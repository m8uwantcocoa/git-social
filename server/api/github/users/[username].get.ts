interface GitHubUserProfileData {
  profile: GitHubUserProfile | null
  repos: GitHubRepo[]
}

interface GitHubUserProfile {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  followers: number
  following: number
  html_url: string
  public_repos: number
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

const getErrorStatus = (error: unknown) => {
  if (typeof error === 'object' && error !== null) {
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

// This API route fetches a GitHub user's profile and repos using a provider token from cookies or environment variables.
const githubApiHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

// This API route retrieves a GitHub user's profile and repositories using a provider token from cookies or environment variables for authentication.
export default defineEventHandler(async (event): Promise<GitHubUserProfileData> => {
  const username = getRouterParam(event, 'username')
  const providerToken = getCookie(event, 'github_provider_token') || process.env.GITHUB_TOKEN

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing GitHub username'
    })
  }

  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid GitHub username'
    })
  }

  const encodedUsername = encodeURIComponent(username)

  // If no provider token is available, we can still use GitHub's public API with lower rate limits.
  try {
    const [profile, repos] = await Promise.all([
      $fetch<GitHubUserProfile>(`https://api.github.com/users/${encodedUsername}`, {
        headers: githubApiHeaders(providerToken)
      }),
      $fetch<GitHubRepo[]>(`https://api.github.com/users/${encodedUsername}/repos`, {
        headers: githubApiHeaders(providerToken),
        query: {
          sort: 'updated',
          per_page: 6
        }
      })
    ])

    return {
      profile,
      repos
    }
  } catch (error: unknown) {
    throw createError({
      statusCode: getErrorStatus(error),
      statusMessage: 'Failed to fetch GitHub user data'
    })
  }
})
