<!-- 服务评价排名组件 -->

<template>
  <div class="flex items-center space-x-2">
    <div class="flex-1 relative">
      <div class="font-medium flex flex-row justify-between items-center w-full pt-[1vh] pb-[0.3vh]">
        <div class="flex flex-row gap-[0.5vw]">
          <img src="/src/assets/第一.png" class="w-[1vw] h-[1.2vw]"/>
          <div class="text-white text-[0.7vw] ml-2">{{ label }}</div>
        </div>
        <div class="text-white text-[0.7vw]"> {{ percentage }}%</div>
      </div>
      <div class="h-1 rounded-full overflow-hidden relative">
        <div class="h-full rounded-full transition-all duration-300"
          :style="{ width: `${percentage}%`, background: getGradientColor(percentage) }"></div>
        <div class="absolute h-1 w-1 bg-white rounded-full transform -translate-y-1/2"
          :style="{ left: `calc(${percentage}% - 1px)` }"></div>
      </div>
      <div class="text-xs"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    label: {
      type: String,
      required: true
    },
    percentage: {
      type: Number,
      required: true,
      validator: value => value >= 0 && value <= 100
    }
  },
  methods: {
    getGradientColor(percent) {
      const opacity = percent / 100; // Adjust opacity based on percentage
      return `linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 112, 255, ${opacity}))`;
    }
  }
}
</script>