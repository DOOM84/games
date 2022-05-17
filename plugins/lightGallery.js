import {defineNuxtPlugin} from '#app';

import Lightgallery from 'lightgallery/vue/LightGalleryVue.umd';
import lgFullScreen from 'lightgallery/plugins/fullscreen/lg-fullscreen.umd';
import lgZoom from 'lightgallery/plugins/zoom/lg-zoom.umd';
import lgThumbnail from 'lightgallery/plugins/thumbnail/lg-thumbnail.umd';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-fullscreen.css';


export default defineNuxtPlugin(nuxtApp => {

   nuxtApp.provide('lgZoom', () => lgZoom);
   nuxtApp.provide('lgThumbnail', () => lgThumbnail);
   nuxtApp.provide('lgFullScreen', () => lgFullScreen);
   nuxtApp.vueApp.component('Lightgallery', Lightgallery);

})



