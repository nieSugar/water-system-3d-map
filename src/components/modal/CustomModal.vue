<!-- 弹窗 -->
<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-opacity-50 flex justify-center items-center z-2000"
    @click.self="closeModal"
  >
    <div class="p-5 rounded-lg relative" :style="modalStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  width: {
    type: String,
    default: '50vw',
  },
  height: {
    type: String,
    default: '53.3vh',
  },
  backgroundImage: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const closeModal = () => {
  emit('update:modelValue', false);
};

const modalStyle = computed(() => ({
  width: props.width,
  height: props.height,
  backgroundImage: `url(${props.backgroundImage})`,
  backgroundPosition: 'center center',
  backgroundSize: '100% 100%',
}));
</script>