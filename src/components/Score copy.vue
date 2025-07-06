<template>
    <!-- 服务评分排名服务 -->
    <div class="score common">
        <!-- 背景与标题区域 -->
        <div class="score-bg flex space-between common-bg text-left">
            <div class="score-title common-title padding-left-xll">服务评分排名服务</div>
            <div class="complaint-tab flex align-center font-size-sm">
                <div class="active color-E3AE3B">分公司</div>
                <div class="default color-6c ">电话受理员</div>
            </div>
        </div>

        <!-- 服务评分排名信息 -->
        <div class="score-sub-bg ">
            <div class="padding-bottom-xs">
                <div class="flex align-center space-between padding-bottom-xs">
                    <div class="flex align-center ">
                        <img src="../../src/assets/img/1.png" alt="">
                        <div class="color-blue font-size-lg padding-left-sm ">皇姑</div>
                    </div>
                    <div class="p-ro Roboto">98.5%</div>

                </div>
                <div class="progress-bg">
                    <div class="progress" style="width: 98.5%;"></div>
                </div>
            </div>
            <div class="padding-bottom-xs">
                <div class="flex align-center space-between padding-bottom-xs">
                    <div class="flex align-center">
                        <img src="../../src/assets/img/2.png" alt="">
                        <div class="color-blue font-size-lg padding-left-sm ">皇姑</div>
                    </div>
                    <div class="p-ro Roboto">78%</div>

                </div>
                <div class="progress-bg">
                    <div class="progress" style="width: 78%;"></div>
                </div>
            </div>
            <div class="padding-bottom-xs">
                <div class="flex align-center space-between padding-bottom-xs ">
                    <div class="flex align-center ">
                        <img src="../../src/assets/img/3.png" alt="">
                        <div class="color-blue font-size-lg padding-left-sm ">皇姑</div>
                    </div>
                    <div class="p-ro Roboto">55%</div>
                </div>
                <div class="progress-bg">
                    <div class="progress" style="width: 55%;"></div>
                </div>
            </div>
            <div class="padding-bottom-xs">
                <div class="flex align-center space-between padding-bottom-xs">
                    <div class="flex align-center">
                        <div style="    width: 20px;    height: 24px;"></div>
                        <div class="color-blue font-size-lg padding-left-sm ">皇姑</div>
                    </div>
                    <div class="p-ro Roboto">15%</div>
                </div>
                <div class="progress-bg">
                    <div class="progress" style="width: 15%;"></div>
                </div>
            </div>

        </div>


    </div>
</template>

<script >
import { onMounted, ref } from 'vue';

export default {
    name: 'Score',
    setup() {


    }
}   
</script>
  
<style scoped>
/* 服务评分排名 */
.score {}

.score-bg {
    background-image: url('../../src/assets/img/huawu.png');
    background-size: 100% 41px;
    margin-top: 20px;
    height: 41px;
}

.score-title {
    height: 21px;
    padding-bottom: 10px;
}

.score-bg img {
    width: 150px;
    height: 52px;
}

/* 服务评分排名信息 */

.score-sub-bg {
    padding: 10px 54px 0;
    font-family: PingFang SC;
}

.score-sub-bg img {
    width: 20px;
    height: 24px;
}

.score-sub-bg .progress-bg {
    flex: 1;
    height: 6px;
    /* background: #070E25; */
    background: linear-gradient(to right, #0B244E, #0B244E);
       -webkit-clip-path: polygon(0 82%, 100% 0, 100% 100%, 0% 100%);
    clip-path: polygon(0 82%, 100% 0, 100% 100%, 0% 100%);
     position: relative;
    overflow: visible;

}

/* 进度条填充样式 */
.progress {
    height: 100%;
    background: linear-gradient(to right, #0B244E, #0084FF);
    /* 渐变色从左到右过渡 */
    /* position: relative; */
     position: absolute; /* 绝对定位以正确显示指示器 */
    left: 0;
    top: 0;
  
    transition: width 0.3s ease; /* 添加平滑过渡 */
    
    /* 保持与背景相同的斜角形状 */
    -webkit-clip-path: polygon(0 82%, 100% 0, 100% 100%, 0% 100%);
    clip-path: polygon(0 82%, 100% 0, 100% 100%, 0% 100%);

}

.progress::after,
.progress::before {
    z-index: 1;
    /* 确保显示在进度条上方 */
}

.progress::after {
    content: "";
    position: absolute;
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    /* 对应图中 16px 尺寸 */
    height: 16px;
    border-radius: 50%;
    background: #A5E8FF;
    opacity: 0.2;
}

.progress::before {
    content: "";
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    /* 对应图中 16px 尺寸 */
    height: 8px;
    background: #9DDDFE;
    border-radius: 50%;
}

.p-ro {
    font-family: D-DIN;
    font-weight: bold;
    font-size: 24px;
}



.score-sub-title {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, 5px);
    background: linear-gradient(0deg, #DDF9FF 90%, #7BFAFF 0%);
    font-weight: 400;
    color: transparent;
    -webkit-background-clip: text;
    font-family: PingFang SC;
}

.sub-bg {
    background-image: url('../../src/assets/img/sub-click-bg.png');
    background-size: 100% 64px;
    height: 64px;
    width: 97px;
    background-position: center center;
    background-repeat: no-repeat;
}

.sub-bg .Roboto {
    font-family: D-DIN;
    font-weight: bold;
    font-size: 28px;
}

/* 受诉量 */
.complaint-tab>div {
    padding: 3px 10px;
    border-radius: 4px;
    background: #0C234D;
    margin-right: 10px;
    cursor: pointer;
}

.complaint-tab :hover {
    background-color: #3D4F71;
}

.complaint-tab .active {
    border: 1px solid #2D5FEC;
}

.complaint-tab .default {
    border: 1px solid #2C3E59;
}


.score-complaint-bg>div {
    height: 168px;
}

.score-complaint-bg img {
    height: 79px;
    width: 72px;
}

.score-bg-title {
    font-family: D-DIN;
    font-weight: bold;
    font-size: 32px;
}

.ren {
    font-family: PingFang SC;
    font-weight: 400;
    line-height: 22px;
}
</style>
  
    