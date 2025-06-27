<script setup>
// @ts-ignore
import paiming from "../assets/title.png";
// @ts-ignore
import jiaotang from "../assets/教堂.png";
// @ts-ignore
import bj2 from "../assets/bj2.png";
// @ts-ignore
import shousong from "../assets/受诉量icon.png";
// @ts-ignore
import juxing from "../assets/矩形 617.png";
// @ts-ignore
import zixunliang from "../assets/咨询量icon.png";

import juxing2 from "../assets/矩形617拷贝4.png";

import juxing3 from "../assets/矩形617拷贝2.png";
// @ts-ignore
import Pie3D from "./Pie3D.vue";

import EChartComponent from './EChartComponent.vue'

const format = (percentage) => (percentage === 100 ? "Full" : `${percentage}%`); 
</script>
<template>
  <div class="flex flex-col w-[25vw] h-[90vh]">
    <div class="flex flex-row mr-[0.83vh]">
      <div class="relative">
        <img src="../assets/title.png" class="w-[24.792vw] h-[3.796vh]" />
        <img src="../assets/沈阳站.png" class="absolute aspect-ratio width-[7.865vw] h-[4vh] right-0 bottom-0" />
        <p class="absolute top-1/2 left-[4vw] transform -translate-y-3/5 text-white text-[1vw] font-[YouSheBiaoTiHei]">
          工单服务
        </p>
      </div>
    </div>
    <div class="w-[24vw] h-[10vh] flex flex-row mr-[0.65vw]" :style="{
      backgroundImage: `url(${bj2})`,
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
    }">
      <div class="w-full h-full flex flex-row justify-between">
        <div class="flex flex-col justify-center">
          <EChartComponent />
        </div>
        <div class="flex flex-col justify-center">
          <EChartComponent />
        </div>
        <div class="flex flex-col justify-center">
          <EChartComponent />
        </div>
      </div>

    </div>
    <div class="flex flex-row ml-[1.67vh] mt-[0.5vh]">
      <img src="../assets/组3047.png" class="w-[1.04vw] h-[1.04vw]" />
      <div class="w-full ml-[0.2vw] flex flex-row items-center justify-between">
        <p class="text-white text-[0.8vw] mr-[1vw]">受诉量</p>
        <div class="flex gap-[0.2vw] pr-[1vw]">
          <div tabindex="-1"
            class="px-[0.2vw] text-[0.5vw] text-white border border-[#0dbcfc] rounded hover:bg-[#192C4A] hover:cursor-pointer outline-none select-none">
            历年
          </div>
          <div tabindex="-1"
            class="px-[0.2vw] text-[0.5vw] text-white border border-[#0dbcfc] rounded hover:bg-[#192C4A] hover:cursor-pointer outline-none select-none">
            月
          </div>
          <div tabindex="-1"
            class="px-[0.2vw] text-[0.5vw] text-white border border-[#0dbcfc] rounded hover:bg-[#192C4A] hover:cursor-pointer outline-none select-none">
            周
          </div>
          <div tabindex="-1"
            class="px-[0.2vw] text-[0.5vw] text-white border border-[#0dbcfc] rounded hover:bg-[#192C4A] hover:cursor-pointer outline-none select-none">
            年
          </div>
        </div>
      </div>
    </div>
    <div class="w-[24vm] h-[1px] bg-[#5792FF] mx-[1.67vh] my-[0.4vh]"></div>
    <div class="w-[3.1vw] h-[3.1vw] flex flex-row mr-[0.65vw] relative" :style="{
      backgroundImage: `url(${shousong})`,
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
    }">
      <div class="w-[11.5vw] h-[1.4vw] flex flex-row absolute bottom-1 left-[1vw]" :style="{
        backgroundImage: `url(${juxing})`,
        backgroundPosition: 'center center',
        backgroundSize: '100% 100%',
      }">
        <div class="w-1/2 flex">
          <div class="w-full h-full flex flex-row items-center ml-[2vw]">
            <div class="text-white text-[0.8vw]">294205</div>
            <div class="text-[#549FF9] text-[0.6vw] ml-[0.3vw]">件</div>
          </div>
        </div>
        <div class="w-[1px] h-[1vw] bg-[#5792FF] self-center ml-[0.5vw]" />
        <div class="w-1/2 flex flex-row justify-between items-center">
          <div class="w-full h-full flex flex-row justify-center items-center">
            <div class="text-white ml-[0.3vh] text-[0.5vw]">环比：</div>
            <div class="text-[#4EFFAE] text-[0.8vw]">-10.42</div>
            <div class="text-[#549FF9] text-[0.4vw] ml-[0.3vw]">%</div>
          </div>
        </div>
      </div>
      <div class="text-white absolute bottom-[1.5vw] left-[3.2vw] text-[0.5vw] w-[3vw] flex flex-row">
        受诉量
      </div>
      <div
        class="text-white absolute bottom-[1.5vw] left-[5vw] text-[0.4vw] w-[3vw] flex flex-row hover:cursor-pointer">
        查看
        <img src="../assets/矩形 1440.png" class="absolute left-[1vw] bottom-[0.1vw] w-[0.4vw] h-[0.4vw]" />
      </div>
      <div class="w-[6vw] h-[1.4vw] flex flex-row absolute bottom-1 left-[12vw]" :style="{
        backgroundImage: `url(${juxing2})`,
        backgroundPosition: 'center center',
        backgroundSize: '100% 100%',
      }">
        <div class="w-1/2 flex">
          <div class="w-full h-full flex flex-row items-center ml-[2vw]">
            <div class="text-white text-[0.8vw]">29420</div>
            <div class="text-[#549FF9] text-[0.6vw] ml-[0.3vw]">件</div>
          </div>
        </div>
        <div class="text-white absolute bottom-[1.5vw] left-[2vw] text-[0.5vw] w-[3vw] flex flex-row">
          办理量
        </div>
        <div
          class="text-white absolute bottom-[1.5vw] left-[4vw] text-[0.4vw] w-[3vw] flex flex-row hover:cursor-pointer">
          查看
          <img src="../assets/矩形 1440.png" class="absolute left-[1vw] bottom-[0.1vw] w-[0.4vw] h-[0.4vw]" />
        </div>
      </div>
      <div class="w-[6vw] h-[1.4vw] flex flex-row absolute bottom-1 left-[18vw]" :style="{
        backgroundImage: `url(${juxing2})`,
        backgroundPosition: 'center center',
        backgroundSize: '100% 100%',
      }">
        <div class="w-1/2 flex">
          <div class="w-full h-full flex flex-row items-center ml-[2vw]">
            <div class="text-white text-[0.8vw]">294205</div>
            <div class="text-[#549FF9] text-[0.6vw] ml-[0.3vw]">件</div>
          </div>
        </div>
        <div class="text-white absolute bottom-[1.5vw] left-[2vw] text-[0.5vw] w-[3vw] flex flex-row">
          办结件
        </div>
        <div
          class="text-white absolute bottom-[1.5vw] left-[4vw] text-[0.4vw] w-[3vw] flex flex-row hover:cursor-pointer">
          查看
          <img src="../assets/矩形 1440.png" class="absolute left-[1vw] bottom-[0.1vw] w-[0.4vw] h-[0.4vw]" />
        </div>
      </div>
    </div>
    <div class="w-[3.1vw] h-[3.1vw] flex flex-row relative" :style="{
      backgroundImage: `url(${zixunliang})`,
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
    }">
      <div class="w-[23vw] h-[1.4vw] flex flex-row absolute left-[1vw] bottom-1" :style="{
        backgroundImage: `url(${juxing})`,
        backgroundPosition: 'center center',
        backgroundSize: '100% 100%',
      }">
        <div class="w-1/2 flex">
          <div class="w-full h-full flex flex-row items-center ml-[2vw]">
            <div class="text-white text-[0.8vw]">294205</div>
            <div class="text-[#549FF9] text-[0.6vw] ml-[0.3vw]">件</div>
          </div>
        </div>
        <div class="w-[1px] h-[1vw] bg-[#5792FF] self-center" />
        <div class="flex-1 flex">
          <div class="w-full h-full flex flex-row justify-center items-center">
            <div class="text-white ml-[0.3vh] text-[0.5vw]">环比：</div>
            <div class="text-[#4EFFAE] text-[0.8vw]">-10.42</div>
            <div class="text-[#549FF9] text-[0.4vw] ml-[0.3vw]">%</div>
          </div>
        </div>
      </div>
      <div class="text-white absolute bottom-[1.5vw] left-[3.2vw] text-[0.5vw] w-[11vw] flex flex-row">
        咨询量
      </div>
      <div
        class="text-white absolute bottom-[1.5vw] left-[5vw] text-[0.4vw] w-[11vw] flex flex-row hover:cursor-pointer">
        查看
        <img src="../assets/矩形 1440.png" class="absolute left-[1vw] bottom-[0.1vw] w-[0.4vw] h-[0.4vw]" />
      </div>
    </div>
    <div class="flex flex-row ml-[1.67vh] mt-[0.5vh]">
      <img src="../assets/组3047.png" class="w-[1.04vw] h-[1.04vw]" />
      <div class="ml-[0.2vw]">
        <p class="text-white text-[0.8vw]">渠道分析</p>
      </div>
    </div>
    <div class="w-[24vm] h-[1px] bg-[#5792FF] mx-[1.67vh] mt-[0.5vh]"></div>
    <div class="w-[24vw] h-[12vh] flex flex-row mt-[0.5vh]">
      <div class="w-16vw">
        <Pie3D />
      </div>
      <div class="w-8vw flex flex-col gap-[0.5vh]">
        <div class="text-[#BFDCFF] flex justify-between">
          <div class="h-[1vw] text-[0.6vw]">96681服务热线</div>
          <div class="text-white text-[0.5vw]">2495670</div>
        </div>
        <div class="text-[#BFDCFF] flex justify-between">
          <div class="h-[1vw] text-[0.6vw]">省12345</div>
          <div class="text-white text-[0.5vw]">685435</div>
        </div>
        <div class="text-[#BFDCFF] flex justify-between">
          <div class="h-[1vw] text-[0.6vw]">人名网</div>
          <div class="text-white text-[0.5vw]">123</div>
        </div>
        <div class="text-[#BFDCFF] flex justify-between">
          <div class="h-[1vw] text-[0.6vw]">市12345</div>
          <div class="text-white text-[0.5vw]">1347</div>
        </div>
        <div class="text-[#BFDCFF] flex justify-between">
          <div class="h-[1vw] text-[0.6vw]">“找茬”窗口</div>
          <div class="flex flex-row">
            <div class="text-white text-[0.5vw]">10347</div>
            <div class="text-[#549FF9] text-[0.6vw]">件</div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-[24.792vw] h-[3.796vh] flex flex-row mr-[0.83vh] mt-[0.5vh]" :style="{
      backgroundImage: `url(${paiming})`,
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
    }">
      <p class="text-white text-[1vw] ml-[4vw]">问题板块</p>
      <div class="flex-1 flex justify-end">
        <div class="w-[7.865vw] h-[4vh] mr-[0.83vh] mt-[-0.3vh]" :style="{
          backgroundImage: `url(${jiaotang})`,
          backgroundPosition: 'center center',
          backgroundSize: '100% 100%',
        }"></div>
      </div>
    </div>
    <div class="flex flex-row mt-[1vh]">
      <!-- 六宫格业务统计卡片 -->
      <div class="grid grid-cols-3 grid-rows-2 gap-x-[1vw] gap-y-[1vh] h-[15.5vh] w-full">
        <!-- 营业 -->
        <div class="flex flex-row items-center justify-center">
          <img src="../assets/营业icon.png" class="w-[2.8vw] h-[5.4vh]" />
          <div class="flex flex-col">
            <div class="flex flex-row items-end">
              <span class="text-white text-[0.7vw] font-bold">1000</span>
              <span class="text-[#0DBCFC] text-[0.5vw] ml-[0.2vw]">件</span>
            </div>
            <span class="text-[#BFDCFF] text-start text-[0.6vw] mt-[0.2vw]">营业</span>
          </div>
        </div>
        <!-- 供水 -->
        <div class="flex flex-row items-center justify-center">
          <img src="../assets/供水icon.png" class="w-[2.8vw] h-[5.4vh]" />
          <div class="flex flex-col">
            <div class="flex flex-row items-end">
              <span class="text-white text-[0.7vw] font-bold">1000</span>
              <span class="text-[#0DBCFC] text-[0.5vw] ml-[0.2vw]">件</span>
            </div>
            <span class="text-[#BFDCFF] text-start text-[0.6vw] mt-[0.2vw]">供水</span>
          </div>
        </div>
        <!-- 漏水 -->
        <div class="flex flex-row items-center justify-center">
          <img src="../assets/漏水icon.png" class="w-[2.8vw] h-[5.4vh]" />
          <div class="flex flex-col">
            <div class="flex flex-row items-end">
              <span class="text-white text-[0.7vw] font-bold">1000</span>
              <span class="text-[#0DBCFC] text-[0.5vw] ml-[0.2vw]">件</span>
            </div>
            <span class="text-[#BFDCFF] text-start text-[0.6vw] mt-[0.2vw]">漏水</span>
          </div>
        </div>
        <!-- 排水 -->
        <div class="flex flex-row items-center justify-center">
          <img src="../assets/排水icon.png" class="w-[2.8vw] h-[5.4vh]" />
          <div class="flex flex-col">
            <div class="flex flex-row items-end">
              <span class="text-white text-[0.7vw] font-bold">1000</span>
              <span class="text-[#0DBCFC] text-[0.5vw] ml-[0.2vw]">件</span>
            </div>
            <span class="text-[#BFDCFF] text-start text-[0.6vw] mt-[0.2vw]">排水</span>
          </div>
        </div>
        <!-- 工程 -->
        <div class="flex flex-row items-center justify-center">
          <img src="../assets/工程.png" class="w-[2.8vw] h-[5.4vh]" />
          <div class="flex flex-col">
            <div class="flex flex-row items-end">
              <span class="text-white text-[0.7vw] font-bold">1000</span>
              <span class="text-[#0DBCFC] text-[0.5vw] ml-[0.2vw]">件</span>
            </div>
            <span class="text-[#BFDCFF] text-start text-[0.6vw] mt-[0.2vw]">工程</span>
          </div>
        </div>
        <!-- 服务 -->
        <div class="flex flex-row items-center justify-center">
          <img src="../assets/服务icon.png" class="w-[2.8vw] h-[5.4vh]" />
          <div class="flex flex-col">
            <div class="flex flex-row items-end">
              <span class="text-white text-[0.7vw] font-bold">1000</span>
              <span class="text-[#0DBCFC] text-[0.5vw] ml-[0.2vw]">件</span>
            </div>
            <span class="text-[#BFDCFF] text-start text-[0.6vw] mt-[0.2vw]">服务</span>
          </div>
        </div>
      </div>
    </div>
    <div class="w-[24.792vw] h-[3.796vh] flex flex-row mr-[0.83vh]" :style="{
      backgroundImage: `url(${paiming})`,
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
    }">
      <p class="text-white text-[1vw] ml-[4vw]">服务评分排名</p>
      <div class="flex-1 flex flex-row justify-center items-center">
        <el-button color="#192C4A" style="
            border: 1px solid #0dbcfc;
            width: 3vw;
            height: 2.4vh;
            color: #7eb6f7;
          ">
          <p class="text-white text-[0.5vw]">分公司</p>
        </el-button>
        <el-button color="#192C4A" style="
            border: 1px solid #0dbcfc;
            width: 4vw;
            height: 2.4vh;
            margin-left: 0.5vw;
            color: #7eb6f7;
          ">
          <p class="text-white text-[0.5vw]">电话受理员</p>
        </el-button>
      </div>
    </div>
    <div class="demo-progress">
      <el-progress :percentage="50" class="h-[3.4vh] gradient-progress default-gradient" />
      <el-progress :percentage="100" :format="format" class="h-[3.4vh] gradient-progress default-gradient" />
      <el-progress :percentage="100" status="success" class="h-[3.4vh] gradient-progress success-gradient" />
      <el-progress :percentage="100" status="warning" class="h-[3.4vh] gradient-progress warning-gradient" />
      <el-progress :percentage="50" status="exception" class="h-[3.4vh] gradient-progress exception-gradient" />
    </div>
  </div>
</template>

<style scoped>
.gradient-progress :deep(.el-progress-bar__inner) {
  background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
}

.gradient-progress.default-gradient :deep(.el-progress-bar__inner) {
  background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
}

.gradient-progress.success-gradient :deep(.el-progress-bar__inner) {
  background-image: linear-gradient(to right, #2af598 0%, #009efd 100%);
}

.gradient-progress.warning-gradient :deep(.el-progress-bar__inner) {
  background-image: linear-gradient(to right, #fbd72b 0%, #f9484a 100%);
}

.gradient-progress.exception-gradient :deep(.el-progress-bar__inner) {
  background-image: linear-gradient(to right, #ff0844 0%, #ffb199 100%);
}
</style>
