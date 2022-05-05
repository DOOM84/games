import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {
    try {

        const gamesSnap = await db.collection('games')
            .where('status', '==', true)
            .where('reviews', '>', 0)
            .orderBy('reviews')
            .orderBy('relStamp', 'desc').limit(12)
            .select('name', 'slug', 'thumbnail').get();

        const games = gamesSnap.docs.map((doc) => {
            return {...doc.data()}
        });

        return {
            reviewGames : games
        };


    }catch (e) {
        //console.log(e);
    }

})
