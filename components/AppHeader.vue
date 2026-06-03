<script setup>

// Component for the top fixed header with app title, refresh button, and profile link
const emit = defineEmits(['update:activeTab', 'refresh'])

defineProps({
  activeTab: {
    type: String,
    required: true,
  },
})

const { avatarUrl } = useGitHubIdentity()
const isRefreshing = ref(false)

const triggerRefresh = () => {
  if (isRefreshing.value) {
    return
  }

  isRefreshing.value = true
  emit('refresh')

  setTimeout(() => {
    isRefreshing.value = false
  }, 600)
}
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-[70] border-b border-white/10 bg-emerald-900/95 px-3 py-3 shadow-lg shadow-emerald-950/20 backdrop-blur-md sm:px-4"
  >
    <div class="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/"
          class="min-w-0 text-2xl font-bold text-lime-400 transition-colors hover:text-lime-300"
        >
          <h1 class="truncate text-lg font-extrabold tracking-tight text-white select-none sm:text-xl">
            𝒈𝒊𝒕<span class="text-lime-400"> - </span>𝒔𝒐𝒄𝒊𝒂𝒍
          </h1>
        </NuxtLink>
      </div>

      <div class="min-w-0 flex-1"></div>

      <div class="flex items-center gap-2">
        <button
          @click="triggerRefresh"
          class="p-2 bg-emerald-800/40 hover:bg-emerald-800 text-emerald-200 hover:text-white rounded-xl border border-white/5 transition-all group flex-shrink-0"
          aria-label="Refresh feed"
        >
          <svg
            :class="[
              'w-4 h-4 transition-transform duration-500',
              isRefreshing ? 'animate-spin' : 'group-hover:rotate-45'
            ]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        <NuxtLink
          to="/profile"
          aria-label="Go to profile"
          class="flex-shrink-0 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400/70 rounded-full"
        >
          <img
            :src="avatarUrl"
            alt="Your profile picture"
            class="w-9 h-9 rounded-full border border-white/10 bg-emerald-950/40 object-cover"
          >
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
