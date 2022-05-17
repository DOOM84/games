import {defineNuxtConfig} from 'nuxt'

export default defineNuxtConfig({

    meta: {
        title: 'Games portal',
        meta: [
            {
                name: 'keywords',
                content: 'Games portal'
            },
            {
                hid: 'description',
                name: 'description',
                content: 'Games portal'
            }
        ],
        link: [
            {
                rel: 'stylesheet',
                href: 'https://use.fontawesome.com/releases/v5.2.0/css/all.css'
            },
            {rel: 'icon', type: "image/x-icon", href: '/favicon.ico'},
        ],
        /* script: [
             {
                 defer: true,
                 async: true,
                 src: 'https://platform.twitter.com/widgets.js',
             },
            /!* {
                 src: '@/node_modules/@ckeditor/ckeditor5-vue/dist/ckeditor.js',
             }*!/

         ]*/
    },

    css: ["@/assets/scss/main.scss"],

    vite: {
        server: {
            hmr: {
                overlay: false
            }
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@import "@/assets/scss/table.scss";',
                    charset: false,
                },
            },
        },
    },


    buildModules: [
        '~/modules/errorPage',
        // '@intlify/nuxt3'
        //'~/modules/vuei18n',
    ],


})
