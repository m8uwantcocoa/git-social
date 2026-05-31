interface GitHubUserProfileData {
  profile: any | null
  repos: any[]
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

  // If no provider token is available, we cannot authenticate with the GitHub API, so we return null data instead of throwing an error.
  try {
    const [profile, repos] = await Promise.all([
      $fetch<any>(`https://api.github.com/users/${username}`, {
        headers: githubApiHeaders(providerToken)
      }),
      $fetch<any[]>(`https://api.github.com/users/${username}/repos`, {
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
  } catch (error: any) {
    const statusCode = error?.response?.status || 500

    throw createError({
      statusCode,
      statusMessage: 'Failed to fetch GitHub user data'
    })
  }
})
