interface GithubEvent {
  id?: string
  github_event_id: string
  event_type: string
  github_username: string
  avatar_url: string
  created_at: string
  repo_name: string
  payload: any
}

export const useGithubFeed = () => {
  const feed = ref<GithubEvent[]>([])
  const isRefreshing = ref(false)

  const loadFeed = async (username: string) => {
    const cached = localStorage.getItem(`feed_${username}`)
    if (cached) {
      feed.value = JSON.parse(cached)
    }

    await refreshFeed(username)
  }

  const refreshFeed = async (username: string) => {
    isRefreshing.value = true
    try {
      const data = await $fetch<GithubEvent[]>(`/api/github/events?username=${username}`)
      
      feed.value = data
      localStorage.setItem(`feed_${username}`, JSON.stringify(data))
    } catch (e) {
      console.error("Kunde inte hämta feed", e)
    } finally {
      isRefreshing.value = false
    }
  }

  return { feed, loadFeed, refreshFeed, isRefreshing }
}