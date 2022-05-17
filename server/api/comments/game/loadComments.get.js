import {getFirestore} from 'firebase-admin/firestore';
import admin from 'firebase-admin';
const db = getFirestore();


export default defineEventHandler(async (event) => {
    try {

        let {id} = useQuery(event);

        const allComments = (await db.collection('comments').doc(id).get()).data();

        let comments = [];

        const rootComments = allComments && allComments.comments ? allComments.comments : [];

        if(rootComments.length){

            comments = await Promise.all(rootComments.map(async (comment) => {

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
        }

        return comments/*{
            comments,
        }*/


    }catch (e) {
        //console.log(e.statusCode);

    }

})
