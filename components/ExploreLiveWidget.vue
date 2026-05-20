<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
const currentDate = ref('')
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    currentDate.value = now.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })
  }
  updateTime()
  timer = setInterval(updateTime, 60000)
})

onUnmounted(() => clearInterval(timer))

const locationData = ref({
  city: 'Malmö, SE',
  condition: 'Växlande molnighet',
  temp: 18
})

const latestActivity = ref([
  { id: 1, type: 'post', user: 'Alex-Aug', description: 'pushade 3 commits till', target: 'git-social', time: '2m' },
  { id: 2, type: 'mention', user: 'TestBot', description: 'pingade', target: '@DeployBot', time: '14m', isMention: true },
  { id: 3, type: 'follow', user: 'AmerAlzor', description: 'följde', target: 'Linus Torvalds', time: '1h' },
  { id: 4, type: 'comment', user: 'm8uwantcocoa', description: 'kommenterade hos', target: '@AmerAlzor', time: '1h' },
])
</script>

<template>
  <aside class="sticky top-[80px] w-full flex flex-col gap-4 pb-12 h-fit">
    
    <div class="sticky top-0 z-10 bg-white pt-2 pb-2">
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="w-[18px] h-[18px] text-slate-500 group-focus-within:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Search Git-Social" 
          class="w-full bg-slate-100 border border-transparent rounded-full py-2.5 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
        />
      </div>
    </div>

    <div class="bg-slate-50 rounded-2xl flex flex-col pt-3 overflow-hidden">
      <h2 class="font-extrabold text-slate-900 text-xl px-4 pb-3">Explore & Live</h2>
      
      <div class="px-4 py-3 hover:bg-slate-100 transition-colors cursor-pointer flex justify-between items-center">
        <div class="flex flex-col">
          <span class="text-[13px] text-slate-500 mb-0.5">Väder i {{ locationData.city }}</span>
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
      <h2 class="font-extrabold text-slate-900 text-xl px-4 pb-3">Senaste aktivitet</h2>

      <div class="flex flex-col">
        <div v-for="event in latestActivity" :key="event.id" 
             class="px-4 py-3 hover:bg-slate-100 transition-colors cursor-pointer flex flex-col gap-1">
          
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
        
        <button class="px-4 py-4 text-[15px] text-emerald-600 hover:bg-slate-100 transition-colors text-left w-full">
          Show more
        </button>
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