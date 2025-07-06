<template>
  <div class="chart-container" ref="chartRef" @mouseleave="handleMouseLeave"></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue';
import * as echarts from 'echarts';
import 'echarts-gl'; // 引入 echarts-gl 支持 3D 效果

export default {
  name: 'ECharts3DPie',
  props: {
    chartData: {
      type: Array,
      default: () => [
        { name: '系统耗能', value: 29, hotline: '96681', count: 100 },
        { name: 'xxxx', value: 82, hotline: '96682', count: 150 },
        { name: 'xxxxx', value: 33, hotline: '96683', count: 80 },
        { name: "'找茬'窗口", value: 23, hotline: '96684', count: 60 },
      ],
    },
    colors: {
      type: Array,
      default: () => ['#ffcc00',  '#0cc2c2', '#02abf9','#EE752A',],
    },
    internalDiameterRatio: {
      type: Number,
      default: 0.8,
    },
    // 自定义标签格式
    labelFormatter: {
      type: Function,
      default: function(params) {
        const hotline = params.data.hotline || '96681';
        const count = params.data.count || 100;
        
        return `${params.name} \n值: ${params.value} \n占比: ${params.percent}% \n服务热线: ${hotline} \n数量: ${count}件`;
      }
    },
    // 是否启用自动旋转
    autoRotate: {
      type: Boolean,
      default: true
    },
    // 点击回调函数（支持标签线和饼图点击）
    onItemClick: {
      type: Function
    },
    // 自定义标签样式
    labelStyle: {
      type: Object,
      default: () => ({
        color: '#fff',
        fontSize: 12,
        fontWeight: 'normal'
      })
    }
  },

  setup(props) {
    const chartRef = ref(null);
    let myChart = null;
    let currentActiveIndex = -1; // 记录当前激活的扇区索引
    
    // 鼠标状态管理
    const mouseState = reactive({
      isHoveringChart: false, // 新增：是否悬停在图表上
      isHoveringSector: false,
      isHoveringLabel: false,
      isHoveringLabelLine: false,
      isClicking: false,
      isPaused: false // 是否暂停旋转
    });

    // 3D 饼图核心算法
    function getParametricEquation(startRatio, endRatio, isSelected, isHovered, k, height) {
      let midRatio = (startRatio + endRatio) / 2;

      let startRadian = startRatio * Math.PI * 2;
      let endRadian = endRatio * Math.PI * 2;
      let midRadian = midRatio * Math.PI * 2;

      // 如果只有一个扇形，则不实现选中效果。
      if (startRatio === 0 && endRatio === 1) {
        isSelected = false;
      }

      // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
      k = typeof k !== 'undefined' ? k : 1 / 3;

      // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
      let offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0;
      let offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0;

      // 计算高亮效果的放大比例（未高亮，则比例为 1）
      let hoverRate = isHovered ? 1.05 : 1;

      // 返回曲面参数方程
      return {
        u: {
          min: -Math.PI,
          max: Math.PI * 3,
          step: Math.PI / 32,
        },

        v: {
          min: 0,
          max: Math.PI * 2,
          step: Math.PI / 20,
        },

        x: function (u, v) {
          if (u < startRadian) {
            return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
          }
          if (u > endRadian) {
            return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
          }
          return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
        },

        y: function (u, v) {
          if (u < startRadian) {
            return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
          }
          if (u > endRadian) {
            return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
          }
          return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate;
        },

        z: function (u, v) {
          if (u < -Math.PI * 0.5) {
            return Math.sin(u);
          }
          if (u > Math.PI * 2.5) {
            return Math.sin(u);
          }
          return Math.sin(v) > 0 ? 1 * height : -1;
        },
      };
    }

    // 生成模拟 3D 饼图的配置项
    function getPie3D(pieData, internalDiameterRatio) {
      let series = [];
      let sumValue = 0;
      let startValue = 0;
      let endValue = 0;
      let k = typeof internalDiameterRatio !== 'undefined' ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio) : 1 / 3;

      // 为每一个饼图数据，生成一个 series-surface 配置
      for (let i = 0; i < pieData.length; i++) {
        sumValue += pieData[i].value;

        let seriesItem = {
          name: typeof pieData[i].name === 'undefined' ? `series${i}` : pieData[i].name,
          type: 'surface',
          parametric: true,
          wireframe: {
            show: false,
          },
          pieData: pieData[i],
          pieStatus: {
            selected: false,
            hovered: false,
            k: k,
          },
          // 标签配置
          label: {
            show: false,
            ...props.labelStyle, // 应用自定义标签样式
            position: 'outside',
            formatter: typeof props.labelFormatter === 'function' 
              ? props.labelFormatter 
              : function(params) { return props.labelFormatter; },
            rich: {
              name: {
                color: props.labelStyle.color || '#fff',
                lineHeight: 20
              },
              value: {
                color: props.labelStyle.color || '#fff',
                lineHeight: 20
              }
            }
          },
          labelLine: {
            show: false,
            lineStyle: {
              color: props.labelStyle.color || '#fff',
              width: 1
            }
          }
        };

        if (typeof pieData[i].itemStyle != 'undefined') {
          let itemStyle = {};

          typeof pieData[i].itemStyle.color != 'undefined' ? (itemStyle.color = pieData[i].itemStyle.color) : null;
          typeof pieData[i].itemStyle.opacity != 'undefined' ? (itemStyle.opacity = pieData[i].itemStyle.opacity) : null;

          seriesItem.itemStyle = itemStyle;
        }
        series.push(seriesItem);
      }

      // 向每个 series-surface 传入参数方程
      for (let i = 0; i < series.length; i++) {
        endValue = startValue + series[i].pieData.value;
        series[i].pieData.startRatio = startValue / sumValue;
        series[i].pieData.endRatio = endValue / sumValue;
        series[i].parametricEquation = getParametricEquation(
          series[i].pieData.startRatio,
          series[i].pieData.endRatio,
          false,
          false,
          k,
          series[i].pieData.value
        );

        startValue = endValue;
      }
      series.push({
        name: 'mouseoutSeries',
        type: 'surface',
        parametric: true,
        wireframe: {
          show: false,
        },
        itemStyle: {
          opacity: 0.1,
          color: '#008fff',
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
            return ((Math.sin(v) * Math.sin(u) + Math.sin(u)) / Math.PI) * 2.2;
          },
          y: function (u, v) {
            return ((Math.sin(v) * Math.cos(u) + Math.cos(u)) / Math.PI) * 2.2;
          },
          z: function (u, v) {
            return Math.cos(v) > 0 ? -7 : -7;
          },
        },
      });
      return series;
    }

    // 初始化图表
    const initChart = () => {
      if (!chartRef.value) return;

      // 销毁旧实例
      if (myChart) {
        myChart.dispose();
      }

      // 初始化新实例
      myChart = echarts.init(chartRef.value);

      // 准备数据
      const optionsData = props.chartData.map((item, index) => ({
        ...item,
        itemStyle: {
          color: props.colors[index % props.colors.length],
          opacity: 0.92,
        },
      }));

      // 生成 3D 饼图配置
      const series = getPie3D(optionsData, props.internalDiameterRatio);

      // 准备图表配置
      const option = {
        legend: {
          show: false,
          data: optionsData.map((item) => item.name),
        },
        graphic: {
          elements: [
            {
              type: 'circle',
              shape: {
                cx: '50%',
                cy: '70%',
                r: '45%',
              },
              style: {
                fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(30, 40, 70, 0.8)' },
                  { offset: 1, color: 'rgba(10, 20, 40, 0.9)' },
                ]),
                shadowBlur: 5,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                opacity: 0.8,
              },
              z: -1,
            },
          ],
        },
        animation: true,
        tooltip: {
          show: true, // 显示 tooltip 作为补充
          formatter: typeof props.labelFormatter === 'function' 
            ? props.labelFormatter 
            : function(params) { return props.labelFormatter; }
        },
        xAxis3D: {
          min: -1,
          max: 1,
        },
        yAxis3D: {
          min: -1,
          max: 1,
        },
        zAxis3D: {
          min: -5,
          max: 0.5,
        },
        grid3D: {
          show: false,
          boxHeight: 0.5,
          viewControl: {
                autoRotate: props.autoRotate, // 启用自动旋转
            },
        },
        series: series,
      };

      // 设置图表配置
      myChart.setOption(option);

      // 鼠标进入扇区事件 - 显示标签线并暂停旋转
      myChart.on('mouseover', (params) => {
        if (params.componentType === 'series' && params.seriesName !== 'mouseoutSeries') {
          const seriesIndex = params.seriesIndex;
          currentActiveIndex = seriesIndex;
          mouseState.isHoveringSector = true;
          mouseState.isHoveringChart = true;
          
          // 鼠标悬停时暂停旋转
          if (props.autoRotate && !mouseState.isPaused) {
            mouseState.isPaused = true;
            myChart.setOption({
              grid3D: {
                viewControl: {
                  autoRotate: false
                }
              }
            });
          }
          
          updateLabelVisibility(seriesIndex);
        }
      });

      // 鼠标离开扇区事件 - 不再隐藏标签
      myChart.on('mouseout', (params) => {
        if (params.componentType === 'series' && params.seriesName !== 'mouseoutSeries') {
          mouseState.isHoveringSector = false;
          
          // 鼠标离开扇区但仍在图表内时不隐藏标签
          if (!mouseState.isHoveringChart) {
            checkAndHideLabels();
          }
        }
      });

      // 鼠标进入标签事件 - 暂停旋转
      myChart.on('mouseover', (params) => {
        if (params.componentType === 'label') {
          mouseState.isHoveringLabel = true;
          mouseState.isHoveringChart = true;
          
          // 鼠标悬停在标签上时暂停旋转
          if (props.autoRotate && !mouseState.isPaused) {
            mouseState.isPaused = true;
            myChart.setOption({
              grid3D: {
                viewControl: {
                  autoRotate: false
                }
              }
            });
          }
          
          const seriesIndex = params.seriesIndex;
          updateLabelVisibility(seriesIndex);
        }
      });

      // 鼠标离开标签事件 - 不再隐藏标签
      myChart.on('mouseout', (params) => {
        if (params.componentType === 'label') {
          mouseState.isHoveringLabel = false;
          
          // 鼠标离开标签但仍在图表内时不隐藏标签
          if (!mouseState.isHoveringChart) {
            checkAndHideLabels();
          }
        }
      });

      // 鼠标进入标签线事件 - 暂停旋转
      myChart.on('mouseover', (params) => {
        if (params.componentType === 'labelLine') {
          mouseState.isHoveringLabelLine = true;
          mouseState.isHoveringChart = true;
          
          // 鼠标悬停在标签线上时暂停旋转
          if (props.autoRotate && !mouseState.isPaused) {
            mouseState.isPaused = true;
            myChart.setOption({
              grid3D: {
                viewControl: {
                  autoRotate: false
                }
              }
            });
          }
          
          const seriesIndex = params.seriesIndex;
          updateLabelVisibility(seriesIndex);
        }
      });

      // 鼠标离开标签线事件 - 不再隐藏标签
      myChart.on('mouseout', (params) => {
        if (params.componentType === 'labelLine') {
          mouseState.isHoveringLabelLine = false;
          
          // 鼠标离开标签线但仍在图表内时不隐藏标签
          if (!mouseState.isHoveringChart) {
            checkAndHideLabels();
          }
        }
      });

      // 点击事件处理 - 支持扇区、标签和标签线点击
      myChart.on('click', (params) => {
        let seriesIndex, dataIndex;
        
        if (params.componentType === 'series') {
          seriesIndex = params.seriesIndex;
          dataIndex = params.dataIndex;
          mouseState.isClicking = true;
        } else if (params.componentType === 'label' || params.componentType === 'labelLine') {
          seriesIndex = params.seriesIndex;
          dataIndex = params.dataIndex;
        } else {
          return;
        }
        
        currentActiveIndex = seriesIndex;
        
        // 触发父组件的点击回调
        if (props.onItemClick) {
          props.onItemClick({
            seriesIndex,
            dataIndex,
            name: params.name,
            value: params.value,
            percent: params.percent,
            componentType: params.componentType
          });
        }
        
        // 显示标签和标签线
        updateLabelVisibility(seriesIndex);
        
        // 处理选中效果
        handleSelection(seriesIndex);
      });

      // 检查是否恢复旋转状态
      const checkRotationState = () => {
        if (props.autoRotate && mouseState.isPaused && !mouseState.isHoveringChart) {
          mouseState.isPaused = false;
          myChart.setOption({
            grid3D: {
              viewControl: {
                autoRotate: true
              }
            }
          });
        }
      };

      // 监听窗口大小变化，自适应图表
      const resizeHandler = () => {
        if (myChart) {
          myChart.resize();
        }
      };

      window.addEventListener('resize', resizeHandler);

      // 组件卸载时清理资源
      onUnmounted(() => {
        window.removeEventListener('resize', resizeHandler);
        if (myChart) {
          myChart.dispose();
          myChart = null;
        }
      });
    };

    // 鼠标离开整个图表区域时的处理
    const handleMouseLeave = () => {
      mouseState.isHoveringChart = false;
      mouseState.isHoveringSector = false;
      mouseState.isHoveringLabel = false;
      mouseState.isHoveringLabelLine = false;
      
      checkAndHideLabels();
      checkRotationState();
    };

    // 更新标签可见性
    const updateLabelVisibility = (seriesIndex) => {
      const option = myChart.getOption();
      if (seriesIndex !== -1 && option.series[seriesIndex]) {
        option.series[seriesIndex].label.show = true;
        option.series[seriesIndex].labelLine.show = true;
        myChart.setOption(option);
      }
    };

    // 检查并隐藏标签
    const checkAndHideLabels = () => {
      if (!mouseState.isHoveringChart) {
        const option = myChart.getOption();
        if (currentActiveIndex !== -1 && option.series[currentActiveIndex]) {
          option.series[currentActiveIndex].label.show = false;
          option.series[currentActiveIndex].labelLine.show = false;
          myChart.setOption(option);
          currentActiveIndex = -1;
        }
        mouseState.isClicking = false;
      }
    };

    // 处理选中效果
    const handleSelection = (seriesIndex) => {
      const option = myChart.getOption();
      // 清除之前的选中状态
      for (let i = 0; i < option.series.length - 1; i++) {
        option.series[i].pieStatus.selected = false;
        option.series[i].parametricEquation = getParametricEquation(
          option.series[i].pieData.startRatio,
          option.series[i].pieData.endRatio,
          false,
          option.series[i].pieStatus.hovered,
          option.series[i].pieStatus.k,
          option.series[i].pieData.value
        );
      }
      // 设置当前点击的扇区为选中状态
      if (seriesIndex < option.series.length - 1) {
        option.series[seriesIndex].pieStatus.selected = true;
        option.series[seriesIndex].parametricEquation = getParametricEquation(
          option.series[seriesIndex].pieData.startRatio,
          option.series[seriesIndex].pieData.endRatio,
          true,
          option.series[seriesIndex].pieStatus.hovered,
          option.series[seriesIndex].pieStatus.k,
          option.series[seriesIndex].pieData.value
        );
      }
      myChart.setOption(option);
    };

    // 监听数据变化，更新图表
    watch(
      () => props.chartData,
      () => {
        initChart();
      },
      { deep: true }
    );

    // 监听自动旋转属性变化
    watch(
      () => props.autoRotate,
      (newVal) => {
        if (myChart) {
          myChart.setOption({
            grid3D: {
              viewControl: {
                autoRotate: newVal && !mouseState.isPaused
              }
            }
          });
        }
      }
    );

    // 组件挂载后初始化图表
    onMounted(() => {
      initChart();
    });

    return {
      chartRef,
      handleMouseLeave
    };
  },
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 180px;
}
</style>