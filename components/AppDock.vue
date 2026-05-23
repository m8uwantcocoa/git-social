<script setup>
const route = useRoute()
const supabase = useSupabaseClient()

const isHome = computed(() => route.path === '/')
const isProfile = computed(() => route.path.startsWith('/profile'))

const signOut = async () => {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-3 sm:px-4 lg:hidden">
    <nav class="flex items-center justify-between gap-1 rounded-2xl border border-white/10 bg-emerald-950/80 px-4 py-2.5 shadow-2xl backdrop-blur-md">
      <NuxtLink
        to="/"
        aria-label="Home"
        :class="[
          isHome
            ? 'bg-lime-400/15 text-lime-400'
            : 'text-emerald-200 hover:text-lime-400 hover:bg-white/5',
          'flex items-center justify-center p-2 rounded-xl transition-all group'
        ]"
      >
        <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </NuxtLink>

      <button
        type="button"
        class="flex items-center justify-center p-2 rounded-xl text-emerald-200 hover:text-lime-400 hover:bg-white/5 transition-all group"
        aria-label="Search"
      >
        <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <NuxtLink
        to="/profile"
        aria-label="Profile"
        :class="[
          isProfile
            ? 'bg-lime-400/15 text-lime-400'
            : 'text-emerald-200 hover:text-lime-400 hover:bg-white/5',
          'flex items-center justify-center p-2 rounded-xl transition-all group'
        ]"
      >
        <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </NuxtLink>

      <button
        type="button"
        @click="signOut"
        aria-label="Sign out"
        class="flex items-center justify-center p-2 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-all group"
      >
        <svg class="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H9" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 20H6a2 2 0 01-2-2V6a2 2 0 012-2h7" />
        </svg>
      </button>
    </nav>
  </div>
</template>
