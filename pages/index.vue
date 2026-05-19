<script setup>
import { ref } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const activeTab = ref('global')

const { data: posts, refresh } = await useAsyncData('posts', async () => {
  const { data } = await supabase
    .from('events')
    .select(`
      *,
      event_likes (github_username),
      comments (id, github_username, text, created_at)
    `)
    .order('created_at', { ascending: false })

  return data
})

const reloadFeed = async () => {
  await refresh()
}
</script>

<template>
  <div class="min-h-screen bg-mist-100 text-slate-100 font-sans pb-10 selection:bg-emerald-500/30">
    <AppHeader
      v-model:activeTab="activeTab"
      @refresh="reloadFeed"
    />

    <main class="max-w-md mx-auto px-4 mt-6 space-y-5">
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

      <AppDock />
    </main>
  </div>
</template>
