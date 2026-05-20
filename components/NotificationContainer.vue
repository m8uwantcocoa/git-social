<script lang="ts" setup>
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

        // så vi kan se under testet vad som fungar. ta bort // när vi klara, annars blir de dubbel
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
    .subscribe((status) => {
      console.log("supabase:", status);
    });
});

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
});
</script>

<template>
  <div class="fixed z-[100] flex flex-col gap-4 pointer-events-none w-full px-4 bottom-28 left-0 md:w-full md:max-w-[350px] md:bottom-6 md:right-6 md:left-auto md:px-0">
    <!-- AnimatedList owns the shared notification transition behavior. -->
    <AnimatedList class="pointer-events-auto">
      <NotificationCard
        v-for="data in notifications"
        :key="data.id"
        :name="data.name"
        :description="data.description"
        :icon="data.icon"
        :color="data.color"
        :time="data.time"
      />
    </AnimatedList>
  </div>
</template>
