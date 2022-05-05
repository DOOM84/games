import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import {
    getFirestore
} from "firebase-admin/firestore";

const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        const form = formidable();

        const {id} = await new Promise((resolve, reject) => {
            form.parse(event.req, (err, fields, files) => {
                resolve(firstValues(form, fields))
            });
        })

        await db.collection('genres').doc(id).delete();

        return {id}

    } catch (e) {

        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));
    }

})
