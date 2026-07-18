/**
 * 数学分组 —— 基于 Three.js 数学库的高级积木组
 *
 * 设计目标：
 *   1. 把 Three.js 的 Vector / Euler / Quaternion / Matrix / Color 封装为 Scratch 积木
 *   2. 向后兼容原有所有 opcode（quaternion / euler / vector3 / ...）
 *   3. 通过“对象类型 + 操作类型”的菜单组合，减少积木数量，提升组合能力
 *   4. 利用 BlockGroup / Wrapper / RTW_Model_Box / getDynamicArgs 等已有框架能力
 *
 * 新增能力（相对旧版）：
 *   - 2D/4D 向量、3x3/4x4 矩阵、Color 对象
 *   - 向量标量运算、向量投影/反射/垂直
 *   - 四元数从轴角、从两向量创建
 *   - 矩阵变换、矩阵乘法/求逆/转置、应用矩阵到对象
 *   - 颜色混合、颜色从十六进制创建
 *   - MathUtils 常用工具（lerp / clamp / rand / deg-rad 互转）
 */

import BlockGroup from '../BlockGroup.js'
import {
    RTW_Model_Box,
    Wrapper,
    unwrapRTWModel,
    wrapRTWModel,
    toVector3,
    ColorTools
} from '../../utils/RTWTools.js'
import { getDynamicArgs } from '../../utils/extendableBlock.js'

