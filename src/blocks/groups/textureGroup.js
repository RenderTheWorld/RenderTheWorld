/**
 * 纹理分组 —— 创建纹理 / 配置材质贴图
 *
 * 包含积木：
 *   - createTexture         (OUTPUT) 从图片文件创建纹理
 *   - createTextureFromCostume (OUTPUT) 从角色当前造型创建纹理
 *   - setMaterialMap        (COMMAND) 设置材质贴图通道
 *   - setTextureRepeat      (COMMAND) 设置纹理重复
 *   - setTextureOffset      (COMMAND) 设置纹理偏移
 *   - setTextureRotation    (COMMAND) 设置纹理旋转
 *   - disposeTexture        (COMMAND) 释放纹理
 */

import BlockGroup from '../BlockGroup.js'
import { RTW_Model_Box, Wrapper } from '../../rendering/RTWTools.js'

// 贴图通道枚举
const MAP_TYPES = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'bumpMap', 'alphaMap']

export default class TextureGroup extends BlockGroup {
    static groupId = 'Textures'
    /**
     * @param {import('../BlockGroup.js').BlockGroupContext} ctx
     */
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.texture')
    }

    /**
     * @returns {(import('../BlockGroup.js').BlockDef | string)[]}
     */
    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            {
                opcode: 'createTexture',
                blockType: BT.OUTPUT,
                text: t('createTexture'),
                arguments: {
                    filename: { type: AT.STRING, defaultValue: '' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const THREE = engine.THREE
                    const cast = ext.cast
                    const filename = cast.toString(args.filename)
                    if (!filename) return '⚠️文件名不能为空！'
                    const url = this._getFileURL(filename)
                    if (!url) return '⚠️文件未找到！'
                    const loader = new THREE.TextureLoader()
                    const texture = loader.load(url)
                    texture.colorSpace = THREE.SRGBColorSpace
                    return new Wrapper(
                        new RTW_Model_Box(texture, false, false, false, undefined)
                    )
                }
            },
            {
                opcode: 'createTextureFromCostume',
                blockType: BT.OUTPUT,
                text: t('createTextureFromCostume'),
                arguments: {
                    target: { type: AT.STRING, defaultValue: '' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const THREE = engine.THREE
                    const cast = ext.cast
                    const runtime = ext.runtime
                    const targetName = cast.toString(args.target)
                    const target = targetName
                        ? runtime.getSpriteTargetByName?.(targetName)
                        : runtime.getEditingTarget()
                    if (!target) return '⚠️角色未找到！'
                    const costume = target.getCurrentCostume()
                    if (!costume?.asset) return '⚠️造型未找到！'
                    const url = costume.asset.encodeDataURI()
                    const loader = new THREE.TextureLoader()
                    const texture = loader.load(url)
                    texture.colorSpace = THREE.SRGBColorSpace
                    return new Wrapper(
                        new RTW_Model_Box(texture, false, false, false, undefined)
                    )
                }
            },
            '---',
            {
                opcode: 'setMaterialMap',
                blockType: BT.COMMAND,
                text: t('setMaterialMap'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    mapType: {
                        type: AT.STRING,
                        menu: 'mapTypeMenu',
                        defaultValue: 'map'
                    },
                    texture: { type: null, defaultValue: '' }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    // 查找材质（支持 Mesh 子物体）
                    let material = model.material
                    if (!material && model.children?.length > 0) {
                        material = model.children[0]?.material
                    }
                    if (!material) return '⚠️未找到材质！'
                    const mapType = cast.toString(args.mapType)
                    const texObj = Wrapper.unwrap(args.texture)
                    const texture =
                        texObj instanceof RTW_Model_Box
                            ? texObj.model
                            : texObj
                    // 如果是 null/undefined，移除贴图
                    if (texture == null) {
                        if (material[mapType]) material[mapType].dispose?.()
                        material[mapType] = null
                    } else if (texture?.isTexture) {
                        material[mapType] = texture
                    } else {
                        return '⚠️传入的不是纹理！'
                    }
                    material.needsUpdate = true
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'setTextureRepeat',
                blockType: BT.COMMAND,
                text: t('setTextureRepeat'),
                arguments: {
                    texture: { type: null, defaultValue: '' },
                    x: { type: AT.NUMBER, defaultValue: 1 },
                    y: { type: AT.NUMBER, defaultValue: 1 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    const cast = ext.cast
                    const texObj = Wrapper.unwrap(args.texture)
                    const texture =
                        texObj instanceof RTW_Model_Box ? texObj.model : texObj
                    if (!texture?.isTexture) return '⚠️传入的不是纹理！'
                    texture.wrapS = engine.THREE.RepeatWrapping
                    texture.wrapT = engine.THREE.RepeatWrapping
                    texture.repeat.set(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y)
                    )
                    texture.needsUpdate = true
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'setTextureOffset',
                blockType: BT.COMMAND,
                text: t('setTextureOffset'),
                arguments: {
                    texture: { type: null, defaultValue: '' },
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    const cast = ext.cast
                    const texObj = Wrapper.unwrap(args.texture)
                    const texture =
                        texObj instanceof RTW_Model_Box ? texObj.model : texObj
                    if (!texture?.isTexture) return '⚠️传入的不是纹理！'
                    texture.offset.set(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y)
                    )
                    texture.needsUpdate = true
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'setTextureRotation',
                blockType: BT.COMMAND,
                text: t('setTextureRotation'),
                arguments: {
                    texture: { type: null, defaultValue: '' },
                    rotation: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    const cast = ext.cast
                    const THREE = engine.THREE
                    const texObj = Wrapper.unwrap(args.texture)
                    const texture =
                        texObj instanceof RTW_Model_Box ? texObj.model : texObj
                    if (!texture?.isTexture) return '⚠️传入的不是纹理！'
                    texture.rotation = THREE.MathUtils.degToRad(
                        cast.toNumber(args.rotation)
                    )
                    texture.center.set(0.5, 0.5)
                    texture.needsUpdate = true
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'disposeTexture',
                blockType: BT.COMMAND,
                text: t('disposeTexture'),
                arguments: {
                    texture: { type: null, defaultValue: '' }
                },
                handler: args => {
                    const texObj = Wrapper.unwrap(args.texture)
                    const texture =
                        texObj instanceof RTW_Model_Box ? texObj.model : texObj
                    if (texture?.isTexture) texture.dispose()
                }
            }
        ]
    }

    registerMenus() {
        this.core.registerMenu('mapTypeMenu', {
            acceptReporters: false,
            items: MAP_TYPES.map(t => ({
                text: t,
                value: t
            }))
        })
    }

    /**
     * 从 Gandi 资源系统获取文件 URL
     */
    _getFileURL(filename) {
        const runtime = this.ext.runtime
        try {
            const content = runtime.getGandiAssetContent(filename)
            return content ? content.encodeDataURI() : ''
        } catch {
            return ''
        }
    }

    l10n() {
        return {
            'group.texture': {
                'zh-cn': '🖼️纹理',
                en: '🖼️Texture'
            },
            createTexture: {
                'zh-cn': '从文件 [filename] 创建纹理',
                en: 'create texture from [filename]'
            },
            createTextureFromCostume: {
                'zh-cn': '从角色 [target] 的当前造型创建纹理',
                en: 'create texture from [target] costume'
            },
            setMaterialMap: {
                'zh-cn': '设置 [name] 材质的 [mapType] 为 [texture]',
                en: 'set [name] material [mapType] to [texture]'
            },
            setTextureRepeat: {
                'zh-cn': '设置纹理 [texture] 重复 x [x] y [y]',
                en: 'set [texture] repeat x [x] y [y]'
            },
            setTextureOffset: {
                'zh-cn': '设置纹理 [texture] 偏移 x [x] y [y]',
                en: 'set [texture] offset x [x] y [y]'
            },
            setTextureRotation: {
                'zh-cn': '设置纹理 [texture] 旋转 [rotation]°',
                en: 'set [texture] rotation [rotation]°'
            },
            disposeTexture: {
                'zh-cn': '释放纹理 [texture]',
                en: 'dispose texture [texture]'
            }
        }
    }
}
