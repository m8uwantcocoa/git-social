interface GithubEvent {
  id: string
  type: string
  actor: { display_login: string }
  repo: { name: string }
  created_at: string
  payload: any
}

export const useGithubFeed = () => {
  const feed = ref([])
  const isRefreshing = ref(false)

  const loadFeed = async (username: string) => {
    const cached = localStorage.getItem(`feed_${username}`)
    if (cached) {
      feed.value = JSON.parse(cached)
    }

    await refreshFeed(username)
  }

  const refreshFeed = async (username: string) => {
    const feed = ref<GithubEvent[]>([]) 
    const isRefreshing = ref(false)
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