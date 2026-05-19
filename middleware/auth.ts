export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

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
