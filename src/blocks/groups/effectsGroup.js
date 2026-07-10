/**
 * 后处理与色彩分组 —— 模块化 pass 系统
 *
 * 每个 pass 可独立启/禁，参数可单独设置。
 * pass 顺序：Render → Bloom → 亮度对比度 → 色相饱和度 → FXAA → Vignette
 *
 * 包含积木：
 *   - enableBloom / disableBloom / setBloomParams
 *   - enableFXAA / disableFXAA
 *   - enableVignette / disableVignette / setVignetteParams
 *   - enableBrightnessContrast / disableBrightnessContrast / setBrightnessContrast
 *   - enableHueSaturation / disableHueSaturation / setHueSaturation
 *   - disableAllEffects
 *   - setToneMapping / setToneMappingExposure
 */

import BlockGroup from '../BlockGroup.js'

export default class EffectsGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.effects')
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            '---',
            // ============== Bloom 辉光 ==============
            {
                opcode: 'enableBloom',
                blockType: BT.COMMAND,
                text: t('enableBloom'),
                arguments: {
                    strength: { type: AT.NUMBER, defaultValue: 0.6 },
                    radius: { type: AT.NUMBER, defaultValue: 0.4 },
                    threshold: { type: AT.NUMBER, defaultValue: 0.85 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    engine.enableBloom(
                        cast.toNumber(args.strength),
                        cast.toNumber(args.radius),
                        cast.toNumber(args.threshold)
                    )
                }
            },
            {
                opcode: 'disableBloom',
                blockType: BT.COMMAND,
                text: t('disableBloom'),
                handler: () => ext.renderEngine.disableBloom()
            },
            {
                opcode: 'setBloomParams',
                blockType: BT.COMMAND,
                text: t('setBloomParams'),
                arguments: {
                    strength: { type: AT.NUMBER, defaultValue: 0.6 },
                    radius: { type: AT.NUMBER, defaultValue: 0.4 },
                    threshold: { type: AT.NUMBER, defaultValue: 0.85 }
                },
                handler: args => {
                    const cast = ext.cast
                    ext.renderEngine.setBloomParams(
                        cast.toNumber(args.strength),
                        cast.toNumber(args.radius),
                        cast.toNumber(args.threshold)
                    )
                }
            },
            '---',
            // ============== FXAA 抗锯齿 ==============
            {
                opcode: 'enableFXAA',
                blockType: BT.COMMAND,
                text: t('enableFXAA'),
                handler: () => ext.renderEngine.enableFXAA()
            },
            {
                opcode: 'disableFXAA',
                blockType: BT.COMMAND,
                text: t('disableFXAA'),
                handler: () => ext.renderEngine.disableFXAA()
            },
            '---',
            // ============== Vignette 暗角 ==============
            {
                opcode: 'enableVignette',
                blockType: BT.COMMAND,
                text: t('enableVignette'),
                arguments: {
                    offset: { type: AT.NUMBER, defaultValue: 1.0 },
                    darkness: { type: AT.NUMBER, defaultValue: 1.0 }
                },
                handler: args => {
                    const cast = ext.cast
                    ext.renderEngine.enableVignette(
                        cast.toNumber(args.offset),
                        cast.toNumber(args.darkness)
                    )
                }
            },
            {
                opcode: 'disableVignette',
                blockType: BT.COMMAND,
                text: t('disableVignette'),
                handler: () => ext.renderEngine.disableVignette()
            },
            {
                opcode: 'setVignetteParams',
                blockType: BT.COMMAND,
                text: t('setVignetteParams'),
                arguments: {
                    offset: { type: AT.NUMBER, defaultValue: 1.0 },
                    darkness: { type: AT.NUMBER, defaultValue: 1.0 }
                },
                handler: args => {
                    const cast = ext.cast
                    ext.renderEngine.setVignetteParams(
                        cast.toNumber(args.offset),
                        cast.toNumber(args.darkness)
                    )
                }
            },
            '---',
            // ============== 亮度对比度 ==============
            {
                opcode: 'enableBrightnessContrast',
                blockType: BT.COMMAND,
                text: t('enableBrightnessContrast'),
                arguments: {
                    brightness: { type: AT.NUMBER, defaultValue: 0 },
                    contrast: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const cast = ext.cast
                    ext.renderEngine.enableBrightnessContrast(
                        cast.toNumber(args.brightness),
                        cast.toNumber(args.contrast)
                    )
                }
            },
            {
                opcode: 'disableBrightnessContrast',
                blockType: BT.COMMAND,
                text: t('disableBrightnessContrast'),
                handler: () => ext.renderEngine.disableBrightnessContrast()
            },
            {
                opcode: 'setBrightnessContrast',
                blockType: BT.COMMAND,
                text: t('setBrightnessContrast'),
                arguments: {
                    brightness: { type: AT.NUMBER, defaultValue: 0 },
                    contrast: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const cast = ext.cast
                    ext.renderEngine.setBrightnessContrast(
                        cast.toNumber(args.brightness),
                        cast.toNumber(args.contrast)
                    )
                }
            },
            '---',
            // ============== 色相饱和度 ==============
            {
                opcode: 'enableHueSaturation',
                blockType: BT.COMMAND,
                text: t('enableHueSaturation'),
                arguments: {
                    hue: { type: AT.NUMBER, defaultValue: 0 },
                    saturation: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const cast = ext.cast
                    ext.renderEngine.enableHueSaturation(
                        cast.toNumber(args.hue),
                        cast.toNumber(args.saturation)
                    )
                }
            },
            {
                opcode: 'disableHueSaturation',
                blockType: BT.COMMAND,
                text: t('disableHueSaturation'),
                handler: () => ext.renderEngine.disableHueSaturation()
            },
            {
                opcode: 'setHueSaturation',
                blockType: BT.COMMAND,
                text: t('setHueSaturation'),
                arguments: {
                    hue: { type: AT.NUMBER, defaultValue: 0 },
                    saturation: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const cast = ext.cast
                    ext.renderEngine.setHueSaturation(
                        cast.toNumber(args.hue),
                        cast.toNumber(args.saturation)
                    )
                }
            },
            '---',
            // ============== 全局控制 ==============
            {
                opcode: 'disableAllEffects',
                blockType: BT.COMMAND,
                text: t('disableAllEffects'),
                handler: () => ext.renderEngine.disablePostProcessing()
            },
            {
                opcode: 'setToneMapping',
                blockType: BT.COMMAND,
                text: t('setToneMapping'),
                arguments: {
                    mode: {
                        type: AT.STRING,
                        menu: 'toneMappingMenu',
                        defaultValue: 0
                    }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.renderer) return
                    engine.setToneMapping(ext.cast.toNumber(args.mode), null)
                }
            },
            {
                opcode: 'setToneMappingExposure',
                blockType: BT.COMMAND,
                text: t('setToneMappingExposure'),
                arguments: {
                    exposure: { type: AT.NUMBER, defaultValue: 1 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.renderer) return
                    engine.setToneMapping(
                        null,
                        ext.cast.toNumber(args.exposure)
                    )
                }
            }
        ]
    }

    registerMenus() {
        const THREE = this.ext?.renderEngine?.THREE
        this.core.registerMenu('toneMappingMenu', {
            acceptReporters: false,
            items: THREE ? [
                { text: 'None', value: THREE.NoToneMapping },
                { text: 'Linear', value: THREE.LinearToneMapping },
                { text: 'Reinhard', value: THREE.ReinhardToneMapping },
                { text: 'Cineon', value: THREE.CineonToneMapping },
                { text: 'ACESFilmic', value: THREE.ACESFilmicToneMapping },
                { text: 'AgX', value: THREE.AgXToneMapping },
                { text: 'Neutral', value: THREE.NeutralToneMapping }
            ] : [
                { text: 'None', value: 0 },
                { text: 'Linear', value: 1 },
                { text: 'Reinhard', value: 2 },
                { text: 'Cineon', value: 3 },
                { text: 'ACESFilmic', value: 4 },
                { text: 'AgX', value: 6 },
                { text: 'Neutral', value: 7 }
            ]
        })
    }

    l10n() {
        return {
            'group.effects': { 'zh-cn': '🎨效果', en: '🎨Effects' },
            enableBloom: {
                'zh-cn': '启用辉光 强度 [strength] 半径 [radius] 阈值 [threshold]',
                en: 'enable bloom strength [strength] radius [radius] threshold [threshold]'
            },
            disableBloom: { 'zh-cn': '禁用辉光', en: 'disable bloom' },
            setBloomParams: {
                'zh-cn': '设置辉光 强度 [strength] 半径 [radius] 阈值 [threshold]',
                en: 'set bloom strength [strength] radius [radius] threshold [threshold]'
            },
            enableFXAA: { 'zh-cn': '启用FXAA抗锯齿', en: 'enable FXAA' },
            disableFXAA: { 'zh-cn': '禁用FXAA抗锯齿', en: 'disable FXAA' },
            enableVignette: {
                'zh-cn': '启用暗角 偏移 [offset] 暗度 [darkness]',
                en: 'enable vignette offset [offset] darkness [darkness]'
            },
            disableVignette: { 'zh-cn': '禁用暗角', en: 'disable vignette' },
            setVignetteParams: {
                'zh-cn': '设置暗角 偏移 [offset] 暗度 [darkness]',
                en: 'set vignette offset [offset] darkness [darkness]'
            },
            enableBrightnessContrast: {
                'zh-cn': '启用亮度对比度 亮度 [brightness] 对比度 [contrast]',
                en: 'enable brightness [brightness] contrast [contrast]'
            },
            disableBrightnessContrast: {
                'zh-cn': '禁用亮度对比度',
                en: 'disable brightness/contrast'
            },
            setBrightnessContrast: {
                'zh-cn': '设置亮度 [brightness] 对比度 [contrast]',
                en: 'set brightness [brightness] contrast [contrast]'
            },
            enableHueSaturation: {
                'zh-cn': '启用色相饱和度 色相 [hue] 饱和度 [saturation]',
                en: 'enable hue [hue] saturation [saturation]'
            },
            disableHueSaturation: {
                'zh-cn': '禁用色相饱和度',
                en: 'disable hue/saturation'
            },
            setHueSaturation: {
                'zh-cn': '设置色相 [hue] 饱和度 [saturation]',
                en: 'set hue [hue] saturation [saturation]'
            },
            disableAllEffects: {
                'zh-cn': '禁用所有后处理效果',
                en: 'disable all effects'
            },
            setToneMapping: {
                'zh-cn': '设置色调映射 [mode]',
                en: 'set tone mapping [mode]'
            },
            setToneMappingExposure: {
                'zh-cn': '设置曝光 [exposure]',
                en: 'set exposure [exposure]'
            }
        }
    }
}
