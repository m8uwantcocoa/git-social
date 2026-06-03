// This plugin syncs the GitHub provider token from Supabase to the server
export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()

  const syncProviderToken = async () => {
    const { data } = await supabase.auth.getSession()

    try {
      // Stores the GitHub OAuth token server-side so API routes can call GitHub on behalf of the user.
      await $fetch('/api/github/session', {
        method: 'POST',
        body: {
          providerToken: data.session?.provider_token || null
        }
      })
    } catch (error) {
      console.error('Failed to sync GitHub provider token', error)
    }
  }

  // Sync the provider token on initial load
  void syncProviderToken()

  supabase.auth.onAuthStateChange((_event, session) => {
    // Keep the stored token in sync when the Supabase auth session changes.
    void $fetch('/api/github/session', {
      method: 'POST',
      body: {
        providerToken: session?.provider_token || null
      }
    }).catch((error) => {
      console.error('Failed to update GitHub provider token', error)
    })
  })
})
