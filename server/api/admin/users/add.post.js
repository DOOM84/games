import admin from "firebase-admin";
import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import * as yup from 'yup';
import {
    getFirestore
} from "firebase-admin/firestore";
import prepareFileInfo from "~/helpers/prepareFileInfo";
import uploadFile from "~/helpers/uploadFile";
const db = getFirestore();

const schema = yup.object({
    created: yup.object({

        displayName: yup.string('Некорректное имя пользователя.').trim('Некорректное имя пользователя.')
            .min(3, 'Некорректное имя пользователя.')
            .max(100, 'Некорректное имя пользователя.')
            .matches(/^[0-9A-Za-zа-яёА-ЯЁ ]*$/, 'Некорректное имя пользователя.')
            .required('Введите имя пользователя'),
        email: yup.string('Введен некорректный Email адрес').trim('Введен некорректный Email адрес')
            .email('Введен некорректный Email адрес').required('Введен некорректный Email адрес'),
        password: yup.string('Пароль не должен быть менее 6 символов')
            .trim('Пароль не должен быть менее 6 символов')
            .min(6, 'Пароль не должен быть менее 6 символов')
            .required('Пароль не должен быть менее 6 символов'),
        passwordConfirmation: yup.string('Пароль не должен быть менее 6 символов')
            .trim('Пароль не должен быть менее 6 символов').required('Подтвердите пароль')
            .oneOf([yup.ref('password'), null], 'Введенные пароли не совпадают.')
    }),
});


export default defineEventHandler(async (event) => {

    const form = formidable({
        encoding: 'utf-8',
        keepExtensions: true,
        // 2 mb for news image and attachments. override otherwise
        maxFileSize: 20 * 1024 * 1024,
        //multiples: true,
    });

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    const {files, fields, err} = await new Promise((resolve, reject) => {
        form.parse(event.req, (err, fields, files) => {
            resolve({files: firstValues(form, files), fields: firstValues(form, fields), err})
        });
    })

    const created = JSON.parse(fields.data);

    if (err || (files.file && !allowedTypes.includes(files.file.mimetype))/*|| files.avatar.size > maxFileSize*/) {

        event.res.statusCode = 422;
        event.res.end(JSON.stringify({msg: 'Неверный тип или размер файла превышен'}));

    } else {

        try {

            await schema.validate({
                created
            });

            let avaPath = '/img/avatars/no_avatar.png';

            if(files.file){
                const picPath = prepareFileInfo(files.file.newFilename, '/public/img/avatars/');

                const {mainImage} =  await uploadFile(files.file, '/public/',  {
                    mainImage: true,
                    mainImagePath: picPath,
                    mainImageWidth: 80,
                    mainImageHeight: 80
                });

                avaPath = mainImage.substring(mainImage.indexOf('/img'));

            }

            const userRecord = await admin.auth().createUser(
                {
                    ...created,
                    photoURL: event.req.headers.origin + avaPath
                })

            await admin.auth()
                .setCustomUserClaims(userRecord.uid, {admin: created.customClaims.admin});

            const createdUser = await admin.auth().getUser(userRecord.uid);

            await db.collection('users').doc(createdUser.uid)
                .set({avatar: avaPath, login: created.displayName});

            const result = {
                email: createdUser.email,
                displayName: createdUser.displayName,
                photoURL: avaPath,
                disabled: createdUser.disabled,
                customClaims: createdUser.customClaims ? createdUser.customClaims : {admin: false},
                uid: createdUser.uid,
            }

            return {result: result};

        } catch (e) {

            if (e.path) {
                event.res.statusCode = 422;
                event.res.end(JSON.stringify({
                    msg: e.errors[0]
                }));

            } else {

                event.res.setHeader('Content-Type', 'application/json');
                event.res.statusCode = 401;
                event.res.end(JSON.stringify({msg: 'Ошибка! Вы не авторизованы!'}));

            }
        }
    }

})