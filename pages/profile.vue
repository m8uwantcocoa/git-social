<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()

const { data: githubData, pending, refresh } = await useAsyncData('github-profile', async () => {
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.provider_token) {
    await $fetch('/api/github/session', {
      method: 'POST',
      body: { providerToken: session.provider_token }
    })
  }

  const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}

  return await $fetch('/api/github/me', { headers })
}, {
  default: () => ({ profile: null, repos: [] })
})

const refreshProfile = async () => {
  await refresh()
}
</script>

<template>
  <div class="min-h-screen bg-mist-100 pb-10 font-sans text-slate-100 selection:bg-emerald-500/30">
    <AppHeader
      active-tab="global"
      @refresh="refreshProfile"
    />

    <main class="mx-auto mt-6 max-w-md space-y-5 px-4 pb-24">
      <section class="rounded-3xl border border-white/5 bg-emerald-950 p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-emerald-300">GitHub account</p>
            <h2 class="mt-2 text-lg font-bold text-white">Profile</h2>
            <p class="mt-1 text-sm text-slate-300">
              View the connected GitHub account separately from the feed.
            </p>
          </div>

          <button
            class="rounded-xl border border-white/10 bg-emerald-900/50 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-800"
            @click="refreshProfile"
          >
            Refresh
          </button>
        </div>

        <div v-if="pending" class="mt-4 text-sm text-slate-400">
          Loading account data...
        </div>

        <div v-else-if="githubData?.profile" class="mt-4">
          <div class="flex items-center gap-3">
            <img
              :src="githubData.profile.avatar_url"
              :alt="githubData.profile.login"
              class="h-14 w-14 rounded-full border border-white/10 bg-slate-800 object-cover"
            >
            <div class="min-w-0">
              <p class="truncate text-base font-semibold text-white">
                {{ githubData.profile.name || githubData.profile.login }}
              </p>
              <p class="text-sm text-emerald-300">@{{ githubData.profile.login }}</p>
            </div>
          </div>

          <dl class="mt-4 grid grid-cols-3 gap-3">
            <div class="rounded-2xl border border-white/5 bg-black/20 px-3 py-3">
              <dt class="text-[11px] uppercase tracking-wide text-slate-500">Repos</dt>
              <dd class="mt-1 text-lg font-bold text-white">{{ githubData.profile.public_repos }}</dd>
            </div>
            <div class="rounded-2xl border border-white/5 bg-black/20 px-3 py-3">
              <dt class="text-[11px] uppercase tracking-wide text-slate-500">Followers</dt>
              <dd class="mt-1 text-lg font-bold text-white">{{ githubData.profile.followers }}</dd>
            </div>
            <div class="rounded-2xl border border-white/5 bg-black/20 px-3 py-3">
              <dt class="text-[11px] uppercase tracking-wide text-slate-500">Following</dt>
              <dd class="mt-1 text-lg font-bold text-white">{{ githubData.profile.following }}</dd>
            </div>
          </dl>

          <div class="mt-5">
            <h3 class="text-sm font-semibold text-white">Repositories</h3>

            <div class="mt-3 space-y-2">
              <div
                v-for="repo in githubData.repos"
                :key="repo.id"
                class="rounded-2xl border border-white/5 bg-black/20 px-4 py-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-white">{{ repo.full_name }}</p>
                    <p class="mt-1 line-clamp-2 text-xs text-slate-400">
                      {{ repo.description || 'No description' }}
                    </p>
                  </div>
                  <span class="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                    {{ repo.private ? 'Private' : 'Public' }}
                  </span>
                </div>
                <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{{ repo.default_branch }}</span>
                  <span>{{ repo.stargazers_count }} stars</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="mt-4 text-sm text-slate-400">
          No GitHub profile data is available yet. Sign out and sign in again if the provider token was not captured.
        </p>
      </section>

      <AppDock />
    </main>
  </div>
</template>
