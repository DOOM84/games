import getCookie from "~/helpers/getCookie";
//import { useState } from '#app';
//import {useState} from "nuxt3/dist/app";

export default defineNuxtPlugin(async ({ssrContext, $logOut}) => {
    const router = useRouter();
    let token = null;
    const isLoggedIn = useLoggedIn();
    const user = useUserInfo();
    const isAdmin = useUserAdmin();


    if (process.server && ssrContext) {

        //console.log('aaa');

        const {res, url} = ssrContext;

        const {path} = router.resolve(url);

        token = getCookie(ssrContext.req.headers.cookie, 'token');

        const toName = path.split("/");

        try {

            if ((toName[1] === 'admin')) {
                try {
                    if (!token) {
                        await Promise.reject(Error());
                    }

                    const {access} = await $fetch('/api/check',
                        {params: {token: token}})

                    if (!access) {
                        await Promise.reject(Error());
                    } else {
                        await getUser(token, isLoggedIn, user)
                        isAdmin.value = access;
                        //isAdmin.value = true;
                    }

                } catch (e) {
                    ssrContext.res.writeHead(302, {Location: '/404'});
                    ssrContext.res.end();
                    //console.log(e);
                }
            }

            else if ((toName[1] === 'auth' && token)) {
                ssrContext.res.writeHead(302, {Location: '/'});
                ssrContext.res.end();
            }

            else{
                await getUser(token, isLoggedIn, user)
            }

        }catch (e) {
            $logOut();
        }

    } else if (process.client) {
        router.beforeEach(async (to, from, next) => {

            const toName = to.path.split("/");

            if (toName[1] === 'auth' && isLoggedIn.value) {
                return next('/');
            }

            if ((toName[1] === 'admin')) {
                try {

                    const {access} = await $fetch('/api/check',
                        {params: {token: token}})

                    if (!access) {
                        return next('/404');
                    } else {
                        isAdmin.value = true;
                        return next()
                    }

                } catch (e) {
                    return next('/404');
                }
            }

            return next();

        });
    }
});

async function getUser(token, isLoggedIn, user){
    const data = await $fetch('/api/user',
        {params: {token: token}});

    if (data) {
        isLoggedIn.value = true;
        user.value = {
            name: data.login,
            avatar: data.avatar //data.avatar ? data.avatar.substring(data.avatar.lastIndexOf('/') + 1) : null
        };
    }
}
