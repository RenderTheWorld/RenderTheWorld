/**
 * 数学分组 —— 四元数 / 欧拉角 / 向量 的创建、运算与应用
 *
 * 设计理念：
 *   数学对象（四元数/欧拉角/向量）是轻量值类型，适合用直接 OUTPUT 块创建，
 *   配合可扩展运算积木实现多操作数链式运算。比内联 C 块更简洁可组合。
 *
 * 包含积木：
 *   - '🧮数学' LABEL
 *   - quaternion          (OUTPUT) 创建四元数 x/y/z/w
 *   - euler               (OUTPUT) 创建欧拉角 x/y/z/顺序
 *   - vector3             (OUTPUT) 创建向量 x/y/z
 *   - quaternionFromEuler (OUTPUT) 从欧拉角创建四元数
 *   - eulerFromQuaternion (OUTPUT) 从四元数创建欧拉角
 *   - '---'
 *   - vectorOperation     (OUTPUT, 可扩展) 向量 N 元运算（加/减/乘/叉积/插值）
 *   - quaternionOperation (OUTPUT, 可扩展) 四元数 N 元运算（乘法/球面插值）
 *   - '---'
 *   - vectorNormalize     (OUTPUT) 向量归一化
 *   - vectorNegate        (OUTPUT) 向量取反
 *   - quaternionInvert    (OUTPUT) 四元数求逆
 *   - quaternionConjugate (OUTPUT) 四元数共轭
 *   - '---'
 *   - vectorDot           (REPORTER) 点积
 *   - vectorDistance      (REPORTER) 距离
 *   - vectorAngle         (REPORTER) 夹角
 *   - vectorLength        (REPORTER) 长度
 *   - '---'
 *   - getQuaternionComp   (REPORTER) 获取四元数分量
 *   - getEulerComp        (REPORTER) 获取欧拉角分量（度）
 *   - getVectorComp       (REPORTER) 获取向量分量
 *   - '---'
 *   - applyQuaternionTo   (COMMAND) 应用四元数到对象旋转
 *   - applyEulerTo        (COMMAND) 应用欧拉角到对象旋转
 *   - setPositionFromVector (COMMAND) 从向量设置对象位置
 *   - rotateAroundAxis    (COMMAND) 绕轴旋转对象（带枢轴点）
 */

import BlockGroup from '../BlockGroup.js'
import { RTW_Model_Box, Wrapper } from '../../utils/RTWTools.js'
import { getDynamicArgs } from '../../utils/extendableBlock.js'

