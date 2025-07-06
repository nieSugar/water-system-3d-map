<template>
  <div ref="chartRef" class="pie-chart-container"></div>
</template>

<script>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import 'echarts-gl'; // 引入3D图表支持

export default {
  name: 'ECharts3DPie',
  props: {
    chartData: {
      type: Array,
      required: true,
      validator: data => {
        return data.every(item =>
          typeof item.name === 'string' && typeof item.value === 'number'
        );
      }
    },
    colors: {
      type: Array,
      default: () => ['#ffcc00', '#0cc2c2', '#02abf9', '#EE752A'],
    },
  },
  setup(props) {
    const chartRef = ref(null);
    let chartInstance = null;

    /**
     * 生成扇形的3D参数方程
     * @param {number} startRatio 起始比例
     * @param {number} endRatio 结束比例
     * @param {boolean} isSelected 是否选中
     * @param {boolean} isHovered 是否悬停
     * @param {number} height 扇形高度（基于value计算）
     * @returns {object} 3D参数方程配置
     */
    const getParametricEquation = (startRatio, endRatio, isSelected, isHovered, height) => {
      const midRatio = (startRatio + endRatio) / 3;
      const startRadian = startRatio * Math.PI * 2;
      const endRadian = endRatio * Math.PI * 2;
      const midRadian = midRatio * Math.PI * 2;
      const k = 0.3; // 固定内径比例为0.3

      // 处理全圆时的选中状态
      if (startRatio === 0 && endRatio === 1) {
        isSelected = false;
      }

      // 计算曲面偏移参数
      const offsetX = isSelected ? Math.cos(midRadian) * 0.05 : 0; // 减小选中偏移量
      const offsetY = isSelected ? Math.sin(midRadian) * 0.05 : 0; // 减小选中偏移量
      const hoverRate = isHovered ? 1.1 : 1;

      // 增加最小高度，确保小数值可见
      const effectiveHeight = Math.max(5, height);

      return {
        u: { min: -Math.PI, max: Math.PI * 3, step: Math.PI / 32 },
        v: { min: 0, max: Math.PI * 2, step: Math.PI / 20 },
        x: (u, v) => {
          if (u < startRadian) return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
          if (u > endRadian) return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
          return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
        },
        y: (u, v) => {
          if (u < startRadian) return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
          if (u > endRadian) return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
          return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate;
        },
        z: (u, v) => {
          if (u < -Math.PI * 0.5 || u > Math.PI * 2.5) return Math.sin(u);
          return Math.sin(v) > 0 ? 0.3 * effectiveHeight : -1;
        }
      };
    };

    /**
     * 添加底部三层居中圆盘
     * @param {Array} series ECharts series数组
     */
    const addBottomDisks = (series) => {
      // 第一层底盘 - 最内层（居中版本）
      series.push({
        name: 'bottomDisk1',
        type: 'surface',
        parametric: true,
        wireframe: { show: false },
        itemStyle: {
          opacity: 0.35,
          color: '#103551',
        },
        parametricEquation: {
          u: {
            min: 0,
            max: Math.PI * 2,
            step: Math.PI / 20,
          },
          v: {
            min: 0,
            max: Math.PI,
            step: Math.PI / 20,
          },
          x: function (u, v) {
            return ((Math.sin(v) * Math.sin(u) + Math.sin(u)) / Math.PI) * 2.3;
          },
          y: function (u, v) {
            return ((Math.sin(v) * Math.cos(u) + Math.cos(u)) / Math.PI) * 2.3;
          },
          z: function (u, v) {
            return Math.cos(v) > 0 ? -1 : -8; // 下移底盘
          },
        },
      });

      // 第二层底盘 - 中间层（用于高亮效果支撑，居中版本）
      series.push({
        name: 'bottomDisk2',
        type: 'surface',
        parametric: true,
        wireframe: { show: false },
        itemStyle: {
          opacity: 0.35,
          color: '#103551',
        },
        parametricEquation: {
          u: {
            min: 0,
            max: Math.PI * 2,
            step: Math.PI / 20,
          },
          v: {
            min: 0,
            max: Math.PI,
            step: Math.PI / 20,
          },
          x: function (u, v) {
            return ((Math.sin(v) * Math.sin(u) + Math.sin(u)) / Math.PI) * 2.5;
          },
          y: function (u, v) {
            return ((Math.sin(v) * Math.cos(u) + Math.cos(u)) / Math.PI) * 2.5;
          },
          z: function (u, v) {
            return Math.cos(v) > 0 ? -5 : -10; // 下移底盘
          },
        },
      });

      // 第三层底盘 - 最外层（居中版本）
      series.push({
        name: 'bottomDisk3',
        type: 'surface',
        parametric: true,
        wireframe: { show: false },
        itemStyle: {
          opacity: 0.1,
          color: '#10354F',
        },
        parametricEquation: {
          u: {
            min: 0,
            max: Math.PI * 2,
            step: Math.PI / 20,
          },
          v: {
            min: 0,
            max: Math.PI,
            step: Math.PI / 20,
          },
          x: function (u, v) {
            return ((Math.sin(v) * Math.sin(u) + Math.sin(u)) / Math.PI) * 2.7;
          },
          y: function (u, v) {
            return ((Math.sin(v) * Math.cos(u) + Math.cos(u)) / Math.PI) * 2.7;
          },
          z: function (u, v) {
            return Math.cos(v) > 0 ? -8 : -12; // 下移底盘
          },
        },
      });
    };

    /**
     * 生成3D饼图配置（完整显示优化版）
     * @param {Array} pieData 饼图数据
     * @returns {Array} ECharts series配置
     */
    const getPie3D = (pieData) => {
      const series = [];
      let sumValue = pieData.reduce((sum, item) => sum + item.value, 0);
      if (sumValue === 0) sumValue = 1; // 避免除以0错误
      let startValue = 0;
      let endValue = 0;
      const linesSeries = [];
      const labelPositions = []; // 记录标签位置用于防重叠
      const labelAngles = [];    // 记录标签角度范围

      // 打印数据信息用于调试
      console.log('生成3D饼图数据:', pieData);

      // 1. 生成扇形基础配置
      pieData.forEach((item, index) => {
        const color = props.colors[index] ||
          `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;

        series.push({
          name: item.name,
          type: 'surface',
          parametric: true,
          wireframe: { show: false },
          pieData: { ...item, value: item.value, itemStyle: { color } },
          pieStatus: { selected: false, hovered: false },
          itemStyle: { color }
        });
      });

      // 2. 生成每个扇形的参数方程和标签
      series.forEach((item, index) => {
        endValue = startValue + item.pieData.value;
        const percent = item.pieData.value / sumValue;

        // 计算扇形角度比例
        item.pieData.startRatio = startValue / sumValue;
        item.pieData.endRatio = endValue / sumValue;
        item.parametricEquation = getParametricEquation(
          item.pieData.startRatio,
          item.pieData.endRatio,
          false,
          false,
          item.pieData.value
        );

        startValue = endValue;

        // 计算标签基准角度和坐标（Z轴高度显著提升）
        const midRadian = (item.pieData.endRatio + item.pieData.startRatio) * Math.PI;
        const baseRadius = 1.3; // 标签基础半径
        const posX = Math.cos(midRadian) * baseRadius;
        const posY = Math.sin(midRadian) * baseRadius;
        const posZ = 0.9; // 标签Z轴高度（确保在3D模型上方）

        // 计算扇形角度范围（用于防重叠）
        const angleRange = (item.pieData.endRatio - item.pieData.startRatio) * Math.PI * 2;
        const angleCenter = midRadian;

        // 防重叠核心算法：动态调整标签角度
        let finalRadian = midRadian;
        let offsetStep = 0.05; // 减小偏移步长
        let maxOffset = Math.PI / 6; // 减小最大偏移量

        // 检查与已有标签的角度重叠
        for (let i = 0; i < labelAngles.length; i++) {
          const { start, end } = labelAngles[i];
          const currentOverlap = (finalRadian >= start && finalRadian <= end) ||
            (start >= finalRadian && start <= end);

          if (currentOverlap) {
            // 向右偏移（顺时针）
            let newRadian = finalRadian + offsetStep;
            let offsetCount = 1;

            while (newRadian < finalRadian + maxOffset) {
              const overlap = (newRadian >= start && newRadian <= end) ||
                (start >= newRadian && start <= end);

              if (!overlap) {
                finalRadian = newRadian;
                break;
              }
              newRadian += offsetStep;
              offsetCount++;

              // 超过最大偏移量则向左尝试（逆时针）
              if (offsetCount > maxOffset / offsetStep) {
                newRadian = finalRadian - offsetStep;
                offsetCount = 1;
                while (newRadian > finalRadian - maxOffset) {
                  const overlap = (newRadian >= start && newRadian <= end) ||
                    (start >= newRadian && start <= end);

                  if (!overlap) {
                    finalRadian = newRadian;
                    break;
                  }
                  newRadian -= offsetStep;
                  offsetCount++;

                  // 仍重叠则跳过此标签（极小扇形）
                  if (offsetCount > maxOffset / offsetStep) break;
                }
              }
            }
          }
        }

        // 应用最终坐标（带偏移量）
        const finalX = Math.cos(finalRadian) * baseRadius;
        const finalY = Math.sin(finalRadian) * baseRadius;
        const finalZ = posZ;

        // 记录当前标签的角度范围（用于后续标签防重叠）




      });

      // 合并series（注意顺序：先扇形，再指示线，最后底盘）
      const finalSeries = series.concat(linesSeries);
      addBottomDisks(finalSeries);
      return finalSeries;
    };

    /**
     * 初始化图表
     */
    const initChart = () => {
      if (!chartRef.value || !props.chartData || props.chartData.length === 0) {
        console.log('图表容器或数据不存在，跳过初始化');
        return;
      }

      // 销毁旧实例
      if (chartInstance) {
        chartInstance.dispose();
      }

      // 创建新实例
      chartInstance = echarts.init(chartRef.value);

      // 生成图表配置
      const series = getPie3D(props.chartData);

      const option = {
        legend: { show: false, tooltip: { show: false } },
      
        label: { show: false },
        xAxis3D: {
          min: -1.5, // 扩大x轴范围
          max: 1.5,
        },
        yAxis3D: {
          min: -1.5, // 扩大y轴范围
          max: 1.5,
        },
        zAxis3D: {
          min: -1,   // 扩大z轴范围
          max: 1,
        },
        grid3D: {
          show: false,
          bottom: '10%', // 调整底部位置
          boxHeight: 0.5,   // 原0.5，放大为1
          viewControl: {
            distance: 100,
            zoomSensitivity: 0,
            rotateSensitivity: 0,
            panSensitivity: 0,
            autoRotate: false,

          }
        },
        series: series
      };

      // 设置配置并绑定事件
      chartInstance.setOption(option);
    };

    // 监听数据变化
    watch(() => props.chartData, (newData) => {
      console.log('数据更新:', newData);
      if (newData && newData.length > 0) {
        nextTick(initChart);
      }
    }, { deep: true });

    // 生命周期钩子
    onMounted(initChart);
    onUnmounted(() => {
      chartInstance?.dispose();
      chartInstance = null;
    });

    return { chartRef };
  }
}
</script>

<style scoped>
.pie-chart-container {
  width: 100%;
  height: 140px;
  /* 增加高度以便更好地查看3D效果 */
}
</style>    