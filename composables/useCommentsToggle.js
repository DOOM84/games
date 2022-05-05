import { useState } from '#app';

export const useCommentsToggle = () => {
    return useState('commentsToggle', () => null)
}