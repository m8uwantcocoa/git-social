<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true,
  },
});

defineEmits(["update:activeTab", "refresh"]);
const supabase = useSupabaseClient()

const signOut = async () => {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <header
    class="sticky top-0 z-50 backdrop-blur-md bg-emerald-900/90 border-b border-white/10 py-3 px-4 shadow-lg shadow-emerald-950/20"
  >
    <div class="max-w-md mx-auto flex items-center justify-between gap-3">
      <h1 class="text-xl font-extrabold tracking-tight text-white select-none">
        Git<span class="text-lime-400"> - </span>Social
      </h1>
      <div class="flex-1 max-w-[180px]">
        <div
          class="py-1 px-3 text-xs rounded-lg bg-lime-400 text-emerald-950 shadow-sm font-bold text-center"
        >
          Followers
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="$emit('refresh')"
          class="p-2 bg-emerald-800/40 hover:bg-emerald-800 text-emerald-200 hover:text-white rounded-xl border border-white/5 transition-all group flex-shrink-0"
          aria-label="Refresh feed"
        >
          <svg
            class="w-4 h-4 group-hover:rotate-45 transition-transform duration-300"
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

        <button
          @click="signOut"
          class="px-3 py-2 text-xs font-semibold rounded-xl border border-white/10 bg-emerald-950/40 text-emerald-100 transition hover:bg-emerald-950/70 hover:text-white flex-shrink-0"
        >
          Sign out
        </button>
      </div>
    </div>
  </header>
</template>
