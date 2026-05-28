<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const { addNotification } = useNotifications()
const emit = defineEmits(['refresh'])
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { username: currentUsername } = useGitHubIdentity()

const localLikes = ref(props.post.event_likes || [])
const localComments = ref(props.post.comments || [])

const showComments = ref(false)
const newCommentText = ref('')
const isSubmittingComment = ref(false)

const isLiked = computed(() => {
  return localLikes.value.some((like) => like.github_username === currentUsername.value)
})

const latestComment = computed(() => {
  if (localComments.value.length === 0) return null
  return localComments.value[localComments.value.length - 1]
})

const generatedMessage = computed(() => {
  const type = props.post.event_type
  let payload = props.post.payload

  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload) } catch {}
  }

  if (type === 'PushEvent') {
    const commits = payload?.commits || []
    const commitsCount = payload?.size || commits.length || 0
    let msg = `Pushed ${commitsCount} commit${commitsCount !== 1 ? 's' : ''}`
    
    if (commits.length > 0) {
      msg += `:\n"${commits[0].message}"`
    }
    return msg
  } else if (type === 'CreateEvent') {
    const refType = payload?.ref_type || 'repository'
    return `Created a new ${refType}`
  } else if (type === 'IssuesEvent') {
    const action = payload?.action || 'opened'
    const title = payload?.issue?.title
    let msg = `${action.charAt(0).toUpperCase() + action.slice(1)} an issue`
    if (title) msg += `:\n"${title}"`
    return msg
  } else if (type === 'PullRequestEvent') {
    const action = payload?.action || 'opened'
    const title = payload?.pull_request?.title
    let msg = `${action.charAt(0).toUpperCase() + action.slice(1)} a pull request`
    if (title) msg += `:\n"${title}"`
    return msg
  } else if (type === 'WatchEvent') {
    return `Starred the repository`
  } else if (type === 'ForkEvent') {
    return `Forked the repository`
  } else if (type === 'IssueCommentEvent') {
    return `Commented on an issue`
  } else if (type === 'DeleteEvent') {
    return `Deleted a ${payload?.ref_type || 'branch'}`
  }
  
  return `Interacted with the repository`
})

const toggleLike = async () => {
  if (!user.value) {
    alert('You need to sign in to like posts.')
    return
  }

  if (isLiked.value) {
    const { error } = await supabase
      .from('event_likes')
      .delete()
      .eq('event_id', props.post.id)
      .eq('github_username', currentUsername.value)

    if (!error) {
      localLikes.value = localLikes.value.filter((like) => like.github_username !== currentUsername.value)
    }

    return
  }

  const { error } = await supabase
    .from('event_likes')
    .insert({
      event_id: props.post.id,
      github_username: currentUsername.value
    })

  if (!error) {
    localLikes.value.push({ github_username: currentUsername.value })
  }
}

const submitComment = async () => {
  if (!newCommentText.value.trim() || isSubmittingComment.value) {
    return
  }

  if (!user.value) {
    alert('You need to sign in to comment.')
    return
  }

  isSubmittingComment.value = true

  const { data, error } = await supabase
    .from('comments')
    .insert({
      id: crypto.randomUUID(),
      event_id: props.post.id,
      github_username: currentUsername.value,
      text: newCommentText.value.trim()
    })
    .select()

  if (!error && data) {
    localComments.value.push(data[0])
    newCommentText.value = ''

    addNotification({
      name: 'Successfully commented!',
      description: 'Your comment has been posted.',
      icon: '💬',
      color: '#10b981',
      time: 'Now'
    })
  } else {
    console.error('Failed to save comment:', error)
  }

  isSubmittingComment.value = false
}
</script>

