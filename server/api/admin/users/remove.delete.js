import admin from "firebase-admin";
import formidable from "formidable";
import {firstValues} from 'formidable/src/helpers/firstValues.js';
import {
    getFirestore
} from "firebase-admin/firestore";
import fs from "fs";
import setFilePath from "~/helpers/setFilePath";

const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        const form = formidable();

        const {data} = await new Promise((resolve, reject) => {
            form.parse(event.req, (err, fields, files) => {
                resolve(firstValues(form, fields))
            });
        })

        const {id} = JSON.parse(data);

        const userRef = db.collection('users');

        const {avatar} = (await userRef.doc(id).get()).data();

        if (avatar !== '/img/avatars/no_avatar.png') {
            if (fs.existsSync(setFilePath('/public' + avatar))) {
                fs.unlinkSync(setFilePath('/public' + avatar));
            }
        }

        await userRef.doc(id).delete();

        await admin.auth().deleteUser(id);

        return {id};

    } catch (e) {
        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));
    }

})
