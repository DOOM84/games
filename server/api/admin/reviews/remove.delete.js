import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import {
    getFirestore
} from "firebase-admin/firestore";

const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        const form = formidable();

        const {id, gameId} = await new Promise((resolve, reject) => {
            form.parse(event.req, (err, fields, files) => {
                resolve(firstValues(form, fields))
            });
        })

        await db.collection('reviews').doc(id).delete();

        await db.collection('reviewComments').doc(id).delete();

        const {reviews} = (await db.collection('games').doc(gameId).get()).data();

        await db.collection('games')
            .doc(gameId).update({reviews: +reviews-1})

        return {id};

    } catch (e) {

        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));
    }

})
