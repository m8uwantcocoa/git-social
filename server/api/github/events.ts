import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const username = query.username
  
  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('github_username', username)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data || []
})