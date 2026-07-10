/**
 * 设置与工具分组
 *
 * 扩展加载时自动初始化 Three.js（无需 init 积木），本分组提供
 * 运行时可动态修改的渲染设置和通用工具积木。
 *
 * 包含积木：
 *   - apidocs            (BUTTON)    API 文档跳转
 *   - setBackgroundColor (COMMAND)   设置场景背景颜色
 *   - setAntialias       (COMMAND)   启/禁用抗锯齿（重建渲染器）
 *   - setShadowMapType   (COMMAND)   设置阴影贴图类型
 *   - setShadowEnabled   (COMMAND)   启/禁用阴影
 *   - set3dState         (COMMAND)   设置 3D 层显隐
 *   - get3dState         (BOOLEAN)   三维显示器是否显示
 *   - isWebGLAvailable   (BOOLEAN)   当前设备是否支持 WebGL
 *   - color_RGB          (REPORTER)  RGB 颜色合成工具
 *
 * LABEL 顺序：
 *   🛠️工具 → [apidocs, setBackgroundColor, setAntialias, setShadowMapType,
 *             setShadowEnabled, set3dState, get3dState,
 *             isWebGLAvailable, color_RGB]
 *   🧸物体 → 材质 → ...（后续分组续接）
 */

import BlockGroup from '../BlockGroup.js'

export default class SettingsGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        this.label = null // 不使用自动 LABEL，手动插入
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            // LABEL: 🛠️工具
            { blockType: BT.LABEL, text: t('group.tools') },

            {
                opcode: 'apidocs',
                blockType: BT.BUTTON,
                text: t('apidocs'),
                onClick: () => {
                    window.open(ext.docsURI, '_blank', 'noopener,noreferrer')
                }
            },

            // —— 渲染设置 ——
            {
                opcode: 'setBackgroundColor',
                blockType: BT.COMMAND,
                text: t('setBackgroundColor'),
                arguments: {
                    color: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    const cast = ext.cast
                    const colorVal = cast
                        ? cast.toNumber(args.color)
                        : Number(args.color)
                    engine.setBackgroundColor(colorVal)
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
                        ext.cast ? ext.cast.toNumber(args.type) : Number(args.type)
                    )
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

            // —— 3D 显示器状态 ——
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
                opcode: 'get3dState',
                blockType: BT.BOOLEAN,
                text: t('get3dState'),
                handler: () => ext.renderEngine.get3dState()
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
                opcode: 'color_RGB',
                blockType: BT.REPORTER,
                text: t('color_RGB'),
                arguments: {
                    R: { type: AT.NUMBER, defaultValue: 255 },
                    G: { type: AT.NUMBER, defaultValue: 255 },
                    B: { type: AT.NUMBER, defaultValue: 255 }
                },
                disableMonitor: true,
                handler: args => {
                    const cast = ext.cast
                    const toNum = cast ? cast.toNumber : v => Number(v) || 0
                    const r = Math.min(Math.max(toNum(args.R), 0), 255)
                    const g = Math.min(Math.max(toNum(args.G), 0), 255)
                    const b = Math.min(Math.max(toNum(args.B), 0), 255)
                    return r * 65536 + g * 256 + b
                }
            },

            // LABEL: 🧸物体
            { blockType: BT.LABEL, text: t('group.objects') },
            // LABEL: 材质
            { blockType: BT.LABEL, text: t('group.material') }
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
    }

    l10n() {
        return {
            'group.tools': { 'zh-cn': '🛠️工具', en: '🛠️Tools' },
            'group.objects': { 'zh-cn': '🧸物体', en: '🧸Objects' },
            'group.material': { 'zh-cn': '材质', en: 'Material' },
            apidocs: { 'zh-cn': '📖API文档', en: '📖API Docs' },
            setBackgroundColor: {
                'zh-cn': '设置背景颜色为 [color]',
                en: 'set background color to [color]'
            },
            setAntialias: {
                'zh-cn': '[enabled] 抗锯齿',
                en: '[enabled] anti-aliasing'
            },
            setShadowMapType: {
                'zh-cn': '设置阴影类型为 [type]',
                en: 'set shadow map type to [type]'
            },
            setShadowEnabled: {
                'zh-cn': '[enabled] 阴影',
                en: '[enabled] shadows'
            },
            set3dState: {
                'zh-cn': '设置3D显示器状态为 [state]',
                en: 'set 3D layer state [state]'
            },
            get3dState: {
                'zh-cn': '三维显示器是显示的?',
                en: 'the 3D layer is visible?'
            },
            color_RGB: {
                'zh-cn': 'RGB颜色: [R] [G] [B]',
                en: 'RGB color: [R] [G] [B]'
            },
            '3dState.display': { 'zh-cn': '显示', en: 'display' },
            '3dState.hidden': { 'zh-cn': '隐藏', en: 'hidden' },
            'ed.enable': { 'zh-cn': '启用', en: 'enable' },
            'ed.disable': { 'zh-cn': '禁用', en: 'disable' },
            isWebGLAvailable: {
                'zh-cn': '当前设备支持WebGL吗?',
                en: 'WebGL available?'
            }
        }
    }
}
