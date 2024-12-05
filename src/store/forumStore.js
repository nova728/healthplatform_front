import { defineStore } from 'pinia'

export const useForumStore = defineStore('forum', {
    state: () => ({
        posts: [],
        categories: [],
        currentCategory: null,
        loading: false,
        cache: new Map()
    }),

    actions: {
        cachePost(post) {
            this.cache.set(post.id, {
                data: post,
                timestamp: Date.now()
            })
        },

        getCachedPost(id) {
            const cached = this.cache.get(id)
            if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
                return cached.data
            }
            return null
        },

        async fetchArticles(categoryId, search, page, size) {
            try {
                this.loading = true
                // 原有的 fetchArticles 逻辑
                const response = await fetch(...)
                this.posts = response.data.articles
            } finally {
                this.loading = false
            }
        }
    }
})