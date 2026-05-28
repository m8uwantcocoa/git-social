<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

type GitHubProfile = {
  avatar_url: string
  bio?: string | null
  followers: number
  following: number
  html_url: string
  login: string
  name?: string | null
  public_repos: number
}

type GitHubRepo = {
  id: number
  default_branch?: string
  description?: string | null
  full_name: string
  html_url: string
  language?: string | null
  private: boolean
  stargazers_count?: number
  updated_at?: string
}

type GitHubProfileData = {
  profile: GitHubProfile | null
  repos: GitHubRepo[]
}

const route = useRoute()
const username = computed(() => String(route.params.username || ''))

const { data: githubData, pending, refresh, error } = await useAsyncData(
  () => `github-user-profile-${username.value}`,
  () => $fetch<GitHubProfileData>(`/api/github/users/${username.value}`),
  {
    watch: [username],
    default: () => ({ profile: null, repos: [] })
  }
)

const refreshing = ref(false)
const showAllRepos = ref(false)

const visibleRepos = computed(() => {
  const repos = githubData.value?.repos || []

  return showAllRepos.value ? repos : repos.slice(0, 4)
})

const hasMoreRepos = computed(() => (githubData.value?.repos?.length || 0) > 4)

const refreshProfile = async () => {
  refreshing.value = true

  try {
    await refresh()
  } finally {
    refreshing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-mist-100 pt-[68px] font-sans text-slate-900 selection:bg-emerald-500/30">
    <AppHeader active-tab="global" @refresh="refreshProfile" />
    <AppSidebar class="hidden lg:block" />

    <main class="w-full px-3 pb-28 pt-4 sm:px-5 sm:pt-5 lg:ml-72 lg:w-[calc(100%-18rem)] lg:max-w-none lg:px-6 lg:pb-12 xl:mx-auto xl:w-full xl:max-w-4xl">
      <section class="max-w-full overflow-hidden rounded-3xl border border-slate-200/60 bg-slate-50/80 shadow-sm backdrop-blur-sm sm:rounded-[2rem]">
        <div class="relative min-w-0">
          <div class="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/5 blur-3xl" />
          <div class="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-lime-400/5 blur-3xl" />

          <div class="relative border-b border-slate-200/60 px-4 py-5 sm:px-6 sm:py-7">
            <div class="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0 max-w-2xl">
                

                <h1 class="mt-4 break-words text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  {{ pending ? 'Loading profile...' : `@${username}` }}
                </h1>

                <p class="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                  View this developer's public GitHub profile and recently updated repositories.
                </p>
              </div>

              <button
                class="inline-flex w-full shrink-0 items-center justify-center rounded-2xl border border-transparent bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-500 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                :disabled="pending || refreshing"
                @click="refreshProfile"
              >
                <span v-if="refreshing">Refreshing...</span>
                <span v-else>Refresh profile</span>
              </button>
            </div>
          </div>

          <div class="relative p-4 sm:p-6">
            <div
              v-if="pending"
              class="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[290px_minmax(0,1fr)]"
            >
              <div class="rounded-3xl border border-slate-200/60 bg-slate-100 p-5">
                <div class="flex items-center gap-4">
                  <div class="h-20 w-20 shrink-0 animate-pulse rounded-3xl bg-slate-200" />
                  <div class="min-w-0 flex-1 space-y-3">
                    <div class="h-5 w-40 max-w-full animate-pulse rounded-full bg-slate-200" />
                    <div class="h-4 w-24 max-w-full animate-pulse rounded-full bg-slate-200" />
                  </div>
                </div>

                <div class="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                  <div
                    v-for="item in 3"
                    :key="item"
                    class="h-20 animate-pulse rounded-2xl bg-slate-200"
                  />
                </div>
              </div>

              <div class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="item in 6"
                  :key="item"
                  class="h-36 animate-pulse rounded-3xl bg-slate-100"
                />
              </div>
            </div>

            <div
              v-else-if="githubData?.profile"
              class="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[290px_minmax(0,1fr)]"
            >
              <aside class="min-w-0 space-y-5">
                <div class="rounded-3xl border border-slate-200/60 bg-white/70 p-5 shadow-sm backdrop-blur">
                  <div class="flex min-w-0 flex-col items-center text-center sm:flex-row sm:text-left xl:flex-col xl:text-center">
                    <img
                      :src="githubData.profile.avatar_url"
                      :alt="githubData.profile.login"
                      class="h-20 w-20 shrink-0 rounded-3xl sm:h-24 sm:w-24 border border-slate-200 bg-slate-100 object-cover shadow-sm md:h-20 md:w-20 xl:h-24 xl:w-24"
                    >

                    <div class="mt-4 min-w-0 max-w-full sm:ml-4 sm:mt-0 xl:ml-0 xl:mt-5">
                      <h2 class="truncate text-2xl font-black text-slate-900">
                        {{ githubData.profile.name || githubData.profile.login }}
                      </h2>

                      <p class="mt-1 truncate text-sm font-bold text-emerald-700">
                        @{{ githubData.profile.login }}
                      </p>
                    </div>
                  </div>

                  <dl class="mt-6 grid grid-cols-3 gap-1 sm:gap-2">
                    <div class="min-w-0 rounded-2xl border border-slate-200/60 bg-slate-100 px-1 py-3 text-center sm:px-2 sm:py-4">
                      <dt class="break-words text-[9px] font-black uppercase leading-tight tracking-normal text-slate-500">
                        Repos
                      </dt>
                      <dd class="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                        {{ githubData.profile.public_repos }}
                      </dd>
                    </div>

                    <div class="min-w-0 rounded-2xl border border-slate-200/60 bg-slate-100 px-1 py-3 text-center sm:px-2 sm:py-4">
                      <dt class="break-words text-[9px] font-black uppercase leading-tight tracking-normal text-slate-500">
                        Followers
                      </dt>
                      <dd class="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                        {{ githubData.profile.followers }}
                      </dd>
                    </div>

                    <div class="min-w-0 rounded-2xl border border-slate-200/60 bg-slate-100 px-1 py-3 text-center sm:px-2 sm:py-4">
                      <dt class="break-words text-[9px] font-black uppercase leading-tight tracking-normal text-slate-500">
                        Following
                      </dt>
                      <dd class="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                        {{ githubData.profile.following }}
                      </dd>
                    </div>
                  </dl>
                </div>

                <a
                  :href="githubData.profile.html_url"
                  target="_blank"
                  rel="noreferrer"
                  class="block rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 transition hover:bg-emerald-500/15"
                >
                  <p class="text-sm font-black text-emerald-800">
                    Open on GitHub
                  </p>
                  <p class="mt-2 text-sm leading-6 text-emerald-700">
                    Jump to the full GitHub profile in a new tab.
                  </p>
                </a>
              </aside>

              <section class="min-w-0 overflow-hidden">
                <div class="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div class="min-w-0">
                    <h3 class="break-words text-2xl font-black text-slate-900">
                      Repositories
                    </h3>
                    <p class="mt-1 text-sm text-slate-500">
                      {{ githubData.repos.length }} repositories
                    </p>
                  </div>

                  <span class="w-fit shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-700">
                    GitHub repos
                  </span>
                </div>

                <div
                  v-if="githubData.repos.length"
                  :class="[
                    'repo-scroll-grid grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2',
                    showAllRepos ? 'max-h-[32rem] overflow-y-auto pr-1' : ''
                  ]"
                >
                  <article
                    v-for="repo in visibleRepos"
                    :key="repo.id"
                    class="group flex min-h-40 min-w-0 flex-col justify-between rounded-3xl border border-slate-200/60 bg-slate-100 p-4 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white"
                  >
                    <div class="min-w-0">
                      <div class="flex min-w-0 items-start justify-between gap-3">
                        <div class="min-w-0">
                          <h4 class="break-words text-sm font-black text-slate-900 sm:truncate">
                            {{ repo.full_name }}
                          </h4>
                        </div>

                        <span
                          class="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black"
                          :class="repo.private
                            ? 'border-amber-500/40 bg-amber-100 text-amber-800'
                            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'"
                        >
                          {{ repo.private ? 'Private' : 'Public' }}
                        </span>
                      </div>

                      <p class="mt-3 line-clamp-3 break-words text-xs leading-5 text-slate-600">
                        {{ repo.description || 'No description' }}
                      </p>
                    </div>

                    <div class="mt-5 flex min-w-0 items-center justify-between gap-3 border-t border-slate-200/60 pt-3 text-[11px] font-bold text-slate-500">
                      <span class="min-w-0 truncate">
                        {{ repo.default_branch }}
                      </span>

                      <span class="shrink-0 text-slate-600">
                        ★ {{ repo.stargazers_count }}
                      </span>
                    </div>
                  </article>
                </div>

                <div
                  v-if="githubData.repos.length && hasMoreRepos"
                  class="mt-5 flex justify-center"
                >
                  <button
                    class="inline-flex items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5 text-xs font-black text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-500/15 active:translate-y-0"
                    type="button"
                    @click="showAllRepos = !showAllRepos"
                  >
                    {{ showAllRepos ? 'Show less' : `See more (${githubData.repos.length - 4})` }}
                  </button>
                </div>

                <div
                  v-if="!githubData.repos.length"
                  class="rounded-3xl border border-dashed border-slate-200/80 bg-slate-100 px-5 py-12 text-center"
                >
                  <p class="text-base font-black text-slate-900">
                    No repositories found
                  </p>

                  <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    This GitHub profile was loaded, but no public repositories were returned.
                  </p>
                </div>
              </section>
            </div>

            <div
              v-else
              class="mx-auto max-w-lg rounded-3xl border border-dashed border-slate-200/80 bg-slate-100 px-5 py-10 text-center sm:px-8"
            >
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 bg-white text-2xl font-black text-slate-900">
                ?
              </div>

              <h2 class="mt-5 text-xl font-black text-slate-900">
                Profile unavailable
              </h2>

              <p class="mt-3 text-sm leading-6 text-slate-500">
                {{ error?.statusMessage || 'That GitHub profile could not be loaded right now.' }}
              </p>

              <button
                class="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                :disabled="refreshing"
                @click="refreshProfile"
              >
                <span v-if="refreshing">Refreshing...</span>
                <span v-else>Try again</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <AppDock />
  </div>
</template>

<style scoped>
.repo-scroll-grid {
  scrollbar-gutter: stable;
}

.repo-scroll-grid::-webkit-scrollbar {
  width: 4px;
}

.repo-scroll-grid::-webkit-scrollbar-track {
  background: transparent;
}

.repo-scroll-grid::-webkit-scrollbar-thumb {
  background: rgb(15 23 42 / 0.14);
  border-radius: 999px;
}

.repo-scroll-grid::-webkit-scrollbar-thumb:hover {
  background: rgb(15 23 42 / 0.22);
}

.repo-scroll-grid {
  scrollbar-color: rgb(15 23 42 / 0.14) transparent;
  scrollbar-width: thin;
}
</style>
