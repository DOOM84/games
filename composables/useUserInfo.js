import { useState } from '#app';

export const useUserInfo = () => {
    return useState('userInfo ', () => null)
}