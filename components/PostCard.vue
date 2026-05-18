<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="bg-emerald-950 rounded-3xl p-5 border border-white/5 hover:border-white/10 transition-colors">
    
    <div class="flex items-center space-x-3 mb-4">
      <img :src="post.avatar_url || 'https://github.com/github.png'" class="w-10 h-10 rounded-full border border-slate-700/50 bg-slate-800 object-cover" alt="Avatar" />
      <div class="flex-1 leading-tight">
        <h3 class="font-semibold text-sm text-slate-100">{{ post.github_username }}</h3>
        <span class="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
          {{ new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
        </span>
      </div>
    </div>

    <div class="mb-5">
      <div class="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md mb-3 border border-emerald-500/20">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs font-mono uppercase font-medium tracking-tight">{{ post.event_type }} - </span>
        <span class="text-xs font-mono font-medium tracking-tight">{{ post.repo_name }}</span>
      </div>
      
      <p class="text-slate-200 text-sm leading-relaxed">
        {{ post.message }}
      </p>
    </div>

    <div class="flex items-center space-x-6 pt-1">
      <button class="flex items-center space-x-2 text-slate-400 hover:text-red-400 transition-colors group">
        <div class="p-1.5 rounded-full group-hover:bg-red-400/10 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span class="text-xs font-semibold">69</span>
      </button>
      
      <button class="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors group">
        <div class="p-1.5 rounded-full group-hover:bg-cyan-400/10 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <span class="text-xs font-semibold">Comment</span>
      </button>
    </div>

  </div>
</template>