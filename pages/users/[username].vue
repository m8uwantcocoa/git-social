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
  <div class="min-h-screen overflow-x-hidden bg-mist-100 font-sans text-slate-100 selection:bg-emerald-500/30">
    <AppHeader
      active-tab="global"
      @refresh="refreshProfile"
    />

    <main class="mx-auto w-full max-w-7xl px-3 pb-28 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pb-12">
      <section class="max-w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-950 via-slate-950 to-black shadow-2xl shadow-emerald-950/20 sm:rounded-[2rem]">
        <div class="relative min-w-0">
          <div class="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
          <div class="pointer-events-none absolute left-1/3 top-32 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
          <div class="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />

          <div class="relative border-b border-white/10 px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div class="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0 max-w-2xl">
                <div class="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5">
                  <span class="h-2 w-2 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
                  <span class="truncate text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">
                    GitHub account
                  </span>
                </div>

                <h1 class="mt-4 break-words text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {{ pending ? 'Loading profile...' : `@${username}` }}
                </h1>

                <p class="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  View this developer's public GitHub profile and recently updated repositories.
                </p>
              </div>

              <button
                class="inline-flex w-full shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                :disabled="pending || refreshing"
                @click="refreshProfile"
              >
                <span v-if="refreshing">Refreshing...</span>
                <span v-else>Refresh profile</span>
              </button>
            </div>
          </div>

          <div class="relative p-4 sm:p-8 lg:p-10">
            <div
              v-if="pending"
              class="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]"
            >
              <div class="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                <div class="flex items-center gap-4">
                  <div class="h-20 w-20 shrink-0 animate-pulse rounded-3xl bg-white/10" />
                  <div class="min-w-0 flex-1 space-y-3">
                    <div class="h-5 w-40 max-w-full animate-pulse rounded-full bg-white/10" />
                    <div class="h-4 w-24 max-w-full animate-pulse rounded-full bg-white/10" />
                  </div>
                </div>

                <div class="mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-3">
                  <div
                    v-for="item in 3"
                    :key="item"
                    class="h-20 animate-pulse rounded-2xl bg-white/10"
                  />
                </div>
              </div>

              <div class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="item in 6"
                  :key="item"
                  class="h-36 animate-pulse rounded-3xl bg-white/10"
                />
              </div>
            </div>

            <div
              v-else-if="githubData?.profile"
              class="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]"
            >
              <aside class="min-w-0 space-y-5">
                <div class="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-xl shadow-black/20 backdrop-blur">
                  <div class="flex min-w-0 flex-col items-center text-center sm:flex-row sm:text-left lg:flex-col lg:text-center">
                    <img
                      :src="githubData.profile.avatar_url"
                      :alt="githubData.profile.login"
                      class="h-24 w-24 shrink-0 rounded-3xl border border-white/10 bg-slate-800 object-cover shadow-xl shadow-black/30 sm:h-20 sm:w-20 lg:h-28 lg:w-28"
                    >

                    <div class="mt-4 min-w-0 max-w-full sm:ml-4 sm:mt-0 lg:ml-0 lg:mt-5">
                      <h2 class="truncate text-2xl font-black text-white">
                        {{ githubData.profile.name || githubData.profile.login }}
                      </h2>

                      <p class="mt-1 truncate text-sm font-bold text-emerald-300">
                        @{{ githubData.profile.login }}
                      </p>
                    </div>
                  </div>

                  <dl class="mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-3">
                    <div class="rounded-2xl border border-white/10 bg-black/20 px-3 py-4 text-center">
                      <dt class="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Repos
                      </dt>
                      <dd class="mt-1 text-2xl font-black text-white">
                        {{ githubData.profile.public_repos }}
                      </dd>
                    </div>

                    <div class="rounded-2xl border border-white/10 bg-black/20 px-3 py-4 text-center">
                      <dt class="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Followers
                      </dt>
                      <dd class="mt-1 text-2xl font-black text-white">
                        {{ githubData.profile.followers }}
                      </dd>
                    </div>

                    <div class="rounded-2xl border border-white/10 bg-black/20 px-3 py-4 text-center">
                      <dt class="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Following
                      </dt>
                      <dd class="mt-1 text-2xl font-black text-white">
                        {{ githubData.profile.following }}
                      </dd>
                    </div>
                  </dl>
                </div>

                <a
                  :href="githubData.profile.html_url"
                  target="_blank"
                  rel="noreferrer"
                  class="block rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-5 transition hover:bg-emerald-300/15"
                >
                  <p class="text-sm font-black text-emerald-100">
                    Open on GitHub
                  </p>
                  <p class="mt-2 text-sm leading-6 text-emerald-100/70">
                    Jump to the full GitHub profile in a new tab.
                  </p>
                </a>
              </aside>

              <section class="min-w-0 overflow-hidden">
                <div class="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div class="min-w-0">
                    <h3 class="break-words text-2xl font-black text-white">
                      Repositories
                    </h3>
                    <p class="mt-1 text-sm text-slate-400">
                      {{ githubData.repos.length }} repositories loaded
                    </p>
                  </div>

                  <span class="w-fit shrink-0 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-slate-200">
                    Public repos
                  </span>
                </div>

                <div
                  v-if="githubData.repos.length"
                  class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                  <article
                    v-for="repo in githubData.repos"
                    :key="repo.id"
                    class="group flex min-h-40 min-w-0 flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-1 hover:border-emerald-300/30 hover:bg-white/[0.09]"
                  >
                    <div class="min-w-0">
                      <div class="flex min-w-0 items-start justify-between gap-3">
                        <div class="min-w-0">
                          <h4 class="break-words text-sm font-black text-white sm:truncate">
                            {{ repo.full_name }}
                          </h4>
                        </div>

                        <span
                          class="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black"
                          :class="repo.private
                            ? 'border-amber-300/20 bg-amber-400/10 text-amber-200'
                            : 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'"
                        >
                          {{ repo.private ? 'Private' : 'Public' }}
                        </span>
                      </div>

                      <p class="mt-3 line-clamp-3 break-words text-xs leading-5 text-slate-400">
                        {{ repo.description || 'No description' }}
                      </p>
                    </div>

                    <div class="mt-5 flex min-w-0 items-center justify-between gap-3 border-t border-white/10 pt-3 text-[11px] font-bold text-slate-400">
                      <span class="min-w-0 truncate">
                        {{ repo.default_branch }}
                      </span>

                      <span class="shrink-0 text-slate-300">
                        ★ {{ repo.stargazers_count }}
                      </span>
                    </div>
                  </article>
                </div>

                <div
                  v-else
                  class="rounded-3xl border border-dashed border-white/10 bg-white/[0.04] px-5 py-12 text-center"
                >
                  <p class="text-base font-black text-white">
                    No repositories found
                  </p>

                  <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                    This GitHub profile was loaded, but no public repositories were returned.
                  </p>
                </div>
              </section>
            </div>

            <div
              v-else
              class="mx-auto max-w-lg rounded-3xl border border-dashed border-white/10 bg-white/[0.05] px-5 py-10 text-center sm:px-8"
            >
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-2xl font-black text-white">
                ?
              </div>

              <h2 class="mt-5 text-xl font-black text-white">
                Profile unavailable
              </h2>

              <p class="mt-3 text-sm leading-6 text-slate-400">
                {{ error?.statusMessage || 'That GitHub profile could not be loaded right now.' }}
              </p>

              <button
                class="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

      <AppDock />
    </main>
  </div>
</template>
