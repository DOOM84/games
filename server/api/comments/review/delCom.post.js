import { getFirestore} from 'firebase-admin/firestore';
import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import admin from 'firebase-admin';

const db = getFirestore();


export default defineEventHandler(async (event) => {
    try {

        const {token} = useCookies(event);

        const {uid} = await admin.auth().verifyIdToken(token);

        const user = await admin.auth().getUser(uid);

        if(!user.customClaims['admin']){
            const e = new Error('Access Denied');
            e.code = '403';
            e.statusCode = 403;
            await Promise.reject(e);
        }

        const form = formidable();

        const {id, commentId} = await new Promise((resolve, reject) => {

            form.parse(event.req, (err, fields, files) => {
                const fieldsSingle = firstValues(form, fields);
                resolve(fieldsSingle)
            });
        })

        const allComments = (await db.collection('reviewComments').doc(id).get()).data();

        if(allComments[commentId]) {
            delChild(commentId)
        }else{
            delEverywhere(commentId)
        }


        function delChild(commentId, ids = []){

            if(allComments[commentId]){

                allComments[commentId].map((childComment, index)=>{

                    ids.push(childComment.id)

                })

               delete allComments[commentId];
               delEverywhere(commentId);

                if(ids.length){
                    ids.map((id)=>{
                        delChild(id)
                    })
                }

            }else{
                delEverywhere(commentId)
            }
        }

        function delEverywhere(commentId){
            for (const [key, value] of Object.entries(allComments)) {

                    value.map((com, index)=>{
                        if(com.id === commentId){
                            allComments[key].splice(index, 1);
                            if(!allComments[key].length){delete allComments[key]}
                        }
                    })
            }
        }

        await db.collection('reviewComments').doc(id).set(allComments);


        const {gameComments} = await $fetch('/api/comments/review/loadComments',
            {params: {id: id}})


        return {
            gameComments
        }

    }catch (e) {

        if (e.path) {
            event.res.statusCode = 422;
            event.res.end(JSON.stringify({
                msg: e.errors[0]
            }));
        }
        else if(e.statusCode === 403){
            event.res.statusCode = 403;
            event.res.end('Access denied');
        }
        else {
            event.res.statusCode = 401;
            event.res.end('Unauthenticated');
        }

    }

})