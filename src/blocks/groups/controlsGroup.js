/**
 * 控制器分组 —— OrbitControls 创建与配置
 *
 * 包含积木：
 *   - createOrbitControls      (OUTPUT) 创建轨道控制器（绑定到相机）
 *   - updateControls           (COMMAND) 更新控制器
 *   - setControlState          (COMMAND) 启用/禁用控制器
 *   - mouseCanControl          (BOOLEAN) 鼠标能否控制
 *   - mouseControl             (COMMAND) 分别设置平移/缩放/旋转
 *   - setControlDamping        (COMMAND, YN2 菜单) 启用/禁用阻尼
 *   - setControlDampingNum     (COMMAND) 设置阻尼系数
 *   - setOrbitControlsTarget   (COMMAND) 设置控制器目标点
 */

import BlockGroup from '../BlockGroup.js'
import { RTW_Model_Box, Wrapper } from '../../utils/RTWTools.js'

export default class ControlsGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.control')
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            {
                opcode: 'createOrbitControls',
                blockType: BT.OUTPUT,
                text: t('createOrbitControls'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const engine = ext.renderEngine
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️绑定的对象有误！'
                    const controls = new engine.OrbitControls(
                        model,
                        ext.runtime.renderer.canvas
                    )
                    controls.isOrbitControls = true
                    // 控制器交互时标记脏，唤醒 RAF 渲染
                    controls.addEventListener('change', () =>
                        engine.setDirty3D()
                    )
                    controls.update()
                    return new Wrapper(
                        new RTW_Model_Box(
                            controls,
                            false,
                            false,
                            false,
                            undefined
                        )
                    )
                }
            },
            {
                opcode: 'updateControls',
                blockType: BT.COMMAND,
                text: t('updateControls'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' }
                },
                handler: args => {
                    const model = ext.renderEngine.getModel(args.name)
                    if (!model || !model.update) return '⚠️更新的控制器有误！'
                    model.update()
                }
            },
            {
                opcode: 'setControlState',
                blockType: BT.COMMAND,
                text: t('setControlState'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    YN: { type: AT.STRING, menu: 'YN' }
                },
                handler: args => {
                    const model = ext.renderEngine.getModel(args.name)
                    if (!model || !model.update) return '⚠️设置的控制器有误！'
                    model.enabled = ext.cast.toString(args.YN) === 'true'
                    model.update()
                }
            },
            {
                opcode: 'mouseCanControl',
                blockType: BT.BOOLEAN,
                text: t('mouseCanControl'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' }
                },
                handler: args => {
                    const model = ext.renderEngine.getModel(args.name)
                    if (!model || !model.update) return '⚠️设置的控制器有误！'
                    return model.enabled
                }
            },
            {
                opcode: 'mouseControl',
                blockType: BT.COMMAND,
                text: t('mouseControl'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    yn1: { type: AT.STRING, menu: 'YN' },
                    yn2: { type: AT.STRING, menu: 'YN' },
                    yn3: { type: AT.STRING, menu: 'YN' }
                },
                handler: args => {
                    const model = ext.renderEngine.getModel(args.name)
                    if (!model || !model.update) return '⚠️设置的控制器有误！'
                    model.enablePan = ext.cast.toString(args.yn1) === 'true'
                    model.enableZoom = ext.cast.toString(args.yn2) === 'true'
                    model.enableRotate = ext.cast.toString(args.yn3) === 'true'
                    model.update()
                }
            },
            {
                opcode: 'setControlDamping',
                blockType: BT.COMMAND,
                text: t('setControlDamping'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    YN2: { type: AT.STRING, menu: 'YN2' }
                },
                handler: args => {
                    const model = ext.renderEngine.getModel(args.name)
                    if (!model || !model.update) return '⚠️设置的控制器有误！'
                    model.enableDamping = ext.cast.toString(args.YN2) === 'yes'
                }
            },
            {
                opcode: 'setControlDampingNum',
                blockType: BT.COMMAND,
                text: t('setControlDampingNum'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    num: { type: AT.NUMBER, defaultValue: 0.05 }
                },
                handler: args => {
                    const model = ext.renderEngine.getModel(args.name)
                    if (!model || !model.update) return '⚠️设置的控制器有误！'
                    model.dampingFactor = ext.cast.toNumber(args.num)
                }
            },
            {
                opcode: 'setOrbitControlsTarget',
                blockType: BT.COMMAND,
                text: t('setOrbitControlsTarget'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 },
                    z: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    const model = engine.getModel(args.name)
                    if (
                        !model ||
                        !model.update ||
                        !(model.target instanceof engine.THREE.Vector3)
                    )
                        return '⚠️设置的轨道控制器有误！'
                    const cast = ext.cast
                    model.target.set(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z)
                    )
                }
            }
        ]
    }

    registerMenus() {
        this.core.registerMenu('YN2', {
            acceptReporters: false,
            items: [
                { text: this.translate('YN2.yes'), value: 'yes' },
                { text: this.translate('YN2.no'), value: 'no' }
            ]
        })
    }

    l10n() {
        return {
            'group.control': { 'zh-cn': '🎚️控制模块', en: '🎚️Controller' },
            createOrbitControls: {
                'zh-cn': '创建轨道控制器 绑定 [name]',
                en: 'create orbit controls bind [name]'
            },
            updateControls: {
                'zh-cn': '更新控制器 [name]',
                en: 'update controls [name]'
            },
            setControlState: {
                'zh-cn': '控制器 [name] [YN] 启用',
                en: 'controls [name] [YN] enabled'
            },
            mouseCanControl: {
                'zh-cn': '控制器 [name] 已启用?',
                en: 'controls [name] enabled?'
            },
            mouseControl: {
                'zh-cn': '控制器 [name] [yn1] 平移 [yn2] 缩放 [yn3] 旋转',
                en: 'controls [name] [yn1] pan [yn2] zoom [yn3] rotate'
            },
            setControlDamping: {
                'zh-cn': '控制器 [name] [YN2] 启用阻尼',
                en: 'controls [name] [YN2] damping'
            },
            setControlDampingNum: {
                'zh-cn': '控制器 [name] 阻尼系数 [num]',
                en: 'controls [name] damping factor [num]'
            },
            setOrbitControlsTarget: {
                'zh-cn': '控制器 [name] 目标 x [x] y [y] z [z]',
                en: 'controls [name] target x [x] y [y] z [z]'
            },
            'YN2.yes': { 'zh-cn': '有', en: 'yes' },
            'YN2.no': { 'zh-cn': '没有', en: 'no' }
        }
    }
}
