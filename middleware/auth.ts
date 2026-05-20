export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Allow the OAuth callback page to load before protected-route checks run.
  if (to.path === '/auth/callback') {
    return
  }

  // On the first loadask Supabase for the current user before deciding whether to block the route.
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
