/**
 * 初始化与基础设置分组
 *
 * 包含积木：
 *   - apidocs           (BUTTON)    API 文档跳转
 *   - init              (COMMAND)   初始化 3D 环境（背景色、抗锯齿、阴影类型）
 *   - set3dState        (COMMAND)   设置 3D 层显隐
 *   - get3dState        (BOOLEAN)   三维显示器是否显示
 *   - isWebGLAvailable  (BOOLEAN)   当前设备是否支持 WebGL（执行检查并缓存）
 *   - _isWebGLAvailable (BOOLEAN, hideFromPalette)  读取缓存的兼容性结果
 */

import BlockGroup from '../BlockGroup.js'

export default class InitGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        // 旧版中 InitGroup 没有 GROUP LABEL，"🛠️工具" 在 get3dState 之后手动插入
        this.label = null
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            {
                opcode: 'apidocs',
                blockType: BT.BUTTON,
                text: t('apidocs'),
                onClick: () => {
                    window.open(ext.docsURI, '_blank', 'noopener,noreferrer')
                }
            },
            {
                opcode: 'init',
                blockType: BT.COMMAND,
                text: t('init'),
                arguments: {
                    color: { type: AT.NUMBER, defaultValue: 0 },
                    sizex: { type: AT.NUMBER, defaultValue: 640 },
                    sizey: { type: AT.NUMBER, defaultValue: 360 },
                    ed: {
                        type: AT.STRING,
                        menu: 'edMenu'
                    },
                    shadowMapType: {
                        type: AT.STRING,
                        menu: 'shadowMapMenu',
                        defaultValue: 1
                    }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    const cast = ext.cast
                    const antialias = cast
                        ? cast.toString(args.ed) === 'enable'
                        : args.ed === 'enable'
                    engine.init(
                        args.color,
                        antialias,
                        args.shadowMapType,
                        cast ? cast.toNumber(args.sizex) : Number(args.sizex),
                        cast ? cast.toNumber(args.sizey) : Number(args.sizey)
                    )
                }
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
                opcode: 'get3dState',
                blockType: BT.BOOLEAN,
                text: t('get3dState'),
                handler: () => ext.renderEngine.get3dState()
            },
            // LABEL: 🛠️工具
            { blockType: BT.LABEL, text: t('group.tools') },
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
            {
                opcode: 'isWebGLAvailable',
                blockType: BT.COMMAND,
                text: t('isWebGLAvailable'),
                handler: () => {
                    try {
                        const canvas = document.createElement('canvas')
                        const ok = !!(
                            window.WebGLRenderingContext &&
                            (canvas.getContext('webgl') ||
                                canvas.getContext('experimental-webgl'))
                        )
                        ext._webglAvailable = ok
                    } catch {
                        ext._webglAvailable = false
                    }
                }
            },
            {
                opcode: '_isWebGLAvailable',
                blockType: BT.BOOLEAN,
                text: t('_isWebGLAvailable'),
                handler: () => ext._webglAvailable === true
            },
            // LABEL: 🧸物体
            { blockType: BT.LABEL, text: t('group.objects') },
            // LABEL: 材质
            { blockType: BT.LABEL, text: t('group.material') }
        ]
    }

    registerMenus() {
        const THREE = this.ext.renderEngine.THREE
        this.core.registerMenu('edMenu', {
            acceptReporters: false,
            items: [
                { text: this.translate('ed.enable'), value: 'enable' },
                { text: this.translate('ed.disable'), value: 'disable' }
            ]
        })
        this.core.registerMenu('stateMenu', {
            acceptReporters: false,
            items: [
                { text: this.translate('3dState.display'), value: 'display' },
                { text: this.translate('3dState.hidden'), value: 'hidden' }
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
            init: {
                'zh-cn':
                    '初始化并设置背景颜色为 [color] 大小 [sizex] x [sizey] y [ed] 抗锯齿，阴影类型: [shadowMapType]',
                en: 'init and set the background color to [color] size: [sizex] x [sizey] y [ed] anti aliasing, shadow type: [shadowMapType]'
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
                'zh-cn': '兼容性检查',
                en: 'WebGL available?'
            },
            _isWebGLAvailable: {
                'zh-cn': '当前设备支持WebGL吗?',
                en: 'WebGL available?'
            }
        }
    }
}
