/**
 * 天空盒分组 —— 立方体贴图天空盒 / 纯色天空 / 渐变天空
 *
 * 包含积木：
 *   - setSkyBox        (COMMAND) 从6张图片设置天空盒
 *   - setSkyColor      (COMMAND) 设置纯色天空
 *   - setSkyFromGradient (COMMAND) 设置渐变天空（上下两色）
 *   - clearSky         (COMMAND) 清除天空盒（透明）
 */

import BlockGroup from '../BlockGroup.js'

export default class SkyGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.sky')
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            {
                opcode: 'setSkyBox',
                blockType: BT.COMMAND,
                text: t('setSkyBox'),
                arguments: {
                    px: { type: AT.STRING, defaultValue: '' },
                    nx: { type: AT.STRING, defaultValue: '' },
                    py: { type: AT.STRING, defaultValue: '' },
                    ny: { type: AT.STRING, defaultValue: '' },
                    pz: { type: AT.STRING, defaultValue: '' },
                    nz: { type: AT.STRING, defaultValue: '' }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.scene) return '⚠️显示器未初始化！'
                    const THREE = engine.THREE
                    const cast = ext.cast
                    const loader = new THREE.CubeTextureLoader()
                    const urls = [
                        cast.toString(args.px),
                        cast.toString(args.nx),
                        cast.toString(args.py),
                        cast.toString(args.ny),
                        cast.toString(args.pz),
                        cast.toString(args.nz)
                    ].map(name => this._getFileURL(name))

                    // 如果任一贴图为空则放弃
                    if (urls.some(u => !u)) {
                        return '⚠️天空盒贴图不完整！'
                    }

                    loader.load(urls, cubeTex => {
                        if (engine._destroyed) return
                        cubeTex.colorSpace = THREE.SRGBColorSpace
                        engine.scene.background = cubeTex
                        // 保存引用以便 dispose
                        engine._skyTexture = cubeTex
                        engine.setDirty3D()
                    })
                }
            },
            {
                opcode: 'setSkyColor',
                blockType: BT.COMMAND,
                text: t('setSkyColor'),
                arguments: {
                    color: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.scene) return '⚠️显示器未初始化！'
                    const THREE = engine.THREE
                    // 释放旧的天空盒贴图
                    if (engine._skyTexture) {
                        engine._skyTexture.dispose()
                        engine._skyTexture = null
                    }
                    const cast = ext.cast
                    engine.scene.background = new THREE.Color(
                        cast.toNumber(args.color)
                    )
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'setSkyFromGradient',
                blockType: BT.COMMAND,
                text: t('setSkyFromGradient'),
                arguments: {
                    top: { type: AT.NUMBER, defaultValue: 0x87ceeb },
                    bottom: { type: AT.NUMBER, defaultValue: 0xffffff }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.scene) return '⚠️显示器未初始化！'
                    const THREE = engine.THREE
                    const cast = ext.cast
                    // 释放旧的天空盒贴图
                    if (engine._skyTexture) {
                        engine._skyTexture.dispose()
                        engine._skyTexture = null
                    }
                    const top = new THREE.Color(cast.toNumber(args.top))
                    const bottom = new THREE.Color(cast.toNumber(args.bottom))
                    const canvas = document.createElement('canvas')
                    canvas.width = 2
                    canvas.height = 256
                    const ctx = canvas.getContext('2d')
                    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
                    gradient.addColorStop(0, `#${top.getHexString()}`)
                    gradient.addColorStop(1, `#${bottom.getHexString()}`)
                    ctx.fillStyle = gradient
                    ctx.fillRect(0, 0, 2, 256)
                    const tex = new THREE.CanvasTexture(canvas)
                    tex.colorSpace = THREE.SRGBColorSpace
                    engine.scene.background = tex
                    engine._skyTexture = tex
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'clearSky',
                blockType: BT.COMMAND,
                text: t('clearSky'),
                handler: () => {
                    const engine = ext.renderEngine
                    if (!engine.scene) return '⚠️显示器未初始化！'
                    if (engine._skyTexture) {
                        engine._skyTexture.dispose()
                        engine._skyTexture = null
                    }
                    engine.scene.background = null
                    engine.setDirty3D()
                }
            }
        ]
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
            'group.sky': { 'zh-cn': '🌅天空', en: '🌅Sky' },
            setSkyBox: {
                'zh-cn':
                    '设置天空盒 前 [px] 后 [nx] 上 [py] 下 [ny] 右 [pz] 左 [nz]',
                en: 'skybox front [px] back [nx] up [py] down [ny] right [pz] left [nz]'
            },
            setSkyColor: {
                'zh-cn': '设置天空颜色 [color]',
                en: 'set sky color [color]'
            },
            setSkyFromGradient: {
                'zh-cn': '设置渐变天空 上 [top] 下 [bottom]',
                en: 'gradient sky top [top] bottom [bottom]'
            },
            clearSky: {
                'zh-cn': '清除天空',
                en: 'clear sky'
            }
        }
    }
}
