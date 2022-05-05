import { useState } from '#app';

export const usePostComments = () => {
    return useState('postComments', () => null)
}