// This page handles the callback from GitHub after the user has authenticated.
// It listens for changes in the authentication state and redirects the user to the app once they are signed in.
// It also syncs the GitHub token and profile information with the backend before redirecting.
<script setup lang="ts">
import type { Session } from '@supabase/supabase-js'

const supabase = useSupabaseClient()
const status = ref('Finishing sign-in...')
const errorMessage = ref('')
let syncPromise: Promise<boolean> | null = null

// Redirect the user to the app after successful sign-in.
const redirectToApp = () => {
  localStorage.setItem('show_welcome_confetti', 'true')
  window.location.replace('/')
}

// Sync the GitHub token and profile information with the backend.
const syncGitHubToken = (session: Session): Promise<boolean> => {
  if (syncPromise) return syncPromise

  syncPromise = (async () => {
    try {
      const providerToken = session.provider_token
      const accessToken = session.access_token

      if (!providerToken || !accessToken) {
        throw new Error('GitHub provider token was not returned by Supabase.')
      }

      // Save the GitHub provider token in the backend to use for authenticated API requests.
      await $fetch('/api/github/session', {
        method: 'POST',
        body: { providerToken }
      })

      // Sync the user's profile information.
      await $fetch('/api/github/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      return true
    } catch (error) {
      console.error('Failed to store session or sync profile', error)
      status.value = 'Sign-in could not be completed.'
      errorMessage.value = error instanceof Error
        ? error.message
        : 'Could not sync your GitHub profile. Please try signing in again.'
      return false
    }
  })()

  return syncPromise
}

// Listen for changes in the authentication state and handle the sign-in process.
onMounted(() => {
  const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
      authListener.data.subscription.unsubscribe()
      const didSync = await syncGitHubToken(session)
      if (didSync) redirectToApp()
    }
  })

  // In case the auth state change event was missed, check the session directly.
  void supabase.auth.getSession().then(async ({ data, error }) => {
    if (error) {
      errorMessage.value = error.message
      status.value = 'Sign-in failed.'
      authListener.data.subscription.unsubscribe()
      return
    }

    if (data.session?.user) {
      authListener.data.subscription.unsubscribe()
      const didSync = await syncGitHubToken(data.session)
      if (didSync) redirectToApp()
      return
    }

    status.value = 'Waiting for session...'
  })
})
</script>

<template>
  <main class="min-h-screen bg-mist-100 text-slate-100 px-4">
    <div class="mx-auto flex min-h-screen max-w-md items-center">
      <section class="w-full rounded-3xl border border-white/10 bg-emerald-950 p-6 shadow-xl shadow-emerald-950/30">
        <p class="text-sm font-semibold uppercase tracking-wide text-emerald-300">Git Social</p>
        <h1 class="mt-3 text-3xl font-black text-white">Completing sign-in</h1>
        <p class="mt-3 text-sm leading-6 text-slate-300">
          {{ status }}
        </p>

        <p v-if="errorMessage" class="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {{ errorMessage }}
        </p>
      </section>
    </div>
  </main>
</template>
