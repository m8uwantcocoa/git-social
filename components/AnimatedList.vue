<script lang="ts" setup>
import { cn } from "@inspira-ui/plugins";
import { Motion } from "motion-v";
import { Comment, computed, useSlots, type VNode } from "vue";

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const slots = useSlots();

// Read the slot on each render so notifications added later still animate.
const itemsToShow = computed<VNode[]>(() => {
  return (slots.default?.() ?? []).filter((node) => node.type !== Comment)
});
</script>

<template>
  <div :class="cn(`flex flex-col items-center gap-4`, props.class)">
    <transition-group
      name="list"
      tag="div"
      class="flex flex-col-reverse items-center gap-3"
      move-class="move"
    >
      <Motion
        v-for="(node, index) in itemsToShow"
        :key="node.key ?? `animated-item-${index}`"
        as="div"
        :initial="{ scale: 0, opacity: 0 }"
        :animate="{
          scale: 1,
          opacity: 1,
          y: 0,
        }"
        :exit="{
          scale: 0,
          opacity: 0,
          y: 0,
        }"
        :transition="{
          type: 'spring',
          stiffness: 350,
          damping: 40,
        }"
        class="mx-auto w-full"
      >
        <component :is="node.type" v-bind="node.props ?? {}" />
      </Motion>
    </transition-group>
  </div>
</template>

<style scoped>
.move {
  transition: transform 0.4s ease-out;
}
</style>

