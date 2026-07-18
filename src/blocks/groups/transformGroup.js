/**
 * 变换分组 —— 移动 / 旋转 / 缩放 / 查询
 *
 * 包含积木：
 *   - rotationObject   (COMMAND) 旋转对象
 *   - moveObject       (COMMAND) 移动对象
 *   - scaleObject      (COMMAND) 缩放对象
 *   - getObjectPos     (REPORTER, disableMonitor) 获取对象位置
 *   - getObjectRotation(REPORTER, disableMonitor) 获取对象旋转
 *   - getObjectScale   (REPORTER, disableMonitor) 获取对象缩放
 */

import BlockGroup from '../BlockGroup.js'

export default class TransformGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.transform')
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            {
                opcode: 'rotationObject',
                blockType: BT.COMMAND,
                text: t('rotationObject'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 },
                    z: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const THREE = engine.THREE
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    model.rotation.set(
                        THREE.MathUtils.degToRad(cast.toNumber(args.x)),
                        THREE.MathUtils.degToRad(cast.toNumber(args.y)),
                        THREE.MathUtils.degToRad(cast.toNumber(args.z))
                    )
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'moveObject',
                blockType: BT.COMMAND,
                text: t('moveObject'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 },
                    z: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    model.position.set(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z)
                    )
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'scaleObject',
                blockType: BT.COMMAND,
                text: t('scaleObject'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 },
                    z: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    model.scale.set(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z)
                    )
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'getObjectPos',
                blockType: BT.REPORTER,
                text: t('getObjectPos'),
                disableMonitor: true,
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    xyz: { type: AT.STRING, menu: 'xyz' }
                },
                handler: args => {
                    const cast = ext.cast
                    const model = ext.renderEngine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    switch (cast.toString(args.xyz)) {
                        case 'x':
                            return model.position.x
                        case 'y':
                            return model.position.y
                        case 'z':
                            return model.position.z
                    }
                }
            },
            {
                opcode: 'getObjectRotation',
                blockType: BT.REPORTER,
                text: t('getObjectRotation'),
                disableMonitor: true,
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    xyz: { type: AT.STRING, menu: 'xyz' }
                },
                handler: args => {
                    const cast = ext.cast
                    const model = ext.renderEngine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    const THREE = ext.renderEngine.THREE
                    switch (cast.toString(args.xyz)) {
                        case 'x':
                            return THREE.MathUtils.radToDeg(model.rotation.x)
                        case 'y':
                            return THREE.MathUtils.radToDeg(model.rotation.y)
                        case 'z':
                            return THREE.MathUtils.radToDeg(model.rotation.z)
                    }
                }
            },
            {
                opcode: 'getObjectScale',
                blockType: BT.REPORTER,
                text: t('getObjectScale'),
                disableMonitor: true,
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    xyz: { type: AT.STRING, menu: 'xyz' }
                },
                handler: args => {
                    const cast = ext.cast
                    const model = ext.renderEngine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    switch (cast.toString(args.xyz)) {
                        case 'x':
                            return model.scale.x
                        case 'y':
                            return model.scale.y
                        case 'z':
                            return model.scale.z
                    }
                }
            }
        ]
    }

    registerMenus() {
        this.core.registerMenu('xyz', {
            acceptReporters: false,
            items: [
                { text: this.translate('xyz.x'), value: 'x' },
                { text: this.translate('xyz.y'), value: 'y' },
                { text: this.translate('xyz.z'), value: 'z' }
            ]
        })
    }

    l10n() {
        return {
            'group.transform': { 'zh-cn': '🏃动作', en: '🏃Move' },
            rotationObject: {
                'zh-cn': '让对象 [name] 旋转 x [x] y [y] z [z]',
                en: 'rotate object [name] by x [x] y [y] z [z]'
            },
            moveObject: {
                'zh-cn': '让对象 [name] 移到 x [x] y [y] z [z]',
                en: 'move object [name] to x [x] y [y] z [z]'
            },
            scaleObject: {
                'zh-cn': '让对象 [name] 缩放 x [x] y [y] z [z]',
                en: 'scale object [name] by x [x] y [y] z [z]'
            },
            getObjectPos: {
                'zh-cn': '对象 [name] 的 [xyz] 坐标',
                en: 'get object [name] [xyz] position'
            },
            getObjectRotation: {
                'zh-cn': '对象 [name] 的 [xyz] 旋转角度',
                en: 'get object [name] [xyz] rotation'
            },
            getObjectScale: {
                'zh-cn': '对象 [name] 的 [xyz] 缩放',
                en: 'get object [name] [xyz] scale'
            },
            'xyz.x': { 'zh-cn': 'x轴', en: 'x axis' },
            'xyz.y': { 'zh-cn': 'y轴', en: 'y axis' },
            'xyz.z': { 'zh-cn': 'z轴', en: 'z axis' }
        }
    }
}
