<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

defineEmits(['update:activeTab', 'refresh'])
</script>

<template>
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-emerald-800 border-b border-white/5 pt-6 pb-4 px-4">
    <div class="max-w-md mx-auto">
      
      <div class="flex justify-between items-center mb-5">
        <h1 class="text-2xl font-extrabold tracking-tight text-emerald-300">
          Git-Social
        </h1>
        <button 
          @click="$emit('refresh')" 
          class="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors group" 
          aria-label="Uppdatera feed"
        >
          <svg class="w-4 h-4 text-slate-300 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div class="flex bg-slate-900/50 rounded-2xl border border-white/5">
        <button 
          @click="$emit('update:activeTab', 'followers')" 
          :class="[
            activeTab === 'followers' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200', 
            'flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200'
          ]"
        >
          Followers
        </button>
        <button 
          @click="$emit('update:activeTab', 'global')" 
          :class="[
            activeTab === 'global' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200', 
            'flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200'
          ]"
        >
          Global
        </button>
      </div>

    </div>
  </header>
</template>