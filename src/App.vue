<template>
  <div class="app-container">
    <Index></Index>
  </div>
</template>

<script>
import Index from './view/Index.vue'
export default {
  name: 'App',
  components: {
    // 注册 Index 组件
    Index
  }
}
</script>

<style scoped>
.app-container {
  /* width: 100vw; */
  /* height: 100%;
  background-image: url('../../src/assets/img/bg.png');
  background-repeat: no-repeat; */
  /* background-size: cover; */
  /* background-position: center;    */
  /* overflow: hidden; */
}
::-webkit-scrollbar {
  display: none;
}
</style>
