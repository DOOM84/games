import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {
    try {

        let {id} = useQuery(event)

        const reviewsSnap = await (db.collection('reviews')
            .where('gameId', '==', id).where('status', '==', true).get());

        if(!reviewsSnap.size){

            const e = new Error('Not found');
            e.code = '404';
            e.statusCode = 404;

            await Promise.reject(e);
        }

        const gameReviews = reviewsSnap.docs.map((doc) => {
            return {...doc.data(), id:doc.id}
        });

        return {
            gameReviews
        }

    }catch (e) {
        //console.log(e);

    }

})