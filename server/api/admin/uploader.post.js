import fs from "fs";
import formidable from "formidable";
import {firstValues} from 'formidable/src/helpers/firstValues.js';
import setFilePath from "~/helpers/setFilePath";

export default defineEventHandler(async (event) => {

    const fsPromises = fs.promises;

    const form = formidable({
        encoding: 'utf-8',
        keepExtensions: true,
        // 2 mb for news image and attachments. override otherwise
        maxFileSize: 2 * 1024 * 1024,
    });

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    const {files, err} = await new Promise((resolve, reject) => {
        form.parse(event.req, (err, fields, files) => {
            resolve({files: firstValues(form, files), err})
        });
    })

    if (err || !allowedTypes.includes(files.upload.mimetype) /*|| files.avatar.size > maxFileSize*/) {
        event.res.statusCode = 422;
        event.res.end(JSON.stringify({msg: 'Неверный тип или размер файла превышен'}));
    } else {

        try {
            let oldPath = files.upload.filepath;
            let fileName = files.upload.newFilename;
            let ext = fileName.substring(fileName.indexOf('.') + 1);

            let salt = (+new Date).toString(36).slice(-5);

            const uploadedName = Date.now() + salt + '.' + ext

            let newPath = setFilePath('/public/img/uploads/' + uploadedName);

            await fsPromises.rename(oldPath, newPath);

            return {
                fileName: uploadedName,
                uploaded: 1,
                url: newPath.substring(newPath.indexOf('/img'))
            }

        } catch (e) {
            event.res.setHeader('Content-Type', 'application/json');
            event.res.statusCode = 401;
            event.res.end(JSON.stringify({msg: 'Ошибка! Вы не авторизованы!'}));
        }
    }

})

