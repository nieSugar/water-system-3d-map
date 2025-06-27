<!-- 饼图 -->
<template>
  <div :id="chartId" class="ModuleBar2DBar">

  </div>
</template>

<script setup>
import { onMounted, nextTick, onUnmounted } from 'vue'
import 'echarts-gl'
import * as echarts from 'echarts'

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let myChart;
const chartId = generateUUID();

const init = () => {
  const chartDom = document.getElementById(chartId);
  if (!myChart) {
    myChart = echarts.init(chartDom);
  }
  // 把每段数据转换成echarts需要的格式
  // 每个省份后面加上省 比如辽宁-》辽宁省 颜色就会出来

  const options = getPie3D(
    [
      {
        name: "磷含量",
        value: 1.8,
        itemStyle: {
          opacity: 0.5,
          color: "#FFCC26",
        },
      },
      {
        name: "钾含量",
        value: 3.2,
        itemStyle: {
          opacity: 0.5,
          color: "#00B3FF",
        },
      },
      {
        name: "钾含量",
        value: 3.2,
        itemStyle: {
          opacity: 0.5,
          color: "#00B3FF",
        },
      },
      {
        name: "钾含量",
        value: 3.2,
        itemStyle: {
          opacity: 0.5,
          color: "#00B3FF",
        },
      },
      {
        name: "钾含量",
        value: 3.2,
        itemStyle: {
          opacity: 0.5,
          color: "#00B3FF",
        },
      },
      {
        name: "钾含量",
        value: 3.2,
        itemStyle: {
          opacity: 0.5,
          color: "#00B3FF",
        },
      },
    ],
    2
  );

  myChart.setOption(options, true);
};


function getParametricEquation(
  startRatio,
  endRatio,
  isSelected,
  isHovered,
  k,
  height
) {
  // 计算
  let midRatio = (startRatio + endRatio) / 2;

  let startRadian = startRatio * Math.PI * 2;
  let endRadian = endRatio * Math.PI * 2;
  let midRadian = midRatio * Math.PI * 2;

  // 如果只有一个扇形，则不实现选中效果。
  if (startRatio === 0 && endRatio === 1) {
    isSelected = false;
  }

  // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
  k = typeof k !== "undefined" ? k : 1 / 3;

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
        return (
          offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      if (u > endRadian) {
        return (
          offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
    },

    y: function (u, v) {
      if (u < startRadian) {
        return (
          offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      if (u > endRadian) {
        return (
          offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
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
  var series = [];
  let sumValue = 0;
  let startValue = 0;
  const color = ['#255edd', '#ee9b2c', '#37dfcd']
  let endValue = 0;
  let legendData = [];
  let k =
    typeof internalDiameterRatio !== "undefined"
      ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio)
      : 1 / 3;

  // 为每一个饼图数据，生成一个 series-surface 配置
  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value;

    let seriesItem = {
      name:
        typeof pieData[i].name === "undefined" ? `series${i}` : pieData[i].name,
      type: "surface",
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
    };

    if (typeof pieData[i].itemStyle != "undefined") {
      let itemStyle = {};

      typeof pieData[i].itemStyle.color != "undefined"
        ? (itemStyle.color = pieData[i].itemStyle.color)
        : null;
      typeof pieData[i].itemStyle.opacity != "undefined"
        ? (itemStyle.opacity = pieData[i].itemStyle.opacity)
        : null;

      seriesItem.itemStyle = itemStyle;
    }


    series.push(seriesItem);

  }

  // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
  // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value;
    // console.log(series[i]);
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

    legendData.push(series[i].name);
  }
  const pieD = [
    {
      name: "磷含量",
      value: 1.8,
      labelLine: {
        show: true,
        lineStyle: {
          color: "#90EE90"
        },
        // 通过调整标签的position和distance属性实现标签线在3D圆柱上方
        position: 'top',
        distance: 10
      },
      itemStyle: {
        opacity: 0,
        color: "#FFCC26",
      },
    },
  ]
  const pieOption = {
    type: "pie",
    label: {
      opacity: 1,
      formatter: (params) => {

        return `{${params.dataIndex == 0

            ? "red"

            : params.dataIndex == 1

              ? "blue"

              : "green"

          }|${params.name}}\n{${params.dataIndex == 0

            ? "red"

            : params.dataIndex == 1

              ? "blue"

              : "green"

          }|(${params.percent}%)}`;

      },

      color: "#fff",

      rich: {

        red: {

          fontSize: 16,

          color: "#FFCC26",

        },

        blue: {

          fontSize: 16,

          color: "#90EE90",

        },

        green: {

          fontSize: 16,

          color: "#00B3FF",

        },
      },
    },
    labelLine: {
      length: "10%",
      length2: "10%"
    },
    itemStyle: {
      color: 'transparent'
    },
    radius: ["20%", "35%"],
    center: ["50%", "50%"],
    data: pieD,
    startAngel: 220,



  }
  series.push(pieOption)
  // 准备待返回的配置项，把准备好的 legendData、series 传入。
  let option = {
    // backgroundColor: "transparent",
    tooltip: {
      show: false
      // formatter: (params) => {
      //   if (params.seriesName !== "mouseoutSeries") {
      //     return `${
      //       params.seriesName
      //     }<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${
      //       params.color
      //     };"></span>${option.series[params.seriesIndex].pieData.value}`;
      //   }
      // },
    },
    // legend: {
    //   data: legendData,
    //   textStyle: {
    //     color: "#fff",
    //     fontSize: 26,
    //   },
    // },
    xAxis3D: {
      min: -1,
      max: 1,
    },
    yAxis3D: {
      min: -1,
      max: 1,
    },
    zAxis3D: {
      min: -1,
      max: 1,
    },
    // graphic:{
    //   element:{

    //   }
    // },

    grid3D: {
      show: false,
      boxHeight: 20,
      //top: '30%',
      bottom: "50%",
      environment: "#043033",
      viewControl: {
        distance: 300,
        alpha: 25,
        beta: 70,
      },
    },
    series: series,
  };
  return option;
}

// 传入数据生成 option


// 图表配置项

// window.addEventListener('resize', resizeHandlerOrigin)
onMounted(async () => {
  // 初始化报表
  await nextTick()
  init();
})
onUnmounted(() => {
  if (!!myChart) {
    myChart.dispose();
    myChart = null;
  }
})


</script>

<style scoped>
.ModuleBar2DBar {
  width: 100%;
  height: 100%;
}
</style>