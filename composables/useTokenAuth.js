import {useState} from '#app';
import getCookie from "~/helpers/getCookie";

export const useTokenAuth = () => {
    return useState('tokenAuth', () => {

        const {ssrContext} = useNuxtApp();

        if(ssrContext){return getCookie(ssrContext.req.headers.cookie, 'token')}

        if(process.client){
            return  getCookie(document.cookie, 'token')
        }
        return null;
    })
}