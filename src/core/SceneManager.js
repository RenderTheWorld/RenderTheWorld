/**
 * SceneManager —— 场景对象管理器
 *
 * 职责：
 *   - 管理命名对象表（objects / animations / lights）
 *   - 提供统一的模型获取接口（支持 RTW_Model_Box / Wrapper / 名称字符串）
 *   - 对象的注册、注销、dispose
 *   - 动画混合器的批量更新
 *
 * 设计理念：
 *   将"场景内容管理"从"渲染管线"中分离，让 RenderEngine 专注渲染调度，
 *   SceneManager 专注场景图与资源生命周期。
 */

import { RTW_Model_Box, Wrapper } from '../utils/RTWTools.js'

class SceneManager {
    /**
     * @param {import('./renderengine.js').default} engine - 渲染引擎实例
     */
    constructor(engine) {
        this.engine = engine
        this.THREE = engine.THREE

        /** @type {Record<string, THREE.Object3D>} 已命名的 3D 对象 */
        this.objects = Object.create(null)
        /** @type {Record<string, {mixer: THREE.AnimationMixer, clips: THREE.AnimationClip[], action: Record<string, THREE.AnimationAction>}>} 动画表 */
        this.animations = Object.create(null)
        /** @type {Record<string, THREE.Light>} 灯光对象（ambient/hemisphere 等单例） */
        this.lights = Object.create(null)
    }

    /**
     * 获取模型对象。接受 RTW_Model_Box 包装、Wrapper 包装或名称字符串。
     * @param {RTW_Model_Box|Wrapper|string|*} obj
     * @returns {THREE.Object3D|null}
     */
    getModel(obj) {
        obj = Wrapper.unwrap(obj)
        if (
            obj instanceof RTW_Model_Box &&
            obj.model != null &&
            (obj.model.isObject3D || obj.model.isOrbitControls)
        ) {
            return obj.model
        }
        const name = this.engine.castToString(obj)
        if (Object.prototype.hasOwnProperty.call(this.objects, name)) {
            return this.objects[name]
        }
        return null
    }

    /**
     * 注册一个命名对象到对象表并加入场景
     * @param {string} name
     * @param {THREE.Object3D} obj
     * @returns {THREE.Object3D}
     */
    register(name, obj) {
        this.objects[name] = obj
        if (this.engine.scene) this.engine.scene.add(obj)
        this.engine.setDirty3D()
        return obj
    }

    /**
     * 注册动画数据
     * @param {string} name
     * @param {{mixer: THREE.AnimationMixer, clips: THREE.AnimationClip[], action: Record<string, THREE.AnimationAction>}} anim
     */
    registerAnimation(name, anim) {
        this.animations[name] = anim
    }

    /**
     * 注销并 dispose 一个命名对象（含动画）
     * @param {string} name
     */
    remove(name) {
        const obj = this.objects[name]
        if (!obj) return
        if (obj.parent) obj.parent.remove(obj)
        this._disposeObject(obj)
        delete this.objects[name]

        const anim = this.animations[name]
        if (anim?.mixer) anim.mixer.stopAllAction()
        delete this.animations[name]

        this.engine.setDirty3D()
    }

    /**
     * 清空所有命名对象与动画
     */
    clear() {
        Object.keys(this.objects).forEach(name => this.remove(name))
    }

    /**
     * 推进所有动画混合器
     * @param {number} delta - 秒
     * @returns {boolean} 是否有动画被更新
     */
    updateAnimations(delta) {
        let changed = false
        for (const name in this.animations) {
            const mixer = this.animations[name]?.mixer
            if (mixer) {
                mixer.update(delta)
                changed = true
            }
        }
        if (changed) this.engine.setDirty3D()
        return changed
    }

    /**
     * 释放一个 Object3D 及其子树的所有资源
     * @param {THREE.Object3D} obj
     */
    _disposeObject(obj) {
        obj.traverse(child => {
            if (child.geometry) child.geometry.dispose()
            if (child.material) {
                const mats = Array.isArray(child.material)
                    ? child.material
                    : [child.material]
                mats.forEach(m => {
                    for (const k in m) {
                        if (m[k] && m[k].isTexture) m[k].dispose()
                    }
                    m.dispose()
                })
            }
        })
    }
}

export default SceneManager
