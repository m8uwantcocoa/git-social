export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  if (!user.value && import.meta.client) {
    const { data } = await supabase.auth.getUser()

    if (data.user) {
      return
    }
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
