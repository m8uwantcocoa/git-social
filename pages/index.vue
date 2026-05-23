<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const currentUser = useSupabaseUser()
const { username: currentUsername } = useGitHubIdentity()
const activeTab = ref('global')
const showConfetti = ref(false)

onMounted(() => {
  if (localStorage.getItem('show_welcome_confetti')) {
    showConfetti.value = true
    localStorage.removeItem('show_welcome_confetti')
  }

  const cached = localStorage.getItem('feed_cache')
  if (cached && (!posts.value || posts.value.length === 0)) {
    try { posts.value = JSON.parse(cached) } catch {}
  }

  window.addEventListener('following-updated', reloadFeed)
  reloadFeed()
})

onUnmounted(() => {
  window.removeEventListener('following-updated', reloadFeed)
})

const { data: posts, refresh } = await useAsyncData('posts', async () => {
  if (!currentUser.value) return []

  let usernamesToTrack = []

  if (import.meta.client) {
    const stored = localStorage.getItem('git_social_following')
    if (stored) {
      try { usernamesToTrack = JSON.parse(stored) } catch {}
    }
  }
  
  if (currentUsername.value && currentUsername.value !== 'Anonymous' && !usernamesToTrack.includes(currentUsername.value)) {
    usernamesToTrack.push(currentUsername.value)
  }
  
  if (usernamesToTrack.length === 0) return []

  const { data: feedEvents, error } = await supabase
    .from('events')
    .select(`
      *,
      event_likes (github_username),
      comments (id, github_username, text, created_at)
    `)
    .in('github_username', usernamesToTrack) 
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) console.error("Fel vid hämtning av feed:", error.message)

  return feedEvents || []
})

if (import.meta.client) {
  watch(posts, (newVal) => {
    if (newVal && newVal.length > 0) {
      localStorage.setItem('feed_cache', JSON.stringify(newVal))
    }
  }, { deep: true })
}

const reloadFeed = async () => {
  if (import.meta.client) {
    let usernames = []
    const stored = localStorage.getItem('git_social_following')
    if (stored) {
      try { usernames = JSON.parse(stored) } catch {}
    }

    if (currentUsername.value && currentUsername.value !== 'Anonymous' && !usernames.includes(currentUsername.value)) {
      usernames.push(currentUsername.value)
    }

    try {
      await $fetch('/api/github/sync-events', { method: 'POST', body: { usernames } })
    } catch (e) {}
  } else {
    try {
      await $fetch('/api/github/sync-events', { method: 'POST' })
    } catch (e) {}
  }
  await refresh()
}
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-mist-100 pt-[68px] text-slate-100 font-sans pb-24 selection:bg-emerald-500/30">
    <Confetti 
      v-if="showConfetti" 
      class="fixed inset-0 z-[100] pointer-events-none w-full h-full"
      :options="{ particleCount: 150, spread: 90 }"
    />

    <AppHeader
      v-model:activeTab="activeTab"
      @refresh="reloadFeed"
      />

    <AppSidebar class="hidden lg:block" />

    <div class="mx-auto w-full max-w-7xl px-3 pt-4 sm:px-4 sm:pt-6 lg:px-6">
      <div class="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-8">
        
        <div class="hidden lg:block lg:col-span-2"></div> <!-- // ändra till span-3 om vi vill byta till gamla layouten -->

        <main class="mx-auto w-full max-w-md min-w-0 space-y-5 lg:col-span-6">
          
        <main class="lg:col-span-6 w-full max-w-md mx-auto space-y-5">
        <div class="flex items-center gap-8 border-b border-slate-200/60 mb-6 px-2">
           <div class="relative  pb-3">
            <h2 class="text-[16px] font-bold text-slate-900">Feed</h2>
            <div class="absolute bottom-0 left-0 w-full h-1 bg-lime-400 rounded-t-full"></div>
          </div>
        </div>
          <div v-if="!posts || posts.length === 0" class="flex flex-col items-center justify-center mt-20 text-slate-500">
            <svg class="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p class="text-sm">No updates found.</p>
            <p class="text-xs mt-1 text-slate-600">Make a push from GitHub to wake the feed!</p>
          </div>

          <PostCard 
            v-else 
            v-for="post in posts" 
            :key="post.id" 
            :post="post" 
            @refresh="reloadFeed"
          />
          
        </main>

        <aside class="sticky top-[88px] hidden h-fit min-w-0 lg:col-span-3 lg:block">
            <ExploreLiveWidget />
        </aside>

      </div>
    </div>
    
    <AppDock />
  </div>
</template>
