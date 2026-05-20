<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const currentTime = ref('')
const currentDate = ref('')
let timer

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

// here implement weather api
const locationData = ref({
  city: 'Malmö, SE',
  condition: 'Växlande molnighet',
  temp: 18
})

// implement latest activity with supabase realtime, this is dummy data brur
const latestActivity = ref([
  { id: 1, type: 'post', user: 'Alex-Aug', description: 'puschade 3 commits till', target: 'git-social', time: '2m' },
  { id: 2, type: 'mention', user: 'TestBot', description: 'nämnde', target: '@Evan You', time: '14m', isMention: true },
  { id: 3, type: 'follow', user: 'AmerAlzor', description: 'följde Linus Torvalds', target: '', time: '1h' },
  { id: 4, type: 'comment', user: 'm8uwantcocoa', description: 'kommenterade', target: '@AmerAlzor', time: '1h' },
])
</script>

<template>
  <div class="flex flex-col gap-4 sticky top-24 w-full">
    
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input 
        type="text" 
        placeholder="Search Git-Social" 
        class="w-full bg-slate-300/60 border border-emerald-800/30 rounded-full py-2.5 pl-11 pr-4 text-sm text-emerald-200 placeholder-slate-500 focus:outline-none focus:border-slate-600/50 focus:bg-slate-800 transition-colors" 
      />
    </div>

    <div class="bg-slate-300/60 rounded-3xl border border-slate-800/50 backdrop-blur-md overflow-hidden flex flex-col">
      
      <div class="px-5 py-4 border-b border-white/5 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-emerald-900/90 text-base">Malmö, SE • Explore & Live</h3>
          <div class="text-right border border-slate-700/50 bg-emerald-800/30 px-3 py-1 rounded-lg">
            <span class="text-2xl font-light text-white tracking-tight">{{ currentTime || '--:--' }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm">
          <div class="flex flex-col">
            <span class="text-xs text-slate-400">{{ currentDate }}</span>
            <div class="flex items-center gap-2 text-slate-300 mt-1">
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span>{{ locationData.condition }}</span>
            </div>
          </div>
          <span class="font-medium text-white text-base">{{ locationData.temp }}°C</span>
        </div>
      </div>

      <div class="px-5 py-4 flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-slate-100 text-base">Live Feed • Senaste Aktivitet</h3>
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
          </span>
        </div>

        <div class="space-y-4">
          <div v-for="event in latestActivity" :key="event.id" class="flex items-start gap-3 text-xs leading-tight">
            <div class="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" 
              :class="[
                event.type === 'mention' ? 'bg-slate-400' :
                event.type === 'follow' ? 'bg-slate-500' :
                'bg-slate-600'
              ]"
            ></div>
            
            <div class="flex-1 text-slate-300">
              <span class="font-semibold text-white">{{ event.user }}</span> 
              {{ event.description }} 
              <span v-if="event.target" class="font-medium text-slate-200" :class="{'text-white': event.isMention}">{{ event.target }}</span>
            </div>
            
            <span class="text-[10px] text-slate-500 shrink-0">{{ event.time }}</span>
          </div>
        </div>
      </div>

    </div>

    <div class="flex flex-wrap gap-x-3 gap-y-1 px-4 text-[11px] text-slate-500">
      <a href="#" class="hover:underline">Terms of Service</a>
      <a href="#" class="hover:underline">Privacy Policy</a>
      <a href="#" class="hover:underline">Cookie Policy</a>
      <span>© 2026 Git-Social</span>
    </div>

  </div>
</template>