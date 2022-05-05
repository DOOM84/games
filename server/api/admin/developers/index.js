import {getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        const developersSnap = await db.collection('developers').get();

        const developers = developersSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });

        return {developers};

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
    }

})
