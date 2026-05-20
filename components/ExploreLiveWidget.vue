<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const supabase = useSupabaseClient()
const currentUser = useSupabaseUser()

const currentTime = ref('')
const currentDate = ref('')
let timer: ReturnType<typeof setInterval>

const locationData = ref({
  city: 'Locating...',
  condition: 'Gathering weather info...',
  temp: '--'
})

const fetchWeatherFromApi = async (lat: number, lon: number) => {
  try {
    const data = await $fetch(`/api/weather/weather?lat=${lat}&lon=${lon}`)
    
    if (data.error) {
      locationData.value.condition = 'Could not fetch'
      return
    }

    locationData.value = {
      city: data.city,
      condition: data.condition,
      temp: data.temp
    }
  } catch (err) {
    locationData.value.condition = 'Could not fetch'
  }
}

const initLocalWeather = () => {
  if (!navigator.geolocation) {
    locationData.value.condition = 'Not supported'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeatherFromApi(position.coords.latitude, position.coords.longitude)
    },
    (error) => {
      console.warn('Location denied:', error)
      locationData.value = {
        city: 'Git-Social HQ',
        condition: 'Location denied',
        temp: '--'
      }
    },
    { timeout: 10000 }
  )
}

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const followingSet = ref<Set<string>>(new Set()) 
let searchTimeout: any

const fetchMyFollows = async () => {
  if (!currentUser.value) return
  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUser.value.id)
  
  if (data) {
    followingSet.value = new Set(data.map(f => f.following_id))
  }
  await fetchLatestActivity()
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, github_username, full_name, avatar_url')
      .or(`github_username.ilike.%${searchQuery.value}%,full_name.ilike.%${searchQuery.value}%`)
      .limit(5)

    if (!error && data) {
      searchResults.value = data
    }
    isSearching.value = false
  }, 300) 
}

const toggleFollow = async (targetId: string) => {
  const isFollowing = followingSet.value.has(targetId)
  
  if (isFollowing) {
    followingSet.value.delete(targetId)
  } else {
    followingSet.value.add(targetId)
  }

  try {
    await $fetch('/api/follow', {
      method: 'POST',
      body: { targetUserId: targetId }
    })
    await fetchLatestActivity()
  } catch (err) {
    console.error('Failed to toggle follow status:', err)
    if (isFollowing) {
      followingSet.value.add(targetId)
    } else {
      followingSet.value.delete(targetId)
    }
  }
}

onMounted(() => {
  initLocalWeather()
  fetchMyFollows()

  const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
    currentDate.value = now.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })
  }
  updateTime()
  timer = setInterval(updateTime, 60000)
})

onUnmounted(() => clearInterval(timer))

const latestActivity = ref<any[]>([])

const getEventDescription = (event: any) => {
  const type = event.type
  const payload = event.payload || {}

  if (type === 'PushEvent') {
    const commitsCount = payload.size || payload.commits?.length || 0
    return `pushed ${commitsCount} commit${commitsCount !== 1 ? 's' : ''} to`
  } else if (type === 'CreateEvent') {
    return `created a new ${payload.ref_type || 'repository'}`
  } else if (type === 'WatchEvent') {
    return `starred`
  } else if (type === 'ForkEvent') {
    return `forked`
  } else if (type === 'IssuesEvent') {
    return `${payload.action || 'opened'} an issue in`
  } else if (type === 'PullRequestEvent') {
    return `${payload.action || 'opened'} a pull request in`
  } else if (type === 'IssueCommentEvent') {
    return `commented on an issue in`
  } else if (type === 'DeleteEvent') {
    return `deleted a ${payload.ref_type || 'branch'} in`
  }
  return `interacted with`
}

const formatTimeAgo = (dateString: string) => {
  const diff = new Date().getTime() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins || 1}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

const fetchLatestActivity = async () => {
  if (!currentUser.value) return
  const followedIds = Array.from(followingSet.value)
  if (followedIds.length === 0) {
    latestActivity.value = []
    return
  }

  const { data: profiles } = await supabase.from('profiles').select('github_username').in('id', followedIds)
  const usernamesToTrack = profiles ? profiles.map(p => p.github_username) : []
  
  if (usernamesToTrack.length === 0) {
    latestActivity.value = []
    return
  }

  const { data: events } = await supabase.from('events').select('*').in('github_username', usernamesToTrack).order('created_at', { ascending: false }).limit(4)

  if (events) {
    latestActivity.value = events.map(e => ({
      id: e.id,
      type: 'post',
      user: e.github_username,
      description: getEventDescription(e),
      target: e.repo_name,
      time: formatTimeAgo(e.created_at),
      isMention: false
    }))
  }
}
</script>

