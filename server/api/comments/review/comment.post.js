import { getFirestore} from 'firebase-admin/firestore';
import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import admin from 'firebase-admin';
import * as yup from 'yup';
import getRandom from "~/helpers/getRandom";

const db = getFirestore();

const schema = yup.object({

    comment: yup.string('Содержимое Вашего сообщения менее 10 или более 2000 знаков')
        .required('Введите текст, либо отформатируйте его без лишних переносов строк')
        .trim('Введите текст, либо отформатируйте его без лишних переносов строк')
        .test(
            'line_breaks',
            'Введите текст, либо отформатируйте его без лишних переносов строк',
            (value) => value.indexOf('\n\n\n') < 0
        ).max(8000, 'Содержимое Вашего комментария больше 8000 знаков'),
});

export default defineEventHandler(async (event) => {
    try {

        const {token} = useCookies(event);

        const {uid} = await admin.auth().verifyIdToken(token);

        const user = await admin.auth().getUser(uid);

        if(user.disabled){
            const e = new Error('Access Denied');
            e.code = '403';
            e.statusCode = 403;
            await Promise.reject(e);
        }

        const form = formidable();

        const {id, comment, parentId} = await new Promise((resolve, reject) => {

            form.parse(event.req, (err, fields, files) => {
                const fieldsSingle = firstValues(form, fields);
                resolve(fieldsSingle)
            });
        })

        await schema.validate({
            comment
        });

        const newComment = {

            body: comment,
            createdAt: Date.now(),
            id: Date.now() + getRandom(10000000, 1) + (+new Date).toString(36).slice(-5),
            showAnswers: true,
            subComments: 0,

            user: {
                name: user.displayName,
                avatar: user.photoURL.substring(user.photoURL.indexOf('/img')),
                id: uid
            }
        }

        const allComments = (await db.collection('reviewComments').doc(id).get()).data();

        if(!parentId){

            if(!allComments || Object.keys(allComments).length === 0){

                await db.collection('reviewComments').doc(id).set({comments: [newComment]})

            }else{

                const {comments} = allComments;
                comments.push(newComment);
                await db.collection('reviewComments').doc(id).update({comments})

            }

        }else{

                let parentExists;

                for (const [key, value] of Object.entries(allComments)) {
                    value.map((com)=>{
                        if(com.id === parentId){
                            parentExists = true;
                        }
                    })
                }

            if(!parentExists){
                    const e = new Error('Access Denied');
                    e.code = '403';
                    e.statusCode = 403;
                    await Promise.reject(e);
                }


            if(allComments[parentId]){
                allComments[parentId].push(newComment)
                await db.collection('reviewComments')
                    .doc(id).update({[parentId] : allComments[parentId]})
            }else{
                await db.collection('reviewComments')
                    .doc(id).update({[parentId] : [newComment]})
            }


            const allC = (await db.collection('reviewComments').doc(id).get()).data();

            for (const [key, value] of Object.entries(allC)) {

                value.map((com, index)=>{

                    if(com.id === parentId){
                        allC[key][index].subComments += 1;
                    }
                })
            }

            await db.collection('reviewComments').doc(id).set(allC);

            const childComments = (await db.collection('reviewComments').doc(id).get()).data()[parentId]

            return {childComments: childComments}
        }

        return {
            newComment: newComment
        }

    }catch (e) {

        if (e.path) {
            event.res.statusCode = 422;
            event.res.end(JSON.stringify({
                msg: e.errors[0]
            }));
        } else if(e.statusCode === 403){
            event.res.statusCode = 403;
            event.res.end('Access denied');
        }else{
            event.res.statusCode = 401;
            event.res.end('Unauthenticated');
        }

    }

})