export default class MathGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.math')
    }

    // ============== 工具方法 ==============

    /**
     * 解包参数为 THREE 对象
     * @param {*} value - 积木传入的值（可能是 Wrapper/RTW_Model_Box/原始对象）
     * @returns {*} THREE 对象
     */
    _unwrap(value) {
        const obj = Wrapper.unwrap(value)
        return obj instanceof RTW_Model_Box ? obj.model : obj
    }

    /**
     * 包装 THREE 对象为 RTW_Model_Box
     */
    _wrap(obj) {
        return new Wrapper(new RTW_Model_Box(obj, false, false, false, undefined))
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            '---',
            // ============== 创建实例 ==============
            {
                opcode: 'quaternion',
                blockType: BT.OUTPUT,
                text: t('quaternion'),
                arguments: {
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 },
                    z: { type: AT.NUMBER, defaultValue: 0 },
                    w: { type: AT.NUMBER, defaultValue: 1 }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    const THREE = ext.renderEngine.THREE
                    const q = new THREE.Quaternion(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z),
                        cast.toNumber(args.w)
                    )
                    return this._wrap(q)
                }
            },
            {
                opcode: 'euler',
                blockType: BT.OUTPUT,
                text: t('euler'),
                arguments: {
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 },
                    z: { type: AT.NUMBER, defaultValue: 0 },
                    order: { type: AT.STRING, menu: 'eulerOrder' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    const THREE = ext.renderEngine.THREE
                    const e = new THREE.Euler(
                        THREE.MathUtils.degToRad(cast.toNumber(args.x)),
                        THREE.MathUtils.degToRad(cast.toNumber(args.y)),
                        THREE.MathUtils.degToRad(cast.toNumber(args.z)),
                        cast.toString(args.order)
                    )
                    return this._wrap(e)
                }
            },
            {
                opcode: 'vector3',
                blockType: BT.OUTPUT,
                text: t('vector3'),
                arguments: {
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 },
                    z: { type: AT.NUMBER, defaultValue: 0 }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    const THREE = ext.renderEngine.THREE
                    const v = new THREE.Vector3(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z)
                    )
                    return this._wrap(v)
                }
            },
            {
                opcode: 'quaternionFromEuler',
                blockType: BT.OUTPUT,
                text: t('quaternionFromEuler'),
                arguments: {
                    euler: { type: null }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const e = this._unwrap(args.euler)
                    if (!(e instanceof THREE.Euler))
                        return '⚠️传入的不是欧拉角！'
                    const q = new THREE.Quaternion().setFromEuler(e)
                    return this._wrap(q)
                }
            },
            {
                opcode: 'eulerFromQuaternion',
                blockType: BT.OUTPUT,
                text: t('eulerFromQuaternion'),
                arguments: {
                    quat: { type: null }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const q = this._unwrap(args.quat)
                    if (!(q instanceof THREE.Quaternion))
                        return '⚠️传入的不是四元数！'
                    const e = new THREE.Euler().setFromQuaternion(q)
                    return this._wrap(e)
                }
            },
            '---',
            // ============== 可扩展运算 ==============
            {
                opcode: 'vectorOperation',
                blockType: BT.OUTPUT,
                text: t('vectorOperation'),
                arguments: {
                    op: { type: AT.STRING, menu: 'vectorOp' }
                },
                dynamicArgsInfo: {
                    afterArg: 'op',
                    defaultValues: '0',
                    dynamicArgTypes: ['s'],
                    joinCh: t('vectorOperation.joinCh'),
                    preText: t('vectorOperation.preText')
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    const THREE = ext.renderEngine.THREE
                    const op = cast.toString(args.op)
                    const vecs = getDynamicArgs(args).map(v => {
                        const obj = this._unwrap(v)
                        return obj instanceof THREE.Vector3
                            ? obj
                            : new THREE.Vector3()
                    })
                    if (vecs.length === 0) return this._wrap(new THREE.Vector3())

                    let result
                    switch (op) {
                        case 'add':
                            result = vecs[0].clone()
                            for (let i = 1; i < vecs.length; i++)
                                result.add(vecs[i])
                            break
                        case 'sub':
                            result = vecs[0].clone()
                            for (let i = 1; i < vecs.length; i++)
                                result.sub(vecs[i])
                            break
                        case 'multiply':
                            result = vecs[0].clone()
                            for (let i = 1; i < vecs.length; i++)
                                result.multiply(vecs[i])
                            break
                        case 'cross':
                            result = vecs[0].clone()
                            for (let i = 1; i < vecs.length; i++)
                                result.cross(vecs[i])
                            break
                        case 'lerp':
                            result = vecs[0].clone()
                            for (let i = 1; i < vecs.length; i++)
                                result.lerp(vecs[i], 1 / vecs.length)
                            break
                        default:
                            result = new THREE.Vector3()
                    }
                    return this._wrap(result)
                }
            },
            {
                opcode: 'quaternionOperation',
                blockType: BT.OUTPUT,
                text: t('quaternionOperation'),
                arguments: {
                    op: { type: AT.STRING, menu: 'quaternionOp' }
                },
                dynamicArgsInfo: {
                    afterArg: 'op',
                    defaultValues: '0',
                    dynamicArgTypes: ['s'],
                    joinCh: t('quaternionOperation.joinCh'),
                    preText: t('quaternionOperation.preText')
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    const THREE = ext.renderEngine.THREE
                    const op = cast.toString(args.op)
                    const quats = getDynamicArgs(args).map(v => {
                        const obj = this._unwrap(v)
                        return obj instanceof THREE.Quaternion
                            ? obj
                            : new THREE.Quaternion()
                    })
                    if (quats.length === 0)
                        return this._wrap(new THREE.Quaternion())

                    let result
                    switch (op) {
                        case 'multiply':
                            result = quats[0].clone()
                            for (let i = 1; i < quats.length; i++)
                                result.multiply(quats[i])
                            break
                        case 'slerp':
                            result = quats[0].clone()
                            for (let i = 1; i < quats.length; i++)
                                result.slerp(quats[i], 1 / quats.length)
                            break
                        default:
                            result = new THREE.Quaternion()
                    }
                    return this._wrap(result)
                }
            },
            '---',
            // ============== 一元运算 ==============
            {
                opcode: 'vectorNormalize',
                blockType: BT.OUTPUT,
                text: t('vectorNormalize'),
                arguments: { vec: { type: null } },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const v = this._unwrap(args.vec)
                    if (!(v instanceof THREE.Vector3))
                        return '⚠️传入的不是向量！'
                    return this._wrap(v.clone().normalize())
                }
            },
            {
                opcode: 'vectorNegate',
                blockType: BT.OUTPUT,
                text: t('vectorNegate'),
                arguments: { vec: { type: null } },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const v = this._unwrap(args.vec)
                    if (!(v instanceof THREE.Vector3))
                        return '⚠️传入的不是向量！'
                    return this._wrap(v.clone().negate())
                }
            },
            {
                opcode: 'quaternionInvert',
                blockType: BT.OUTPUT,
                text: t('quaternionInvert'),
                arguments: { quat: { type: null } },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const q = this._unwrap(args.quat)
                    if (!(q instanceof THREE.Quaternion))
                        return '⚠️传入的不是四元数！'
                    return this._wrap(q.clone().invert())
                }
            },
            {
                opcode: 'quaternionConjugate',
                blockType: BT.OUTPUT,
                text: t('quaternionConjugate'),
                arguments: { quat: { type: null } },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const q = this._unwrap(args.quat)
                    if (!(q instanceof THREE.Quaternion))
                        return '⚠️传入的不是四元数！'
                    return this._wrap(q.clone().conjugate())
                }
            },
            '---',
            // ============== 标量结果 ==============
            {
                opcode: 'vectorDot',
                blockType: BT.REPORTER,
                text: t('vectorDot'),
                disableMonitor: true,
                arguments: {
                    v1: { type: null },
                    v2: { type: null }
                },
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const v1 = this._unwrap(args.v1)
                    const v2 = this._unwrap(args.v2)
                    if (!(v1 instanceof THREE.Vector3) || !(v2 instanceof THREE.Vector3))
                        return '⚠️传入的不是向量！'
                    return v1.dot(v2)
                }
            },
            {
                opcode: 'vectorDistance',
                blockType: BT.REPORTER,
                text: t('vectorDistance'),
                disableMonitor: true,
                arguments: {
                    v1: { type: null },
                    v2: { type: null }
                },
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const v1 = this._unwrap(args.v1)
                    const v2 = this._unwrap(args.v2)
                    if (!(v1 instanceof THREE.Vector3) || !(v2 instanceof THREE.Vector3))
                        return '⚠️传入的不是向量！'
                    return v1.distanceTo(v2)
                }
            },
            {
                opcode: 'vectorAngle',
                blockType: BT.REPORTER,
                text: t('vectorAngle'),
                disableMonitor: true,
                arguments: {
                    v1: { type: null },
                    v2: { type: null }
                },
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const v1 = this._unwrap(args.v1)
                    const v2 = this._unwrap(args.v2)
                    if (!(v1 instanceof THREE.Vector3) || !(v2 instanceof THREE.Vector3))
                        return '⚠️传入的不是向量！'
                    return THREE.MathUtils.radToDeg(v1.angleTo(v2))
                }
            },
            {
                opcode: 'vectorLength',
                blockType: BT.REPORTER,
                text: t('vectorLength'),
                disableMonitor: true,
                arguments: { vec: { type: null } },
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const v = this._unwrap(args.vec)
                    if (!(v instanceof THREE.Vector3))
                        return '⚠️传入的不是向量！'
                    return v.length()
                }
            },
            '---',
            // ============== 分量获取 ==============
            {
                opcode: 'getQuaternionComp',
                blockType: BT.REPORTER,
                text: t('getQuaternionComp'),
                disableMonitor: true,
                arguments: {
                    quat: { type: null },
                    comp: { type: AT.STRING, menu: 'quatComp' }
                },
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const q = this._unwrap(args.quat)
                    if (!(q instanceof THREE.Quaternion))
                        return '⚠️传入的不是四元数！'
                    switch (ext.cast.toString(args.comp)) {
                        case 'x': return q.x
                        case 'y': return q.y
                        case 'z': return q.z
                        case 'w': return q.w
                    }
                }
            },
            {
                opcode: 'getEulerComp',
                blockType: BT.REPORTER,
                text: t('getEulerComp'),
                disableMonitor: true,
                arguments: {
                    euler: { type: null },
                    comp: { type: AT.STRING, menu: 'xyzComp' }
                },
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const e = this._unwrap(args.euler)
                    if (!(e instanceof THREE.Euler))
                        return '⚠️传入的不是欧拉角！'
                    switch (ext.cast.toString(args.comp)) {
                        case 'x': return THREE.MathUtils.radToDeg(e.x)
                        case 'y': return THREE.MathUtils.radToDeg(e.y)
                        case 'z': return THREE.MathUtils.radToDeg(e.z)
                    }
                }
            },
            {
                opcode: 'getVectorComp',
                blockType: BT.REPORTER,
                text: t('getVectorComp'),
                disableMonitor: true,
                arguments: {
                    vec: { type: null },
                    comp: { type: AT.STRING, menu: 'xyzComp' }
                },
                handler: args => {
                    const THREE = ext.renderEngine.THREE
                    const v = this._unwrap(args.vec)
                    if (!(v instanceof THREE.Vector3))
                        return '⚠️传入的不是向量！'
                    switch (ext.cast.toString(args.comp)) {
                        case 'x': return v.x
                        case 'y': return v.y
                        case 'z': return v.z
                    }
                }
            },
            '---',
            // ============== 应用到对象 ==============
            {
                opcode: 'applyQuaternionTo',
                blockType: BT.COMMAND,
                text: t('applyQuaternionTo'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    quat: { type: null }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const THREE = engine.THREE
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    const q = this._unwrap(args.quat)
                    if (!(q instanceof THREE.Quaternion))
                        return '⚠️传入的不是四元数！'
                    model.quaternion.copy(q)
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'applyEulerTo',
                blockType: BT.COMMAND,
                text: t('applyEulerTo'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    euler: { type: null }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const THREE = engine.THREE
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    const e = this._unwrap(args.euler)
                    if (!(e instanceof THREE.Euler))
                        return '⚠️传入的不是欧拉角！'
                    model.rotation.copy(e)
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'setPositionFromVector',
                blockType: BT.COMMAND,
                text: t('setPositionFromVector'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    vec: { type: null }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const THREE = engine.THREE
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    const v = this._unwrap(args.vec)
                    if (!(v instanceof THREE.Vector3))
                        return '⚠️传入的不是向量！'
                    model.position.copy(v)
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'rotateAroundAxis',
                blockType: BT.COMMAND,
                text: t('rotateAroundAxis'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    axis: { type: AT.STRING, menu: 'axis' },
                    angle: { type: AT.NUMBER, defaultValue: 0 },
                    px: { type: AT.NUMBER, defaultValue: 0 },
                    py: { type: AT.NUMBER, defaultValue: 0 },
                    pz: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const THREE = engine.THREE
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    const axisStr = cast.toString(args.axis)
                    const axisVec = new THREE.Vector3(
                        axisStr === 'x' ? 1 : 0,
                        axisStr === 'y' ? 1 : 0,
                        axisStr === 'z' ? 1 : 0
                    )
                    const pivot = new THREE.Vector3(
                        cast.toNumber(args.px),
                        cast.toNumber(args.py),
                        cast.toNumber(args.pz)
                    )
                    const angle = THREE.MathUtils.degToRad(cast.toNumber(args.angle))
                    // 围绕枢轴点旋转：平移到枢轴 → 旋转 → 平移回来
                    const offset = model.position.clone().sub(pivot)
                    offset.applyAxisAngle(axisVec, angle)
                    model.position.copy(pivot).add(offset)
                    model.rotateOnWorldAxis(axisVec, angle)
                    engine.setDirty3D()
                }
            }
        ]
    }

    registerMenus() {
        const T = this.ext?.renderEngine?.THREE
        this.core.registerMenu('eulerOrder', {
            acceptReporters: false,
            items: [
                { text: 'XYZ', value: 'XYZ' },
                { text: 'YZX', value: 'YZX' },
                { text: 'ZXY', value: 'ZXY' },
                { text: 'XZY', value: 'XZY' },
                { text: 'YXZ', value: 'YXZ' },
                { text: 'ZYX', value: 'ZYX' }
            ]
        })
        this.core.registerMenu('vectorOp', {
            acceptReporters: true,
            items: [
                { text: this.translate('vOp.add'), value: 'add' },
                { text: this.translate('vOp.sub'), value: 'sub' },
                { text: this.translate('vOp.multiply'), value: 'multiply' },
                { text: this.translate('vOp.cross'), value: 'cross' },
                { text: this.translate('vOp.lerp'), value: 'lerp' }
            ]
        })
        this.core.registerMenu('quaternionOp', {
            acceptReporters: true,
            items: [
                { text: this.translate('qOp.multiply'), value: 'multiply' },
                { text: this.translate('qOp.slerp'), value: 'slerp' }
            ]
        })
        this.core.registerMenu('quatComp', {
            acceptReporters: false,
            items: [
                { text: 'x', value: 'x' },
                { text: 'y', value: 'y' },
                { text: 'z', value: 'z' },
                { text: 'w', value: 'w' }
            ]
        })
        this.core.registerMenu('xyzComp', {
            acceptReporters: false,
            items: [
                { text: 'x', value: 'x' },
                { text: 'y', value: 'y' },
                { text: 'z', value: 'z' }
            ]
        })
        this.core.registerMenu('axis', {
            acceptReporters: true,
            items: [
                { text: this.translate('axis.x'), value: 'x' },
                { text: this.translate('axis.y'), value: 'y' },
                { text: this.translate('axis.z'), value: 'z' }
            ]
        })
    }

    l10n() {
        return {
            'group.math': { 'zh-cn': '🧮数学', en: '🧮Math' },
            quaternion: {
                'zh-cn': '四元数 x [x] y [y] z [z] w [w]',
                en: 'quaternion x [x] y [y] z [z] w [w]'
            },
            euler: {
                'zh-cn': '欧拉角 x [x] y [y] z [z] 顺序 [order]',
                en: 'euler x [x] y [y] z [z] order [order]'
            },
            vector3: {
                'zh-cn': '向量 x [x] y [y] z [z]',
                en: 'vector x [x] y [y] z [z]'
            },
            quaternionFromEuler: {
                'zh-cn': '从欧拉角 [euler] 创建四元数',
                en: 'quaternion from euler [euler]'
            },
            eulerFromQuaternion: {
                'zh-cn': '从四元数 [quat] 创建欧拉角',
                en: 'euler from quaternion [quat]'
            },
            vectorOperation: {
                'zh-cn': '向量 [op]',
                en: 'vector [op]'
            },
            'vectorOperation.joinCh': { 'zh-cn': '、', en: ', ' },
            'vectorOperation.preText': { 'zh-cn': '', en: '' },
            quaternionOperation: {
                'zh-cn': '四元数 [op]',
                en: 'quaternion [op]'
            },
            'quaternionOperation.joinCh': { 'zh-cn': '、', en: ', ' },
            'quaternionOperation.preText': { 'zh-cn': '', en: '' },
            vectorNormalize: {
                'zh-cn': '归一化向量 [vec]',
                en: 'normalize [vec]'
            },
            vectorNegate: {
                'zh-cn': '取反向量 [vec]',
                en: 'negate [vec]'
            },
            quaternionInvert: {
                'zh-cn': '求逆四元数 [quat]',
                en: 'invert [quat]'
            },
            quaternionConjugate: {
                'zh-cn': '共轭四元数 [quat]',
                en: 'conjugate [quat]'
            },
            vectorDot: {
                'zh-cn': '[v1] 与 [v2] 的点积',
                en: '[v1] dot [v2]'
            },
            vectorDistance: {
                'zh-cn': '[v1] 到 [v2] 的距离',
                en: '[v1] distance to [v2]'
            },
            vectorAngle: {
                'zh-cn': '[v1] 与 [v2] 的夹角',
                en: '[v1] angle to [v2]'
            },
            vectorLength: {
                'zh-cn': '向量 [vec] 的长度',
                en: 'length of [vec]'
            },
            getQuaternionComp: {
                'zh-cn': '四元数 [quat] 的 [comp] 分量',
                en: '[quat] [comp]'
            },
            getEulerComp: {
                'zh-cn': '欧拉角 [euler] 的 [comp] 分量',
                en: '[euler] [comp]'
            },
            getVectorComp: {
                'zh-cn': '向量 [vec] 的 [comp] 分量',
                en: '[vec] [comp]'
            },
            applyQuaternionTo: {
                'zh-cn': '将 [name] 的旋转设置为四元数 [quat]',
                en: 'set [name] rotation to quaternion [quat]'
            },
            applyEulerTo: {
                'zh-cn': '将 [name] 的旋转设置为欧拉角 [euler]',
                en: 'set [name] rotation to euler [euler]'
            },
            setPositionFromVector: {
                'zh-cn': '将 [name] 的位置设置为向量 [vec]',
                en: 'set [name] position to vector [vec]'
            },
            rotateAroundAxis: {
                'zh-cn': '将 [name] 绕 [axis] 轴旋转 [angle]° 围绕点 x [px] y [py] z [pz]',
                en: 'rotate [name] around [axis] by [angle]° pivot x [px] y [py] z [pz]'
            },
            'vOp.add': { 'zh-cn': '相加', en: 'add' },
            'vOp.sub': { 'zh-cn': '相减', en: 'subtract' },
            'vOp.multiply': { 'zh-cn': '相乘', en: 'multiply' },
            'vOp.cross': { 'zh-cn': '叉积', en: 'cross' },
            'vOp.lerp': { 'zh-cn': '插值', en: 'lerp' },
            'qOp.multiply': { 'zh-cn': '相乘', en: 'multiply' },
            'qOp.slerp': { 'zh-cn': '球面插值', en: 'slerp' },
            'axis.x': { 'zh-cn': 'x轴', en: 'x axis' },
            'axis.y': { 'zh-cn': 'y轴', en: 'y axis' },
            'axis.z': { 'zh-cn': 'z轴', en: 'z axis' }
        }
    }
}
