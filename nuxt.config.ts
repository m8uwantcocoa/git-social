// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  routeRules: {
    '/auth/callback': { ssr: false }
  },

  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],

  supabase: {
    redirect: false,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production'
    }
  },
  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN, // Fetches from .env
  }
})
