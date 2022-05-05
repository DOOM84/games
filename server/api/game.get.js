import {getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {id} = useQuery(event)

        const game = (await db.collection('games').doc(id).get()).data();

        if(!game){ throw new Error()}


        const reviewsSnap = await (db.collection('reviews')
            .where('gameId', '==', id).where('status', '==', true)
            .select('gameId', 'title').get());

        game.reviews = reviewsSnap.docs.map((doc) => {
            return {...doc.data()}
        });


        game.developers = await Promise.all(game.developers.map(async (developer) => {
            return (await db.collection('developers').doc(developer).get()).data();
        }))

        game.platforms = await Promise.all(game.platforms.map(async (platform) => {
            return (await db.collection('platforms').doc(platform).get()).data();
        }))

        game.genres = await Promise.all(game.genres.map(async (genre) => {
            return (await db.collection('genres').doc(genre).get()).data();
        }))

        return {
            game
        }

    }catch (e) {

    }
})

