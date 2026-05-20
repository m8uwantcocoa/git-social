import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)
  const targetUserId = body?.targetUserId

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  if (!targetUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Saknar targetUserId' })
  }

  const supabase = await serverSupabaseClient(event)

  const { data: existingFollow } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single()

  if (existingFollow) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { status: 'unfollowed' }
  } else {
    const { error } = await supabase
      .from('follows') 
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      })

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { status: 'followed' }
  }
})