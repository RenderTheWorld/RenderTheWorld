/**
 * 动画分组 —— GLTF 模型动画播放
 *
 * 包含积木：
 *   - playAnimation   (COMMAND, dynamicArgsInfo) 播放动画（可扩展多个动画名）
 *   - stopAnimation   (COMMAND, dynamicArgsInfo) 停止动画（可扩展多个动画名）
 *   - updateAnimation (COMMAND) 推进动画 N 秒
 *   - getAnimation    (REPORTER, disableMonitor) 获取模型所有动画名列表
 *
 * 动画表结构（由 renderEngine.animations 维护）：
 *   { [name]: { mixer, clips, action } }
 */

import BlockGroup from '../BlockGroup.js'
import { getDynamicArgs } from '../../utils/extendableBlock.js'

export default class AnimationGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.animation')
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            {
                opcode: 'playAnimation',
                blockType: BT.COMMAND,
                text: t('playAnimation'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    animationName: {
                        type: AT.STRING,
                        defaultValue: 'animationName1'
                    }
                },
                dynamicArgsInfo: {
                    defaultValues: i => `animationName${i + 2}`,
                    afterArg: 'animationName',
                    joinCh: ', ',
                    dynamicArgTypes: ['s']
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const name = cast.toString(args.name)
                    const anim = engine.animations[name]
                    if (!anim || !anim.mixer) return
                    const THREE = engine.THREE
                    // 旧版用 [Cast.toString(args.animationName)].concat(dynamicArgs)
                    const names = [cast.toString(args.animationName)].concat(
                        getDynamicArgs(args)
                    )
                    names.forEach(animationName => {
                        const clip = THREE.AnimationClip.findByName(
                            anim.clips,
                            animationName
                        )
                        if (clip) {
                            anim.action[animationName] =
                                anim.mixer.clipAction(clip)
                            anim.action[animationName].play()
                        }
                    })
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'stopAnimation',
                blockType: BT.COMMAND,
                text: t('stopAnimation'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    animationName: {
                        type: AT.STRING,
                        defaultValue: 'animationName1'
                    }
                },
                dynamicArgsInfo: {
                    defaultValues: i => `animationName${i + 2}`,
                    afterArg: 'animationName',
                    joinCh: ', ',
                    dynamicArgTypes: ['s']
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const name = cast.toString(args.name)
                    const anim = engine.animations[name]
                    if (!anim) return
                    // 旧版用 [Cast.toString(args.animationName)].concat(dynamicArgs)
                    const names = [cast.toString(args.animationName)].concat(
                        getDynamicArgs(args)
                    )
                    names.forEach(animationName => {
                        if (anim.action[animationName]) {
                            anim.action[animationName].stop()
                        }
                    })
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'updateAnimation',
                blockType: BT.COMMAND,
                text: t('updateAnimation'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    time: { type: AT.NUMBER, defaultValue: '1' }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const name = cast.toString(args.name)
                    const anim = engine.animations[name]
                    if (anim && anim.mixer) {
                        anim.mixer.update(cast.toNumber(args.time))
                        engine.setDirty3D()
                    }
                }
            },
            {
                opcode: 'getAnimation',
                blockType: BT.REPORTER,
                text: t('getAnimation'),
                disableMonitor: true,
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const name = cast.toString(args.name)
                    const anim = engine.animations[name]
                    if (!anim || !anim.clips) return '[]'
                    return JSON.stringify(anim.clips.map(c => c.name))
                }
            }
        ]
    }

    l10n() {
        return {
            'group.animation': { 'zh-cn': '动画', en: 'Animation' },
            playAnimation: {
                'zh-cn': '启动模型: [name] 的动画 [animationName]',
                en: 'play animation [animationName] of [name]'
            },
            stopAnimation: {
                'zh-cn': '结束模型: [name] 的动画 [animationName]',
                en: 'stop animation [animationName] of [name]'
            },
            updateAnimation: {
                'zh-cn': '推进模型: [name] 的动画 [time] 秒 并更新',
                en: 'advance [name] animation by [time] s'
            },
            getAnimation: {
                'zh-cn': '获取模型: [name] 的所有动画',
                en: 'animations of [name]'
            }
        }
    }
}
