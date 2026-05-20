import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

interface GitHubProfileData {
  profile: any | null
  repos: any[]
}

const githubApiHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
})

export default defineEventHandler(async (event): Promise<GitHubProfileData> => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const providerToken = getCookie(event, 'github_provider_token')

  if (!providerToken) {
    return {
      profile: null,
      repos: []
    }
  }

  try {
    const [profile, repos] = await Promise.all([
      $fetch<any>('https://api.github.com/user', {
        headers: githubApiHeaders(providerToken)
      }),
      $fetch<any>('https://api.github.com/user/repos', {
        headers: githubApiHeaders(providerToken),
        query: {
          sort: 'updated',
          per_page: 5
        }
      })
    ])

    const supabase = await serverSupabaseClient(event)

    const { error: dbError } = await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    github_username: profile.login,
    full_name: profile.name || profile.login,
    email: profile.email,
    avatar_url: profile.avatar_url,
    public_repos: profile.public_repos,
    total_private_repos: profile.total_private_repos || 0,
    updated_at: new Date().toISOString()
  } as any, { onConflict: 'id' })

    if (dbError) {
      console.error('Kunde inte spara profil till databasen:', dbError.message)
    }

    return {
      profile,
      repos
    }
    
  } catch (error: any) {
    const statusCode = error?.response?.status || 500

    throw createError({
      statusCode,
      statusMessage: 'Failed to fetch or sync GitHub data'
    })
  }
})