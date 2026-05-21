interface GitHubUserProfileData {
  profile: any | null
  repos: any[]
}

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

export default defineEventHandler(async (event): Promise<GitHubUserProfileData> => {
  const username = getRouterParam(event, 'username')
  const providerToken = getCookie(event, 'github_provider_token') || process.env.GITHUB_TOKEN

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing GitHub username'
    })
  }

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
