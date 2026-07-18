/**
 * 设置与工具分组
 *
 * 扩展加载时自动初始化 Three.js（无需 init 积木），本分组提供
 * 运行时可动态修改的渲染设置和通用工具积木。
 *
 * 包含积木：
 *   - setBackgroundColor (COMMAND)   设置场景背景颜色
 *   - setAntialias       (COMMAND)   启/禁用抗锯齿（重建渲染器）
 *   - setShadowMapType   (COMMAND)   设置阴影贴图类型
 *   - setShadowEnabled   (COMMAND)   启/禁用阴影
 *   - set3dState         (COMMAND)   设置 3D 层显隐
 *   - get3dState         (BOOLEAN)   三维显示器是否显示
 *   - isWebGLAvailable   (BOOLEAN)   当前设备是否支持 WebGL
 *
 * LABEL 顺序：
 *   🛠️工具 → [setBackgroundColor, setAntialias, setShadowMapType,
 *             setShadowEnabled, set3dState, get3dState,
 *             isWebGLAvailable]
 *   🧸物体 → 材质 → ...（后续分组续接）
 */

import BlockGroup from '../BlockGroup.js'
import { ColorTools, wrapRTWModel } from '../../utils/RTWTools.js'

export default class SettingsGroup extends BlockGroup {
    static groupId = 'Tools'
    /**
     * @param {import('../BlockGroup.js').BlockGroupContext} ctx
     */
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.tools')
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
            // —— 渲染设置 ——
            {
                opcode: 'setBackgroundColor',
                blockType: BT.COMMAND,
                text: t('setBackgroundColor'),
                arguments: {
                    color: { type: AT.NUMBER, defaultValue: 0, menu: 'bgColorMenu' }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    const cast = ext.cast
                    if (
                        cast
                            ? cast.toString(args.color) === 'none'
                            : args.color === 'none'
                    ) {
                        engine.setBackgroundColor(null)
                        return
                    }
                    const THREE = engine.THREE
                    const color = ColorTools.parse(args.color, THREE, cast)
                    engine.setBackgroundColor(color.getHex())
                }
            },
            // —— 3D 显示器状态 ——
            {
                opcode: 'get3dState',
                blockType: BT.BOOLEAN,
                text: t('get3dState'),
                handler: () => ext.renderEngine.get3dState()
            },
            {
                opcode: 'set3dState',
                blockType: BT.COMMAND,
                text: t('set3dState'),
                arguments: {
                    state: {
                        type: AT.STRING,
                        menu: 'stateMenu'
                    }
                },
                handler: args => {
                    ext.renderEngine.setVisible(
                        ext.cast
                            ? ext.cast.toString(args.state) === 'display'
                            : args.state === 'display'
                    )
                }
            },
            {
                opcode: 'setAntialias',
                blockType: BT.COMMAND,
                text: t('setAntialias'),
                arguments: {
                    enabled: {
                        type: AT.STRING,
                        menu: 'enableDisableMenu'
                    }
                },
                handler: args => {
                    const cast = ext.cast
                    const enabled = cast
                        ? cast.toString(args.enabled) === 'enable'
                        : args.enabled === 'enable'
                    ext.renderEngine.setAntialias(enabled)
                }
            },
            {
                opcode: 'setShadowEnabled',
                blockType: BT.COMMAND,
                text: t('setShadowEnabled'),
                arguments: {
                    enabled: {
                        type: AT.STRING,
                        menu: 'enableDisableMenu'
                    }
                },
                handler: args => {
                    const cast = ext.cast
                    const enabled = cast
                        ? cast.toString(args.enabled) === 'enable'
                        : args.enabled === 'enable'
                    ext.renderEngine.setShadowEnabled(enabled)
                }
            },
            {
                opcode: 'setShadowMapType',
                blockType: BT.COMMAND,
                text: t('setShadowMapType'),
                arguments: {
                    type: {
                        type: AT.STRING,
                        menu: 'shadowMapMenu',
                        defaultValue: 1
                    }
                },
                handler: args => {
                    ext.renderEngine.setShadowMapType(
                        ext.cast
                            ? ext.cast.toNumber(args.type)
                            : Number(args.type)
                    )
                }
            },

            // —— 兼容性检查 ——
            {
                opcode: 'isWebGLAvailable',
                blockType: BT.BOOLEAN,
                text: t('isWebGLAvailable'),
                handler: () => {
                    // 扩展加载时已自动初始化，如果 WebGL 不可用会抛异常
                    // 这里直接检查渲染器是否存在
                    return !!ext.renderEngine?.renderer
                }
            },

