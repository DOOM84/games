import { getFirestore} from 'firebase-admin/firestore';
import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import admin from 'firebase-admin';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {

        const form = formidable();

        const {id, rating} = await new Promise((resolve, reject) => {

            form.parse(event.req, (err, fields, files) => {
                const fieldsSingle = firstValues(form, fields);
                resolve(fieldsSingle)
            });
        })

        const {token} = useCookies(event);

        const {uid} = await admin.auth().verifyIdToken(token);

        const gameRate = (await db.collection('ratings').doc(id).get()).data();

        let finalRate;

        if(!gameRate){
            await db.collection('ratings').doc(id).set(
                {
                    rates: [{user: uid, rate: rating}],
                    rating
                })

            await db.collection('games').doc(id).update({userRate: +rating});

            finalRate = rating;

        }else{

            const ind = gameRate.rates.findIndex(r => r.user === uid);

            if(ind > -1){
                gameRate.rates[ind].rate = rating;
            }else{
                gameRate.rates.push({user: uid, rate: rating})
            }

            const ratesSum = gameRate.rates.reduce((n, {rate}) => n + Number(rate), 0);

            finalRate = (ratesSum / gameRate.rates.length).toFixed(1);


            await db.collection('ratings').doc(id).update({rates: gameRate.rates, rating: +finalRate});

            await db.collection('games').doc(id).update({userRate: +finalRate})

        }

        return {
            rate: +finalRate
        }



    }catch (e) {
        event.res.statusCode = 403;
        event.res.end('Access denied');
    }

})