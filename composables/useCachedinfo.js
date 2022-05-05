import { useState } from '#app'

export const useCachedinfo = () => {
    return useState('cachedinfo', () => [])
}