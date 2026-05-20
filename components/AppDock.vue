<script setup>
const route = useRoute()

const isHome = computed(() => route.path === '/')
const isProfile = computed(() => route.path.startsWith('/profile'))
</script>

<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
    <nav class="backdrop-blur-md bg-emerald-950/80 border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-1">
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
        class="flex items-center justify-center p-2 rounded-xl text-emerald-200 hover:text-lime-400 hover:bg-white/5 transition-all group"
        aria-label="Settings"
      >
        <svg class="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </nav>
  </div>
</template>
