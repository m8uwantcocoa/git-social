import { serverSupabaseUser } from '#supabase/server'

const githubApiHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
})

export default defineEventHandler(async (event) => {
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
    // Call GitHub from the server with the OAuth token caught during sign-in.
    const [profile, repos] = await Promise.all([
      $fetch('https://api.github.com/user', {
        headers: githubApiHeaders(providerToken)
      }),
      $fetch('https://api.github.com/user/repos', {
        headers: githubApiHeaders(providerToken),
        query: {
          sort: 'updated',
          per_page: 5
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
      statusMessage: 'Failed to fetch GitHub data'
    })
  }
})
