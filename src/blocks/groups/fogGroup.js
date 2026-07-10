/**
 * 雾效分组 —— 场景雾效
 *
 * 包含积木：
 *   - enableFogEffect  (COMMAND) 启用线性雾效
 *   - disableFogEffect (COMMAND) 禁用雾效
 */

import BlockGroup from '../BlockGroup.js'

export default class FogGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.fog')
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            {
                opcode: 'enableFogEffect',
                blockType: BT.COMMAND,
                text: t('enableFogEffect'),
                arguments: {
                    color: { type: AT.NUMBER },
                    near: { type: AT.NUMBER, defaultValue: 1 },
                    far: { type: AT.NUMBER, defaultValue: 1000 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.scene) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const THREE = engine.THREE
                    engine.scene.fog = new THREE.Fog(
                        cast.toNumber(args.color),
                        cast.toNumber(args.near),
                        cast.toNumber(args.far)
                    )
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'disableFogEffect',
                blockType: BT.COMMAND,
                text: t('disableFogEffect'),
                arguments: {},
                handler: () => {
                    const engine = ext.renderEngine
                    if (!engine.scene) return '⚠️显示器未初始化！'
                    engine.scene.fog = null
                    engine.setDirty3D()
                }
            }
        ]
    }

    l10n() {
        return {
            'group.fog': { 'zh-cn': '🌫️雾', en: '🌫️Fog' },
            enableFogEffect: {
                'zh-cn': '启用雾效 颜色: [color] 近: [near] 远: [far]',
                en: 'enable fog color: [color] near: [near] far: [far]'
            },
            disableFogEffect: { 'zh-cn': '禁用雾效', en: 'disable fog' }
        }
    }
}
