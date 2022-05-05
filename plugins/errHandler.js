export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.errorHandler = (error, context) => {
        //console.log(error.code);
        //console.log(error.statusCode);
        clearError({ redirect: '/404' })
    }
})