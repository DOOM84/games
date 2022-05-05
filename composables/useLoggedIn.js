import { useState } from '#app';
import getCookie from "~/helpers/getCookie";

export const useLoggedIn = () => {
    return useState('loggedIn', () =>
        {
            if(process.client){
                return  !!getCookie(document.cookie, 'token')
            }
            return false
        }
        //!!getCookie(document.cookie, 'token')
    )
}

