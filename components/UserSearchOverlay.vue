<script setup lang="ts">
const supabase = useSupabaseClient()
const isSearchOpen = useState<boolean>('git-social-search-open', () => false)

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const followingSet = ref<Set<string>>(new Set())
let searchTimeout: ReturnType<typeof setTimeout> | undefined

const loadFollowing = () => {
  if (!import.meta.client) return

  const stored = localStorage.getItem('git_social_following')
  if (!stored) {
    followingSet.value = new Set()
    return
  }

  try {
    followingSet.value = new Set(JSON.parse(stored))
  } catch {
    followingSet.value = new Set()
  }
}

const closeSearch = () => {
  isSearchOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
  isSearching.value = false
}

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  const query = searchQuery.value.trim()

  if (!query) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true

  searchTimeout = setTimeout(async () => {
    const safeQuery = query.replaceAll('%', '').replaceAll(',', '')

    const { data, error } = await supabase
      .from('profiles')
      .select('id, github_username, full_name, avatar_url')
      .or(`github_username.ilike.%${safeQuery}%,full_name.ilike.%${safeQuery}%`)
      .limit(8)

    if (!error && data) {
      searchResults.value = data
    } else {
      searchResults.value = []
    }

    isSearching.value = false
  }, 300)
}

const toggleFollow = (targetUsername: string) => {
  if (followingSet.value.has(targetUsername)) {
    followingSet.value.delete(targetUsername)
  } else {
    followingSet.value.add(targetUsername)
  }

  if (import.meta.client) {
    localStorage.setItem('git_social_following', JSON.stringify(Array.from(followingSet.value)))
    window.dispatchEvent(new Event('following-updated'))
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeSearch()
}

onMounted(() => {
  loadFollowing()
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('following-updated', loadFollowing)
})

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('following-updated', loadFollowing)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isSearchOpen"
        class="fixed inset-0 z-[100] bg-slate-950/35 px-4 pt-20 backdrop-blur-sm sm:pt-24"
        @click.self="closeSearch"
      >
        <div class="mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div class="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <svg class="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <input
              v-model="searchQuery"
              @input="handleSearch"
              autofocus
              type="text"
              placeholder="Search developers..."
              class="w-full bg-transparent py-2 text-base text-slate-900 placeholder-slate-400 outline-none"
            />

            <button
              type="button"
              class="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close search"
              @click="closeSearch"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="max-h-[60vh] overflow-y-auto p-2">
            <div v-if="!searchQuery.trim()" class="px-5 py-8 text-center text-sm text-slate-500">
              Search for Git-Social users and follow them.
            </div>

            <div v-else-if="isSearching" class="px-5 py-8 text-center text-sm text-slate-500">
              Searching...
            </div>

            <div v-else-if="searchResults.length === 0" class="px-5 py-8 text-center text-sm text-slate-500">
              No developers found.
            </div>

            <div v-else class="flex flex-col">
              <div
                v-for="user in searchResults"
                :key="user.id"
                class="flex items-center justify-between gap-3 rounded-2xl p-3 transition hover:bg-slate-50"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <img
                    :src="user.avatar_url || `https://github.com/${user.github_username}.png`"
                    class="h-11 w-11 shrink-0 rounded-full border border-slate-200 bg-slate-200"
                    alt="avatar"
                  />

                  <div class="flex min-w-0 flex-col">
                    <span class="truncate text-sm font-bold text-slate-900">
                      {{ user.full_name || user.github_username }}
                    </span>
                    <span class="truncate text-xs text-slate-500">@{{ user.github_username }}</span>
                  </div>
                </div>

                <button
                  type="button"
                  @click="toggleFollow(user.github_username)"
                  class="shrink-0 rounded-full px-4 py-1.5 text-[13px] font-bold transition-all"
                  :class="followingSet.has(user.github_username)
                    ? 'border border-slate-200 bg-slate-100 text-slate-800 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                    : 'bg-slate-900 text-white hover:bg-slate-800'"
                >
                  {{ followingSet.has(user.github_username) ? 'Following' : 'Follow' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
