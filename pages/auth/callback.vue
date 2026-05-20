<script setup lang="ts">
const supabase = useSupabaseClient()
const status = ref('Finishing sign-in...')
const errorMessage = ref('')
let hasSynced = false

const redirectToApp = () => {
  window.location.replace('/')
}

const syncGitHubToken = async (session: any) => {
  if (hasSynced) return
  hasSynced = true

  try {
    const providerToken = session?.provider_token
    const accessToken = session?.access_token

    // Spara GitHub-token
    await $fetch('/api/github/session', {
      method: 'POST',
      body: { providerToken: providerToken || null }
    })
    
    await new Promise(resolve => setTimeout(resolve, 800))

    // Synka profilen 
    if (accessToken) {
      await $fetch('/api/github/me', {
        headers: {
          Authorization: `Bearer ${accessToken}` 
        }
      })
    }
    
  } catch (error) {
    console.error('Failed to store session or sync profile', error)
  }
}

onMounted(() => {
  const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
      await syncGitHubToken(session) 
      authListener.data.subscription.unsubscribe()
      redirectToApp()
    }
  })

  void supabase.auth.getSession().then(async ({ data, error }) => {
    if (error) {
      errorMessage.value = error.message
      status.value = 'Sign-in failed.'
      authListener.data.subscription.unsubscribe()
      return
    }

    if (data.session?.user) {
      await syncGitHubToken(data.session) 
      authListener.data.subscription.unsubscribe()
      redirectToApp()
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
