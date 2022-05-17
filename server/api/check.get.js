import admin from 'firebase-admin';

import {
    useCookie
} from 'h3'

export default defineEventHandler(async (event) => {
    try {
        const token = useCookie(event.req, 'token') || useQuery(event).token;

        const {uid} = await admin.auth().verifyIdToken(token);

        const user = await admin.auth().getUser(uid);

        return {access: !!user.customClaims['admin']}

    } catch (e) {
        event.res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });

        event.res.end(JSON.stringify({msg: 'no or expired token'}));
    }

})
