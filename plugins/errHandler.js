export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('vue:error', (..._args) => {

        // console.log('vue:error ' + _args)

        if (process.client) {

            clearError({redirect: '/404'})

        } else {
            nuxtApp.ssrContext.res.writeHead(302, {Location: '/404'});
            nuxtApp.ssrContext.res.end();
        }


    })
    nuxtApp.hook('app:error', (..._args) => {

        //  console.log('app:error ' + _args)

        if (process.client) {
            clearError({redirect: '/404'})
        } else {
            nuxtApp.ssrContext.res.writeHead(302, {Location: '/404'});
            nuxtApp.ssrContext.res.end();
        }
    })
    nuxtApp.vueApp.config.errorHandler = (..._args) => {

        // console.log('global error handler ' + _args)

        if (process.client) {
            clearError({redirect: '/404'})
        } else {
            nuxtApp.ssrContext.res.writeHead(302, {Location: '/error'});
            nuxtApp.ssrContext.res.end();
        }
    }
})
