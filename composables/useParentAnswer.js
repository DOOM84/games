import { useState } from '#app';

export const useParentAnswer = () => {
    return useState('parentAnswer', () => null)
}