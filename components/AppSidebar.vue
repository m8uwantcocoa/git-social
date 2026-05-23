<script setup>
defineProps({
    open: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['close'])

const isSearchOpen = useState('git-social-search-open', () => false)

const openSearch = () => {
    isSearchOpen.value = true
    emit('close')
}

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
  <UserSearchOverlay />

  <aside class="fixed left-0 top-0 bottom-0 z-40 w-[245px] border-r border-slate-200 bg-slate-50 text-slate-900">
    <div class="flex h-full flex-col px-3 py-10">
      <div class="mb-8 px-3">
      </div>

      <nav class="space-y-1">
        <NuxtLink
          to="/"
          @click="emit('close')"
          :class="[
            isHome
              ? 'bg-slate-200/70 font-semibold text-slate-950'
              : 'font-normal text-slate-700 hover:text-slate-950',
            'group flex items-center gap-4 rounded-xl px-3 py-3 text-base transition-all duration-150 hover:bg-slate-200/60'
          ]"
        >
          <svg
            class="h-6 w-6 shrink-0 transition-transform duration-150 group-hover:scale-105"
            :class="isHome ? 'stroke-[2.5]' : 'stroke-2'"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"
            />
          </svg>
          <span>Home</span>
        </NuxtLink>

        <button
          type="button"
          @click="openSearch"
          class="group flex w-full items-center gap-4 rounded-xl px-3 py-3 text-base text-slate-700 transition-all duration-150 hover:bg-slate-200/60 hover:text-slate-950"
        >
          <svg
            class="h-6 w-6 shrink-0 stroke-2 transition-transform duration-150 group-hover:scale-105"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span>Search</span>
        </button>

        <NuxtLink
          to="/profile"
          @click="emit('close')"
          :class="[
            isProfile
              ? 'bg-slate-200/70 font-semibold text-slate-950'
              : 'font-normal text-slate-700 hover:text-slate-950',
            'group flex items-center gap-4 rounded-xl px-3 py-3 text-base transition-all duration-150 hover:bg-slate-200/60'
          ]"
        >
          <svg
            class="h-6 w-6 shrink-0 transition-transform duration-150 group-hover:scale-105"
            :class="isProfile ? 'stroke-[2.5]' : 'stroke-2'"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>Profile</span>
        </NuxtLink>
      </nav>

      <div class="mt-auto space-y-1">
        <button
          type="button"
          @click="signOut"
          class="group flex w-full items-center gap-4 rounded-xl px-3 py-3 text-base text-slate-700 transition-all duration-150 hover:bg-red-50 hover:text-red-600"
        >
          <svg
            class="h-6 w-6 shrink-0 stroke-2 transition-transform duration-150 group-hover:scale-105"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H9" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13 20H6a2 2 0 01-2-2V6a2 2 0 012-2h7"
            />
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  </aside>
</template>