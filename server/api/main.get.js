import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {
    try {

        let {genre} = useQuery(event);
        let genreName = '';

        if(genre){
            const genreInfo = (await db.collection('genres').doc(genre).get()).data();

            if(!genreInfo){
                const e = new Error('Not found');
                e.code = '404';
                e.statusCode = 404;

                await Promise.reject(e);
            }else{
                genreName = genreInfo.name;
            }
        }

        const gamesSnap = genre ? await db.collection('games')
                .where('status', '==', true)
            .where("genres", "array-contains", genre)
            .orderBy('relStamp', 'desc').limit(12)
                //.select('genres', 'platforms', 'image', 'name', 'slug', 'releaseDate', 'rating', 'video')
                .get() :
            await db.collection('games')
                .where('status', '==', true)
                .orderBy('relStamp', 'desc')
                //.select('genres', 'platforms', 'image', 'name', 'slug', 'releaseDate', 'rating', 'video')
                .limit(12).get();


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
            games,
            genreName
        };


    }catch (e) {
       // console.log(e);
    }

})
