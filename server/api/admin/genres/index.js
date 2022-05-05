import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        const genresSnap = await db.collection('genres').get();

        const genres = genresSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });

        return {genres};

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
    }

})
