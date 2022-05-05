import {defineNuxtPlugin} from '#app';
import * as dt from '@jobinsjp/vue3-datatable';
const { DataTable, TableBody, TableHead } = dt;
//import "@jobinsjp/vue3-datatable/dist/style.scss";


export default defineNuxtPlugin(nuxtApp => {

   nuxtApp.vueApp.component('data-table', DataTable);
    nuxtApp.vueApp.component('table-body', TableBody);
    nuxtApp.vueApp.component('table-head', TableHead);
})



