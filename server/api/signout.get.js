import {getAuth, signOut} from "firebase/auth";


export default defineEventHandler(async (event) => {

    const auth = getAuth();

    try {
        await signOut(auth);
        event.res.setHeader('Content-Type', 'application/json');
        event.res.end(JSON.stringify({msg: 'Logged out successfully'}));

    } catch (e) {
        //console.log(e);
        //res.statusCode = 403;
        //res.end(e.code);
        event.res.end()
    }

})
