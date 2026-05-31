export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Allow the OAuth callback page to load before protected-route checks run.
  if (to.path === '/auth/callback') {
    return
  }

  // If the user is not already loaded, try to fetch the user from Supabase.
  if (!user.value && import.meta.client) {
    const { data } = await supabase.auth.getUser()

    if (data.user) {
      return
    }
  }

  // Send unauthenticated visitors to the login page.
  if (!user.value) {
    return navigateTo('/login')
  }
})
