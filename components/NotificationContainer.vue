<script lang="ts" setup>
import { Motion } from "motion-v";
import { onMounted, onUnmounted, computed, ref } from "vue";
import NotificationCard from "./NotificationCard.vue";

const { notifications, addNotification } = useNotifications();
const supabase = useSupabaseClient();

const user = ref({
  user_metadata: { user_name: 'TestDeveloper' }
});

const currentUsername = computed(() => {
  return user.value?.user_metadata?.user_name || 'Anonym';
});

let realtimeChannel: any;

onMounted(() => {
  setTimeout(() => {
    addNotification({
      name: "Welcome to Git-Social!",
      description: "Have fun!",
      icon: "👋",
      color: "#3b82f6",
      time: "Now"
    });
  }, 2000);

  realtimeChannel = supabase.channel('global-feed-updates')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'comments' },
      (payload) => {

        // så vi kan se under testet vad som fungar
        // if (payload.new.github_username === currentUsername.value) return;

        addNotification({
          name: payload.new.github_username,
          description: `Commented: "${payload.new.text.substring(0, 30)}..."`,
          icon: "💬",
          color: "#10b981",
          time: "Just now"
        });
      }
    )
    // ÄNDRING HÄR: Vi kollar om vi ens lyckas prenumerera på kanalen
    .subscribe((status) => {
      console.log("supabase:", status);
    });
});

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
});
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 w-full max-w-[350px] pointer-events-none">
    <transition-group name="list" tag="div" class="flex flex-col gap-3">
      <Motion
        v-for="data in notifications"
        :key="data.id"
        as="div"
        :initial="{ scale: 0.8, opacity: 0, x: 50 }"
        :animate="{ scale: 1, opacity: 1, x: 0 }"
        :exit="{ scale: 0.8, opacity: 0, x: 50 }"
        :transition="{ type: 'spring', stiffness: 350, damping: 40 }"
        class="mx-auto w-full pointer-events-auto"
      >
        <NotificationCard
          :name="data.name"
          :description="data.description"
          :icon="data.icon"
          :color="data.color"
          :time="data.time"
        />
      </Motion>
    </transition-group>
  </div>
</template>