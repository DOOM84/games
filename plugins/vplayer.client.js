import {defineNuxtPlugin} from '#app'
import {Plugin} from "vue-responsive-video-background-player";
//import VideoBackground from 'vue-responsive-video-background-player'

export default defineNuxtPlugin((nuxtApp) => {

    //nuxtApp.vueApp.component('video-background', VideoBackground);

    nuxtApp.vueApp.use(Plugin);

    //nuxtApp.provide('i18n', () => i18n)

});