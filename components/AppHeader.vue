<script setup>
const emit = defineEmits(["update:activeTab", "refresh"]);

defineProps({
  activeTab: {
    type: String,
    required: true,
  },
});

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
    class="sticky top-0 z-50 backdrop-blur-md bg-emerald-900/90 border-b border-white/10 py-3 px-4 shadow-lg shadow-emerald-950/20"
  >
    <div class="max-w-md mx-auto flex items-center justify-between gap-3">
      <NuxtLink
        to="/"
        class="text-2xl font-bold text-lime-400 hover:text-lime-300 transition-colors"
      >
        <h1 class="text-xl font-extrabold tracking-tight text-white select-none">
          Git<span class="text-lime-400"> - </span>Social
        </h1>
      </NuxtLink>
      <div class="flex-1 max-w-[180px]">
        
      </div>

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
