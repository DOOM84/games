import { useState } from '#app';

export const useUserAdmin = () => {
    return useState('userAdmin ', () => false)
}