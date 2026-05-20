import { serverSupabaseClient } from '#supabase/server'

interface GitHubEvent {
  id: string
  type: string
  actor: { login: string; avatar_url: string }
  created_at: string
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  // 1. Hämta alla användare med GitHub-användarnamn
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('github_username')
    .not('github_username', 'is', null)

  if (profileError || !profiles) return { success: false, error: 'Kunde inte hämta profiler' }

  // 2. Loopa och hämta events (använd Promise.all för snabbhet)
  const syncPromises = profiles.map(async (profile) => {
    try {
      const githubEvents = await $fetch<any[]>(`https://api.github.com/users/${profile.github_username}/events`, {
        headers: { 'Accept': 'application/vnd.github+json' }
      })

      // 3. Förbered data för upsert
      const eventsToSave = githubEvents.map(e => ({
        github_event_id: e.id,
        type: e.type,
        github_username: e.actor.login,
        avatar_url: e.actor.avatar_url,
        created_at: e.created_at,
        repo_name: e.repo?.name, // Spara repot för din feed
        payload: e.payload // Spara payload för att kunna visa "pushade 3 commits"
      }))

      if (eventsToSave.length > 0) {
        await supabase.from('events').upsert(eventsToSave, { onConflict: 'github_event_id' })
      }
    } catch (err) {
      console.error(`Fel vid synk av ${profile.github_username}:`, err)
    }
  })

  await Promise.all(syncPromises)
  return { success: true }
})