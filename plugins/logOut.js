import {defineNuxtPlugin} from '#app'

export default defineNuxtPlugin(nuxtApp => {

    const authToken = useTokenAuth();
    const isLoggedIn = useLoggedIn();
    const user = useUserInfo();
    const isAdmin = useUserAdmin();

    nuxtApp.provide('logOut', async () => {

        isAdmin.value = false;
        isLoggedIn.value = false;
        authToken.value = null;
        user.value = null;

        await $fetch('/api/signout')
        if (!process.server) {
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    })
})
