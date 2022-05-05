import {defineNuxtPlugin} from '#app'
import {Tabs, Tab} from 'vue3-tabs-component';

export default defineNuxtPlugin((nuxtApp) => {

    nuxtApp.vueApp.component('tabs', Tabs);
    nuxtApp.vueApp.component('tab', Tab);

    /*nuxtApp.vueApp.use(Vue3Mq, {
        preset: 'tailwind'
    });*/

    //nuxtApp.provide('i18n', () => i18n)

});