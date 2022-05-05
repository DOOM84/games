import fs from "fs";
import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import admin from 'firebase-admin';
import getRandom from "~/helpers/getRandom";
import setFilePath from "~/helpers/setFilePath";
import {
    getFirestore
} from "firebase-admin/firestore";
const db = getFirestore();
import im from "imagemagick";
import * as yup from "yup";


const fileSchema = yup.object().shape({
    file: yup.mixed().required('File is required'),
})

export default defineEventHandler(async (event) => {

    const form = formidable({
        encoding: 'utf-8',
        keepExtensions: true,
        // 2 mb for news image and attachments. override otherwise
        maxFileSize: 2 * 1024 * 1024,
    });

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    //const maxFileSize = 2000000;

    const {files, fields, err} = await new Promise((resolve, reject) => {
        form.parse(event.req, (err, fields, files) => {

            resolve({files: firstValues(form, files), fields: firstValues(form, fields), err})
        });
    })

    if (err || !allowedTypes.includes(files.avatar.mimetype) /*|| files.avatar.size > maxFileSize*/) {
        event.res.statusCode = 422;
        event.res.end(JSON.stringify({msg: 'Неверный тип или размер файла превышен'}));
    } else {

        const {token} = useCookies(event);

        try {
                await fileSchema.validate({
                    file: files.avatar
                });

            const {uid} = await admin.auth().verifyIdToken(token);

            const {photoURL} = await admin.auth().getUser(uid);

            const oldAvaPath = '/img/avatars/'+photoURL.substring(photoURL.lastIndexOf('/')+1);

            if (oldAvaPath !== '/img/avatars/no_avatar.png') {

                if (fs.existsSync(setFilePath('/public' + oldAvaPath))) {
                    fs.unlinkSync(setFilePath('/public' + oldAvaPath));
                }
            }

            let oldPath = files.avatar.filepath;
            let fileName = files.avatar.newFilename;
            let ext = fileName.substring(fileName.indexOf('.') + 1);
            let nameWithSalt = Date.now() + getRandom(10000000, 1) + (+new Date).toString(36).slice(-5);

            const newPath = setFilePath('/public/img/avatars/' + nameWithSalt + '.' + ext);
            const newPhotoURL = event.req.headers.origin + newPath.substring(newPath.indexOf('/img'));

            im.resize({
                srcPath: oldPath,
                dstPath: newPath,
                width : 80,
                height : "80^",
                customArgs: [
                    "-gravity", "center", "-extent", "80x80"
                ]
            }, function (err, stdout, stderr) {
                if (err) throw err;
            });

            await admin.auth().updateUser(uid, {
                photoURL: newPhotoURL,
            })

            await db.collection('users').doc(uid)
                .update({
                    avatar: newPath.substring(newPath.indexOf('/img'))
                });

            return {msg: 'File uploaded and moved!', path: newPhotoURL /*newPath.substring(6)*/}

        }catch (e) {
            console.log(e);
            event.res.setHeader('Content-Type', 'application/json');
            event.res.statusCode = 401;
            event.res.end(JSON.stringify({msg: 'Ошибка! Вы не авторизованы!'}));
        }
    }
})