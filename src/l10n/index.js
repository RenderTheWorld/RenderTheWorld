// Contains l10n

export default {
  'zh-cn': {
    'name': '渲染世界',
    'fileListEmpty': '没有文件',
    'apidocs': '📖API文档',
    'objectLoadingCompleted': '当 [name] 对象加载完成时',
    'set3dState': '设置3D显示器状态为: [state]',
    'get3dState': '​3D显示器是显示的?',
    '3dState.display': '显示',
    '3dState.hidden': '隐藏',
    'material.Basic': '基础',
    'material.Lambert': 'Lambert',
    'material.Phong': 'Phong',

    'init':
      '初始化并设置背景颜色为 [color] 大小 [sizex] x [sizey] y [ed] 抗锯齿，阴影类型: [shadowMapType]',
    'ed.enable': '启用',
    'ed.disable': '禁用',
    'color_RGB': 'RGB颜色: [R] [G] [B]',
    'tools': '🛠️工具',
    'YN.true': '能',
    'YN.false': '不能',
    'YN2.yes': '有',
    'YN2.no': '没有',
    'isWebGLAvailable': '兼容性检查',
    '_isWebGLAvailable': '当前设备支持WebGL吗?',

    'objects': '🧸物体',
    'Material': '材质',
    'Model': '模型',
    'Move': '动作',
    'Animation': '动画',
    'makeCube':
      '创建或重置长方体: [name] 长 [a] 宽 [b] 高 [h] 颜色: [color] 位置: x [x] y [y] z [z] [YN] 投射阴影 [YN2] 被投射阴影',
    'makeSphere':
      '创建或重置球体: [name] 半径 [radius] 水平分段数 [w] 垂直分段数 [h] 颜色: [color] 位置: x [x] y [y] z [z] [YN] 投射阴影 [YN2] 被投射阴影',
    'makePlane':
      '创建或重置平面: [name] 长 [a] 宽 [b] 颜色: [color] 位置: x [x] y [y] z [z] [YN] 投射阴影 [YN2] 被投射阴影',
    'importOBJ':
      '导入或重置OBJ模型: [name] OBJ模型文件: [objfile] MTL材质文件: [mtlfile] 位置: x [x] y [y] z [z] [YN] 投射阴影 [YN2] 被投射阴影',
    'importGLTF':
      '导入或重置GLTF模型: [name] GLTF模型文件: [gltffile] 位置: x [x] y [y] z [z] [YN] 投射阴影 [YN2] 被投射阴影',

    'cubeModel': '<长方体> 长 [a] 宽 [b] 高 [h] 材质 [material]',
    'sphereModel':
      '<球体> 半径 [radius] 水平分段数 [w] 垂直分段数 [h] 材质 [material]',
    'planeModel': '<平面> 长 [a] 宽 [b] 材质 [material]',
    'objModel': '<OBJ模型> OBJ文件 [objfile] MTL文件 [mtlfile]',
    'gltfModel': '<GLTF模型> GLTF文件 [gltffile]',
    'groupModel': '<组> ',

    'importModel': '导入或重置: 名称 [name] 对象 [model]',
    'shadowSettings':
      '设置 [name] 的阴影设置: [YN] 投射阴影 [YN2] 被投射阴影',
    'makeMaterial': '创建材质',
    'setMaterialColor': '设置当前材质颜色 [color]',
    'setMaterialFog': '设置当前材质 [YN] 受雾效果影响',
    'returnm': '材质创建完成 [material]',

    'playAnimation': '启动模型: [name] 的动画 [animationName]',
    'stopAnimation': '结束模型: [name] 的动画 [animationName]',
    'updateAnimation':
      '推进模型: [name] 的动画 [time] 秒 并更新',
    'getAnimation': '获取模型: [name] 的所有动画',

    'rotationObject': '将: [name] 旋转: x [x] y [y] z [z]',
    'moveObject': '将: [name] 移动到: x [x] y [y] z [z]',
    'scaleObject': '将: [name] 缩放: x [x] y [y] z [z]',

    'getObjectPos': '获取物体: [name] 的 [xyz] 坐标',
    'getObjectRotation': '获取物体: [name] [xyz] 的旋转角度',
    'getObjectScale': '获取物体: [name] [xyz] 的缩放',

    'destroyObject': '销毁: [name]',
    'getObjectByNmae': '名称为 [name] 的物体',

    'getChildrenNumInObject': '获取物体: [name] 中的子物体数量',
    'getChildrenInObject': '获取物体: [name] 中的第 [num] 个子物体',
    'getChildrenInObject.joinCh': '个子物体中的第',
    'getChildrenInObject.preText': '中的第',
    'getChildrenInObjectByName': '获取物体: [name] 中第一个名为 [name2] 的子物体',
    'addChildren': '给物体: [name] 添加子物体: [name2]',
    'removeChildren': '给物体: [name] 删除子物体: [name2]',

    'getScene': '场景',

    'xyz.x': 'x轴',
    'xyz.y': 'y轴',
    'xyz.z': 'z轴',

    'lights': '🕯️光照',
    'setAmbientLightColor':
      '设置环境光颜色: [color] 光照强度: [intensity]',
    'setHemisphereLightColor':
      '设置半球光天空颜色: [skyColor] 地面颜色: [groundColor] 光照强度: [intensity]',
    'makePointLight':
      '创建或重置点光源: [name] 颜色: [color] 光照强度: [intensity] 位置: x [x] y [y] z [z] 衰减量 [decay] [YN] 投射阴影',
    'makeDirectionalLight':
      '创建或重置方向光: [name] 颜色: [color] 光照强度: [intensity] 位置: x [x] y [y] z [z] 指向: x [x2] y [y2] z [z2] [YN] 投射阴影',

    'pointLight':
      '<点光源> 颜色: [color] 光照强度: [intensity] 位置: x [x] y [y] z [z] 衰减量 [decay] [YN] 投射阴影',
    'directionalLight':
      '<方向光> 颜色: [color] 光照强度: [intensity] 位置: x [x] y [y] z [z] 指向: x [x2] y [y2] z [z2] [YN] 投射阴影',

    'setDirectionalLightShawdowCamera':
      '设置方向光: [name] 的阴影投射范围 left: [left] right: [right] top: [top] bottom: [bottom] near: [near] far: [far]',
    'setLightMapSize':
      '设置光源: [name] 的阴影纹理分辨率为: x [xsize] y [ysize]',
    'moveLight': '将光源: [name] 移动到: x [x] y [y] z [z]',
    'getLightPos': '获取光源: [name] 的 [xyz] 坐标',

    'camera': '📷相机',
    'perspectiveCamera': '<相机> 透视投影相机 fov [fov] aspect [aspect] near [near] far [far]',
    'useCamera': '用相机 [camera] 渲染3D场景',
    'moveCamera': '将相机移动到x [x] y [y] z [z]',
    'rotationCamera': '将相机旋转: x [x] y [y] z [z]',
    'cameraLookAt': '让相机面向: x [x] y [y] z [z]',
    'getCameraPos': '获取相机 [xyz] 坐标',
    'getCameraRotation': '获取相机 [xyz] 的旋转角度',

    'control': '🎚️控制模块',
    'createOrbitControls': '<轨道控制器> 绑定 [name]',
    'updateControls': '更新控制器 [name]',
    
    'setControlState': '鼠标 [YN] 使用控制器 [name]',
    'mouseCanControl': '鼠标能使用控制器 [name] 吗?',
    'mouseControl': '控制器 [name] : [yn1] 右键拖拽 [yn2] 中键缩放 [yn3] 左键旋转',
    'setControlDamping': '使用控制器 [name] : [YN2] 惯性',
    'setControlDampingNum': '设置控制器 [name] 的惯性系数 [num]',
    'setOrbitControlsTarget': '设置轨道控制器 [name] 的焦点 x [x] y [y] z [z]',

    'fogs': '🌫️雾',
    'enableFogEffect':
      '启用雾效果并设置雾颜色为: [color] near [near] far [far]',
    'disableFogEffect': '禁用雾效果',

    // tooltips
    'objectLoadingCompleted.tooltip': '当对象加载完成时触发',
    'set3dState.tooltip': '设置3D显示器是否显示',
    'get3dState.tooltip': '判断​3D显示器是否显示',

    'init.tooltip':
      '初始化扩展模块，设置背景颜色、渲染大小、是否开启抗锯齿和阴影类型',
    'color_RGB.tooltip': 'RGB颜色',
    'isWebGLAvailable.tooltip': 'WebGL兼容性检查',
    '_isWebGLAvailable.tooltip': '当前设备支持WebGL吗?',

    'makeCube.tooltip': '创建或重置长方体',
    'makeSphere.tooltip': '创建或重置球体',
    'makePlane.tooltip': '创建或重置平面',
    'importOBJ.tooltip': '导入或重置OBJ模型',
    'importGLTF.tooltip': '导入或重置GLTF模型',

    'cubeModel.tooltip':
      '创建一个长方体，返回一个模型对象，可直接在“导入或重置”积木中使用',
    'sphereModel.tooltip':
      '创建一个球体，返回一个模型对象，可直接在“导入或重置”积木中使用',
    'planeModel.tooltip':
      '创建一个平面，返回一个模型对象，可直接在“导入或重置”积木中使用',
    'objModel.tooltip':
      '导入OBJ模型，返回一个模型对象，可直接在“导入或重置”积木中使用',
    'gltfModel.tooltip':
      '导入GLTF模型，返回一个模型对象，可直接在“导入或重置”积木中使用',
    'pointLight.tooltip':
      '创建一个点光源，返回一个模型对象，可直接在“导入或重置”积木中使用',
    'directionalLight.tooltip':
      '创建一个平行光，返回一个模型对象，可直接在“导入或重置”积木中使用',
    'groupModel.tooltip':
      '创建一个对象组，返回一个组对象，可直接在“导入或重置”积木中使用',

    'importModel.tooltip': '导入或重置对象',
    'shadowSettings.tooltip': '设置对象的阴影设置',
    'makeMaterial.tooltip':
      '创建一个材质，可直接在“导入或重置”积木中使用，如非必要，推荐多个模型共用一个材质',
    'setMaterialColor.tooltip':
      '设置当前材质颜色，在“创建材质”积木中使用',
    'setMaterialFog.tooltip':
      '设置当前材质是否受雾效果影响，在“创建材质”积木中使用',
    'returnm.tooltip': '材质创建完成，必须在“创建材质”积木中使用',

    'playAnimation.tooltip': '启动模型的动画',
    'stopAnimation.tooltip': '结束模型的动画',
    'updateAnimation.tooltip': '推进模型的动画并更新',
    'getAnimation.tooltip':
      '获取模型的所有动画，返回一个字符串化列表',

    'rotationObject.tooltip': '旋转物体',
    'moveObject.tooltip': '移动物体',
    'scaleObject.tooltip': '缩放物体',

    'getObjectPos.tooltip': '获取对象的任意xyz坐标',
    'getObjectRotation.tooltip': '获取对象任意xyz轴的旋转角度',
    'getObjectScale.tooltip': '获取对象任意xyz轴的缩放',

    'destroyObject.tooltip': '销毁物体',
    'getObjectByNmae.tooltip':
      '通过导入时设置的名称获取对应的物体',

    'getChildrenNumInObject.tooltip':
      '获得某个物体中的子物体数量（不包含子物体的子物体数量，子物体可能也有子物体），如果没有这个物体返回-1',
    'getChildrenInObject.tooltip':
      '获得某个物体中的第几个子物体，如果没有这个子物体返回一个空字符串（""）',
    'getChildrenInObjectByName.tooltip': '获得某个物体中第一个叫某个名字的子物体，如果没有这个子物体返回一个空字符串（""）',
    'addChildren.tooltip': '给某个物体添加子物体',
    'removeChildren.tooltip': '给某个物体删除子物体',

    'getScene.tooltip': '得到场景实例（未初始化前是null）',

    'setAmbientLightColor.tooltip': '设置环境光颜色',
    'setHemisphereLightColor.tooltip': '设置半球光天空颜色',
    'setDirectionalLightShawdowCamera.tooltip':
      '设置方向光的阴影投射范围',
    'setLightMapSize.tooltip': '设置光源的阴影纹理分辨率',

    'perspectiveCamera.tooltip': '创建一个透视投影相机',
    'useCamera.tooltip': '指定渲染3D场景的相机',
    'moveCamera.tooltip': '移动相机',
    'rotationCamera.tooltip': '旋转相机',
    'cameraLookAt.tooltip': '让相机面向一个坐标',
    'getCameraPos.tooltip': '获取相机任意xyz的坐标',
    'getCameraRotation.tooltip': '获取相机任意xyz的旋转角度',

    'createOrbitControls.tooltip': '创建一个轨道控制器，并绑定一个对象',
    'updateControls.tooltip': '更新控制器，常在手动使用积木移动、旋转等操作后使用',

    'setControlState.tooltip': '设置鼠标能否使用某个控制器',
    'mouseCanControl.tooltip': '判断鼠标是否能使用某个控制器',
    'mouseControl.tooltip':
      '设置某个控制器能否右键拖拽、能否中键缩放、能否左键旋转',
    'setControlDamping.tooltip':
      '设置某个控制器的视口旋转是否启用惯性',
    'setControlDampingNum.tooltip':
      '设置某个控制器的视口旋转惯性',
    'setOrbitControlsTarget.tooltip': '设置某个轨道控制器的焦点',

    'enableFogEffect.tooltip': '启用雾效果并设置雾颜色',
    'disableFogEffect.tooltip': '禁用雾效果'
  },
  en: {
    'name': 'Render The World',
    'fileListEmpty': 'file list is empty',
    'apidocs': '📖API Docs',
    'objectLoadingCompleted':
      'When [name] object loading is completed',
    'set3dState': 'Set the 3D display status to: [state]',
    'get3dState': 'The 3D display is show?',
    '3dState.display': 'display',
    '3dState.hidden': 'hidden',
    'material.Basic': 'Basic',
    'material.Lambert': 'Lambert',
    'material.Phong': 'Phong',

    'init':
      'init and set the background color to [color] size: [sizex] x [sizey] y [ed] anti aliasing, shadow type: [shadowMapType]',
    '_init': ', Set the shadow type to',
    'ed.enable': 'enable',
    'ed.disable': 'disable',
    'color_RGB': 'RGB color: [R] [G] [B]',
    'tools': '🛠️Tools',
    'YN.true': 'can',
    'YN.false': "can't",
    'YN2.yes': 'yes',
    'YN2.no': 'no',
    'isWebGLAvailable': 'compatibility check',
    '_isWebGLAvailable':
      'Does the current device support WebGL?',

    'objects': '🧸Objects',
    'Material': 'Material',
    'Model': 'Model',
    'Move': 'Move',
    'Animation': 'Animation',
    'makeCube':
      'reset or make a Cube: [name] length [a] width [b] height [h] color: [color] position: x [x] y [y] z [z] [YN] cast shadows [YN2] shadow cast',
    'makeSphere':
      'reset or make a Sphere: [name] radius [radius] widthSegments [w] heightSegments [h] color: [color] position: x [x] y [y] z [z] [YN] cast shadows [YN2] shadow cast',
    'makePlane':
      'reset or make a Plane: [name] length [a] width [b] color: [color] position: x [x] y [y] z [z] [YN] cast shadows [YN2] shadow cast',
    'importOBJ':
      'reset or make a OBJ Model: [name] OBJ file: [objfile] MTL file: [mtlfile] position: x [x] y [y] z [z] [YN] cast shadows [YN2] shadow cast',
    'importGLTF':
      'reset or make a GLTF Model: [name] GLTF file: [gltffile] position: x [x] y [y] z [z] [YN] cast shadows [YN2] shadow cast',

    'cubeModel':
      '<cube> length [a] width [b] height [h] material [material]',
    'sphereModel':
      '<sphere> radius [radius] widthSegments [w] heightSegments [h] material [material]',
    'planeModel':
      '<plane> length [a] width [b] material [material]',
    'objModel':
      '<OBJ model> OBJ file [objfile] MTL file [mtlfile]',
    'gltfModel': '<GLTF model> GLTF file [gltffile]',
    'groupModel': '<group> ',

    'importModel': 'reset or make: name [name] object [model]',
    'shadowSettings':
      'set [name] shadow settings: [YN] cast shadows [YN2] shadow cast',
    'makeMaterial': 'make material',
    'setMaterialColor': 'set current material color [color]',
    'setMaterialFog': 'set current material [YN] affected fog',
    'returnm': 'Material make completed [material]',

    'playAnimation':
      "start Object: [name] 's Animation [animationName]",
    'stopAnimation':
      "stop Object: [name] 's Animation [animationName]",
    'updateAnimation':
      "advance Object: [name] 's animation [time] second and update it",
    'getAnimation': "Get Object: [name] 's all animations",

    'rotationObject':
      'Object: [name] rotation: x [x] y [y] z [z]',
    'moveObject': 'Object: [name] go to: x [x] y [y] z [z]',
    'scaleObject': 'Object: [name] scale: x [x] y [y] z [z]',

    'getObjectPos': "get Object: [name] 's [xyz] pos",
    'getObjectRotation': "get Object: [name] 's  [xyz] rotation",
    'getObjectScale': "get Object: [name] 's  [xyz] scale",

    'destroyObject': 'destroy object: [name]',
    'getObjectByNmae': 'Get an object named [name]',

    'getChildrenNumInObject':
      'Get the number of sub objects in Object: [name]',
    'getChildrenInObject': 'Get object: [name]\'s [num]th child object',
    'getChildrenInObject.joinCh': 'th child object\'s',
    'getChildrenInObject.preText': '\'s',
    'getChildrenInObjectByName': 'Get the first sub object named [name2] in the object: [name]',
    'addChildren': 'Add sub object: [name2] to object: [name]',
    'removeChildren':
      'Delete sub object: [name2] from object: [name]',

    'getScene': 'Scene',

    'xyz.x': 'x-axis',
    'xyz.y': 'y-axis',
    'xyz.z': 'z-axis',

    'lights': '🕯️Lights',
    'setAmbientLightColor':
      "set AmbientLight's color: [color] intensity: [intensity]",
    'setHemisphereLightColor':
      "set HemisphereLight's skyColor: [skyColor] groundColor: [groundColor] intensity: [intensity]",
    'makePointLight':
      'reset or make a PointLight: [name] color: [color] intensity: [intensity] position: x [x] y [y] z [z] decay [decay] [YN] cast shadows',
    'makeDirectionalLight':
      'reset or make a DirectionalLight: [name] color: [color] intensity: [intensity] position: x [x] y [y] z [z] to: x [x2] y [y2] z [z2] [YN] cast shadows',
    'setDirectionalLightShawdowCamera':
      'set the shadow casting range for DirectionalLight: [name] left: [left] right: [right] top: [top] bottom: [bottom] near: [near] far: [far]',

    'pointLight':
      '<pointLight> color: [color] intensity: [intensity] position: x [x] y [y] z [z] decay [decay] [YN] cast shadows',
    'directionalLight':
      '<directionalLight> color: [color] intensity: [intensity] position: x [x] y [y] z [z] to: x [x2] y [y2] z [z2] [YN] cast shadows',

    'setLightMapSize':
      "set Light: [name]'s shadow texture resolution x [xsize] y [ysize]",
    'moveLight': 'Light: [name] go to: x [x] y [y] z [z]',
    'getLightPos': "get Light: [name]'s [xyz] pos",

    'camera': '📷Camera',
    'perspectiveCamera': '<Camera> PerspectiveCamera fov [fov] aspect [aspect] near [near] far [far]',
    'useCamera': 'Rendering a 3D scene with a camera [camera]',
    'moveCamera': 'camera go to: x [x] y [y] z [z]',
    'rotationCamera': 'camera rotation: x [x] y [y] z [z]',
    'cameraLookAt': 'Face the camera towards: x [x] y [y] z [z]',
    'getCameraPos': "get camera's [xyz] pos",
    'getCameraRotation': "get camera's  [xyz] rotation",

    'control': '🎚️Controller',
    'createOrbitControls': '<OrbitControls> Bind [name]',
    'updateControls': 'Update Controller [name]',

    'setControlState': 'Mouse [YN] Using Controller [name]',
    'mouseCanControl': 'Can a mouse use a controller [name]?',
    'mouseControl': 'Controller [name] : [yn1] right-click drag [yn2] middle-click zoom [yn3] left-click to rotate',
    'setControlDamping': 'Use controller [name] : [YN2] inertia',
    'setControlDampingNum': 'Set the coefficient of inertia [num] for controller [name]',
    'setOrbitControlsTarget': 'Set the target of the OrbitControls [name] x [x] y [y] z [z]',

    'fogs': '🌫️Fog',
    'enableFogEffect':
      'Enable fog effect and set fog color to: [color] near [near] far [far]',
    'disableFogEffect': 'Disable fog effect',

    // tooltips
    'objectLoadingCompleted.tooltip':
      'Triggered when object loading is complete',
    'set3dState.tooltip': 'Set whether the 3D stage displays',
    'get3dState.tooltip':
      'Determine whether the 3D stage is displaying',

    'init.tooltip':
      'Initialize the extension module, set the background color, rendering size, whether to enable anti aliasing and shadow type',
    'color_RGB.tooltip': 'RGB color',
    'isWebGLAvailable.tooltip': 'WebGL compatibility check',
    '_isWebGLAvailable.tooltip':
      'Does the current device support WebGL?',

    'makeCube.tooltip': 'Create or reset a cube',
    'makeSphere.tooltip': 'Create or reset a sphere',
    'makePlane.tooltip': 'Create or reset a plane',
    'importOBJ.tooltip': 'Import or reset OBJ model',
    'importGLTF.tooltip': 'Import or reset GLTF model',

    'cubeModel.tooltip':
      'Create a cube and return a model object, which can be directly used in the "reset or make" building block',
    'sphereModel.tooltip':
      'Create a sphere and return a model object, which can be directly used in the "reset or make" building block',
    'planeModel.tooltip':
      'Create a plane and return a model object, which can be directly used in the "reset or make" building block',
    'objModel.tooltip':
      'Import OBJ model and return a model object, which can be directly used in the "reset or make" building block',
    'gltfModel.tooltip':
      'Import GLTF model and return a model object, which can be directly used in the "reset or make" building block',
    'pointLight.tooltip':
      'Create a pointLight and return a model object, which can be directly used in the "reset or make" building block',
    'directionalLight.tooltip':
      'Create a directionalLight and return a model object, which can be directly used in the "reset or make" building block',
    'groupModel.tooltip':
      'Create a group and return a group object, which can be directly used in the "reset or make" building block',

    'importModel.tooltip': 'Import or reset objects',
    'shadowSettings.tooltip': 'Set shadow settings for objects',
    'makeMaterial.tooltip':
      'Create a material that can be directly used in the "reset or make" block. If not necessary, it is recommended that multiple models share the same material',
    'setMaterialColor.tooltip':
      'Set the current material color and use it in the "make material" block',
    'setMaterialFog.tooltip':
      'Set whether the current material is affected by fog effects, using in the "make material" block',
    'returnm.tooltip':
      'The material creation is completed and must be used in the "make material" block',

    'playAnimation.tooltip': 'Start the animation of the model',
    'stopAnimation.tooltip': 'End the animation of the model',
    'updateAnimation.tooltip':
      'Advance the animation of the model and update it',
    'getAnimation.tooltip':
      'Retrieve all animations of the model and return a stringified list',

    'rotationObject.tooltip': 'Rotating object',
    'moveObject.tooltip': 'Moving object',
    'scaleObject.tooltip': 'Scaling object',

    'getObjectPos.tooltip':
      'Get the position of any xyz axis of the object',
    'getObjectRotation.tooltip':
      'Get any xyz coordinate of the object',
    'getObjectScale.tooltip':
      'Get the scaling of any xyz axis of the object',

    'destroyObject.tooltip': 'Destroy object',
    'getObjectByNmae.tooltip':
      'Retrieve the corresponding object by the name set during import',

    'getChildrenNumInObject.tooltip':
      'Get the number of sub objects in an object (excluding sub objects, which may also have sub objects). If there are no such objects, return -1',
    'getChildrenInObject.tooltip':
      'Get one of the sub objects in a Object, and if there is no the sub object, return an empty string ("")',
    'getChildrenInObjectByName.tooltip': 'Get the first sub object with a certain name in an object, and if there is no sub object, return an empty string ("")',
    'addChildren.tooltip': 'Add sub objects to an Object',
    'removeChildren.tooltip': 'Delete sub objects for an object',

    'getScene.tooltip':
      'Get scene instance (null before initialization)',

    'setAmbientLightColor.tooltip': 'Set ambient light color',
    'setHemisphereLightColor.tooltip':
      'Set the color of the hemisphere light',
    'setDirectionalLightShawdowCamera.tooltip':
      'Set the shadow projection range of directional light',
    'setLightMapSize.tooltip':
      'Set the shadow texture resolution of the light source',

    'perspectiveCamera.tooltip': 'Create a perspective camera',
    'useCamera.tooltip': 'Specify the camera for rendering the 3D scene',
    'moveCamera.tooltip': 'Moving camera',
    'rotationCamera.tooltip': 'Rotating camera',
    'cameraLookAt.tooltip':
      'Place the camera facing a coordinate',
    'getCameraPos.tooltip':
      'Obtain the coordinates of any xyz of the camera',
    'getCameraRotation.tooltip':
      'Obtain the rotation angle of any xyz of the camera',
    
      
    'createOrbitControls.tooltip': 'Create a OrbitControls and bind an object',
    'updateControls.tooltip': 'Update the controller, often used after manually moving, rotating, and other operations with block',
    
    'setControlState.tooltip': 'Sets whether the mouse can use a controller',
    'mouseCanControl.tooltip': 'Determines whether the mouse can use a controller',
    'mouseControl.tooltip':
      'Sets whether a controller can be right-clicked and dragged, middle-clicked to zoom, or left-clicked to rotate',
    'setControlDamping.tooltip':
      'Sets whether viewport rotation for a controller has inertia enabled',
    'setControlDampingNum.tooltip':
      'Sets the viewport rotation inertia for a controller',
    'setOrbitControlsTarget.tooltip': 'Set the target of a OrbitControls',

    'enableFogEffect.tooltip':
      'Enable fog effect and set fog color',
    'disableFogEffect.tooltip': 'Disable fog effect'
  }
}
