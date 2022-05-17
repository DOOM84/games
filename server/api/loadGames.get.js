import {getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {

        let {offset, genre} = useQuery(event)

        const gamesSnap = genre ? await db.collection('games')
                .where('status', '==', true)
                .where("genres", "array-contains", genre)
            .orderBy('relStamp', "desc").limit(4).offset(+offset).get() :
            await db.collection('games')
                .where('status', '==', true)
                .orderBy('relStamp', "desc")
                .limit(4).offset(+offset).get()

        const games = await Promise.all(gamesSnap.docs.map(async (doc) => {

            const platforms = await Promise.all(doc.data().platforms.map(async (platform) => {
                return (await db.collection('platforms').doc(platform).get()).data();
            }))

            const genres = await Promise.all(doc.data().genres.map(async (genre) => {
                return (await db.collection('genres').doc(genre).get()).data();
            }))

            const extracted = {};

            ({image: extracted.image,
                name: extracted.name,
                slug: extracted.slug,
                releaseDate: extracted.releaseDate,
                rating: extracted.rating,
                video: extracted.video,
            } = doc.data());


            return {...extracted, platforms, genres}

        }));

        return {
            games
        }

    }catch (e) {
        //console.log(e);

    }

})
