import {getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {

        let {offset} = useQuery(event);

        const gamesSnap = await db.collection('games')
            .where('status', '==', true)
            .where('reviews', '>', 0)
            .orderBy('reviews')
            .orderBy('relStamp', 'desc').limit(4)
            .select('name', 'slug', 'thumbnail').offset(+offset).get();

        const games = gamesSnap.docs.map((doc) => {
            return {...doc.data()}
        });

        return {
            reviewGames : games
        }


    }catch (e) {
        //console.log(e);

    }

})
