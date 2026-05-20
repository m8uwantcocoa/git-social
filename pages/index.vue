<script setup>
import { ref } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const activeTab = ref('global')

const { data: posts, refresh } = await useAsyncData('posts', async () => {
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUser.value.id)
  
  const followingIds = following.map(f => f.following_id)

  const { data } = await supabase
    .from('events')
    .select(`
      *,
      profiles!inner(id, github_username)
    `)
    .in('profiles.id', followingIds) 
    .order('created_at', { ascending: false })

  return data
})

const reloadFeed = async () => {
  await $fetch('/api/sync-events', { method: 'POST' })
  
  await refresh() 
}
</script>

<template>
  <div class="min-h-screen bg-mist-100 text-slate-100 font-sans pb-24 selection:bg-emerald-500/30">
    <AppHeader
      v-model:activeTab="activeTab"
      @refresh="reloadFeed"
    />

    <div class="max-w-7xl mx-auto w-full px-4 pt-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div class="hidden lg:block lg:col-span-3"></div>

        <main class="lg:col-span-6 w-full max-w-md mx-auto space-y-5">
          
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

        <aside class="hidden lg:block lg:col-span-3 sticky top-[80px] h-fit">
            <ExploreLiveWidget />
        </aside>

      </div>
    </div>
    
    <AppDock />

    <AppDock />
  </div>
</template>
