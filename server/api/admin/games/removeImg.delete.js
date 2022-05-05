import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import {
    getFirestore
} from "firebase-admin/firestore";

const db = getFirestore();
import fs from "fs";
import setFilePath from "~/helpers/setFilePath";

export default defineEventHandler(async (event) => {

    try {

        const form = formidable();

        const {id, url} = await new Promise((resolve, reject) => {
            form.parse(event.req, (err, fields, files) => {
                resolve(firstValues(form, fields))
            });
        })

        const images = (await db.collection('games').doc(id).get()).data().images;

        const index = images.findIndex(image => {
            return image.pic === url;
        });

        if (index > -1) {

            if (fs.existsSync(setFilePath('/public' + images[index].pic))) {
                fs.unlinkSync(setFilePath('/public' + images[index].pic));
            }
            if (fs.existsSync(setFilePath('/public' + images[index].thumbnail))) {
                fs.unlinkSync(setFilePath('/public' + images[index].thumbnail));
            }

            images.splice(index, 1); // 2nd parameter means remove one item only

            await db.collection('games').doc(id).update({images: images});
        }

        return {id}

    } catch (e) {
        console.log(e);
        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));
    }

})