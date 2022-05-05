import {defineNuxtPlugin} from '#app'
import vClickOutside from "click-outside-vue3"

export default defineNuxtPlugin((nuxtApp) => {

    nuxtApp.vueApp.use(vClickOutside);

    //nuxtApp.provide('i18n', () => i18n)

});