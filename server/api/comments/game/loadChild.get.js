import {getFirestore} from 'firebase-admin/firestore';
import admin from 'firebase-admin';
const db = getFirestore();


export default defineEventHandler(async (event) => {
    try {

        let {id, parentId} = useQuery(event);

        const subComments = (await db.collection('comments').doc(id).get()).data()[parentId];

        const gameComments = await Promise.all(subComments.map(async (comment) => {

            try {
                const {photoURL} = await admin.auth().getUser(comment.user.id);
                comment.user.avatar = photoURL.substring(photoURL.indexOf('/img'))
            }catch (e) {
                comment.user.avatar = '/img/avatars/no_avatar.png';
                comment.user.name += ' (Удален)';

            }

            const subCommentsLength = (await db.collection('comments')
                .doc(id).get()).data()[comment.id]?.length;

            comment.subComments = subCommentsLength ? subCommentsLength : 0;

            return comment;
        }))

        return {
            gameComments
        }


    }catch (e) {
        //console.log(e);

    }

})
