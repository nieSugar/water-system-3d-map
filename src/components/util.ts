/**
 * Three.js 工具库 - 向后兼容导出
 *
 * @deprecated 此文件已被拆分为多个模块，建议使用新的导入方式：
 * - import { useThree } from "./three-utils/useThree"
 * - import { THREEMAP } from "./three-utils/ThreeMap"
 * - import { EventCaster } from "./three-utils/EventCaster"
 *
 * 或者使用统一导出：
 * - import { useThree, THREEMAP, EventCaster } from "./three-utils"
 */

// 重新导出所有功能，保持向后兼容性
export { useThree } from "./three-utils/useThree";
export { THREEMAP } from "./three-utils/ThreeMap";
export { EventCaster } from "./three-utils/EventCaster";
