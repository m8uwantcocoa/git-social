import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '../../../types/database.types'

interface GitHubProfileData {
  profile: GitHubUserProfile | null
  repos: GitHubRepo[]
}

interface GitHubUserProfile {
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  public_repos: number
  total_private_repos?: number
}

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  private: boolean
  default_branch?: string
  language?: string | null
  stargazers_count?: number
  updated_at?: string
}

type AuthUser = Pick<User, 'id'>

const getErrorStatus = (error: unknown) => {
  if (typeof error === 'object' && error !== null) {
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return error.statusCode
    }

    const response = 'response' in error ? error.response : undefined

    if (
      typeof response === 'object'
      && response !== null
      && 'status' in response
      && typeof response.status === 'number'
    ) {
      return response.status
    }
  }

  return 500
}

// Helper function to construct the necessary headers for GitHub API requests using the provider token.
const githubApiHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
})

// This API route fetches the authenticated user's GitHub profile and repositories using the provider token stored in an HTTP-only cookie. It also syncs the GitHub profile data with a Supabase database.
export default defineEventHandler(async (event): Promise<GitHubProfileData> => {
  let user = await serverSupabaseUser(event) as AuthUser | null
  let supabase: SupabaseClient<Database> = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    const authHeader = getHeader(event, 'Authorization')

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const config = useRuntimeConfig()

      const fallbackClient = createClient<Database>(
        config.public.supabase.url,
        config.public.supabase.key,
        {
          global: {
            headers: { Authorization: `Bearer ${token}` }
          }
        }
      )

      const { data } = await fallbackClient.auth.getUser()
      if (data.user) {
        user = { id: data.user.id }
        supabase = fallbackClient
      }
    }
  }

  if (!user?.id) {
    console.error('Missing user id while syncing GitHub profile.')
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

  // Fetch the user's GitHub profile and repositories in parallel using the provider token for authentication. Then, upsert the profile data into the Supabase database to keep it in sync.
  try {
    const [profile, repos] = await Promise.all([
      $fetch<GitHubUserProfile>('https://api.github.com/user', {
        headers: githubApiHeaders(providerToken)
      }),
      $fetch<GitHubRepo[]>('https://api.github.com/user/repos', {
        headers: githubApiHeaders(providerToken),
        query: {
          sort: 'updated',
          per_page: 100
        }
      })
    ])

    // Upsert the GitHub profile data into the Supabase database to keep it in sync with the latest information from GitHub.
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
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to save GitHub profile: ${dbError.message}`
      })
    }

    return {
      profile,
      repos
    }
  } catch (error: unknown) {
    throw createError({
      statusCode: getErrorStatus(error),
      statusMessage: 'Failed to fetch or sync GitHub data'
    })
  }
})
