/**
 * EventCaster 类 - 3D 对象事件管理器
 * 
 * 功能：
 * 1. 为 3D 场景中的对象添加鼠标交互事件
 * 2. 支持点击和悬停事件
 * 3. 使用射线投射检测鼠标与 3D 对象的交互
 * 4. 提供统一的事件管理接口
 */

import * as THREE from 'three';

/**
 * EventCaster 类 - 3D 对象事件管理器
 *
 * 功能：
 * 1. 为 3D 场景中的对象添加鼠标交互事件
 * 2. 支持点击和悬停事件
 * 3. 使用射线投射检测鼠标与 3D 对象的交互
 * 4. 提供统一的事件管理接口
 */
export class EventCaster {
  // 点击事件监听器列表
  private clickListeners: { obj: THREE.Object3D, callback: (result: THREE.Intersection) => void }[] = []

  // 悬停事件监听器列表
  private hoverListeners: { obj: THREE.Object3D, callback: (result: THREE.Intersection) => void }[] = []

  // 射线投射器，用于检测鼠标与3D对象的交互
  private rayCaster: THREE.Raycaster = new THREE.Raycaster()

  // 鼠标位置向量（标准化设备坐标）
  private mouse: THREE.Vector2 = new THREE.Vector2()

  public camera: THREE.Camera        // 相机引用
  public canvas: HTMLCanvasElement   // 画布引用

  // 默认回调函数
  public defaultCilckCallback: () => void = () => { }   // 默认点击回调
  public defaultHoverCallback: () => void = () => { }   // 默认悬停回调

  /**
   * 构造函数
   * @param camera - Three.js 相机对象
   * @param canvas - HTML Canvas 元素
   */
  constructor(camera: THREE.Camera, canvas: HTMLCanvasElement) {
    this.camera = camera
    this.canvas = canvas
    this.canvas.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.offsetX / this.canvas.offsetWidth) * 2 - 1
      this.mouse.y = -(event.offsetY / this.canvas.offsetHeight) * 2 + 1

      this.rayCaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.rayCaster.intersectObjects(this.hoverListeners.map(l => l.obj))
      if (intersects.length > 0) {
        const result = intersects[0]
        const listener = this.hoverListeners.find((l: any) => l.obj.id === result.object.id)
        listener?.callback(result)
      } else {
        this.defaultHoverCallback()
      }
    })

    this.canvas.addEventListener('click', () => {
      this.rayCaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.rayCaster.intersectObjects(this.clickListeners.map(l => l.obj))
      if (intersects.length > 0) {
        const result = intersects[0]
        const listener = this.clickListeners.find((l: any) => l.obj.id === result.object.id)
        listener?.callback(result)
      } else {
        this.defaultCilckCallback()
      }
    })
  }

  /**
   * 为3D对象添加事件监听器
   * @param obj - 要监听的3D对象或对象数组
   * @param event - 事件类型（'click' 或 'mousemove'）
   * @param callback - 事件回调函数，接收射线投射结果
   */
  addListener(obj: THREE.Object3D | THREE.Object3D[], event: keyof HTMLElementEventMap, callback: (result: THREE.Intersection) => void) {
    if (Array.isArray(obj)) {
      obj.forEach(o => {
        if (event === 'click') {
          this.clickListeners.push({ obj: o, callback: callback })
        }
        else if (event === 'mousemove') {
          this.hoverListeners.push({ obj: o, callback: callback })
        }
      })
    } else {
      if (event === 'click') {
        this.clickListeners.push({ obj, callback: callback })
      }
      else if (event === 'mousemove') {
        this.hoverListeners.push({ obj, callback: callback })
      }
    }

  }

  /**
   * 清理事件监听器，释放资源
   * 移除所有绑定的鼠标事件监听器
   */
  dispose() {
    this.canvas.removeEventListener('mousemove', (event) => {
      this.mouse.x = (event.offsetX / this.canvas.offsetWidth) * 2 - 1
      this.mouse.y = -(event.offsetY / this.canvas.offsetHeight) * 2 + 1

      this.rayCaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.rayCaster.intersectObjects(this.hoverListeners.map(l => l.obj))
      if (intersects.length > 0) {
        const result = intersects[0]
        const listener = this.hoverListeners.find((l: any) => l.obj.id === result.object.id)
        listener?.callback(result)
      } else {
        this.defaultHoverCallback()
      }
    })

    this.canvas.removeEventListener('click', () => {
      this.rayCaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.rayCaster.intersectObjects(this.clickListeners.map(l => l.obj))
      if (intersects.length > 0) {
        const result = intersects[0]
        const listener = this.clickListeners.find((l: any) => l.obj.id === result.object.id)
        listener?.callback(result)
      } else {
        this.defaultCilckCallback()
      }
    })
  }
}
