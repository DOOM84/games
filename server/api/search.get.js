import {getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {

        let {term} = useQuery(event);

        const gamesSnap = await db.collection('games')
            .where("searchTerms", "array-contains", term).select('name', 'id', 'thumbnail').get();

        const results = gamesSnap.docs.map((doc) => {
            return {...doc.data()}
        });

        return {
            results
        }


    }catch (e) {
        //console.log(e);

    }

})
