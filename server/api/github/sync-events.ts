import { serverSupabaseClient } from '#supabase/server'

interface GitHubEvent {
  id: string
  type: string
  actor: { login: string; avatar_url: string }
  created_at: string
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  const body = await readBody(event).catch(() => ({}))
  let usernamesToSync = body?.usernames || []

  if (!usernamesToSync || usernamesToSync.length === 0) {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('github_username')
      .not('github_username', 'is', null)

    if (profileError || !profiles) return { success: false, error: 'Kunde inte hämta profiler' }
    usernamesToSync = profiles.map(p => p.github_username)
  }

  const syncPromises = usernamesToSync.map(async (username: string) => {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json'
      }
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
      }

      const githubEvents = await $fetch<any[]>(`https://api.github.com/users/${username}/events`, {
        headers
      })

      const eventsToSave = githubEvents.map(e => {
        let extractedMessage = null

        if (e.type === 'PushEvent') {
          const commits = e.payload?.commits || []
          if (commits.length > 0) {
            extractedMessage = commits[0].message
          } else {
            const branch = e.payload?.ref?.replace('refs/heads/', '') || 'branch'
            extractedMessage = `Pushed updates to ${branch}`
          }
        } else if (e.type === 'IssuesEvent') {
          extractedMessage = e.payload?.issue?.title
        } else if (e.type === 'PullRequestEvent') {
          extractedMessage = e.payload?.pull_request?.title
        }

        return {
          github_event_id: e.id,
          event_type: e.type,
          github_username: e.actor.login,
          avatar_url: e.actor.avatar_url,
          created_at: e.created_at,
          repo_name: e.repo?.name,
          payload: e.payload,
          message: extractedMessage 
        }
      })

      if (eventsToSave.length > 0) {
        const { error: upsertError } = await supabase.from('events').upsert(eventsToSave, { onConflict: 'github_event_id' })
        if (upsertError) {
          console.error(`Kunde inte spara events för ${username} i databasen:`, upsertError.message)
        }
      }
    } catch (err) {
      console.error(`Fel vid synk av ${username}:`, err)
    }
  })

  await Promise.all(syncPromises)
  return { success: true }
})