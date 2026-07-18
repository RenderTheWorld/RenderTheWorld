/* eslint-disable no-underscore-dangle */
/**
 * Renderer Adapter - 封装 Scratch 渲染器访问
 * 提供统一的接口来操作渲染层级、皮肤和可绘制对象
 *
 * 适配不同 Scratch 环境的渲染器实现差异（TurboWarp / Gandi / CCW），
 * 对上层屏蔽 _layerGroups / _allSkins / _allDrawables 等私有字段。
 */
class RendererAdapter {
    /**
     * @param {import('scratch-vm').Runtime} runtime
     */
    constructor(runtime) {
        this.runtime = runtime
        this.renderer = runtime.renderer
    }

    /**
     * 注入新的渲染层级
     * @param {string} layerName - 层级名称
     * @param {string} afterLayer - 插入到哪个层级之后
     */
    injectLayer(layerName, afterLayer = 'video') {
        const renderer = this.renderer
        let index = renderer._groupOrdering.indexOf(afterLayer)
        if (index === -1) index = 0

        // 防止重复添加
        if (renderer._groupOrdering.indexOf(layerName) === -1) {
            renderer._groupOrdering.splice(index + 1, 0, layerName)
        }

        const afterLayerGroup = renderer._layerGroups[afterLayer]
        const drawListOffset = afterLayerGroup
            ? afterLayerGroup.drawListOffset
            : 0

        renderer._layerGroups[layerName] = {
            groupIndex: index + 1,
            drawListOffset: drawListOffset
        }

        // 更新后续层级索引
        for (let i = 0; i < renderer._groupOrdering.length; i++) {
            const groupName = renderer._groupOrdering[i]
            if (renderer._layerGroups[groupName]) {
                renderer._layerGroups[groupName].groupIndex = i
            }
        }
    }

    /**
     * 创建新的皮肤 ID
     * @returns {number} 皮肤 ID
     */
    createSkinId() {
        return this.renderer._nextSkinId++
    }

    /**
     * 注册皮肤
     * @param {number} skinId
     * @param {any} skin - 皮肤对象
     */
    registerSkin(skinId, skin) {
        this.renderer._allSkins[skinId] = skin
    }

    /**
     * 创建可绘制对象
     * @param {string} drawableName - 可绘制对象名称（同时作为 group）
     * @returns {number} 可绘制对象 ID
     */
    createDrawable(drawableName) {
        return this.renderer.createDrawable(drawableName)
    }

    /**
     * 更新可绘制对象的皮肤 ID
     * @param {number} drawableId
     * @param {number} skinId
     */
    updateDrawableSkinId(drawableId, skinId) {
        this.renderer.updateDrawableSkinId(drawableId, skinId)
    }

    /**
     * 批量更新可绘制对象属性
     * @param {number} drawableId
     * @param {Object} properties - position / scale / direction / visible 等
     */
    updateDrawableProperties(drawableId, properties) {
        this.renderer.updateDrawableProperties(drawableId, properties)
    }

    /**
     * 设置可绘制对象可见性
     * @param {number} drawableId
     * @param {boolean} visible
     */
    setDrawableVisible(drawableId, visible) {
        const drawable = this.renderer._allDrawables[drawableId]
        if (drawable) {
            drawable.updateVisible(visible)
        }
    }

    /**
     * 获取 Scratch 舞台原生尺寸（如 [480, 360]）
     * @returns {[number, number]}
     */
    getNativeSize() {
        return this.renderer.getNativeSize
            ? this.renderer.getNativeSize()
            : [480, 360]
    }

    /**
     * 请求 Scratch 重绘
     */
    requestRedraw() {
        this.runtime.requestRedraw()
    }
}

export default RendererAdapter
