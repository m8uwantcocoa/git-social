export const useGitHubIdentity = () => {
  const user = useSupabaseUser()

  // Keep GitHub display data in one place so components use the same identity fields.
  const username = computed(() => {
    return user.value?.user_metadata?.user_name
      || user.value?.user_metadata?.preferred_username
      || user.value?.email
      || 'Anonymous'
  })

  const avatarUrl = computed(() => {
    return user.value?.user_metadata?.avatar_url || 'https://github.com/github.png'
  })

  return {
    username,
    avatarUrl
  }
}
