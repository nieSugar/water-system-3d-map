<template>
  <!-- 今日话务满意量弹窗组件 -->
  <CustomModal v-model="dialogVisible" :background-image="bghw">
    <div class="flex flex-col h-full">
      <div class="h-[6vh] flex justify-center items-center">
        <div class="text-center text-[0.8vw] text-white">今日-话务满意量</div>
      </div>
      <div class="flex-1 w-full overflow-x-auto">
        <table class="w-full border-collapse text-white">
          <thead class="h-[3.6vh]">
            <tr class="bg-opacity-20">
              <th class="text-center">序号</th>
              <th class="text-center">呼叫类型</th>
              <th class="text-center">电话号码</th>
              <th class="text-center">接待客服</th>
              <th class="text-center">分机号码</th>
              <th class="text-center">呼叫时间</th>
              <th class="text-center">挂断时间</th>
              <th class="text-center">满意度</th>
              <th class="text-center">满意打分</th>
            </tr>
          </thead>
          <tbody class="h-35.4vh">
            <tr
              v-for="item in paginatedData"
              :key="item.date"
              class="hover:bg-opacity-10"
            >
              <td class="h-[3.5vh] text-center">{{ item.date }}</td>
              <td class="h-[3.5vh] text-center">{{ item.name }}</td>
              <td class="h-[3.5vh] text-center">{{ item.address }}</td>
              <td class="h-[3.5vh] text-center">{{ item.name }}</td>
              <td class="h-[3.5vh] text-center">{{ item.address }}</td>
              <td class="h-[3.5vh] text-center">{{ item.date }}</td>
              <td class="h-[3.5vh] text-center">{{ item.date }}</td>
              <td class="h-[3.5vh] text-center">{{ item.address }}</td>
              <td class="h-[3.5vh] text-center">{{ item.address }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mb-[1.5vh] mx-[1vw]">
        <TablePagination
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @update:pageSize="pageSize = $event"
          @update:currentPage="currentPage = $event"
        />
      </div>
    </div>
  </CustomModal>
</template>

<script setup>
import { computed, ref } from "vue";
// 分页组件
import TablePagination from "./TablePagination.vue";
// 自定义弹窗组件
import CustomModal from "./CustomModal.vue";
// 背景图片
import bghw from "../../assets/hwbj.png";

// 当前页码
const currentPage = ref(1);
// 每页条数
const pageSize = ref(10);
// 总条数
const total = computed(() => gridData.length);

// 当前页数据
const paginatedData = computed(() => {
  return gridData.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value
  );
});

// 接收父组件 v-model 传递的弹窗显示状态
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

// 向父组件派发弹窗显示状态变更事件
const emit = defineEmits(["update:modelValue"]);

// 弹窗显示状态，双向绑定父组件的 v-model
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 表格静态数据
const gridData = Array.from({ length: 5 }, (_, index) => {
  // 生成日期，从2024-01-01开始递增
  const date = new Date(2024, 0, index + 1);
  const dateStr = date.toISOString().split("T")[0];

  // 随机生成客服名字
  const names = ["张三", "李四", "王五", "赵六", "钱七"];
  const name = names[Math.floor(Math.random() * names.length)];

  // 随机生成电话号码
  const phone = `1${Math.floor(Math.random() * 9 + 3)}${Array.from(
    { length: 9 },
    () => Math.floor(Math.random() * 10)
  ).join("")}`;

  return {
    date: dateStr,
    name: name,
    address: phone,
  };
});
</script>
