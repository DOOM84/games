import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import slugify from "slugify";
import {
    getFirestore
} from "firebase-admin/firestore";
import * as yup from "yup";
const db = getFirestore();

const schema = yup.object({

    added: yup.object({
        name: yup.string('Название должно быть строкой')
            .trim('Введите название').required('Введите название'),
    })
})

export default defineEventHandler(async (event) => {

    const form = formidable({
        encoding: 'utf-8',
        keepExtensions: true,
        // 2 mb for news image and attachments. override otherwise
        maxFileSize: 20 * 1024 * 1024,
        //multiples: true,
    });

    const {fields, err} = await new Promise((resolve, reject) => {
        form.parse(event.req, (err, fields, files) => {
            resolve({fields: firstValues(form, fields), err})
        });
    })

    const added = JSON.parse(fields.data);

    if (err) {
        event.res.statusCode = 422;
        event.res.end(JSON.stringify({msg: 'Произошла ошибка'}));
    } else {

        try {

            await schema.validate({
                added,
            });

            added.id = slugify(added.name, {strict: true, /*remove: /[*+~.()'"!:@]/g*/}).toLowerCase();

            await db.collection('platforms')
                .doc(added.id).set(added);

            return {result: added};

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

