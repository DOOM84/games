import {getAuth, createUserWithEmailAndPassword, updateProfile} from "firebase/auth";

import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import * as yup from 'yup';
import {
    getFirestore
} from "firebase-admin/firestore";
const db = getFirestore();

const schema = yup.object({
    credentials: yup.object({
        login: yup.string('Некорректное имя пользователя. Специальные символы в имени пользователя запрещены, либо длина менее 3 символов')
            .trim('Некорректное имя пользователя. Специальные символы в имени пользователя запрещены, либо длина менее 3 символов')
            .min(3, 'Некорректное имя пользователя. Специальные символы в имени пользователя запрещены, либо длина менее 3 символов')
            .max(100, 'Некорректное имя пользователя. Специальные символы в имени пользователя запрещены, либо длина менее 3 символов')
            .matches(/^[0-9A-Za-zа-яёА-ЯЁ ]*$/, 'Некорректное имя пользователя. Специальные символы в имени пользователя запрещены, либо длина менее 3 символов')
            .required('Некорректное имя пользователя. Специальные символы в имени пользователя запрещены, либо длина менее 3 символов'),
        email: yup.string('Введен некорректный Email адрес')
            .trim('Введен некорректный Email адрес')
            .email('Введен некорректный Email адрес').required('Введен некорректный Email адрес'),
        password: yup.string('Пароль не должен быть менее 6 символов')
            .trim('Пароль не должен быть менее 6 символов')
            .min(6, 'Пароль не должен быть менее 6 символов').required('Пароль не должен быть менее 6 символов'),
        passwordConfirmation: yup.string('Пароль не должен быть менее 6 символов')
            .trim('Пароль не должен быть менее 6 символов')
            .oneOf([yup.ref('password'), null], 'Введенные пароли не совпадают.')
    }),
});

export default defineEventHandler(async (event) => {

    const auth = getAuth();

    const form = formidable();

    const credentials = await new Promise((resolve, reject) => {
        form.parse(event.req, (err, fields, files) => {
            resolve(firstValues(form, fields))
        });
    })

    try {

        await schema.validate({
            credentials,
        });

        const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);

        await updateProfile(auth.currentUser, {
            displayName: credentials.login,
            photoURL: event.req.headers.origin + '/img/avatars/no_avatar.png'
        });

        await db.collection('users').doc(userCredential.user.uid)
            .set({
                avatar: '/img/avatars/no_avatar.png',
                login: userCredential.user.displayName
            });

        return {
            login: userCredential.user.displayName,
            avatar: '/img/avatars/no_avatar.png',
            token: userCredential.user.accessToken
        }

    } catch (e) {
        if (e.path) {
            event.res.statusCode = 422;
            event.res.end(JSON.stringify({
                msg: e.errors[0]
            }));
        } else {
            event.res.statusCode = 403;
            event.res.end(e.code);
        }
    }

})
