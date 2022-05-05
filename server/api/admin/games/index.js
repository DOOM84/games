import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        const developersSnap = await db.collection('developers').get();
        const genresSnap = await db.collection('genres').get();
        const platformsSnap = await db.collection('platforms').get();
        const gamesSnap = await db.collection('games').get();

        const games = gamesSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });
        const developers = developersSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });
        const genres = genresSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });
        const platforms = platformsSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });

       return {
           developers,
           genres,
           platforms,
           games
       }

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
