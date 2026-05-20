export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // If a session already exists, keep signed-in users out of the login page.
  if (!user.value && import.meta.client) {
    const { data } = await supabase.auth.getUser()

    if (data.user) {
      return navigateTo('/')
    }
  }

  if (user.value) {
    return navigateTo('/')
  }
})
