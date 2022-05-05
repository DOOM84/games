import {useState} from '#app';
//import { useNuxtApp } from '#app';
import getCookie from "~/helpers/getCookie";
//const {ssrContext} = useNuxtApp();


export const useTokenAuth = () => {
    return useState('tokenAuth', () => {
        if(process.client){
            return  getCookie(document.cookie, 'token')
        }
        return false
    })
}