<template>
  <div class="bg-slate-50/80 shadow-sm backdrop-blur-sm rounded-3xl p-5 border border-slate-200/60 hover:border-slate-300 hover:shadow-md transition-all">
    
    <div class="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:justify-between flex-wrap">
      
      <div class="flex min-w-0 items-center space-x-3">
        <NuxtLink
          :to="`/users/${post.github_username}`"
          class="block shrink-0 transition-transform hover:scale-105"
          :aria-label="`Open ${post.github_username} profile`"
        >
          <img
            :src="post.avatar_url || 'https://github.com/github.png'"
            class="h-10 w-10 rounded-full border border-slate-200 bg-slate-100 object-cover"
            alt="Avatar"
          />
        </NuxtLink>

        <div class="min-w-0 leading-tight">
          <h3 class="truncate text-sm font-semibold text-slate-800">
            <NuxtLink
              :to="`/users/${post.github_username}`"
              class="transition-colors hover:text-emerald-600"
            >
              {{ post.github_username }}
            </NuxtLink>
          </h3>

          <span class="mt-0.5 block truncate text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {{ new Date(post.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' }) }} •
            {{ new Date(post.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }}
          </span>
        </div>
      </div>

      <div class="inline-flex min-w-0 shrink-0 max-w-full items-center space-x-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-emerald-700 sm:max-w-[70%] min-[1024px]:max-[1184px]:flex min-[1024px]:max-[1184px]:w-full min-[1024px]:max-[1184px]:max-w-full min-[1024px]:max-[1184px]:mt-2">
        <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-tight">{{ post.event_type }} - </span>
        <span class="truncate font-mono text-[11px] font-medium tracking-tight">{{ post.repo_name }}</span>
      </div>
    </div>

    <div class="mb-5">
      <p class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
        {{ post.message || generatedMessage }}
      </p>
    </div>

    <div class="flex items-center space-x-6 pt-1 border-b border-slate-200 pb-3 mb-3">
      <button @click="toggleLike" :class="['flex items-center space-x-2 transition-colors group', isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500']">
        <div :class="['p-1.5 rounded-full transition-colors', isLiked ? 'bg-red-500/10' : 'group-hover:bg-red-500/10']">
          <svg class="w-5 h-5" :fill="isLiked ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span class="text-xs font-semibold">{{ localLikes.length }}</span>
      </button>

      <button @click="showComments = !showComments" :class="['flex items-center space-x-2 transition-colors group', showComments ? 'text-cyan-600' : 'text-slate-500 hover:text-cyan-600']">
        <div :class="['p-1.5 rounded-full transition-colors', showComments ? 'bg-cyan-600/10' : 'group-hover:bg-cyan-600/10']">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <span class="text-xs font-semibold">
          {{ localComments.length }} {{ localComments.length === 1 ? 'Comment' : 'Comments' }}
        </span>
      </button>
    </div>

    <div v-if="!showComments && latestComment" class="animate-fade-in mt-1">
      <span class="text-xs text-emerald-600 mb-1 block">Latest comment:</span>
      <div class="bg-slate-100 rounded-xl p-2.5 border border-slate-200/60 text-xs flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
        <NuxtLink
          :to="`/users/${latestComment.github_username}`"
          class="font-semibold text-emerald-700 shrink-0 transition-colors hover:text-emerald-600"
          :aria-label="`Open ${latestComment.github_username} profile`"
        >
          {{ latestComment.github_username }}
        </NuxtLink>
        <span class="text-slate-700 truncate">{{ latestComment.text }}</span>
      </div>
      <button v-if="localComments.length > 1" @click="showComments = true" class="text-[11px] text-slate-500 hover:text-slate-700 mt-2 mb-2 font-medium transition-colors">
        Show all {{ localComments.length }} comments...
      </button>
    </div>

    <div v-if="showComments" class="space-y-3 mt-3 animate-fade-in">
      <div v-if="localComments.length > 0" class="max-h-48 overflow-y-auto space-y-2.5 pr-1">
        <div v-for="comment in localComments" :key="comment.id" class="bg-slate-100 rounded-xl p-2.5 border border-slate-200/60 text-xs">
          <div class="flex justify-between items-center mb-1">
            <NuxtLink
              :to="`/users/${comment.github_username}`"
              class="font-semibold text-emerald-700 transition-colors hover:text-emerald-600"
              :aria-label="`Open ${comment.github_username} profile`"
            >
              {{ comment.github_username }}
            </NuxtLink>
            <span class="text-[10px] text-slate-500">
              {{ new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
            </span>
          </div>
          <p class="text-slate-700 leading-normal">{{ comment.text }}</p>
        </div>
      </div>

      <form @submit.prevent="submitComment" class="flex gap-2 mt-2">
        <input
          v-model="newCommentText"
          type="text"
          placeholder="Write a comment..."
          class="flex-1 bg-slate-100 border border-slate-200/60 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
          :disabled="isSubmittingComment"
        />
        <InteractiveSendButton
          type="submit"
          :text="isSubmittingComment ? 'Sending...' : 'Send'"
          :disabled="!newCommentText.trim() || isSubmittingComment"
          class="bg-emerald-600 hover:bg-emerald-500 border-transparent text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </form>
    </div>
  </div>
</template>