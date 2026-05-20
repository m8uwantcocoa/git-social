export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const username = query.username
  
  // https://api.github.com/users/{username}/events
  return await $fetch(`https://api.github.com/users/${username}/events`, {
    headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } 
  })
})