<template>
  <aside class="sticky top-[80px] w-full flex flex-col gap-4 pb-12 h-fit">
    
    <div class="sticky top-0 z-20 bg-mist-100 pt-2 pb-2"> <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="w-[18px] h-[18px] text-slate-500 group-focus-within:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          v-model="searchQuery"
          @input="handleSearch"
          type="text" 
          placeholder="Search Git-Social" 
          class="w-full bg-slate-100 border border-transparent rounded-full py-2.5 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
        />
        
        <div v-if="searchQuery" class="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div v-if="isSearching" class="p-4 text-center text-sm text-slate-500">
            Searching...
          </div>
          <div v-else-if="searchResults.length === 0" class="p-4 text-center text-sm text-slate-500">
            No developers found.
          </div>
          <div v-else class="flex flex-col">
            <div v-for="user in searchResults" :key="user.id" class="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
              <div class="flex items-center gap-3 overflow-hidden">
                 <img :src="user.avatar_url" class="w-10 h-10 rounded-full bg-slate-200 shrink-0 border border-slate-200" />
                 <div class="flex flex-col min-w-0">
                   <span class="text-sm font-bold text-slate-900 truncate">{{ user.full_name || user.github_username }}</span>
                   <span class="text-xs text-slate-500 truncate">@{{ user.github_username }}</span>
                 </div>
              </div>
              <button 
                @click="toggleFollow(user.id)"
                class="px-4 py-1.5 rounded-full text-[13px] font-bold transition-all shrink-0"
                :class="followingSet.has(user.id) 
                  ? 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'"
              >
                {{ followingSet.has(user.id) ? 'Following' : 'Follow' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-slate-50 rounded-2xl flex flex-col pt-3 overflow-hidden">
      <h2 class="font-extrabold text-slate-900 text-xl px-4 pb-3">Weather</h2>
      <div class="px-4 py-3 hover:bg-slate-100 transition-colors cursor-pointer flex justify-between items-center">
        <div class="flex flex-col">
          <span class="text-[13px] text-slate-500 mb-0.5">{{ locationData.city }}</span>
          <span class="font-bold text-slate-900 text-[15px]">{{ locationData.condition }}</span>
          <span class="text-[13px] text-slate-500 mt-0.5">{{ locationData.temp }}°C</span>
        </div>
        <div class="flex flex-col items-end">
           <span class="text-xs text-slate-500 mb-1">{{ currentDate }}</span>
           <span class="text-2xl font-light text-slate-700 tracking-tight">{{ currentTime || '--:--' }}</span>
        </div>
      </div>
    </div>

    <div class="bg-slate-50 rounded-2xl flex flex-col pt-3 overflow-hidden">
      <h2 class="font-extrabold text-slate-900 text-xl px-4 pb-3">Latest Activity</h2>
      <div class="flex flex-col">
        <div v-if="latestActivity.length === 0" class="px-4 py-4 text-sm text-slate-500 text-center">
          Follow developers to see their activity here.
        </div>
        <div v-for="event in latestActivity" :key="event.id" class="px-4 py-3 hover:bg-slate-100 transition-colors cursor-pointer flex flex-col gap-1">
          <div class="flex items-center gap-2 text-[13px] text-slate-500">
             <svg v-if="event.type === 'mention'" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path></svg>
             <svg v-else-if="event.type === 'post'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
             <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
             <span>Trending · {{ event.time }}</span>
          </div>
          <div class="text-[15px] leading-snug text-slate-900">
            <span class="font-bold">{{ event.user }}</span> 
            <span class="text-slate-600"> {{ event.description }} </span> 
            <span v-if="event.target" class="font-medium" :class="event.isMention ? 'text-emerald-600 hover:underline' : 'text-slate-800'">
              {{ event.target }}
            </span>
          </div>
        </div>
        
      </div>
    </div>

    <nav class="flex flex-wrap gap-x-3 gap-y-1 px-4 mt-1 text-[13px] text-slate-500">
      <span>© 2026 Git-Social</span>
    </nav>
  </aside>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>