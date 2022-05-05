import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import * as yup from 'yup';

import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

const schema = yup.object({
    credentials: yup.object({
        email: yup.string('Введен некорректный Email адрес').trim('Введен некорректный Email адрес')
            .email('Введен некорректный Email адрес').required('Введен некорректный Email адрес'),
        password: yup.string('Пароль не должен быть менее 6 символов')
            .trim('Пароль не должен быть менее 6 символов')
            .min(6, 'Пароль не должен быть менее 6 символов')
            .required('Пароль не должен быть менее 6 символов'),
    }),
});

export default defineEventHandler(async (event) => {

    const form = formidable();

    const credentials = await new Promise((resolve, reject) => {

        form.parse(event.req, (err, fields, files) => {
            const fieldsSingle = firstValues(form, fields);
            resolve(fieldsSingle)
        });
    })

        const auth = getAuth();

        try {

            await schema.validate({
                credentials,
            });

            const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)

            return {
                login: userCredential.user.displayName,
                token: userCredential.user.accessToken,
                avatar: userCredential.user.photoURL,
                //id: userCredential.user.uid
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
