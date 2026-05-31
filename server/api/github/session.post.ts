export default defineEventHandler(async (event) => {
  const body = await readBody<{ providerToken?: string | null }>(event)

  // Store the GitHub provider token in an HTTP-only cookie so the browser cannot read it directly.
  // Why? By storing it in an HTTP-only cookie, we can prevent client-side JavaScript from accessing it, which adds an extra layer of security against cross-site scripting (XSS) attacks.
  setCookie(event, 'github_provider_token', body?.providerToken || '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: body?.providerToken ? 60 * 60 * 8 : 0
  })

  return { ok: true }
})
