// Contains l10n

export default {
    "zh-cn": {
        "RenderTheWorld.name": "渲染世界",
        "RenderTheWorld.fileListEmpty": "没有文件",
        "RenderTheWorld.apidocs": "📖API文档",
        "RenderTheWorld.objectLoadingCompleted": "当[name]对象加载完成时",
        "RenderTheWorld.set3dState": "设置3D显示器状态为: [state]",
        "RenderTheWorld.get3dState": "​3D显示器是显示的?",
        "RenderTheWorld.3dState.display": "显示",
        "RenderTheWorld.3dState.hidden": "隐藏",
        "RenderTheWorld.material.Basic": "基础",
        "RenderTheWorld.material.Lambert": "Lambert",
        "RenderTheWorld.material.Phong": "Phong",

        "RenderTheWorld.init":
            "初始化并设置背景颜色为[color] 大小[sizex]x[sizey]y [Anti_Aliasing]",
        "RenderTheWorld.Anti_Aliasing.enable": "启用抗锯齿",
        "RenderTheWorld.Anti_Aliasing.disable": "禁用抗锯齿",
        "RenderTheWorld.color_RGB": "RGB颜色: [R] [G] [B]",
        "RenderTheWorld.tools": "🛠️工具",
        "RenderTheWorld.YN.true": "能",
        "RenderTheWorld.YN.false": "不能",
        "RenderTheWorld.YN2.yes": "有",
        "RenderTheWorld.YN2.no": "没有",
        "RenderTheWorld.isWebGLAvailable": "兼容性检查",
        "RenderTheWorld._isWebGLAvailable": "当前设备支持WebGL吗?",

        "RenderTheWorld.objects": "🧸物体",
        "RenderTheWorld.Material": "材质",
        "RenderTheWorld.Model": "模型",
        "RenderTheWorld.Move": "动作",
        "RenderTheWorld.Animation": "动画",
        "RenderTheWorld.makeCube":
            "创建或重置长方体: [name] 长[a] 宽[b] 高[h] 颜色: [color] 位置: x[x] y[y] z[z] [YN]投射阴影 [YN2]被投射阴影",
        "RenderTheWorld.makeSphere":
            "创建或重置球体: [name] 半径[radius] 水平分段数[w] 垂直分段数[h] 颜色: [color] 位置: x[x] y[y] z[z] [YN]投射阴影 [YN2]被投射阴影",
        "RenderTheWorld.makePlane":
            "创建或重置平面: [name] 长[a] 宽[b] 颜色: [color] 位置: x[x] y[y] z[z] [YN]投射阴影 [YN2]被投射阴影",
        "RenderTheWorld.importOBJ":
            "导入或重置OBJ模型: [name] OBJ模型文件: [objfile] MTL材质文件: [mtlfile] 位置: x[x] y[y] z[z] [YN]投射阴影 [YN2]被投射阴影",
        "RenderTheWorld.importGLTF":
            "导入或重置GLTF模型: [name] GLTF模型文件: [gltffile] 位置: x[x] y[y] z[z] [YN]投射阴影 [YN2]被投射阴影",

        "RenderTheWorld.cubeModel":
            "<长方体> 长[a] 宽[b] 高[h] 材质[material]",
        "RenderTheWorld.sphereModel":
            "<球体> 半径[radius] 水平分段数[w] 垂直分段数[h] 材质[material]",
        "RenderTheWorld.planeModel": "<平面> 长[a] 宽[b] 材质[material]",
        "RenderTheWorld.objModel":
            "<OBJ模型> OBJ文件[objfile] MTL文件[mtlfile]",
        "RenderTheWorld.gltfModel": "<GLTF模型> GLTF文件[gltffile]",
        "RenderTheWorld.groupModel": "<组> ",

        "RenderTheWorld.importModel":
            "导入或重置: 名称[name] 对象[model]",
        "RenderTheWorld.shadowSettings":
            "设置 [name] 的阴影设置: [YN]投射阴影 [YN2]被投射阴影",
        "RenderTheWorld.makeMaterial": "创建材质 [material]",
        "RenderTheWorld.setMaterialColor": "设置当前材质颜色 [color]",
        "RenderTheWorld.setMaterialFog": "设置当前材质 [YN] 受雾效果影响",
        "RenderTheWorld.return": "材质创建完成",

        "RenderTheWorld.playAnimation":
            "启动模型: [name] 的动画[animationName]",
        "RenderTheWorld.stopAnimation":
            "结束模型: [name] 的动画[animationName]",
        "RenderTheWorld.updateAnimation":
            "推进模型: [name] 的动画 [time]毫秒 并更新",
        "RenderTheWorld.getAnimation": "获取模型: [name] 的所有动画",

        "RenderTheWorld.rotationObject":
            "将: [name] 旋转: x[x] y[y] z[z]",
        "RenderTheWorld.moveObject":
            "将: [name] 移动到: x[x] y[y] z[z]",
        "RenderTheWorld.scaleObject": "将: [name] 缩放: x[x] y[y] z[z]",

        "RenderTheWorld.getObjectPos": "获取: [name] 的[xyz]坐标",
        "RenderTheWorld.getObjectRotation":
            "获取物体: [name] [xyz]的旋转角度",
        "RenderTheWorld.getObjectScale": "获取物体: [name] [xyz]的缩放",

        "RenderTheWorld.deleteObject": "删除: [name]",

        "RenderTheWorld.xyz.x": "x轴",
        "RenderTheWorld.xyz.y": "y轴",
        "RenderTheWorld.xyz.z": "z轴",

        "RenderTheWorld.lights": "🕯️光照",
        "RenderTheWorld.setAmbientLightColor":
            "设置环境光颜色: [color] 光照强度: [intensity]",
        "RenderTheWorld.setHemisphereLightColor":
            "设置半球光天空颜色: [skyColor] 地面颜色: [groundColor] 光照强度: [intensity]",
        "RenderTheWorld.makePointLight":
            "创建或重置点光源: [name] 颜色: [color] 光照强度: [intensity] 位置: x[x] y[y] z[z] 衰减量[decay] [YN]投射阴影",
        "RenderTheWorld.makeDirectionalLight":
            "创建或重置方向光: [name] 颜色: [color] 光照强度: [intensity] 位置: x[x] y[y] z[z] 指向: x[x2] y[y2] z[z2] [YN]投射阴影",
        
        "RenderTheWorld.pointLight":
            "<点光源> 颜色: [color] 光照强度: [intensity] 位置: x[x] y[y] z[z] 衰减量[decay] [YN]投射阴影",
        "RenderTheWorld.directionalLight":
            "<方向光> 颜色: [color] 光照强度: [intensity] 位置: x[x] y[y] z[z] 指向: x[x2] y[y2] z[z2] [YN]投射阴影",
        
        "RenderTheWorld.setDirectionalLightShawdowCamera":
            "设置方向光: [name] 的阴影投射范围 left: [left] right: [right] top: [top] bottom: [bottom]",
        "RenderTheWorld.setLightMapSize":
            "设置光源: [name] 的阴影纹理分辨率为: x[xsize] y[ysize]",
        "RenderTheWorld.moveLight": "将光源: [name] 移动到: x[x] y[y] z[z]",
        "RenderTheWorld.getLightPos": "获取光源: [name] 的[xyz]坐标",
        "RenderTheWorld.deleteLight": "删除光源: [name]",

        "RenderTheWorld.camera": "📷相机",
        "RenderTheWorld.moveCamera": "将相机移动到x[x]y[y]z[z]",
        "RenderTheWorld.rotationCamera": "将相机旋转: x[x] y[y] z[z]",
        "RenderTheWorld.cameraLookAt": "让相机面向: x[x] y[y] z[z]",
        "RenderTheWorld.getCameraPos": "获取相机[xyz]坐标",
        "RenderTheWorld.getCameraRotation": "获取相机[xyz]的旋转角度",
        "RenderTheWorld.setControlState": "鼠标[YN]控制相机",
        "RenderTheWorld.mouseCanControlCamera": "鼠标能控制相机吗?",
        "RenderTheWorld.controlCamera":
            "鼠标控制相机: [yn1]右键拖拽 [yn2]中键缩放 [yn3]左键旋转",
        "RenderTheWorld.setControlCameraDamping":
            "鼠标控制相机: [YN2] 惯性",
        "RenderTheWorld.setControlCameraDampingNum":
            "设置鼠标控制相机的惯性系数[num]",

        "RenderTheWorld.fogs": "🌫️雾",
        "RenderTheWorld.enableFogEffect":
            "启用雾效果并设置雾颜色为: [color] near[near] far[far]",
        "RenderTheWorld.disableFogEffect": "禁用雾效果",

        // tooltips
        "RenderTheWorld.objectLoadingCompleted.tooltip":
            "当对象加载完成时触发",
        "RenderTheWorld.set3dState.tooltip": "设置3D显示器是否显示",
        "RenderTheWorld.get3dState.tooltip": "判断​3D显示器是否显示",

        "RenderTheWorld.init.tooltip":
            "初始化扩展模块，设置背景颜色、渲染大小和是否开启抗锯齿",
        "RenderTheWorld.color_RGB.tooltip": "RGB颜色",
        "RenderTheWorld.isWebGLAvailable.tooltip": "WebGL兼容性检查",
        "RenderTheWorld._isWebGLAvailable.tooltip": "当前设备支持WebGL吗?",

        "RenderTheWorld.makeCube.tooltip": "创建或重置长方体",
        "RenderTheWorld.makeSphere.tooltip": "创建或重置球体",
        "RenderTheWorld.makePlane.tooltip": "创建或重置平面",
        "RenderTheWorld.importOBJ.tooltip": "导入或重置OBJ模型",
        "RenderTheWorld.importGLTF.tooltip": "导入或重置GLTF模型",

        "RenderTheWorld.cubeModel.tooltip":
            "创建一个长方体，返回一个模型对象，可直接在“导入或重置”积木中使用",
        "RenderTheWorld.sphereModel.tooltip":
            "创建一个球体，返回一个模型对象，可直接在“导入或重置”积木中使用",
        "RenderTheWorld.planeModel.tooltip":
            "创建一个平面，返回一个模型对象，可直接在“导入或重置”积木中使用",
        "RenderTheWorld.objModel.tooltip":
            "导入OBJ模型，返回一个模型对象，可直接在“导入或重置”积木中使用",
        "RenderTheWorld.gltfModel.tooltip":
            "导入GLTF模型，返回一个模型对象，可直接在“导入或重置”积木中使用",
        "RenderTheWorld.pointLight.tooltip":
            "创建一个点光源，返回一个模型对象，可直接在“导入或重置”积木中使用",
        "RenderTheWorld.directionalLight.tooltip":
            "创建一个平行光，返回一个模型对象，可直接在“导入或重置”积木中使用",
        "RenderTheWorld.groupModel.tooltip":
            "创建一个对象组，返回一个组对象，可直接在“导入或重置”积木中使用",

        "RenderTheWorld.importModel.tooltip": "导入或重置对象",
        "RenderTheWorld.shadowSettings.tooltip": "设置对象的阴影设置",
        "RenderTheWorld.makeMaterial.tooltip":
            "创建一个材质，可直接在“导入或重置”积木中使用，如非必要，推荐多个模型共用一个材质",
        "RenderTheWorld.setMaterialColor.tooltip":
            "设置当前材质颜色，在“创建材质”积木中使用",
        "RenderTheWorld.setMaterialFog.tooltip":
            "设置当前材质是否受雾效果影响，在“创建材质”积木中使用",
        "RenderTheWorld.return.tooltip":
            "材质创建完成，必须在“创建材质”积木中使用",

        "RenderTheWorld.playAnimation.tooltip": "启动模型的动画",
        "RenderTheWorld.stopAnimation.tooltip": "结束模型的动画",
        "RenderTheWorld.updateAnimation.tooltip": "推进模型的动画并更新",
        "RenderTheWorld.getAnimation.tooltip":
            "获取模型的所有动画，返回一个字符串化列表",

        "RenderTheWorld.rotationObject.tooltip": "旋转物体",
        "RenderTheWorld.moveObject.tooltip": "移动物体",
        "RenderTheWorld.scaleObject.tooltip": "缩放物体",

        "RenderTheWorld.getObjectPos.tooltip": "获取对象的任意xyz坐标",
        "RenderTheWorld.getObjectRotation.tooltip":
            "获取对象任意xyz轴的旋转角度",
        "RenderTheWorld.getObjectScale.tooltip": "获取对象任意xyz轴的缩放",

        "RenderTheWorld.deleteObject.tooltip": "删除对象",

        "RenderTheWorld.setAmbientLightColor.tooltip": "设置环境光颜色",
        "RenderTheWorld.setHemisphereLightColor.tooltip":
            "设置半球光天空颜色",
        "RenderTheWorld.setDirectionalLightShawdowCamera.tooltip":
            "设置方向光的阴影投射范围",
        "RenderTheWorld.setLightMapSize.tooltip":
            "设置光源的阴影纹理分辨率",

        "RenderTheWorld.moveCamera.tooltip": "移动相机",
        "RenderTheWorld.rotationCamera.tooltip": "旋转相机",
        "RenderTheWorld.cameraLookAt.tooltip": "让相机面向一个坐标",
        "RenderTheWorld.getCameraPos.tooltip": "获取相机任意xyz的坐标",
        "RenderTheWorld.getCameraRotation.tooltip":
            "获取相机任意xyz的旋转角度",
        "RenderTheWorld.setControlState.tooltip":
            "设置鼠标控制相机模式是否开启",
        "RenderTheWorld.mouseCanControlCamera.tooltip":
            "判断鼠标控制相机模式是否开启",
        "RenderTheWorld.controlCamera.tooltip":
            "设置鼠标控制相机模式能否右键拖拽、能否中键缩放、能否左键旋转",
        "RenderTheWorld.setControlCameraDamping.tooltip":
            "设置鼠标控制相机模式的视口旋转是否启用惯性",
        "RenderTheWorld.setControlCameraDampingNum.tooltip":
            "设置鼠标控制相机模式的视口旋转惯性",

        "RenderTheWorld.enableFogEffect.tooltip": "启用雾效果并设置雾颜色",
        "RenderTheWorld.disableFogEffect.tooltip": "禁用雾效果",
    },
    en: {
        "RenderTheWorld.name": "Render The World",
        "RenderTheWorld.fileListEmpty": "file list is empty",
        "RenderTheWorld.apidocs": "📖API Docs",
        "RenderTheWorld.objectLoadingCompleted":
            "When [name] object loading is completed",
        "RenderTheWorld.set3dState":
            "Set the 3D display status to: [state]",
        "RenderTheWorld.get3dState": "The 3D display is show?",
        "RenderTheWorld.3dState.display": "display",
        "RenderTheWorld.3dState.hidden": "hidden",
        "RenderTheWorld.material.Basic": "Basic",
        "RenderTheWorld.material.Lambert": "Lambert",
        "RenderTheWorld.material.Phong": "Phong",

        "RenderTheWorld.init":
            "init and set the background color to [color] size:[sizex]x[sizey]y [Anti_Aliasing]",
        "RenderTheWorld.Anti_Aliasing.enable": "enable anti aliasing",
        "RenderTheWorld.Anti_Aliasing.disable": "disable anti aliasing",
        "RenderTheWorld.color_RGB": "RGB color: [R] [G] [B]",
        "RenderTheWorld.tools": "🛠️Tools",
        "RenderTheWorld.YN.true": "can",
        "RenderTheWorld.YN.false": "can't",
        "RenderTheWorld.YN2.yes": "yes",
        "RenderTheWorld.YN2.no": "no",
        "RenderTheWorld.isWebGLAvailable": "compatibility check",
        "RenderTheWorld._isWebGLAvailable":
            "Does the current device support WebGL?",

        "RenderTheWorld.objects": "🧸Objects",
        "RenderTheWorld.Material": "Material",
        "RenderTheWorld.Model": "Model",
        "RenderTheWorld.Move": "Move",
        "RenderTheWorld.Animation": "Animation",
        "RenderTheWorld.makeCube":
            "reset or make a Cube: [name] length[a] width[b] height[h] color: [color] position: x[x] y[y] z[z] [YN]cast shadows [YN2]shadow cast",
        "RenderTheWorld.makeSphere":
            "reset or make a Sphere: [name] radius[radius] widthSegments[w] heightSegments[h] color: [color] position: x[x] y[y] z[z] [YN]cast shadows [YN2]shadow cast",
        "RenderTheWorld.makePlane":
            "reset or make a Plane: [name] length[a] width[b] color: [color] position: x[x] y[y] z[z] [YN]cast shadows [YN2]shadow cast",
        "RenderTheWorld.importOBJ":
            "reset or make a OBJ Model: [name] OBJ file: [objfile] MTL file: [mtlfile] position: x[x] y[y] z[z] [YN]cast shadows [YN2]shadow cast",
        "RenderTheWorld.importGLTF":
            "reset or make a GLTF Model: [name] GLTF file: [gltffile] position: x[x] y[y] z[z] [YN]cast shadows [YN2]shadow cast",

        "RenderTheWorld.cubeModel":
            "<cube> length[a] width[b] height[h] material[material]",
        "RenderTheWorld.sphereModel":
            "<sphere> radius[radius] widthSegments[w] heightSegments[h] material[material]",
        "RenderTheWorld.planeModel":
            "<plane> length[a] width[b] material[material]",
        "RenderTheWorld.objModel":
            "<OBJ model> OBJ file[objfile] MTL file[mtlfile]",
        "RenderTheWorld.gltfModel": "<GLTF model> GLTF file[gltffile]",
        "RenderTheWorld.groupModel": "<group> ",

        "RenderTheWorld.importModel":
            "reset or make: name[name] object[model]",
        "RenderTheWorld.shadowSettings":
            "set [name] shadow settings: [YN]cast shadows [YN2]shadow cast",
        "RenderTheWorld.makeMaterial": "make material [material]",
        "RenderTheWorld.setMaterialColor":
            "set current material color [color]",
        "RenderTheWorld.setMaterialFog":
            "set current material [YN] affected fog",
        "RenderTheWorld.return": "Material make completed",

        "RenderTheWorld.playAnimation":
            "start Object: [name]'s Animation [animationName]",
        "RenderTheWorld.stopAnimation":
            "stop Object: [name]'s Animation [animationName]",
        "RenderTheWorld.updateAnimation":
            "advance Object: [name]'s animation [time] millisecond and update it",
        "RenderTheWorld.getAnimation":
            "Get Object: [name]'s all animations",

        "RenderTheWorld.rotationObject":
            "Object: [name] rotation: x[x] y[y] z[z]",
        "RenderTheWorld.moveObject": "Object: [name] go to: x[x] y[y] z[z]",
        "RenderTheWorld.scaleObject":
            "Object: [name] scale: x[x] y[y] z[z]",

        "RenderTheWorld.getObjectPos": "get Object: [name]'s [xyz] pos",
        "RenderTheWorld.getObjectRotation":
            "get Object: [name]'s  [xyz] rotation",
        "RenderTheWorld.getObjectScale":
            "get Object: [name]'s  [xyz] scale",

        "RenderTheWorld.deleteObject": "delete object: [name]",

        "RenderTheWorld.xyz.x": "x-axis",
        "RenderTheWorld.xyz.y": "y-axis",
        "RenderTheWorld.xyz.z": "z-axis",

        "RenderTheWorld.lights": "🕯️Lights",
        "RenderTheWorld.setAmbientLightColor":
            "set AmbientLight's color: [color] intensity: [intensity]",
        "RenderTheWorld.setHemisphereLightColor":
            "set HemisphereLight's skyColor: [skyColor] groundColor: [groundColor] intensity: [intensity]",
        "RenderTheWorld.makePointLight":
            "reset or make a PointLight: [name] color: [color] intensity: [intensity] position: x[x] y[y] z[z] decay[decay] [YN]cast shadows",
        "RenderTheWorld.makeDirectionalLight":
            "reset or make a DirectionalLight: [name] color: [color] intensity: [intensity] position: x[x] y[y] z[z] to: x[x2] y[y2] z[z2] [YN]cast shadows",
        "RenderTheWorld.setDirectionalLightShawdowCamera":
            "set the shadow casting range for DirectionalLight: [name] left: [left] right: [right] top: [top] bottom: [bottom]",
        
        "RenderTheWorld.pointLight":
            "<pointLight> color: [color] intensity: [intensity] position: x[x] y[y] z[z] decay[decay] [YN]cast shadows",
        "RenderTheWorld.directionalLight":
            "<directionalLight> color: [color] intensity: [intensity] position: x[x] y[y] z[z] to: x[x2] y[y2] z[z2] [YN]cast shadows",

        "RenderTheWorld.setLightMapSize":
            "set Light: [name]'s shadow texture resolution x[xsize] y[ysize]",
        "RenderTheWorld.moveLight": "Light: [name] go to: x[x] y[y] z[z]",
        "RenderTheWorld.getLightPos": "get Light: [name]'s [xyz] pos",
        "RenderTheWorld.deleteLight": "delete ligth: [name]",

        "RenderTheWorld.camera": "📷Camera",
        "RenderTheWorld.moveCamera": "camera go to: x[x]y[y]z[z]",
        "RenderTheWorld.rotationCamera": "camera rotation: x[x]y[y]z[z]",
        "RenderTheWorld.cameraLookAt":
            "Face the camera towards: x[x] y[y] z[z]",
        "RenderTheWorld.getCameraPos": "get camera's [xyz] pos",
        "RenderTheWorld.getCameraRotation": "get camera's  [xyz] rotation",
        "RenderTheWorld.setControlState": "Mouse [YN] control camera",
        "RenderTheWorld.mouseCanControlCamera": "Mouse can control camera?",
        "RenderTheWorld.controlCamera":
            "Mouse control camera: [yn1]right click drag [yn2] middle click zoom and [yn3] left click rotation",
        "RenderTheWorld.setControlCameraDamping":
            "Mouse control camera: [YN2] Damping",
        "RenderTheWorld.setControlCameraDampingNum":
            "set the damping coefficient of mouse controlled camera [num]",

        "RenderTheWorld.fogs": "🌫️Fog",
        "RenderTheWorld.enableFogEffect":
            "Enable fog effect and set fog color to: [color] near[near] far[far]",
        "RenderTheWorld.disableFogEffect": "Disable fog effect",

        // tooltips
        "RenderTheWorld.objectLoadingCompleted.tooltip":
            "Triggered when object loading is complete",
        "RenderTheWorld.set3dState.tooltip": "Set whether the 3D stage displays",
        "RenderTheWorld.get3dState.tooltip": "Determine whether the 3D stage is displaying",

        "RenderTheWorld.init.tooltip":
            "Initialize the extension module, set the background color, rendering size, and whether to enable anti aliasing",
        "RenderTheWorld.color_RGB.tooltip": "RGB color",
        "RenderTheWorld.isWebGLAvailable.tooltip": "WebGL compatibility check",
        "RenderTheWorld._isWebGLAvailable.tooltip": "Does the current device support WebGL?",

        "RenderTheWorld.makeCube.tooltip": "Create or reset a cube",
        "RenderTheWorld.makeSphere.tooltip": "Create or reset a sphere",
        "RenderTheWorld.makePlane.tooltip": "Create or reset a plane",
        "RenderTheWorld.importOBJ.tooltip": "Import or reset OBJ model",
        "RenderTheWorld.importGLTF.tooltip": "Import or reset GLTF model",

        "RenderTheWorld.cubeModel.tooltip":
            'Create a cube and return a model object, which can be directly used in the "reset or make" building block',
        "RenderTheWorld.sphereModel.tooltip":
            'Create a sphere and return a model object, which can be directly used in the "reset or make" building block',
        "RenderTheWorld.planeModel.tooltip":
            'Create a plane and return a model object, which can be directly used in the "reset or make" building block',
        "RenderTheWorld.objModel.tooltip":
            'Import OBJ model and return a model object, which can be directly used in the "reset or make" building block',
        "RenderTheWorld.gltfModel.tooltip":
            'Import GLTF model and return a model object, which can be directly used in the "reset or make" building block',
        "RenderTheWorld.pointLight.tooltip":
            'Create a pointLight and return a model object, which can be directly used in the "reset or make" building block',
        "RenderTheWorld.directionalLight.tooltip":
            'Create a directionalLight and return a model object, which can be directly used in the "reset or make" building block',
        "RenderTheWorld.groupModel.tooltip":
            'Create a group and return a group object, which can be directly used in the "reset or make" building block',

        "RenderTheWorld.importModel.tooltip": "Import or reset objects",
        "RenderTheWorld.shadowSettings.tooltip": "Set shadow settings for objects",
        "RenderTheWorld.makeMaterial.tooltip":
            'Create a material that can be directly used in the "reset or make" block. If not necessary, it is recommended that multiple models share the same material',
        "RenderTheWorld.setMaterialColor.tooltip":
            'Set the current material color and use it in the "make material" block',
        "RenderTheWorld.setMaterialFog.tooltip":
            'Set whether the current material is affected by fog effects, using in the "make material" block',
        "RenderTheWorld.return.tooltip":
            'The material creation is completed and must be used in the "make material" block',

        "RenderTheWorld.playAnimation.tooltip": "Start the animation of the model",
        "RenderTheWorld.stopAnimation.tooltip": "End the animation of the model",
        "RenderTheWorld.updateAnimation.tooltip": "Advance the animation of the model and update it",
        "RenderTheWorld.getAnimation.tooltip":
            "Retrieve all animations of the model and return a stringified list",

        "RenderTheWorld.rotationObject.tooltip": "Rotating object",
        "RenderTheWorld.moveObject.tooltip": "Moving object",
        "RenderTheWorld.scaleObject.tooltip": "Scaling object",

        "RenderTheWorld.getObjectPos.tooltip": "获取对象的任意xyz坐标",
        "RenderTheWorld.getObjectRotation.tooltip":
            "Get any xyz coordinate of the object",
        "RenderTheWorld.getObjectScale.tooltip": "Get the scaling of any xyz axis of the object",

        "RenderTheWorld.deleteObject.tooltip": "Delete object",

        "RenderTheWorld.setAmbientLightColor.tooltip": "Set ambient light color",
        "RenderTheWorld.setHemisphereLightColor.tooltip":
            "Set the color of the hemisphere light",
        "RenderTheWorld.setDirectionalLightShawdowCamera.tooltip":
            "Set the shadow projection range of directional light",
        "RenderTheWorld.setLightMapSize.tooltip":
            "Set the shadow texture resolution of the light source",

        "RenderTheWorld.moveCamera.tooltip": "Moving camera",
        "RenderTheWorld.rotationCamera.tooltip": "Rotating camera",
        "RenderTheWorld.cameraLookAt.tooltip": "Place the camera facing a coordinate",
        "RenderTheWorld.getCameraPos.tooltip": "Obtain the coordinates of any xyz of the camera",
        "RenderTheWorld.getCameraRotation.tooltip":
            "Obtain the rotation angle of any xyz of the camera",
        "RenderTheWorld.setControlState.tooltip":
            "Set whether the Mouse Control Camera mode is enabled or not",
        "RenderTheWorld.mouseCanControlCamera.tooltip":
            "Check if the Mouse Control Camera mode is enabled",
        "RenderTheWorld.controlCamera.tooltip":
            "Can the Mouse Control Camera mode be used for right click drag, middle click zoom, and left click rotation",
        "RenderTheWorld.setControlCameraDamping.tooltip":
            "Whether to enable inertia for viewport rotation in the Mouse Control Camera mode",
        "RenderTheWorld.setControlCameraDampingNum.tooltip":
            "Set viewport rotation inertia for Mouse Control Camera mode",

        "RenderTheWorld.enableFogEffect.tooltip": "Enable fog effect and set fog color",
        "RenderTheWorld.disableFogEffect.tooltip": "Disable fog effect",
    },
};