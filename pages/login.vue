<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const isLoading = ref(false)
const errorMessage = ref('')

const redirectIfAuthenticated = async () => {
  // Leave the login page directly if the user already has an active session.
  const { data } = await supabase.auth.getUser()

  if (data.user || user.value) {
    await navigateTo('/', { replace: true })
  }
}

// Check the user's authentication status as soon as the page is mounted.
onMounted(() => {
  void redirectIfAuthenticated()

  supabase.auth.onAuthStateChange((event, session) => {
    // Go to the app as soon as Supabase finishes the sign-in process.
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
      void navigateTo('/', { replace: true })
    }
  })
})

// Start the GitHub OAuth flow when the user clicks the sign-in button.
const signInWithGitHub = async () => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  // Start the GitHub OAuth flow through Supabase.
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'read:user user:email repo'
    }
  })

  if (error) {
    errorMessage.value = error.message
    isLoading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-mist-100 text-slate-100 px-4">
    <div class="mx-auto flex min-h-screen max-w-md items-center">
      <section class="w-full rounded-3xl border border-white/10 bg-emerald-950 p-6 shadow-xl shadow-emerald-950/30">
        <p class="text-sm font-semibold uppercase tracking-wide text-emerald-300">Git Social</p>
        <h1 class="mt-3 text-3xl font-black text-white">Sign in with GitHub</h1>
        <p class="mt-3 text-sm leading-6 text-slate-300">
          Use GitHub to unlock your feed and connect your account.
        </p>

        <button
          class="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-lime-400 px-4 py-3 text-sm font-bold text-emerald-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoading"
          @click="signInWithGitHub"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5C5.65.5.5 5.65.5 12A11.5 11.5 0 0 0 8.36 22.94c.58.1.79-.25.79-.56v-2.01c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.71 1.25 3.37.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.68 0-1.26.45-2.3 1.19-3.11-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.19a11.1 11.1 0 0 1 5.79 0c2.21-1.5 3.18-1.19 3.18-1.19.63 1.58.23 2.75.11 3.04.74.81 1.19 1.85 1.19 3.11 0 4.42-2.69 5.39-5.25 5.67.41.35.78 1.04.78 2.1v3.12c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>
          <span>{{ isLoading ? 'Redirecting...' : 'Continue with GitHub' }}</span>
        </button>

        <p v-if="errorMessage" class="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {{ errorMessage }}
        </p>
      </section>
    </div>
  </main>
</template>
