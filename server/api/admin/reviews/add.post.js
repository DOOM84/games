import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';

import {
    getFirestore
} from "firebase-admin/firestore";
import * as yup from "yup";
const db = getFirestore();


const schema = yup.object({

    added: yup.object({
        text: yup.string('Текст должен быть строкой')
            .trim('Введите текст').required('Введите текст'),
        gameId: yup.string('Игра должен быть строкой').nullable('Введите текст')
            .trim('Выберите игру').required('Выберите игру'),
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

    try {

        await schema.validate({
            added,
        });

        const {name} = (await db.collection('games').doc(added.gameId).get()).data();

        added.gameName = name;

        const reviewsSnap = await (db.collection('reviews')
            .where('gameId', '==', added.gameId).get());

        const { id } = await db.collection('reviews').add(added);

        added.id = id;

        await db.collection('games')
            .doc(added.gameId).update({reviews: reviewsSnap.size+1});


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

})


