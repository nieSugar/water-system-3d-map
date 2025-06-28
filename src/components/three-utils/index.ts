/**
 * Three.js 工具库统一导出
 * 提供3D场景初始化、地图渲染、事件处理等核心功能
 *
 * 主要功能：
 * 1. useThree - Vue3 + Three.js 集成 Hook
 * 2. THREEMAP - GeoJSON 转 3D 地图类
 * 3. EventCaster - 3D 对象事件管理器
 */

// 导出 Vue3 + Three.js 集成 Hook
export { useThree } from './useThree';

// 导出 GeoJSON 转 3D 地图类
export { THREEMAP } from './ThreeMap';

// 导出 3D 对象事件管理器
export { EventCaster } from './EventCaster';

// 重新导出，保持向后兼容性
export { THREEMAP as ThreeMap } from './ThreeMap';
