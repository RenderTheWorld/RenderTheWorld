/**
 * 模型分组 —— 模型创建、导入、销毁、阴影
 *
 * 包含积木：
 *   - objectLoadingCompleted (EVENT) 模型加载完成事件帽
 *   - importModel            (COMMAND) 导入模型到场景
 *   - destroyObject          (COMMAND, dynamicArgsInfo) 销毁对象（可扩展多名称）
 *   - getObjectByName        (OUTPUT) 按名称获取对象
 *   - cubeModel              (OUTPUT) 创建长方体模型
 *   - sphereModel            (OUTPUT) 创建球体模型
 *   - planeModel             (OUTPUT) 创建平面模型
 *   - objModel               (OUTPUT) 创建 OBJ 模型占位
 *   - gltfModel              (OUTPUT) 创建 GLTF 模型占位
 *   - groupModel             (OUTPUT, dynamicArgsInfo) 组合多个模型为 Group
 *   - shadowSettings         (COMMAND) 设置对象投射/被投射阴影
 */

import BlockGroup from '../BlockGroup.js'
import { RTW_Model_Box, Wrapper } from '../../utils/RTWTools.js'
import { getDynamicArgs } from '../../utils/extendableBlock.js'

export default class ModelGroup extends BlockGroup {
    static groupId = 'Objects'
    constructor(ctx) {
        super(ctx)
        this.label = this.translate('group.objects')
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            {
                opcode: 'objectLoadingCompleted',
                blockType: BT.EVENT,
                text: t('objectLoadingCompleted'),
                isEdgeActivated: false,
                shouldRestartExistingThreads: false,
                arguments: {
                    name: {
                        type: AT.CCW_HAT_PARAMETER,
                        defaultValue: 'name',
                    }
                }
            },
            {
                opcode: 'importModel',
                blockType: BT.COMMAND,
                text: t('importModel'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    model: { type: null, defaultValue: '' }
                },
                handler: args => this._importModel(args)
            },
            {
                opcode: 'destroyObject',
                blockType: BT.COMMAND,
                text: t('destroyObject'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' }
                },
                dynamicArgsInfo: {
                    defaultValues: i => `name${i + 2}`,
                    afterArg: 'name',
                    joinCh: ', ',
                    dynamicArgTypes: ['s']
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    engine.removeObject(
                        cast ? cast.toString(args.name) : String(args.name)
                    )
                    getDynamicArgs(args).forEach(n => {
                        engine.removeObject(cast ? cast.toString(n) : String(n))
                    })
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'getObjectByName',
                blockType: BT.OUTPUT,
                text: t('getObjectByName'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const engine = ext.renderEngine
                    const cast = ext.cast
                    const name = cast
                        ? cast.toString(args.name)
                        : String(args.name)
                    if (!(name in engine.objects)) return ''
                    let anim = undefined
                    if (name in engine.animations)
                        anim = engine.animations[name]
                    return new Wrapper(
                        new RTW_Model_Box(
                            engine.objects[name],
                            false,
                            false,
                            false,
                            anim
                        )
                    )
                }
            },
            {
                opcode: 'cubeModel',
                blockType: BT.OUTPUT,
                text: t('cubeModel'),
                arguments: {
                    a: { type: AT.NUMBER, defaultValue: 5 },
                    b: { type: AT.NUMBER, defaultValue: 5 },
                    h: { type: AT.NUMBER, defaultValue: 5 },
                    material: { type: null, defaultValue: '' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => this._cubeModel(args)
            },
            {
                opcode: 'sphereModel',
                blockType: BT.OUTPUT,
                text: t('sphereModel'),
                arguments: {
                    radius: { type: AT.NUMBER, defaultValue: 3 },
                    w: { type: AT.NUMBER, defaultValue: 32 },
                    h: { type: AT.NUMBER, defaultValue: 16 },
                    material: { type: null, defaultValue: '' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => this._sphereModel(args)
            },
            {
                opcode: 'planeModel',
                blockType: BT.OUTPUT,
                text: t('planeModel'),
                arguments: {
                    a: { type: AT.NUMBER, defaultValue: 5 },
                    b: { type: AT.NUMBER, defaultValue: 5 },
                    material: { type: null, defaultValue: '' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => this._planeModel(args)
            },
            {
                opcode: 'objModel',
                blockType: BT.OUTPUT,
                text: t('objModel'),
                arguments: {
                    objfile: { type: AT.STRING, menu: 'obj_file_list' },
                    mtlfile: { type: AT.STRING, menu: 'mtl_file_list' },
                    material: { type: null, defaultValue: '' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args =>
                    new Wrapper(
                        new RTW_Model_Box(
                            { objfile: args.objfile, mtlfile: args.mtlfile },
                            false,
                            true,
                            false,
                            undefined
                        )
                    )
            },
            {
                opcode: 'gltfModel',
                blockType: BT.OUTPUT,
                text: t('gltfModel'),
                arguments: {
                    gltffile: { type: AT.STRING, menu: 'gltf_file_list' },
                    material: { type: null, defaultValue: '' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args =>
                    new Wrapper(
                        new RTW_Model_Box(
                            { gltffile: args.gltffile },
                            false,
                            false,
                            true,
                            undefined
                        )
                    )
            },
            {
                opcode: 'groupModel',
                blockType: BT.OUTPUT,
                text: t('groupModel'),
                arguments: {},
                dynamicArgsInfo: {
                    defaultValues: 'MODEL',
                    dynamicArgTypes: ['s'],
                    joinCh: ', ',
                    preText: n =>
                        n === 0 ? t('groupModel') : `${t('groupModel')}[`,
                    endText: n => (n === 0 ? '' : ']')
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const engine = ext.renderEngine
                    const THREE = engine.THREE
                    const group = new THREE.Group()
                    getDynamicArgs(args).forEach(m => {
                        const obj = engine.getModel(m)
                        if (obj) group.add(obj)
                    })
                    return new Wrapper(
                        new RTW_Model_Box(group, false, false, false, undefined)
                    )
                }
            },
            {
                opcode: 'shadowSettings',
                blockType: BT.COMMAND,
                text: t('shadowSettings'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    YN: { type: AT.STRING, menu: 'YN' },
                    YN2: { type: AT.STRING, menu: 'YN' }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    if (!engine.tc) return '⚠️显示器未初始化！'
                    const cast = ext.cast
                    const model = engine.getModel(args.name)
                    if (!model) return // 旧版 model 无效时静默返回
                    const castYn = cast
                        ? cast.toString(args.YN)
                        : String(args.YN)
                    const castYn2 = cast
                        ? cast.toString(args.YN2)
                        : String(args.YN2)
                    const setShadow = (prop, on) => {
                        model[prop] = on
                        model.traverse(node => {
                            if (node.isMesh) node[prop] = on
                        })
                    }
                    setShadow('castShadow', castYn === 'true')
                    setShadow('receiveShadow', castYn2 === 'true')
                    engine.setDirty3D()
                }
            }
        ]
    }

    registerMenus() {
        // Gandi 资源文件列表（动态菜单）
        // scratch-vm 要求动态菜单 items 为字符串（扩展实例上的方法名）
        // 方法在 index.js 的 RenderTheWorld 构造函数中定义
        this.core.registerMenu('obj_file_list', {
            acceptReporters: true,
            items: '__gandiAssetsObjFileList'
        })
        this.core.registerMenu('mtl_file_list', {
            acceptReporters: true,
            items: '__gandiAssetsMtlFileList'
        })
        this.core.registerMenu('gltf_file_list', {
            acceptReporters: true,
            items: '__gandiAssetsGltfFileList'
        })
    }

    // ============== 模型创建辅助 ==============

    _unwrapMaterial(material) {
        const m = Wrapper.unwrap(material)
        if (m === undefined) return undefined
        if (!(m instanceof RTW_Model_Box) || !m.ismaterial)
            return '⚠️材质无效！'
        return m.model
    }

    _cubeModel({ a, b, h, material }) {
        const ext = this.ext
        const THREE = ext.renderEngine.THREE
        const cast = ext.cast
        const mat = this._unwrapMaterial(material)
        if (typeof mat === 'string') return mat
        const geo = new THREE.BoxGeometry(
            cast.toNumber(a),
            cast.toNumber(b),
            cast.toNumber(h)
        )
        return new Wrapper(
            new RTW_Model_Box(
                new THREE.Mesh(geo, mat),
                false,
                false,
                false,
                undefined
            )
        )
    }

    _sphereModel({ radius, w, h, material }) {
        const ext = this.ext
        const THREE = ext.renderEngine.THREE
        const cast = ext.cast
        const mat = this._unwrapMaterial(material)
        if (typeof mat === 'string') return mat
        const geo = new THREE.SphereGeometry(
            cast.toNumber(radius),
            cast.toNumber(w),
            cast.toNumber(h)
        )
        return new Wrapper(
            new RTW_Model_Box(
                new THREE.Mesh(geo, mat),
                false,
                false,
                false,
                undefined
            )
        )
    }

    _planeModel({ a, b, material }) {
        const ext = this.ext
        const THREE = ext.renderEngine.THREE
        const cast = ext.cast
        const mat = this._unwrapMaterial(material)
        if (typeof mat === 'string') return mat
        const geo = new THREE.PlaneGeometry(cast.toNumber(a), cast.toNumber(b))
        return new Wrapper(
            new RTW_Model_Box(
                new THREE.Mesh(geo, mat),
                false,
                false,
                false,
                undefined
            )
        )
    }

    _getFileURL(filename) {
        const runtime = this.ext.runtime
        try {
            const content = runtime.getGandiAssetContent(filename)
            return content ? content.encodeDataURI() : ''
        } catch {
            return ''
        }
    }

    _importModel({ name, model }) {
        const ext = this.ext
        const engine = ext.renderEngine
        const cast = ext.cast
        if (!engine.tc) return '⚠️显示器未初始化！'
        if (model === undefined) return '⚠️模型加载失败！'

        const unwrapped = Wrapper.unwrap(model)
        if (!(unwrapped instanceof RTW_Model_Box)) return '⚠️传入的模型无法识别'

        name = cast.toString(name)
        // 创建会话令牌，用于异步加载完成后校验会话是否仍有效
        const sessionToken = engine.createSessionToken()
        engine.removeObject(name)

        if (unwrapped.model != null && unwrapped.model.isObject3D) {
            engine.objects[name] = unwrapped.model
            if (unwrapped.animations != null) {
                engine.animations[name] = unwrapped.animations
            }
            // 仅在会话仍有效时添加到场景
            if (engine.isSessionValid(sessionToken) && engine.scene) {
                engine.scene.add(engine.objects[name])
                engine.objects[name].name = name
            }
            engine.triggerObjectLoaded(name)
            engine.setDirty3D()
        } else if (unwrapped.isobj) {
            this._loadObj(
                name,
                unwrapped.model.objfile,
                unwrapped.model.mtlfile,
                sessionToken
            )
        } else if (unwrapped.isgltf) {
            this._loadGltf(name, unwrapped.model.gltffile, sessionToken)
        }
    }

    _loadObj(name, objfile, mtlfile, sessionToken) {
        const ext = this.ext
        const engine = ext.renderEngine
        const cast = ext.cast
        const objLoader = new engine.OBJLoader()
        const mtlLoader = new engine.MTLLoader()

        mtlLoader.load(this._getFileURL(cast.toString(mtlfile)), mtl => {
            if (engine._destroyed) return
            mtl.preload()
            objLoader.setMaterials(mtl)
            objLoader.load(this._getFileURL(cast.toString(objfile)), root => {
                if (engine._destroyed) return
                // 会话校验：防止快速重启项目导致重复添加
                if (!engine.isSessionValid(sessionToken)) return
                engine.objects[name] = root
                if (engine.scene) engine.scene.add(root)
                root.name = name
                engine.triggerObjectLoaded(name)
                engine.setDirty3D()
            })
        })
    }

    _loadGltf(name, gltffile, sessionToken) {
        const ext = this.ext
        const engine = ext.renderEngine
        const cast = ext.cast
        const THREE = engine.THREE
        const gltfLoader = new engine.GLTFLoader()

        gltfLoader.load(this._getFileURL(cast.toString(gltffile)), gltf => {
            if (engine._destroyed) return
            // 会话校验：防止快速重启项目导致重复添加
            if (!engine.isSessionValid(sessionToken)) return
            const root = gltf.scene
            const mixer = new THREE.AnimationMixer(root)
            engine.animations[name] = {
                mixer,
                clips: gltf.animations,
                action: {}
            }
            engine.objects[name] = root
            if (engine.scene) engine.scene.add(root)
            root.name = name
            engine.triggerObjectLoaded(name)
            engine.setDirty3D()
        })
    }

    l10n() {
        return {
            'group.objects': { 'zh-cn': '🧸物体', en: '🧸Objects' },
            objectLoadingCompleted: {
                'zh-cn': '当名为 [name] 的对象导入或重置完成时',
                en: 'when object named [name] imported or reset'
            },
            importModel: {
                'zh-cn': '导入或重置名为 [name] 的对象 [model]',
                en: 'import or reset object named [name] [model]'
            },
            destroyObject: {
                'zh-cn': '销毁对象 [name]',
                en: 'destroy object [name]'
            },
            getObjectByName: {
                'zh-cn': '名为 [name] 的对象',
                en: 'object named [name]'
            },
            cubeModel: {
                'zh-cn': '<长方体> 长 [a] 宽 [b] 高 [h] 材质 [material]',
                en: '<cube> length [a] width [b] height [h] material [material]'
            },
            sphereModel: {
                'zh-cn':
                    '<球体> 半径 [radius] 水平分段数 [w] 垂直分段数 [h] 材质 [material]',
                en: '<sphere> radius [radius] widthSegments [w] heightSegments [h] material [material]'
            },
            planeModel: {
                'zh-cn': '<平面> 长 [a] 宽 [b] 材质 [material]',
                en: '<plane> length [a] width [b] material [material]'
            },
            objModel: {
                'zh-cn': '<OBJ模型> OBJ文件 [objfile] MTL文件 [mtlfile]',
                en: '<OBJ model> OBJ file [objfile] MTL file [mtlfile]'
            },
            gltfModel: {
                'zh-cn': '<GLTF模型> GLTF文件 [gltffile]',
                en: '<GLTF model> GLTF file [gltffile]'
            },
            groupModel: { 'zh-cn': '<组> ', en: '<group> ' },
            shadowSettings: {
                'zh-cn':
                    '让对象 [name] [YN] 产生阴影, [YN2] 接收阴影',
                en: 'let object [name] cast shadows [YN] receive shadows [YN2]'
            },
            fileListEmpty: { 'zh-cn': '没有文件', en: 'no file' },
        }
    }
}
