<template>
  <div class="flex justify-between items-center px-[0.1vw]">
    <div class="text-sm text-[#6C9CE3]">总共 {{ total }} 条</div>
    <div class="flex items-center space-x-4">
      <!-- 翻页按钮 -->
      <div class="flex items-center space-x-2">
        <div @click="goToPrev" :disabled="currentPage === 1"
          class="px-[1vw] w-[0.1vw] h-[0.8vw] rounded-full text-[#6C9CE3] flex items-center justify-center disabled:opacity-50 hover:cursor-pointer disabled:cursor-not-allowed hover:bg-gray-600 transition-colors">
          &lt;
        </div>
        <template v-for="(page, index) in pageNumbers" :key="index">
          <div v-if="typeof page === 'number'" @click="goToPage(page)" :class="[
            'w-[0.1vw] h-[0.8vw] flex items-center justify-center transition-colors px-[1vw] hover:cursor-pointer',
            currentPage === page
              ? 'bg-[#2D5FEC] text-[#6C9CE3]'
              : ' text-[#6C9CE3] hover:bg-gray-600',
          ]">
            {{ page }}
          </div>
          <span v-else class="h-[0.1vw] flex items-center justify-center text-[#6C9CE3]">
            ...
          </span>
        </template>
        <div @click="goToNext" :disabled="currentPage === pageCount"
          class="px-[1vw] w-[0.1vw] h-[0.8vw] hover:cursor-pointer rounded-full text-[#6C9CE3] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors">
          &gt;
        </div>
      </div>
      <!-- 每页条数 -->
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium text-[#6C9CE3]">每页条数</span>
        <select v-model="pageSize"
          class="w-[2vw] h-[1vw] rounded text-[#6C9CE3] border border-gray-600 focus:outline-none focus:border-blue-500 hover:cursor-pointer blue-select"
          @change="onPageSizeChange">
          <option v-for="size in [5, 10, 20, 30, 40, 50]" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>

      <!-- 跳页 -->
      <div class="flex items-center text-sm font-medium space-x-1 text-[#6C9CE3]">
        <span>跳至</span>
        <input v-model="inputValue" type="text"
          class="w-[60px] h-8 px-2 rounded text-[#6C9CE3] border border-gray-600 focus:outline-none focus:border-blue-500"
          @keydown.enter="onPressEnter" />
        <!-- <span>页 / {{ pageCount }}</span> -->
         <span>页</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";

interface Props {
  total: number;
  pageSize: number;
  currentPage: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:pageSize", val: number): void;
  (e: "update:currentPage", val: number): void;
}>();

const inputValue = ref(props.currentPage?.toString());

watch(
  () => props.currentPage,
  (newPage) => {
    inputValue.value = newPage.toString();
  }
);

const pageCount = computed(() => {
  return Math.max(Math.ceil(props.total / props.pageSize), 1);
});

const pageNumbers = computed(() => {
  const total = pageCount.value;
  const current = props.currentPage;
  const show = 5; // The number of page numbers to display
  const pages: (string | number)[] = [];

  if (total <= show) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  let start = current - Math.floor(show / 2);
  let end = current + Math.floor(show / 2);

  if (start < 1) {
    start = 1;
    end = show;
  }

  if (end > total) {
    end = total;
    start = total - show + 1;
  }

  if (start > 1) {
    pages.push(1);
    if (start > 2) {
      pages.push("...");
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total) {
    if (end < total - 1) {
      pages.push("...");
    }
    pages.push(total);
  }

  return pages;
});

const pageSize = ref(props.pageSize);

const goToPage = (page: number) => {
  const validPage = Math.min(Math.max(1, page), pageCount.value);
  emit("update:currentPage", validPage);
};

const debounce = <T extends (...args: any[]) => void>(fn: T, delay = 200) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const changePage = debounce((num: number) => {
  goToPage(num);
});

const onPressEnter = () => {
  const val = inputValue.value.trim();
  const num = Number(val);
  if (/^[1-9]\d*$/.test(val)) {
    changePage(num);
  } else {
    alert("请输入正整数页码");
  }
};

const goToPrev = () => goToPage(props.currentPage - 1);
const goToNext = () => goToPage(props.currentPage + 1);

const onPageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const val = Number(target.value);
  emit("update:pageSize", val);
  emit("update:currentPage", 1);
};
</script>

<style scoped>
.blue-select {
  background: #0b1b44;
}
.blue-select option {
  background: #0b1b44;
  color: #6C9CE3;
}
</style>
