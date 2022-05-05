import { useState } from '#app';

export const useParentInfo = () => {
    return useState('parentInfo', () => null)
}