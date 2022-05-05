import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import {
    getFirestore
} from "firebase-admin/firestore";
import setFilePath from "~/helpers/setFilePath";
const db = getFirestore();
import fs from "fs";


export default defineEventHandler(async (event) => {

    try {

        const form = formidable();

        const {id} = await new Promise((resolve, reject) => {
            form.parse(event.req, (err, fields, files) => {
                resolve(firstValues(form, fields))
            });
        })

        const {images, image, thumbnail, video} = (await db.collection('games').doc(id).get()).data();

        await db.collection('games').doc(id).delete();

        if(images && images.length){
            images.map((img) => {
                if (fs.existsSync(setFilePath('/public' + img.pic))) {
                    fs.unlinkSync(setFilePath('/public' + img.pic));
                }
                if (fs.existsSync(setFilePath('/public' + img.thumbnail))) {
                    fs.unlinkSync(setFilePath('/public' + img.thumbnail));
                }
            })
        }

        if (fs.existsSync(setFilePath('/public' + image))) {
            fs.unlinkSync(setFilePath('/public' + image));
        }

        if (fs.existsSync(setFilePath('/public' + thumbnail))) {
            fs.unlinkSync(setFilePath('/public' + thumbnail));
        }

        if (fs.existsSync(setFilePath('/public' + video))) {
            fs.unlinkSync(setFilePath('/public' + video));
        }

        return {id}

    } catch (e) {

        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));
    }

})