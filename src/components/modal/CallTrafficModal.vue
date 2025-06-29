<template>
  <!-- 今日话务满意量弹窗组件 -->
  <CustomModal v-model="dialogVisible" :background-image="bghw">
    <div class="flex flex-col h-full">
      <div class="h-[6vh] flex justify-center items-center relative">
        <img :src="huangling" alt="教堂" class="absolute left-[-1vw] top-0 w-[8vw] h-[2.5vw] ml-[1vw] mt-[1vh] z-10" />
        <div class="text-center text-[0.8vw] text-white">今日-话务满意量</div>
      </div>
      <div class="flex-1 w-full overflow-x-auto custom-scrollbar">
        <table class="w-full border-collapse text-white table-fixed">
          <thead class="h-[3.6vh]">
            <tr class="bg-opacity-20">
              <th class="text-center w-[2vw] h-[3vh]">序号</th>
              <th class="text-center w-[5vw] h-[3vh]">呼叫类型</th>
              <th class="text-center w-[5vw] h-[3vh]">电话号码</th>
              <th class="text-center w-[5vw] h-[3vh]">接待客服</th>
              <th class="text-center w-[5vw] h-[3vh]">分机号码</th>
              <th class="text-center w-[5vw] h-[3vh]">呼叫时间</th>
              <th class="text-center w-[5vw] h-[3vh]">挂断时间</th>
              <th class="text-center w-[4vw] h-[3vh]">满意度</th>
              <th class="text-center w-[4vw] h-[3vh]">满意打分</th>
            </tr>
          </thead>
          <tbody class="h-35.4vh">
            <tr v-for="(item, idx) in paginatedData" :key="item.id" :class="[
              'hover:cursor-pointer',
              selectedRow === idx ? 'bg-[#194588]' : (idx % 2 === 0 ? 'bg-[#070D23]' : 'bg-[#0b1b44]')
            ]" @click="selectedRow = idx">
              <td class="h-[4vh] w-[2vw] text-center">{{ idx + 1 }}</td>
              <td class="h-[4vh] w-[5vw] text-center">{{ item.callType }}</td>
              <td class="h-[4vh] w-[10vw] text-center">{{ item.phone }}</td>
              <td class="h-[4vh] w-[8vw] text-center">{{ item.agent }}</td>
              <td class="h-[4vh] w-[6vw] text-center">{{ item.ext }}</td>
              <td class="h-[4vh] w-[12vw] text-center">{{ item.callTime }}</td>
              <td class="h-[4vh] w-[12vw] text-center">{{ item.hangupTime }}</td>
              <td class="h-[4vh] w-[8vw] text-center">{{ item.satisfaction }}</td>
              <td class="h-[4vh] w-[8vw] text-center">
                <span v-for="star in 5" :key="star">
                  <svg v-if="star <= item.score" width="18" height="18" viewBox="0 0 24 24" fill="#FFB800"
                    xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
                    <path
                      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="#2D3A4B"
                    xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
                    <path
                      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="my-[1.5vh] mx-[1vw]">
        <TablePagination :total="total" :page-size="pageSize" :current-page="currentPage"
          @update:pageSize="pageSize = $event" @update:currentPage="currentPage = $event" />
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

// @ts-ignore
import huangling from "../../assets/黄陵.png";

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
const gridData = Array.from({ length: 50 }, (_, index) => {
  const callTypes = ["呼入", "呼出"];
  const satisfactionList = ["不满意", "非常满意"];
  const agents = ["刘翔", "王鑫", "张宇", "王博", "朱鑫", "宋江", "王杰", "钱学森", "朱炳仁", "刘昊然"];
  const phone = "183****1111";
  const ext = "1005";
  const callTime = "2025-06-05 22:30:39";
  const hangupTime = "2025-06-05 22:34:58";
  const satisfaction = index === 0 ? "不满意" : "非常满意";
  const score = index === 0 ? 2 : 4 + (index % 2);
  return {
    id: index + 1,
    callType: callTypes[index % 2],
    phone,
    agent: agents[index % agents.length],
    ext,
    callTime,
    hangupTime,
    satisfaction,
    score
  };
});
const selectedRow = ref(-1);
</script>

<style scoped>
.custom-scrollbar {
  overflow-y: auto;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  background: #0b1b44;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #122f74;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #194588;
}
</style>
