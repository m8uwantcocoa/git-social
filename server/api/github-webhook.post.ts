import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const githubEvent = getHeader(event, 'x-github-event')
  if (githubEvent !== 'push') {
    return { status: 'Ignored, not a push event' }
  }

  const username = body.sender.login
  const avatarUrl = body.sender.avatar_url
  const repoName = body.repository.name

  const message = body.commits && body.commits.length > 0 
                  ? body.commits[0].message 
                  : 'Pushed code without message'

  const supabase = serverSupabaseServiceRole(event)

  const { error } = await (supabase as any).from('events').insert({
    github_username: username,
    event_type: 'PushEvent',
    repo_name: repoName,
    message: message,
    avatar_url: avatarUrl
  })

  if (error) {
    console.error("Fel vid sparande till Supabase:", error)
    return { error: 'Failed to save event' }
  }

  return { success: true }
})