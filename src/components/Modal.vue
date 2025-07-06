<template>
  <div v-if="visible" class="dialog">
    <div class="dialog-bg">
      <div class="d-t flex space-between align-center">
        <img class="d-t-b" :src="dialogIcon" alt="对话框图标">
        <div class="dialog-title common-title">{{ title }}</div>
        <div class="d-t-c pointer" 
             @click="close" 
             @mouseenter="handleMouseEnter" 
             @mouseleave="handleMouseLeave"
             @mousedown="handleMouseDown" 
             @mouseup="handleMouseUp">
          <img :src="currentImage" class="w-full h-full object-contain" alt="关闭按钮">
          <!-- 预加载所有状态图片 -->
          <img v-if="false" :src="normalImage" alt="预加载正常状态">
          <img v-if="false" :src="hoverImage" alt="预加载悬停状态">
          <img v-if="false" :src="clickImage" alt="预加载点击状态">
        </div>
      </div>
      
      <!-- 内容 -->
      <div class="dialog-content">
        <el-row class="row-bg margin-top" :gutter="20">
          <el-col :span="4" :offset="1" v-for="item in contentData" :key="item.type"
                  class="flex space-between q-d-b pointer align-center padding-top-xs margin-bottom-sm col-five"
                  :class="item.type === 'busy' ? 'padding-top-xs' : ''">
            <div class="text-left q-d-t margin-left-xs">
              <div class="color-blue font-size-df">{{ item.title }}</div>
              <div class="Roboto seats-title">
                <span>{{ item.count }}</span>
                <span class="font-size-sm color-54 ren margin-left-xs">件</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, defineProps, defineEmits } from 'vue';
 
export default {
  name: 'Modal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '对话框标题'
    },
    contentData: {
      type: Array,
      default: () => []
    },
    dialogIcon: {
      type: String,
      default: ''
    },
    normalImage: {
      type: String,
      required: true
    },
    hoverImage: {
      type: String,
      required: true
    },
    clickImage: {
      type: String,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const currentImage = ref(props.normalImage);
    
    const handleMouseEnter = () => {
      currentImage.value = props.hoverImage;
    }

    const handleMouseLeave = () => {
      currentImage.value = props.normalImage;
    }

    const handleMouseDown = () => {
      currentImage.value = props.clickImage;
    }

    const handleMouseUp = (event) => {
      const isMouseOver = event.relatedTarget?.closest('.d-t-c') !== null;
      currentImage.value = isMouseOver ? props.hoverImage : props.normalImage;
    }

    const close = () => {
      emit('close');
    }

    return {
      currentImage,
      handleMouseEnter,
      handleMouseLeave,
      handleMouseDown,
      handleMouseUp,
      close
    };
  }
}
</script>