import database from '~/helpers/dbConn';
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import * as serviceAccount from "../../helpers/games-a914c-firebase-adminsdk-psu1v-e65c50e201.json";

const apps = getApps();

if (!apps.length) {
    initializeApp({
        credential: cert(serviceAccount)
    })
}
database();

export default defineEventHandler(async (event) => {

    const toName = event.req.originalUrl.split("/");

    if (toName[2] === 'admin' && (toName[toName.length - 1] === 'add' ||
        toName[toName.length - 1] === 'edit' || toName[toName.length - 1] === 'remove' ||
        toName[toName.length - 1] === 'uploader' || toName[toName.length - 1] === 'removeImg')) {

        const {token} = useCookies(event);

         try {
            const {access} = await $fetch('/api/check', {params: {token: useCookies(event).token}});

            if (!access) {
                await Promise.reject(Error('No access'));
            }

        } catch (e) {

             event.res.writeHead(403, {
                "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
            });

             event.res.end(JSON.stringify({msg: 'no or expired token'}));
        }
    }

})
