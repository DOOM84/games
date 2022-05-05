import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        const platformsSnap = await db.collection('platforms').get();

        const platforms = platformsSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });

        return {platforms};

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
    }

})
