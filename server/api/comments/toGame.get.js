import {getFirestore} from 'firebase-admin/firestore';
import admin from 'firebase-admin';

const db = getFirestore();


export default defineEventHandler(async (event) => {
    try {

        let {id} = useQuery(event);

        const allComments = (await db.collection('comments').doc(id).get()).data();

        let gameComments = [];

        const rootComments = allComments && allComments.comments ? allComments.comments : [];

        if (rootComments.length) {

            gameComments = await Promise.all(rootComments.map(async (comment) => {

                const {photoURL} = await admin.auth().getUser(comment.user.id);

                comment.user.avatar = photoURL.substring(photoURL.indexOf('/img'))

                const subCommentsLength = (await db.collection('comments')
                    .doc(id).get()).data()[comment.id]?.length;

                comment.subComments = subCommentsLength ? subCommentsLength : 0;

                return comment;
            }))
        }

        return {
            gameComments,
        }


    } catch (e) {
        //console.log(e);

    }

})
