import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        const reviewsSnap = await db.collection('reviews').get();
        const gamesSnap = await db.collection('games').select('name').get();

        const games = gamesSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });

        const reviews = reviewsSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });

        return {
            reviews,
            games
        };

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
        /*res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        res.end(JSON.stringify({msg: 'no or expired token'}));*/
    }

})