            // —— 颜色工具 ——
            {
                opcode: 'colorMath',
                blockType: BT.OUTPUT,
                text: t('colorMath'),
                arguments: {
                    hex: { type: AT.NUMBER, defaultValue: 0xffffff }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const engine = ext.renderEngine
                    const THREE = engine?.THREE
                    if (!THREE) return '⚠️显示器未初始化！'
                    return wrapRTWModel(
                        ColorTools.parse(args.hex, THREE, ext.cast)
                    )
                }
            },
            {
                opcode: 'colorFromRGB',
                blockType: BT.OUTPUT,
                text: t('colorFromRGB'),
                arguments: {
                    r: { type: AT.NUMBER, defaultValue: 255 },
                    g: { type: AT.NUMBER, defaultValue: 255 },
                    b: { type: AT.NUMBER, defaultValue: 255 }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const engine = ext.renderEngine
                    const THREE = engine?.THREE
                    if (!THREE) return '⚠️显示器未初始化！'
                    return wrapRTWModel(
                        ColorTools.parse(
                            [args.r, args.g, args.b],
                            THREE,
                            ext.cast
                        )
                    )
                }
            },
            {
                opcode: 'colorFromHSL',
                blockType: BT.OUTPUT,
                text: t('colorFromHSL'),
                arguments: {
                    h: { type: AT.NUMBER, defaultValue: 180 },
                    s: { type: AT.NUMBER, defaultValue: 100 },
                    l: { type: AT.NUMBER, defaultValue: 50 }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const engine = ext.renderEngine
                    const THREE = engine?.THREE
                    if (!THREE) return '⚠️显示器未初始化！'
                    return wrapRTWModel(
                        ColorTools.fromHSL(
                            args.h,
                            args.s,
                            args.l,
                            THREE,
                            ext.cast
                        )
                    )
                }
            }
        ]
    }

    registerMenus() {
        const THREE = this.ext.renderEngine.THREE
        const t = this.translate

        this.core.registerMenu('enableDisableMenu', {
            acceptReporters: false,
            items: [
                { text: t('ed.enable'), value: 'enable' },
                { text: t('ed.disable'), value: 'disable' }
            ]
        })
        this.core.registerMenu('stateMenu', {
            acceptReporters: false,
            items: [
                { text: t('3dState.display'), value: 'display' },
                { text: t('3dState.hidden'), value: 'hidden' }
            ]
        })
        this.core.registerMenu('shadowMapMenu', {
            acceptReporters: false,
            items: [
                { text: 'BasicShadowMap', value: THREE.BasicShadowMap },
                { text: 'PCFShadowMap', value: THREE.PCFShadowMap },
                { text: 'PCFSoftShadowMap', value: THREE.PCFSoftShadowMap },
                { text: 'VSMShadowMap', value: THREE.VSMShadowMap }
            ]
        })
        this.core.registerMenu('bgColorMenu', {
            acceptReporters: true,
            acceptText: true,
            items: [
                { text: t('bgColor.none'), value: 'none' },
            ]
        })
    }

    l10n() {
        return {
            'group.tools': { 'zh-cn': '🛠️工具', en: '🛠️Tools' },
            setBackgroundColor: {
                'zh-cn': '将背景颜色设为 [color]',
                en: 'set background color to [color]'
            },
            get3dState: {
                'zh-cn': ' 3D画布是显示的',
                en: 'the 3D layer is visible'
            },
            set3dState: {
                'zh-cn': '将3D画布状态设为 [state]',
                en: 'set 3D layer state to [state]'
            },
            setAntialias: {
                'zh-cn': '[enabled] 抗锯齿',
                en: '[enabled] anti-aliasing'
            },
            setShadowEnabled: {
                'zh-cn': '[enabled] 阴影',
                en: '[enabled] shadows'
            },
            setShadowMapType: {
                'zh-cn': '将阴影类型设为 [type]',
                en: 'set shadow map type to [type]'
            },
            isWebGLAvailable: {
                'zh-cn': '当前设备支持WebGL',
                en: 'WebGL available'
            },
            bgColor: {
                none: {
                    'zh-cn': '透明',
                    en: 'transparent'
                }
            },
            '3dState': {
                display: { 'zh-cn': '显示', en: 'display' },
                hidden: { 'zh-cn': '隐藏', en: 'hidden' }
            },
            // 解析为3dState.display和3dState.hidden
            ed: {
                enable: { 'zh-cn': '启用', en: 'enable' },
                disable: { 'zh-cn': '禁用', en: 'disable' }
            },
            colorMath: {
                'zh-cn': '颜色 [hex]',
                en: 'color [hex]'
            },
            colorFromRGB: {
                'zh-cn': 'RGB颜色 R [r] G [g] B [b]',
                en: 'RGB color R [r] G [g] B [b]'
            },
            colorFromHSL: {
                'zh-cn': 'HSL颜色 色相 [h]° 饱和度 [s]% 亮度 [l]%',
                en: 'HSL color hue [h]° sat [s]% light [l]%'
            }
        }
    }
}
