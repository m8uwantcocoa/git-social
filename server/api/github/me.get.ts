import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

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
  let user = await serverSupabaseUser(event)
  let supabase = await serverSupabaseClient(event)

  if (!user || !user.id) {
    const authHeader = getHeader(event, 'Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const config = useRuntimeConfig()

      const fallbackClient = createClient(
        config.public.supabase.url,
        config.public.supabase.key,
        {
          global: {
            headers: { Authorization: `Bearer ${token}` }
          }
        }
      )

      const { data } = await fallbackClient.auth.getUser()
      if (data?.user) {
        user = data.user
        supabase = fallbackClient
      }
    }
  }

  if (!user || !user.id) {
    console.error('AVBRYTER: Sessionen saknar ett giltigt användar-ID just nu.')
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Missing User ID'
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
      }, { onConflict: 'id' })

    if (dbError) {
      console.error('Kunde inte spara profil till databasen:', dbError.message)
    } else {
      console.log(`Profilen för ${profile.login} sparades framgångsrikt!`)
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