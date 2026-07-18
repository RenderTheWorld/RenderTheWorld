/**
 * 光照分组 —— 点光源 / 方向光 / 聚光灯 / 面光源 / 环境光 / 半球光 / 阴影
 *
 * 包含积木：
 *   - pointLight                       (OUTPUT) 创建点光源
 *   - directionalLight                 (OUTPUT) 创建方向光
 *   - spotLight                        (OUTPUT) 创建聚光灯
 *   - rectAreaLight                    (OUTPUT) 创建面光源
 *   - setAmbientLightColor             (COMMAND) 设置环境光
 *   - setHemisphereLightColor          (COMMAND) 设置半球光
 *   - '---'
 *   - setDirectionalLightShadowCamera  (COMMAND) 设置方向光阴影相机
 *   - setLightMapSize                  (COMMAND) 设置灯光阴影贴图尺寸
 */

import BlockGroup from '../BlockGroup.js'
import { RTW_Model_Box, Wrapper } from '../../utils/RTWTools.js'

export default class LightingGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.light')
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            {
                opcode: 'pointLight',
                blockType: BT.OUTPUT,
                text: t('pointLight'),
                arguments: {
                    color: { type: AT.NUMBER },
                    intensity: { type: AT.NUMBER, defaultValue: 100 },
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 0 },
                    z: { type: AT.NUMBER, defaultValue: 0 },
                    decay: { type: AT.NUMBER, defaultValue: 2 },
                    YN: { type: AT.STRING, menu: 'YN' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    const THREE = ext.renderEngine.THREE
                    const light = new THREE.PointLight(
                        cast.toNumber(args.color),
                        cast.toNumber(args.intensity),
                        0,
                        cast.toNumber(args.decay)
                    )
                    light.position.set(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z)
                    )
                    light.shadow.bias = -0.00005
                    if (cast.toString(args.YN) === 'true') {
                        light.castShadow = true
                    }
                    return new Wrapper(
                        new RTW_Model_Box(light, false, false, false, undefined)
                    )
                }
            },
            {
                opcode: 'directionalLight',
                blockType: BT.OUTPUT,
                text: t('directionalLight'),
                arguments: {
                    color: { type: AT.NUMBER },
                    intensity: { type: AT.NUMBER, defaultValue: 100 },
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 1 },
                    z: { type: AT.NUMBER, defaultValue: 0 },
                    x2: { type: AT.NUMBER, defaultValue: 0 },
                    y2: { type: AT.NUMBER, defaultValue: 1 },
                    z2: { type: AT.NUMBER, defaultValue: 0 },
                    YN: { type: AT.STRING, menu: 'YN' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    const THREE = ext.renderEngine.THREE
                    const light = new THREE.DirectionalLight(
                        cast.toNumber(args.color),
                        cast.toNumber(args.intensity)
                    )
                    light.position.set(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z)
                    )
                    // 修复：旧版误用光源位置 (x,y,z) 作为 target.position，
                    // 导致 x2/y2/z2 参数完全无效。正确应使用目标位置 (x2,y2,z2)。
                    light.target.position.set(
                        cast.toNumber(args.x2),
                        cast.toNumber(args.y2),
                        cast.toNumber(args.z2)
                    )
                    light.shadow.bias = -0.00005
                    if (cast.toString(args.YN) === 'true') {
                        light.castShadow = true
                    }
                    light.shadow.camera.left = -20
                    light.shadow.camera.right = 20
                    light.shadow.camera.top = 20
                    light.shadow.camera.bottom = -20
                    light.shadow.camera.near = 0.1
                    light.shadow.camera.far = 1000
                    return new Wrapper(
                        new RTW_Model_Box(light, false, false, false, undefined)
                    )
                }
            },
            {
                opcode: 'spotLight',
                blockType: BT.OUTPUT,
                text: t('spotLight'),
                arguments: {
                    color: { type: AT.NUMBER },
                    intensity: { type: AT.NUMBER, defaultValue: 100 },
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 5 },
                    z: { type: AT.NUMBER, defaultValue: 0 },
                    tx: { type: AT.NUMBER, defaultValue: 0 },
                    ty: { type: AT.NUMBER, defaultValue: 0 },
                    tz: { type: AT.NUMBER, defaultValue: 0 },
                    angle: { type: AT.NUMBER, defaultValue: 30 },
                    penumbra: { type: AT.NUMBER, defaultValue: 0.2 },
                    decay: { type: AT.NUMBER, defaultValue: 2 },
                    YN: { type: AT.STRING, menu: 'YN' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    const THREE = ext.renderEngine.THREE
                    const light = new THREE.SpotLight(
                        cast.toNumber(args.color),
                        cast.toNumber(args.intensity),
                        0,
                        THREE.MathUtils.degToRad(cast.toNumber(args.angle)),
                        cast.toNumber(args.penumbra),
                        cast.toNumber(args.decay)
                    )
                    light.position.set(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z)
                    )
                    light.target.position.set(
                        cast.toNumber(args.tx),
                        cast.toNumber(args.ty),
                        cast.toNumber(args.tz)
                    )
                    light.shadow.bias = -0.00005
                    if (cast.toString(args.YN) === 'true') {
                        light.castShadow = true
                    }
                    return new Wrapper(
                        new RTW_Model_Box(light, false, false, false, undefined)
                    )
                }
            },
            {
                opcode: 'rectAreaLight',
                blockType: BT.OUTPUT,
                text: t('rectAreaLight'),
                arguments: {
                    color: { type: AT.NUMBER },
                    intensity: { type: AT.NUMBER, defaultValue: 100 },
                    width: { type: AT.NUMBER, defaultValue: 10 },
                    height: { type: AT.NUMBER, defaultValue: 10 },
                    x: { type: AT.NUMBER, defaultValue: 0 },
                    y: { type: AT.NUMBER, defaultValue: 5 },
                    z: { type: AT.NUMBER, defaultValue: 0 },
                    tx: { type: AT.NUMBER, defaultValue: 0 },
                    ty: { type: AT.NUMBER, defaultValue: 0 },
                    tz: { type: AT.NUMBER, defaultValue: 0 }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    const THREE = ext.renderEngine.THREE
                    const light = new THREE.RectAreaLight(
                        cast.toNumber(args.color),
                        cast.toNumber(args.intensity),
                        cast.toNumber(args.width),
                        cast.toNumber(args.height)
                    )
                    light.position.set(
                        cast.toNumber(args.x),
                        cast.toNumber(args.y),
                        cast.toNumber(args.z)
                    )
                    light.lookAt(
                        cast.toNumber(args.tx),
                        cast.toNumber(args.ty),
                        cast.toNumber(args.tz)
                    )
                    return new Wrapper(
                        new RTW_Model_Box(light, false, false, false, undefined)
                    )
                }
            },
            {
                opcode: 'setAmbientLightColor',
                blockType: BT.COMMAND,
                text: t('setAmbientLightColor'),
                arguments: {
                    color: { type: AT.NUMBER },
                    intensity: { type: AT.NUMBER, defaultValue: 1 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.scene) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const THREE = engine.THREE
                    if (!engine.lights.ambient) {
                        engine.lights.ambient = new THREE.AmbientLight(0x000000)
                        engine.scene.add(engine.lights.ambient)
                    }
                    engine.lights.ambient.color = new THREE.Color(
                        cast.toNumber(args.color)
                    )
                    engine.lights.ambient.intensity = cast.toNumber(
                        args.intensity
                    )
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'setHemisphereLightColor',
                blockType: BT.COMMAND,
                text: t('setHemisphereLightColor'),
                arguments: {
                    skyColor: { type: AT.NUMBER },
                    groundColor: { type: AT.NUMBER },
                    intensity: { type: AT.NUMBER, defaultValue: 1 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.scene) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const THREE = engine.THREE
                    if (!engine.lights.hemisphere) {
                        engine.lights.hemisphere = new THREE.HemisphereLight(
                            0x000000,
                            0x000000
                        )
                        engine.scene.add(engine.lights.hemisphere)
                    }
                    engine.lights.hemisphere.color = new THREE.Color(
                        cast.toNumber(args.skyColor)
                    )
                    engine.lights.hemisphere.groundColor = new THREE.Color(
                        cast.toNumber(args.groundColor)
                    )
                    engine.lights.hemisphere.intensity = cast.toNumber(
                        args.intensity
                    )
                    engine.setDirty3D()
                }
            },
            '---',
            {
                opcode: 'setDirectionalLightShadowCamera',
                blockType: BT.COMMAND,
                text: t('setDirectionalLightShadowCamera'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    left: { type: AT.NUMBER, defaultValue: -20 },
                    right: { type: AT.NUMBER, defaultValue: 20 },
                    top: { type: AT.NUMBER, defaultValue: 20 },
                    bottom: { type: AT.NUMBER, defaultValue: -20 },
                    near: { type: AT.NUMBER, defaultValue: 0.1 },
                    far: { type: AT.NUMBER, defaultValue: 1000 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    if (model.type !== 'DirectionalLight') {
                        return `⚠️'${cast.toString(args.name)}'不是平行光！`
                    }
                    const cam = model.shadow.camera
                    cam.left = cast.toNumber(args.left)
                    cam.right = cast.toNumber(args.right)
                    cam.top = cast.toNumber(args.top)
                    cam.bottom = cast.toNumber(args.bottom)
                    cam.near = cast.toNumber(args.near)
                    cam.far = cast.toNumber(args.far)
                    cam.updateProjectionMatrix()
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'setLightMapSize',
                blockType: BT.COMMAND,
                text: t('setLightMapSize'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    xsize: { type: AT.NUMBER, defaultValue: 512 },
                    ysize: { type: AT.NUMBER, defaultValue: 512 }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const model = engine.getModel(args.name)
                    if (!model) return '⚠️传入的名称或物体有误！'
                    if (!model.isLight) {
                        return `⚠️'${cast.toString(args.name)}'不是光源！`
                    }
                    model.shadow.mapSize.set(
                        cast.toNumber(args.xsize),
                        cast.toNumber(args.ysize)
                    )
                    if (model.shadow.map) {
                        model.shadow.map.dispose()
                        model.shadow.map = null
                    }
                    engine.setDirty3D()
                }
            }
        ]
    }

    l10n() {
        return {
            'group.light': { 'zh-cn': '🕯️光照', en: '🕯️Lights' },
            pointLight: {
                'zh-cn':
                    '<点光源>  颜色 [color] 光照强度 [intensity] 位置 x [x] y [y] z [z] 衰减量 [decay] [YN] 投射阴影',
                en: '<point light> color [color] intensity [intensity] pos x [x] y [y] z [z] decay [decay] [YN] shadow'
            },
            directionalLight: {
                'zh-cn':
                    '<平行光> 颜色 [color] 光照强度 [intensity] 位置 x [x] y [y] z [z] 目标 x [x2] y [y2] z [z2] [YN] 投射阴影',
                en: '<directional light> color [color] intensity [intensity] pos x [x] y [y] z [z] target x [x2] y [y2] z [z2] [YN] shadow'
            },
            spotLight: {
                'zh-cn':
                    '<聚光灯> 颜色 [color] 强度 [intensity] 位置 x [x] y [y] z [z] 目标 x [tx] y [ty] z [tz] 角度 [angle]° 半影 [penumbra] 衰减 [decay] [YN] 阴影',
                en: '<spot light> color [color] intensity [intensity] pos x [x] y [y] z [z] target x [tx] y [ty] z [tz] angle [angle]° penumbra [penumbra] decay [decay] [YN] shadow'
            },
            rectAreaLight: {
                'zh-cn':
                    '<矩形面光源> 颜色 [color] 强度 [intensity] 宽 [width] 高 [height] 位置 x [x] y [y] z [z] 朝向 x [tx] y [ty] z [tz]',
                en: '<rect area light> color [color] intensity [intensity] w [width] h [height] pos x [x] y [y] z [z] look x [tx] y [ty] z [tz]'
            },
            setAmbientLightColor: {
                'zh-cn': '将环境光的颜色设为 [color] 光照强度设为 [intensity]',
                en: 'set ambient light color to [color] intensity to [intensity]'
            },
            setHemisphereLightColor: {
                'zh-cn':
                    '将半球光天空颜色设为 [skyColor] 地面颜色设为 [groundColor] 光照强度设为 [intensity]',
                en: 'set hemisphere light sky to [skyColor] ground to [groundColor] intensity to [intensity]'
            },
            setDirectionalLightShadowCamera: {
                'zh-cn':
                    '将平行光 [name] 的阴影相机设为近 [near] 远 [far] 左 [left] 右 [right] 上 [top] 下 [bottom]',
                en: 'set directional light [name] shadow cam to near [near] far [far] l [left] r [right] t [top] b [bottom]'
            },
            setLightMapSize: {
                'zh-cn': '将灯光 [name] 的阴影贴图尺寸宽设为 [xsize] 高设为 [ysize]',
                en: 'set light [name] shadow map size to w [xsize] h to [ysize]'
            }
        }
    }
}