export default class MathGroup extends BlockGroup {
    static groupId = 'Math'

    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.math')
    }

    // ============== 通用工具方法 ==============

    _getTHREE() {
        return this.ext.renderEngine?.THREE
    }

    // ============== 积木构建 ==============

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext
        const cast = ext.cast

        return [
            '---',
            // ============== 创建实例 ==============
            {
                opcode: 'vector2',
                blockType: BT.OUTPUT,
                text: t('vector2'),
                arguments: {
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    return wrapRTWModel(
                        new THREE.Vector2(
                            cast.toNumber(args.x),
                            cast.toNumber(args.y)
                        )
                    )
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    return wrapRTWModel(
                        new THREE.Vector3(
                            cast.toNumber(args.x),
                            cast.toNumber(args.y),
                            cast.toNumber(args.z)
                        )
                    )
                }
            },
            {
                opcode: 'vector4',
                blockType: BT.OUTPUT,
                text: t('vector4'),
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    return wrapRTWModel(
                        new THREE.Vector4(
                            cast.toNumber(args.x),
                            cast.toNumber(args.y),
                            cast.toNumber(args.z),
                            cast.toNumber(args.w)
                        )
                    )
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    return wrapRTWModel(
                        new THREE.Euler(
                            THREE.MathUtils.degToRad(cast.toNumber(args.x)),
                            THREE.MathUtils.degToRad(cast.toNumber(args.y)),
                            THREE.MathUtils.degToRad(cast.toNumber(args.z)),
                            cast.toString(args.order)
                        )
                    )
                }
            },
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    return wrapRTWModel(
                        new THREE.Quaternion(
                            cast.toNumber(args.x),
                            cast.toNumber(args.y),
                            cast.toNumber(args.z),
                            cast.toNumber(args.w)
                        )
                    )
                }
            },
            {
                opcode: 'matrix3',
                blockType: BT.OUTPUT,
                text: t('matrix3'),
                arguments: {
                    mode: { type: AT.STRING, menu: 'matrix3Mode' }
                },
                dynamicArgsInfo: {
                    afterArg: 'mode',
                    defaultValues: i => (i === 0 ? '1' : '0'),
                    dynamicArgTypes: ['n'],
                    joinCh: ', ',
                    preText: t('matrix3.preText')
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const nums = getDynamicArgs(args).map(v => cast.toNumber(v))
                    const mode = cast.toString(args.mode)
                    const m = new THREE.Matrix3()
                    if (mode === 'identity' || nums.length === 0) {
                        m.identity()
                    } else if (mode === 'elements' && nums.length >= 9) {
                        m.set(
                            nums[0], nums[1], nums[2],
                            nums[3], nums[4], nums[5],
                            nums[6], nums[7], nums[8]
                        )
                    } else if (mode === 'scale' && nums.length >= 2) {
                        m.makeScale(nums[0], nums[1])
                    } else if (mode === 'rotation' && nums.length >= 1) {
                        m.makeRotation(THREE.MathUtils.degToRad(nums[0]))
                    } else if (mode === 'translate' && nums.length >= 2) {
                        m.makeTranslation(nums[0], nums[1])
                    } else {
                        m.identity()
                    }
                    return wrapRTWModel(m)
                }
            },
            {
                opcode: 'matrix4',
                blockType: BT.OUTPUT,
                text: t('matrix4'),
                arguments: {
                    mode: { type: AT.STRING, menu: 'matrix4Mode' }
                },
                dynamicArgsInfo: {
                    afterArg: 'mode',
                    defaultValues: i => (i === 0 || i === 5 || i === 10 || i === 15 ? '1' : '0'),
                    dynamicArgTypes: ['n'],
                    joinCh: ', ',
                    preText: t('matrix4.preText')
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const nums = getDynamicArgs(args).map(v => cast.toNumber(v))
                    const mode = cast.toString(args.mode)
                    const m = new THREE.Matrix4()
                    if (mode === 'identity' || nums.length === 0) {
                        m.identity()
                    } else if (mode === 'elements' && nums.length >= 16) {
                        m.set(
                            nums[0], nums[1], nums[2], nums[3],
                            nums[4], nums[5], nums[6], nums[7],
                            nums[8], nums[9], nums[10], nums[11],
                            nums[12], nums[13], nums[14], nums[15]
                        )
                    } else if (mode === 'translate' && nums.length >= 3) {
                        m.makeTranslation(nums[0], nums[1], nums[2])
                    } else if (mode === 'rotateX' && nums.length >= 1) {
                        m.makeRotationX(THREE.MathUtils.degToRad(nums[0]))
                    } else if (mode === 'rotateY' && nums.length >= 1) {
                        m.makeRotationY(THREE.MathUtils.degToRad(nums[0]))
                    } else if (mode === 'rotateZ' && nums.length >= 1) {
                        m.makeRotationZ(THREE.MathUtils.degToRad(nums[0]))
                    } else if (mode === 'scale' && nums.length >= 3) {
                        m.makeScale(nums[0], nums[1], nums[2])
                    } else if (mode === 'shear') {
                        // 保持单位阵
                        m.identity()
                    } else {
                        m.identity()
                    }
                    return wrapRTWModel(m)
                }
            },
            {
                opcode: 'colorToHex',
                blockType: BT.REPORTER,
                text: t('colorToHex'),
                arguments: { color: { type: null } },
                disableMonitor: true,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    return ColorTools.toHex(args.color, THREE, cast)
                }
            },
            {
                opcode: 'colorToRGB',
                blockType: BT.OUTPUT,
                text: t('colorToRGB'),
                arguments: {
                    color: { type: null },
                    format: { type: AT.STRING, menu: 'colorFormat' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const rgb = ColorTools.toRGB(args.color, THREE, cast)
                    const format = cast.toString(args.format)
                    if (format === 'array') {
                        return [rgb.r, rgb.g, rgb.b]
                    }
                    return rgb
                }
            },
            {
                opcode: 'colorToHSL',
                blockType: BT.OUTPUT,
                text: t('colorToHSL'),
                arguments: {
                    color: { type: null },
                    format: { type: AT.STRING, menu: 'colorFormat' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const hsl = ColorTools.toHSL(args.color, THREE, cast)
                    const format = cast.toString(args.format)
                    if (format === 'array') {
                        return [
                            Math.round(hsl.h * 360),
                            Math.round(hsl.s * 100),
                            Math.round(hsl.l * 100)
                        ]
                    }
                    return hsl
                }
            },
            '---',
            // ============== 类型互转 ==============
            {
                opcode: 'quaternionFromEuler',
                blockType: BT.OUTPUT,
                text: t('quaternionFromEuler'),
                arguments: { euler: { type: null } },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const e = unwrapRTWModel(args.euler)
                    if (!(e instanceof THREE.Euler))
                        return '⚠️传入的不是欧拉角！'
                    return wrapRTWModel(new THREE.Quaternion().setFromEuler(e))
                }
            },
            {
                opcode: 'eulerFromQuaternion',
                blockType: BT.OUTPUT,
                text: t('eulerFromQuaternion'),
                arguments: { quat: { type: null } },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const q = unwrapRTWModel(args.quat)
                    if (!(q instanceof THREE.Quaternion))
                        return '⚠️传入的不是四元数！'
                    return wrapRTWModel(new THREE.Euler().setFromQuaternion(q))
                }
            },
            {
                opcode: 'quaternionFromAxisAngle',
                blockType: BT.OUTPUT,
                text: t('quaternionFromAxisAngle'),
                arguments: {
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 1 },
                    z: { type: AT.NUMBER, defaultValue: 0 },
                    angle: { type: AT.NUMBER, defaultValue: 0 }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const axis = new THREE.Vector3(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z)
                    ).normalize()
                    const angle = THREE.MathUtils.degToRad(
                        cast.toNumber(args.angle)
                    )
                    return wrapRTWModel(
                        new THREE.Quaternion().setFromAxisAngle(axis, angle)
                    )
                }
            },
            {
                opcode: 'quaternionFromVectors',
                blockType: BT.OUTPUT,
                text: t('quaternionFromVectors'),
                arguments: {
                    from: { type: null, defaultValue: '0,1,0' },
                    to: { type: null, defaultValue: '0,0,1' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const vFrom = toVector3(args.from, THREE, cast)
                    const vTo = toVector3(args.to, THREE, cast)
                    if (!vFrom || !vTo) return '⚠️传入的不是向量！'
                    return wrapRTWModel(
                        new THREE.Quaternion().setFromUnitVectors(
                            vFrom.clone().normalize(),
                            vTo.clone().normalize()
                        )
                    )
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const op = cast.toString(args.op)
                    const vecs = getDynamicArgs(args)
                        .map(v => toVector3(v, THREE, cast))
                        .filter(Boolean)
                    if (vecs.length === 0) return wrapRTWModel(new THREE.Vector3())

                    let result = vecs[0].clone()
                    switch (op) {
                        case 'add':
                            for (let i = 1; i < vecs.length; i++)
                                result.add(vecs[i])
                            break
                        case 'sub':
                            for (let i = 1; i < vecs.length; i++)
                                result.sub(vecs[i])
                            break
                        case 'multiply':
                            for (let i = 1; i < vecs.length; i++)
                                result.multiply(vecs[i])
                            break
                        case 'cross':
                            for (let i = 1; i < vecs.length; i++)
                                result.cross(vecs[i])
                            break
                        case 'lerp':
                            // 注意：这是多输入顺序混合（等权重），并非带独立 t 参数的插值
                            for (let i = 1; i < vecs.length; i++)
                                result.lerp(vecs[i], 1 / vecs.length)
                            break
                        case 'min':
                            for (let i = 1; i < vecs.length; i++)
                                result.min(vecs[i])
                            break
                        case 'max':
                            for (let i = 1; i < vecs.length; i++)
                                result.max(vecs[i])
                            break
                        default:
                            break
                    }
                    return wrapRTWModel(result)
                }
            },
            {
                opcode: 'vectorScalar',
                blockType: BT.OUTPUT,
                text: t('vectorScalar'),
                arguments: {
                    op: { type: AT.STRING, menu: 'vectorScalarOp' },
                    vec: { type: null },
                    scalar: { type: AT.NUMBER, defaultValue: 1 }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const v = toVector3(args.vec, THREE, cast)
                    if (!v) return '⚠️传入的不是向量！'
                    const op = cast.toString(args.op)
                    const s = cast.toNumber(args.scalar)
                    const result = v.clone()
                    switch (op) {
                        case 'add': result.addScalar(s); break
                        case 'sub': result.addScalar(-s); break
                        case 'mul': result.multiplyScalar(s); break
                        case 'div': result.divideScalar(s || 1); break
                        default: break
                    }
                    return wrapRTWModel(result)
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const op = cast.toString(args.op)
                    const quats = getDynamicArgs(args)
                        .map(v => {
                            const obj = unwrapRTWModel(v)
                            return obj instanceof THREE.Quaternion
                                ? obj
                                : null
                        })
                        .filter(Boolean)
                    if (quats.length === 0)
                        return wrapRTWModel(new THREE.Quaternion())

                    let result = quats[0].clone()
                    switch (op) {
                        case 'multiply':
                            for (let i = 1; i < quats.length; i++)
                                result.multiply(quats[i])
                            break
                        case 'premultiply':
                            for (let i = 1; i < quats.length; i++)
                                result.premultiply(quats[i])
                            break
                        case 'slerp':
                            // 注意：这是多输入顺序球面混合（等权重），并非带独立 t 参数的插值
                            for (let i = 1; i < quats.length; i++)
                                result.slerp(quats[i], 1 / quats.length)
                            break
                        default:
                            break
                    }
                    return wrapRTWModel(result)
                }
            },
            {
                opcode: 'matrixOperation',
                blockType: BT.OUTPUT,
                text: t('matrixOperation'),
                arguments: {
                    op: { type: AT.STRING, menu: 'matrixOp' },
                    a: { type: null },
                    b: { type: null }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const op = cast.toString(args.op)
                    const ma = unwrapRTWModel(args.a)
                    const mb = unwrapRTWModel(args.b)
                    if (!(ma instanceof THREE.Matrix4))
                        return '⚠️A 不是 4x4 矩阵！'

                    const result = ma.clone()
                    switch (op) {
                        case 'multiply':
                            if (!(mb instanceof THREE.Matrix4))
                                return '⚠️B 不是 4x4 矩阵！'
                            result.multiply(mb)
                            break
                        case 'premultiply':
                            if (!(mb instanceof THREE.Matrix4))
                                return '⚠️B 不是 4x4 矩阵！'
                            result.premultiply(mb)
                            break
                        case 'invert':
                            result.invert()
                            break
                        case 'transpose':
                            result.transpose()
                            break
                        default:
                            break
                    }
                    return wrapRTWModel(result)
                }
            },
            {
                opcode: 'colorOperation',
                blockType: BT.OUTPUT,
                text: t('colorOperation'),
                arguments: {
                    op: { type: AT.STRING, menu: 'colorOp' },
                    c1: { type: null },
                    c2: { type: null },
                    alpha: { type: AT.NUMBER, defaultValue: 0.5 }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const op = cast.toString(args.op)
                    const color1 = ColorTools.parse(args.c1, THREE, cast)
                    const color2 = ColorTools.parse(args.c2, THREE, cast)
                    const result = color1.clone()
                    if (op === 'lerp') {
                        result.lerp(color2, cast.toNumber(args.alpha))
                    } else if (op === 'add') {
                        result.add(color2)
                    } else if (op === 'multiply') {
                        result.multiply(color2)
                    }
                    return wrapRTWModel(result)
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const v = toVector3(args.vec, THREE, cast)
                    if (!v) return '⚠️传入的不是向量！'
                    return wrapRTWModel(v.clone().normalize())
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const v = toVector3(args.vec, THREE, cast)
                    if (!v) return '⚠️传入的不是向量！'
                    return wrapRTWModel(v.clone().negate())
                }
            },
            {
                opcode: 'vectorProject',
                blockType: BT.OUTPUT,
                text: t('vectorProject'),
                arguments: {
                    vec: { type: null },
                    normal: { type: null }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const v = toVector3(args.vec, THREE, cast)
                    const n = toVector3(args.normal, THREE, cast)
                    if (!v || !n) return '⚠️传入的不是向量！'
                    return wrapRTWModel(v.clone().projectOnVector(n))
                }
            },
            {
                opcode: 'vectorReflect',
                blockType: BT.OUTPUT,
                text: t('vectorReflect'),
                arguments: {
                    vec: { type: null },
                    normal: { type: null }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const v = toVector3(args.vec, THREE, cast)
                    const n = toVector3(args.normal, THREE, cast)
                    if (!v || !n) return '⚠️传入的不是向量！'
                    return wrapRTWModel(v.clone().reflect(n.clone().normalize()))
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const q = unwrapRTWModel(args.quat)
                    if (!(q instanceof THREE.Quaternion))
                        return '⚠️传入的不是四元数！'
                    return wrapRTWModel(q.clone().invert())
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const q = unwrapRTWModel(args.quat)
                    if (!(q instanceof THREE.Quaternion))
                        return '⚠️传入的不是四元数！'
                    return wrapRTWModel(q.clone().conjugate())
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const v1 = toVector3(args.v1, THREE, cast)
                    const v2 = toVector3(args.v2, THREE, cast)
                    if (!v1 || !v2) return '⚠️传入的不是向量！'
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const v1 = toVector3(args.v1, THREE, cast)
                    const v2 = toVector3(args.v2, THREE, cast)
                    if (!v1 || !v2) return '⚠️传入的不是向量！'
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const v1 = toVector3(args.v1, THREE, cast)
                    const v2 = toVector3(args.v2, THREE, cast)
                    if (!v1 || !v2) return '⚠️传入的不是向量！'
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const v = toVector3(args.vec, THREE, cast)
                    if (!v) return '⚠️传入的不是向量！'
                    return v.length()
                }
            },
            {
                opcode: 'matrixDeterminant',
                blockType: BT.REPORTER,
                text: t('matrixDeterminant'),
                disableMonitor: true,
                arguments: { mat: { type: null } },
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const m = unwrapRTWModel(args.mat)
                    if (!(m instanceof THREE.Matrix4))
                        return '⚠️传入的不是 4x4 矩阵！'
                    return m.determinant()
                }
            },
            '---',
            // ============== 分量获取 ==============
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
                    const v = unwrapRTWModel(args.vec)
                    const c = cast.toString(args.comp)
                    if (v && (typeof v.x === 'number' || typeof v.x === 'object')) {
                        return v[c] ?? 0
                    }
                    return '⚠️传入的不是向量！'
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
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const e = unwrapRTWModel(args.euler)
                    if (!(e instanceof THREE.Euler))
                        return '⚠️传入的不是欧拉角！'
                    const c = cast.toString(args.comp)
                    return THREE.MathUtils.radToDeg(e[c] || 0)
                }
            },
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
                    const q = unwrapRTWModel(args.quat)
                    const c = cast.toString(args.comp)
                    if (q && (typeof q.x === 'number' || typeof q.x === 'object')) {
                        return q[c] ?? 0
                    }
                    return '⚠️传入的不是四元数！'
                }
            },
            {
                opcode: 'getColorComp',
                blockType: BT.REPORTER,
                text: t('getColorComp'),
                disableMonitor: true,
                arguments: {
                    color: { type: null },
                    comp: { type: AT.STRING, menu: 'colorComp' }
                },
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const c = ColorTools.parse(args.color, THREE, cast)
                    const comp = cast.toString(args.comp)
                    if (comp === 'hex') return c.getHex()
                    if (comp === 'r' || comp === 'g' || comp === 'b')
                        return c[comp]
                    return 0
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
                    const q = unwrapRTWModel(args.quat)
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
                    const e = unwrapRTWModel(args.euler)
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
                    const v = toVector3(args.vec, THREE, cast)
                    if (!v) return '⚠️传入的不是向量！'
                    model.position.copy(v)
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'applyMatrixTo',
                blockType: BT.COMMAND,
                text: t('applyMatrixTo'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    mat: { type: null }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const THREE = engine.THREE
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    const m = unwrapRTWModel(args.mat)
                    if (!(m instanceof THREE.Matrix4))
                        return '⚠️传入的不是 4x4 矩阵！'
                    model.applyMatrix4(m)
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
                    const angle = THREE.MathUtils.degToRad(
                        cast.toNumber(args.angle)
                    )
                    const offset = model.position.clone().sub(pivot)
                    offset.applyAxisAngle(axisVec, angle)
                    model.position.copy(pivot).add(offset)
                    model.rotateOnWorldAxis(axisVec, angle)
                    engine.setDirty3D()
                }
            },
            '---',
            // ============== MathUtils 工具 ==============
            {
                opcode: 'mathUtils',
                blockType: BT.REPORTER,
                text: t('mathUtils'),
                disableMonitor: true,
                arguments: {
                    op: { type: AT.STRING, menu: 'mathUtilOp' }
                },
                hideFromPalette: true,
                mutatorInfo: /** @type {import('../BlockGroup.js').MutatorInfo} */ ({
                    fieldName: 'op',
                    defaultValue: 'lerp',
                    argMap: {
                        lerp: [
                            { name: 'a', type: 'n', default: 0, label: 'x' },
                            { name: 'b', type: 'n', default: 1, label: 'y' },
                            { name: 'c', type: 'n', default: 0.5, label: 't' }
                        ],
                        clamp: [
                            { name: 'a', type: 'n', default: 0, label: 'value' },
                            { name: 'b', type: 'n', default: 0, label: 'min' },
                            { name: 'c', type: 'n', default: 1, label: 'max' }
                        ],
                        deg2rad: [
                            { name: 'a', type: 'n', default: 0, label: 'degrees' }
                        ],
                        rad2deg: [
                            { name: 'a', type: 'n', default: 0, label: 'radians' }
                        ],
                        rand: [
                            { name: 'a', type: 'n', default: 0, label: 'min' },
                            { name: 'b', type: 'n', default: 1, label: 'max' }
                        ],
                        randInt: [
                            { name: 'a', type: 'n', default: 0, label: 'min' },
                            { name: 'b', type: 'n', default: 10, label: 'max' }
                        ],
                        randSpread: [
                            { name: 'a', type: 'n', default: 1, label: 'range' }
                        ],
                        map: [
                            { name: 'a', type: 'n', default: 0, label: 'x' },
                            { name: 'b', type: 'n', default: 0, label: 'a1' },
                            { name: 'c', type: 'n', default: 1, label: 'a2' },
                            { name: 'd', type: 'n', default: 0, label: 'b1' },
                            { name: 'e', type: 'n', default: 1, label: 'b2' }
                        ],
                        inverseLerp: [
                            { name: 'a', type: 'n', default: 0, label: 'x' },
                            { name: 'b', type: 'n', default: 1, label: 'y' },
                            { name: 'c', type: 'n', default: 0.5, label: 'value' }
                        ],
                        smoothstep: [
                            { name: 'a', type: 'n', default: 0, label: 'edge0' },
                            { name: 'b', type: 'n', default: 1, label: 'edge1' },
                            { name: 'c', type: 'n', default: 0.5, label: 'x' }
                        ],
                        smootherstep: [
                            { name: 'a', type: 'n', default: 0, label: 'edge0' },
                            { name: 'b', type: 'n', default: 1, label: 'edge1' },
                            { name: 'c', type: 'n', default: 0.5, label: 'x' }
                        ],
                        pingpong: [
                            { name: 'a', type: 'n', default: 0, label: 'x' },
                            { name: 'b', type: 'n', default: 1, label: 'length' }
                        ]
                    }
                }),
                handler: args => {
                    const THREE = this._getTHREE()
                    if (!THREE) return '⚠️显示器未初始化！'
                    const op = cast.toString(args.op)
                    // 防御：若 mutator 未成功创建动态输入，缺失参数按默认值 0 处理
                    const a = args.a !== undefined ? cast.toNumber(args.a) : 0
                    const b = args.b !== undefined ? cast.toNumber(args.b) : 0
                    const c = args.c !== undefined ? cast.toNumber(args.c) : 0
                    const d = args.d !== undefined ? cast.toNumber(args.d) : 0
                    const e = args.e !== undefined ? cast.toNumber(args.e) : 0
                    const MU = THREE.MathUtils
                    switch (op) {
                        case 'lerp':
                            return MU.lerp(a, b, c)
                        case 'clamp':
                            return MU.clamp(a, b, c)
                        case 'deg2rad':
                            return MU.degToRad(a)
                        case 'rad2deg':
                            return MU.radToDeg(a)
                        case 'rand':
                            return MU.randFloat(a, b)
                        case 'randInt':
                            return MU.randInt(a, b)
                        case 'randSpread':
                            return MU.randFloatSpread(a)
                        case 'map':
                            console.log(a, b, c, d, e, MU.mapLinear)
                            return MU.mapLinear(a, b, c, d, e)
                        case 'inverseLerp':
                            return MU.inverseLerp(a, b, c)
                        // Three.js MathUtils.smoothstep / smootherstep 签名是 (x, min, max)
                        // 积木标签保留 edge0/min、edge1/max、x，调用时把 x 提到第一位
                        case 'smoothstep':
                            return MU.smoothstep(c, a, b)
                        case 'smootherstep':
                            return MU.smootherstep(c, a, b)
                        case 'pingpong':
                            console.log(a, b, MU.pingpong)
                            return MU.pingpong(a, b)
                        default:
                            return 0
                    }
                }
            }
        ]
    }

    registerMenus() {
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
            acceptReporters: false,
            items: [
                { text: this.translate('vOp.add'), value: 'add' },
                { text: this.translate('vOp.sub'), value: 'sub' },
                { text: this.translate('vOp.multiply'), value: 'multiply' },
                { text: this.translate('vOp.cross'), value: 'cross' },
                { text: this.translate('vOp.lerp'), value: 'lerp' },
                { text: this.translate('vOp.min'), value: 'min' },
                { text: this.translate('vOp.max'), value: 'max' }
            ]
        })
        this.core.registerMenu('vectorScalarOp', {
            acceptReporters: false,
            items: [
                { text: this.translate('vsOp.add'), value: 'add' },
                { text: this.translate('vsOp.sub'), value: 'sub' },
                { text: this.translate('vsOp.mul'), value: 'mul' },
                { text: this.translate('vsOp.div'), value: 'div' }
            ]
        })
        this.core.registerMenu('quaternionOp', {
            acceptReporters: false,
            items: [
                { text: this.translate('qOp.multiply'), value: 'multiply' },
                { text: this.translate('qOp.premultiply'), value: 'premultiply' },
                { text: this.translate('qOp.slerp'), value: 'slerp' }
            ]
        })
        this.core.registerMenu('matrix3Mode', {
            acceptReporters: false,
            items: [
                { text: this.translate('mMode.identity'), value: 'identity' },
                { text: this.translate('mMode.elements'), value: 'elements' },
                { text: this.translate('mMode.translate'), value: 'translate' },
                { text: this.translate('mMode.rotate'), value: 'rotation' },
                { text: this.translate('mMode.scale'), value: 'scale' }
            ]
        })
        this.core.registerMenu('matrix4Mode', {
            acceptReporters: false,
            items: [
                { text: this.translate('mMode.identity'), value: 'identity' },
                { text: this.translate('mMode.elements'), value: 'elements' },
                { text: this.translate('mMode.translate'), value: 'translate' },
                { text: this.translate('mMode.rotateX'), value: 'rotateX' },
                { text: this.translate('mMode.rotateY'), value: 'rotateY' },
                { text: this.translate('mMode.rotateZ'), value: 'rotateZ' },
                { text: this.translate('mMode.scale'), value: 'scale' }
            ]
        })
        this.core.registerMenu('matrixOp', {
            acceptReporters: false,
            items: [
                { text: this.translate('matOp.multiply'), value: 'multiply' },
                { text: this.translate('matOp.premultiply'), value: 'premultiply' },
                { text: this.translate('matOp.invert'), value: 'invert' },
                { text: this.translate('matOp.transpose'), value: 'transpose' }
            ]
        })
        this.core.registerMenu('colorOp', {
            acceptReporters: false,
            items: [
                { text: this.translate('cOp.lerp'), value: 'lerp' },
                { text: this.translate('cOp.add'), value: 'add' },
                { text: this.translate('cOp.multiply'), value: 'multiply' }
            ]
        })
        this.core.registerMenu('colorComp', {
            acceptReporters: false,
            items: [
                { text: 'R', value: 'r' },
                { text: 'G', value: 'g' },
                { text: 'B', value: 'b' },
                { text: this.translate('comp.hex'), value: 'hex' }
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
            acceptReporters: false,
            items: [
                { text: this.translate('axis.x'), value: 'x' },
                { text: this.translate('axis.y'), value: 'y' },
                { text: this.translate('axis.z'), value: 'z' }
            ]
        })
        this.core.registerMenu('mathUtilOp', {
            acceptReporters: false,
            items: [
                { text: this.translate('mu.lerp'), value: 'lerp' },
                { text: this.translate('mu.clamp'), value: 'clamp' },
                { text: this.translate('mu.deg2rad'), value: 'deg2rad' },
                { text: this.translate('mu.rad2deg'), value: 'rad2deg' },
                { text: this.translate('mu.rand'), value: 'rand' },
                { text: this.translate('mu.randInt'), value: 'randInt' },
                { text: this.translate('mu.randSpread'), value: 'randSpread' },
                { text: this.translate('mu.map'), value: 'map' },
                { text: this.translate('mu.inverseLerp'), value: 'inverseLerp' },
                { text: this.translate('mu.smoothstep'), value: 'smoothstep' },
                { text: this.translate('mu.smootherstep'), value: 'smootherstep' },
                { text: this.translate('mu.pingpong'), value: 'pingpong' }
            ]
        })
        this.core.registerMenu('colorFormat', {
            acceptReporters: false,
            items: [
                { text: this.translate('colorFormat.object'), value: 'object' },
                { text: this.translate('colorFormat.array'), value: 'array' }
            ]
        })
    }

    l10n() {
        return {
            'group.math': { 'zh-cn': '🧮数学', en: '🧮Math' },

            // 创建
            vector2: {
                'zh-cn': '向量2 x [x] y [y]',
                en: 'vector2 x [x] y [y]'
            },
            vector3: {
                'zh-cn': '向量3 x [x] y [y] z [z]',
                en: 'vector3 x [x] y [y] z [z]'
            },
            vector4: {
                'zh-cn': '向量4 x [x] y [y] z [z] w [w]',
                en: 'vector4 x [x] y [y] z [z] w [w]'
            },
            euler: {
                'zh-cn': '欧拉角 x [x] y [y] z [z] 顺序 [order]',
                en: 'euler x [x] y [y] z [z] order [order]'
            },
            quaternion: {
                'zh-cn': '四元数 x [x] y [y] z [z] w [w]',
                en: 'quaternion x [x] y [y] z [z] w [w]'
            },
            matrix3: {
                'zh-cn': ' 3x3 矩阵 模式 [mode]',
                en: 'matrix3 mode [mode]'
            },
            'matrix3.preText': { 'zh-cn': '参数', en: 'args' },
            matrix4: {
                'zh-cn': ' 4x4 矩阵 模式 [mode]',
                en: 'matrix4 mode [mode]'
            },
            'matrix4.preText': { 'zh-cn': '参数', en: 'args' },
            colorToHex: {
                'zh-cn': '颜色 [color] 的十六进制值',
                en: 'hex of [color]'
            },
            colorToRGB: {
                'zh-cn': '颜色 [color] 的RGB [format]',
                en: 'RGB of [color] as [format]'
            },
            colorToHSL: {
                'zh-cn': '颜色 [color] 的HSL [format]',
                en: 'HSL of [color] as [format]'
            },

            // 互转
            quaternionFromEuler: {
                'zh-cn': '从欧拉角 [euler] 创建四元数',
                en: 'quaternion from euler [euler]'
            },
            eulerFromQuaternion: {
                'zh-cn': '从四元数 [quat] 创建欧拉角',
                en: 'euler from quaternion [quat]'
            },
            quaternionFromAxisAngle: {
                'zh-cn': '绕轴 x [x] y [y] z [z] 旋转 [angle]° 的四元数',
                en: 'quaternion axis x [x] y [y] z [z] angle [angle]°'
            },
            quaternionFromVectors: {
                'zh-cn': '从方向 [from] 旋转到 [to] 的四元数',
                en: 'quaternion from [from] to [to]'
            },

            // 运算
            vectorOperation: {
                'zh-cn': '向量 [op]',
                en: 'vector [op]'
            },
            'vectorOperation.joinCh': { 'zh-cn': '、', en: ', ' },
            'vectorOperation.preText': { 'zh-cn': '', en: '' },
            vectorScalar: {
                'zh-cn': '向量 [vec] [op] 标量 [scalar]',
                en: 'vector [vec] [op] scalar [scalar]'
            },
            quaternionOperation: {
                'zh-cn': '四元数 [op]',
                en: 'quaternion [op]'
            },
            'quaternionOperation.joinCh': { 'zh-cn': '、', en: ', ' },
            'quaternionOperation.preText': { 'zh-cn': '', en: '' },
            matrixOperation: {
                'zh-cn': '矩阵 [a] [op] [b]',
                en: 'matrix [a] [op] [b]'
            },
            colorOperation: {
                'zh-cn': '颜色 [c1] [op] [c2] 混合 [alpha]',
                en: 'color [c1] [op] [c2] alpha [alpha]'
            },

            // 一元运算
            vectorNormalize: {
                'zh-cn': '归一化向量 [vec]',
                en: 'normalize [vec]'
            },
            vectorNegate: {
                'zh-cn': '取反向量 [vec]',
                en: 'negate [vec]'
            },
            vectorProject: {
                'zh-cn': '向量 [vec] 投影到 [normal]',
                en: 'project [vec] onto [normal]'
            },
            vectorReflect: {
                'zh-cn': '向量 [vec] 沿 [normal] 反射',
                en: 'reflect [vec] over [normal]'
            },
            quaternionInvert: {
                'zh-cn': '求逆四元数 [quat]',
                en: 'invert [quat]'
            },
            quaternionConjugate: {
                'zh-cn': '共轭四元数 [quat]',
                en: 'conjugate [quat]'
            },

            // 标量
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
            matrixDeterminant: {
                'zh-cn': '矩阵 [mat] 的行列式',
                en: 'determinant of [mat]'
            },

            // 分量
            getVectorComp: {
                'zh-cn': '向量 [vec] 的 [comp] 分量',
                en: '[vec] [comp]'
            },
            getEulerComp: {
                'zh-cn': '欧拉角 [euler] 的 [comp] 分量',
                en: '[euler] [comp]'
            },
            getQuaternionComp: {
                'zh-cn': '四元数 [quat] 的 [comp] 分量',
                en: '[quat] [comp]'
            },
            getColorComp: {
                'zh-cn': '颜色 [color] 的 [comp]',
                en: '[color] [comp]'
            },

            // 应用
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
            applyMatrixTo: {
                'zh-cn': '将矩阵 [mat] 应用到 [name]',
                en: 'apply matrix [mat] to [name]'
            },
            rotateAroundAxis: {
                'zh-cn': '将 [name] 绕 [axis] 轴旋转 [angle]° 围绕点 x [px] y [py] z [pz]',
                en: 'rotate [name] around [axis] by [angle]° pivot x [px] y [py] z [pz]'
            },

            // 工具
            mathUtils: {
                'zh-cn': '数学工具 [op]',
                en: 'math [op]'
            },

            // 菜单
            'vOp.add': { 'zh-cn': '相加', en: 'add' },
            'vOp.sub': { 'zh-cn': '相减', en: 'subtract' },
            'vOp.multiply': { 'zh-cn': '相乘', en: 'multiply' },
            'vOp.cross': { 'zh-cn': '叉积', en: 'cross' },
            'vOp.lerp': { 'zh-cn': '插值', en: 'lerp' },
            'vOp.min': { 'zh-cn': '最小', en: 'min' },
            'vOp.max': { 'zh-cn': '最大', en: 'max' },
            'vsOp.add': { 'zh-cn': '加', en: 'add' },
            'vsOp.sub': { 'zh-cn': '减', en: 'subtract' },
            'vsOp.mul': { 'zh-cn': '乘', en: 'multiply' },
            'vsOp.div': { 'zh-cn': '除', en: 'divide' },
            'qOp.multiply': { 'zh-cn': '相乘', en: 'multiply' },
            'qOp.premultiply': { 'zh-cn': '前乘', en: 'premultiply' },
            'qOp.slerp': { 'zh-cn': '球面插值', en: 'slerp' },
            'mMode.identity': { 'zh-cn': '单位阵', en: 'identity' },
            'mMode.elements': { 'zh-cn': '元素', en: 'elements' },
            'mMode.translate': { 'zh-cn': '平移', en: 'translate' },
            'mMode.rotate': { 'zh-cn': '旋转', en: 'rotate' },
            'mMode.rotateX': { 'zh-cn': '绕X轴旋转', en: 'rotate X' },
            'mMode.rotateY': { 'zh-cn': '绕Y轴旋转', en: 'rotate Y' },
            'mMode.rotateZ': { 'zh-cn': '绕Z轴旋转', en: 'rotate Z' },
            'mMode.scale': { 'zh-cn': '缩放', en: 'scale' },
            'matOp.multiply': { 'zh-cn': '相乘', en: 'multiply' },
            'matOp.premultiply': { 'zh-cn': '前乘', en: 'premultiply' },
            'matOp.invert': { 'zh-cn': '求逆', en: 'invert' },
            'matOp.transpose': { 'zh-cn': '转置', en: 'transpose' },
            'cOp.lerp': { 'zh-cn': '插值', en: 'lerp' },
            'cOp.add': { 'zh-cn': '相加', en: 'add' },
            'cOp.multiply': { 'zh-cn': '相乘', en: 'multiply' },
            'comp.hex': { 'zh-cn': '十六进制', en: 'hex' },
            'axis.x': { 'zh-cn': 'x轴', en: 'x axis' },
            'axis.y': { 'zh-cn': 'y轴', en: 'y axis' },
            'axis.z': { 'zh-cn': 'z轴', en: 'z axis' },
            'mu.lerp': { 'zh-cn': '线性插值', en: 'lerp' },
            'mu.clamp': { 'zh-cn': '限制', en: 'clamp' },
            'mu.deg2rad': { 'zh-cn': '度转弧度', en: 'deg to rad' },
            'mu.rad2deg': { 'zh-cn': '弧度转度', en: 'rad to deg' },
            'mu.rand': { 'zh-cn': '随机小数', en: 'random float' },
            'mu.randInt': { 'zh-cn': '随机整数', en: 'random int' },
            'mu.randSpread': { 'zh-cn': '随机扩散', en: 'random spread' },
            'mu.map': { 'zh-cn': '映射', en: 'map' },
            'mu.inverseLerp': { 'zh-cn': '反线性插值', en: 'inverse lerp' },
            'mu.smoothstep': { 'zh-cn': '平滑阶梯', en: 'smoothstep' },
            'mu.smootherstep': { 'zh-cn': '更平滑阶梯', en: 'smootherstep' },
            'mu.pingpong': { 'zh-cn': '乒乓', en: 'pingpong' },
            'colorFormat.object': { 'zh-cn': '对象', en: 'object' },
            'colorFormat.array': { 'zh-cn': '数组', en: 'array' },
        }
    }
}
