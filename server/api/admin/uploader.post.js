import formidable from "formidable";
import {firstValues} from 'formidable/src/helpers/firstValues.js';
import prepareFileInfo from "~/helpers/prepareFileInfo";
import uploadFile from "~/helpers/uploadFile";

export default defineEventHandler(async (event) => {

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

            const picPath = prepareFileInfo(files.upload.newFilename, '/public/img/uploads/');

            const {mainImage} =  await uploadFile(files.upload, '/public/',  {
                mainImage: true,
                mainImagePath: picPath,
                mainImageWidth: null,
                mainImageHeight: null,
            });

            return {
                fileName: picPath.substring(picPath.lastIndexOf('/')+1),
                uploaded: 1,
                url: picPath.substring(picPath.indexOf('/img'))
            }

        } catch (e) {
            console.log(e);
            event.res.setHeader('Content-Type', 'application/json');
            event.res.statusCode = 401;
            event.res.end(JSON.stringify({msg: 'Ошибка! Вы не авторизованы!'}));
        }
    }

})

