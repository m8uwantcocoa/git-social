import { serverSupabaseClient } from '#supabase/server'

interface GitHubEvent {
  id: string
  type: string
  actor: { login: string; avatar_url: string }
  created_at: string
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('github_username')
    .not('github_username', 'is', null)

  if (profileError || !profiles) return { success: false, error: 'Kunde inte hämta profiler' }

  const syncPromises = profiles.map(async (profile) => {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json'
      }
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
      }

      const githubEvents = await $fetch<any[]>(`https://api.github.com/users/${profile.github_username}/events`, {
        headers
      })

      const eventsToSave = githubEvents.map(e => ({
        github_event_id: e.id,
        type: e.type,
        github_username: e.actor.login,
        avatar_url: e.actor.avatar_url,
        created_at: e.created_at,
        repo_name: e.repo?.name, 
        payload: e.payload 
      }))

      if (eventsToSave.length > 0) {
        const { error: upsertError } = await supabase.from('events').upsert(eventsToSave, { onConflict: 'github_event_id' })
        if (upsertError) {
          console.error(`Kunde inte spara events för ${profile.github_username} i databasen:`, upsertError.message)
        }
      }
    } catch (err) {
      console.error(`Fel vid synk av ${profile.github_username}:`, err)
    }
  })

  await Promise.all(syncPromises)
  return { success: true }
})