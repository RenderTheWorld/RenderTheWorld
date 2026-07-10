/**
 * 相机分组 —— 创建、配置相机
 *
 * 包含积木：
 *   - useCamera         (COMMAND) 切换当前相机
 *   - perspectiveCamera (OUTPUT) 创建透视相机
 *   - moveCamera        (COMMAND) 移动相机
 *   - rotationCamera    (COMMAND) 旋转相机
 *   - cameraLookAt      (COMMAND) 相机看向某点
 *   - '---'
 *   - getCameraPos      (REPORTER, disableMonitor) 获取相机位置
 *   - getCameraRotation (REPORTER, disableMonitor) 获取相机旋转
 */

import BlockGroup from '../BlockGroup.js'
import { RTW_Model_Box, Wrapper } from '../../utils/RTWTools.js'

export default class CameraGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.camera')
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            {
                opcode: 'useCamera',
                blockType: BT.COMMAND,
                text: t('useCamera'),
                arguments: {
                    camera: { type: AT.STRING, defaultValue: 'name' }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    engine.setActiveCamera(args.camera)
                }
            },
            {
                opcode: 'perspectiveCamera',
                blockType: BT.OUTPUT,
                text: t('perspectiveCamera'),
                arguments: {
                    fov: { type: AT.NUMBER, defaultValue: 40 },
                    aspect: {
                        type: AT.NUMBER,
                        defaultValue: (
                            ext.runtime.renderer.canvas.width /
                            ext.runtime.renderer.canvas.height
                        ).toFixed(2)
                    },
                    near: { type: AT.NUMBER, defaultValue: 0.1 },
                    far: { type: AT.NUMBER, defaultValue: 1000 }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    const THREE = ext.renderEngine.THREE
                    const cam = new THREE.PerspectiveCamera(
                        cast.toNumber(args.fov),
                        cast.toNumber(args.aspect),
                        cast.toNumber(args.near),
                        cast.toNumber(args.far)
                    )
                    return new Wrapper(
                        new RTW_Model_Box(cam, false, false, false, undefined)
                    )
                }
            },
            {
                opcode: 'moveCamera',
                blockType: BT.COMMAND,
                text: t('moveCamera'),
                arguments: {
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 },
                    z: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    engine.camera.position.set(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z)
                    )
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'rotationCamera',
                blockType: BT.COMMAND,
                text: t('rotationCamera'),
                arguments: {
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 },
                    z: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const THREE = engine.THREE
                    engine.camera.rotation.set(
                        THREE.MathUtils.degToRad(cast.toNumber(args.x)),
                        THREE.MathUtils.degToRad(cast.toNumber(args.y)),
                        THREE.MathUtils.degToRad(cast.toNumber(args.z))
                    )
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'cameraLookAt',
                blockType: BT.COMMAND,
                text: t('cameraLookAt'),
                arguments: {
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 },
                    z: { type: AT.NUMBER, defaultValue: 0 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    engine.camera.lookAt(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z)
                    )
                    engine.setDirty3D()
                }
            },
            '---',
            {
                opcode: 'getCameraPos',
                blockType: BT.REPORTER,
                text: t('getCameraPos'),
                disableMonitor: true,
                arguments: {
                    xyz: { type: AT.STRING, menu: 'xyz' }
                },
                handler: args => {
                    const cam = ext.renderEngine.camera
                    if (!cam) return // 旧版返回 undefined
                    switch (ext.cast.toString(args.xyz)) {
                        case 'x':
                            return cam.position.x
                        case 'y':
                            return cam.position.y
                        case 'z':
                            return cam.position.z
                    }
                }
            },
            {
                opcode: 'getCameraRotation',
                blockType: BT.REPORTER,
                text: t('getCameraRotation'),
                disableMonitor: true,
                arguments: {
                    xyz: { type: AT.STRING, menu: 'xyz' }
                },
                handler: args => {
                    const cam = ext.renderEngine.camera
                    if (!cam) return // 旧版返回 undefined
                    const THREE = ext.renderEngine.THREE
                    switch (ext.cast.toString(args.xyz)) {
                        case 'x':
                            return THREE.MathUtils.radToDeg(cam.rotation.x)
                        case 'y':
                            return THREE.MathUtils.radToDeg(cam.rotation.y)
                        case 'z':
                            return THREE.MathUtils.radToDeg(cam.rotation.z)
                    }
                }
            }
        ]
    }

    l10n() {
        return {
            'group.camera': { 'zh-cn': '📷相机', en: '📷Camera' },
            useCamera: {
                'zh-cn': '使用相机 [camera]',
                en: 'use camera [camera]'
            },
            perspectiveCamera: {
                'zh-cn':
                    '透视相机 视野 [fov] 宽高比 [aspect] 近裁面 [near] 远裁面 [far]',
                en: 'perspective camera fov [fov] aspect [aspect] near [near] far [far]'
            },
            moveCamera: {
                'zh-cn': '移动相机到 x [x] y [y] z [z]',
                en: 'move camera to x [x] y [y] z [z]'
            },
            rotationCamera: {
                'zh-cn': '旋转相机 x [x] y [y] z [z]',
                en: 'rotate camera x [x] y [y] z [z]'
            },
            cameraLookAt: {
                'zh-cn': '相机看向 x [x] y [y] z [z]',
                en: 'camera look at x [x] y [y] z [z]'
            },
            getCameraPos: {
                'zh-cn': '相机的 [xyz] 坐标',
                en: 'camera [xyz] position'
            },
            getCameraRotation: {
                'zh-cn': '相机的 [xyz] 旋转角度',
                en: 'camera [xyz] rotation'
            }
        }
    }
}
