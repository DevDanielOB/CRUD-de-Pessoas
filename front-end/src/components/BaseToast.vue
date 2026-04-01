<script setup lang="ts">
import { computed, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  message: string;
  type: 'success' | 'error';
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

let timer: number | undefined;

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => emit('update:modelValue', false), 3500);
  },
);

const containerClass = computed(() =>
  props.type === 'success'
    ? 'border-[#22c55e] bg-[#166534]'
    : 'border-[#ef4444] bg-[#7f1d1d]',
);
</script>

<template>
  <div v-if="modelValue" class="fixed right-4 top-4 z-[70]">
    <div class="toast-in rounded-xl border px-4 py-3 text-sm font-medium text-white shadow-xl" :class="containerClass">
      {{ message }}
    </div>
  </div>
</template>
