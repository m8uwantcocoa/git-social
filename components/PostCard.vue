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
  <div class="bg-emerald-950 rounded-3xl p-5 border border-white/5 hover:border-white/10 transition-colors">
    <div class="flex items-center space-x-3 mb-4">
      <NuxtLink
        :to="`/users/${post.github_username}`"
        class="block transition-transform hover:scale-105"
        :aria-label="`Open ${post.github_username} profile`"
      >
        <img :src="post.avatar_url || 'https://github.com/github.png'" class="w-10 h-10 rounded-full border border-slate-700/50 bg-slate-800 object-cover" alt="Avatar" />
      </NuxtLink>
      <div class="flex-1 leading-tight">
        <h3 class="font-semibold text-sm text-slate-100">
          <NuxtLink
            :to="`/users/${post.github_username}`"
            class="transition-colors hover:text-emerald-300"
          >
            {{ post.github_username }}
          </NuxtLink>
        </h3>
        <span class="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
          {{ new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
        </span>
      </div>
    </div>

    <div class="mb-5">
      <div class="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md mb-3 border border-emerald-500/20">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs font-mono uppercase font-medium tracking-tight">{{ post.event_type }} - </span>
        <span class="text-xs font-mono font-medium tracking-tight">{{ post.repo_name }}</span>
      </div>

      <p class="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
        {{ post.message || generatedMessage }}
      </p>
    </div>

    <div class="flex items-center space-x-6 pt-1 border-b border-white/5 pb-3 mb-3">
      <button @click="toggleLike" :class="['flex items-center space-x-2 transition-colors group', isLiked ? 'text-red-400' : 'text-slate-400 hover:text-red-400']">
        <div :class="['p-1.5 rounded-full transition-colors', isLiked ? 'bg-red-400/10' : 'group-hover:bg-red-400/10']">
          <svg class="w-5 h-5" :fill="isLiked ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span class="text-xs font-semibold">{{ localLikes.length }}</span>
      </button>

      <button @click="showComments = !showComments" :class="['flex items-center space-x-2 transition-colors group', showComments ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400']">
        <div :class="['p-1.5 rounded-full transition-colors', showComments ? 'bg-cyan-400/10' : 'group-hover:bg-cyan-400/10']">
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
      <span class="text-xs text-emerald-500 mb-1 block">Latest comment:</span>
      <div class="bg-black/10 rounded-xl p-2.5 border border-white/5 text-xs flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
        <span class="font-semibold text-emerald-400 shrink-0">{{ latestComment.github_username }}</span>
        <span class="text-slate-300 truncate">{{ latestComment.text }}</span>
      </div>
      <button v-if="localComments.length > 1" @click="showComments = true" class="text-[11px] text-slate-500 hover:text-slate-400 mb-2 font-medium transition-colors">
        Show all {{ localComments.length }} comments...
      </button>
    </div>

    <div v-if="showComments" class="space-y-3 mt-3 animate-fade-in">
      <div v-if="localComments.length > 0" class="max-h-48 overflow-y-auto space-y-2.5 pr-1">
        <div v-for="comment in localComments" :key="comment.id" class="bg-black/20 rounded-xl p-2.5 border border-white/5 text-xs">
          <div class="flex justify-between items-center mb-1">
            <span class="font-semibold text-emerald-400">{{ comment.github_username }}</span>
            <span class="text-[10px] text-slate-500">
              {{ new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
            </span>
          </div>
          <p class="text-slate-300 leading-normal">{{ comment.text }}</p>
        </div>
      </div>

      <form @submit.prevent="submitComment" class="flex gap-2 mt-2">
        <input
          v-model="newCommentText"
          type="text"
          placeholder="Write a comment..."
          class="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          :disabled="isSubmittingComment"
        />
        <InteractiveSendButton
          type="submit"
          :text="isSubmittingComment ? 'Sending...' : 'Send'"
          :disabled="!newCommentText.trim() || isSubmittingComment"
          class="bg-emerald-600 hover:bg-emerald-500 border-white/10 text-white font-semibold text-xs rounded-xl focus:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </form>
    </div>
  </div>
</template>
