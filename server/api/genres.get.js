import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();



export default defineEventHandler(async (event) => {
    try {

        const genresSnap = await (db.collection('genres')
            .where('status', '==', true).select('name').get());

        const genres = genresSnap.docs.map((doc) => {
            return {...doc.data(), id:doc.id}
        });

        return {
            genres
        }

    }catch (e) {
        //console.log(e);

    }

})
