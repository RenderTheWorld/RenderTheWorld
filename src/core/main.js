import * as THREE from 'three';

import {
    chen_RenderTheWorld_extensionId,
} from '../assets/index.js';
import { Wrapper, RTW_Model_Box } from '../utils/RTWTools.js';
import { ExtensionCore, RenderEngine } from './engine';


class Extension {
    /**
     * @param {import('scratch-vm').Runtime} _runtime
     */
    constructor(_runtime, vm, ScratchBlocks, Scratch) {
        /** @type {import('scratch-vm').Runtime} */
        this.runtime = _runtime ?? Scratch?.vm?.runtime;
        /** @type {import('scratch-vm')} */
        this.vm = vm;
        /** @type {import('scratch-blocks')} */
        this.ScratchBlocks = ScratchBlocks;

        /** @type {Scratch} */
        this.Scratch = Scratch;

        /** @type {ExtensionCore} */
        this._core;
        /** @type {RenderEngine} */
        this.render_engine;
    }

    /**
     * 兼容性检查
     * @param {object} args
     */
    isWebGLAvailable() {
        this.isWebglAvailable = (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
            } catch (e) {
                return false;
            }
        })();
    }

    /**
     * 兼容性
     * @param {object} args
     * @returns {boolean}
     */
    _isWebGLAvailable() {
        return this.isWebglAvailable;
    }

    /**
         * 清除材质
         * @param {THREE.Material} material
         */
    __disposeMaterial(material) {
        if (material.isMaterial) {
            Object.keys(material).forEach((prop) => {
                if (!material[prop]) return;
                if (typeof material[prop].dispose === 'function')
                    material[prop].dispose();
            });
            material.dispose();
        }
    }

    /**
     * 清除物体
     * @param {THREE.Object3D} obj
     */
    __disposeObject(obj) {
        if (obj.geometry) {
            obj.geometry.dispose();
        }
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach((material) => {
                    this.__disposeMaterial(material);
                });
            } else {
                this.__disposeMaterial(obj.material);
            }
        }
        if (obj.texture) {
            obj.texture.dispose();
        }
    }

    /**
     * @param {THREE.Object3D} model
     */
    _disposeObject(model) {
        if (model.isObject3D) {
            if (model.parent !== null) {
                model.parent.remove(model);
            }
            let disposeObjects = [model];
            if (model.isGroup) {
                model.traverse((obj) => {
                    disposeObjects.push(obj);
                });
            }
            disposeObjects.forEach((obj) => {
                if (obj.parent !== null) {
                    obj.parent.remove(obj);
                }
                this.__disposeObject(obj);
            });
        } else if (model.ismaterial) {
            this.__disposeMaterial(model);
        }
    }

    /**
     * @param {string} name
     */
    releaseDuplicates(name) {
        let model = this._getModel(name);

        if (model === -1) return;
        name = this.Scratch.Cast.toString(name);
        if (name in this.render_engine.animations) {
            if (this.render_engine.animations[name].mixer) {
                this.render_engine.animations[name].mixer.stopAllAction();
            }
            this.render_engine.animations[name] = {};
        }
        this._disposeObject(model);
    }

    /**
     * 获取模型对象
     * @param {string | Wrapper} obj
     * @returns {THREE.Object3D | -1}
     */
    _getModel(obj) {
        obj = Wrapper.unwrap(obj);
        if (
            obj instanceof RTW_Model_Box &&
            obj.model != undefined &&
            (obj.model.isObject3D || obj.model instanceof OrbitControls)
        ) {
            return obj.model;
        } else if (this.Scratch.Cast.toString(obj) in this.render_engine.objects) {
            return this.render_engine.objects[this.Scratch.Cast.toString(obj)];
        } else return -1;
    }

    /**
     * 初始化
     * @param {object} args
     * @param {number} args.color  背景颜色
     * @param {number} args.sizey  Y轴大小（px）
     * @param {number} args.sizex  X轴大小（px）
     * @param {string} args.ed  是否启用抗锯齿
     * @param {THREE.BasicShadowMap || THREE.PCFShadowMap || THREE.PCFSoftShadowMap || THREE.VSMShadowMap} args.shadowMapType  阴影类型
     */
    init({ color, sizex, sizey, ed, shadowMapType }) {
        this.render_engine.init(this.Scratch.Cast.toNumber(color),
            sizex, sizey,
            this.Scratch.Cast.toString(ed) == 'enable' ? true : false,
            shadowMapType
        );
    }

    /**
         * 设置3d渲染器状态
         * @param {object} args
         * @param {string} args.state
         */

    set3dState({ state }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }

        if (this.Scratch.Cast.toString(state) === 'display') {
            this.isTcShow = true;
            this.threeSkin.setContent(this.render_engine.tc);
        } else {
            this.isTcShow = false;
            this.threeSkin.setContent(this.NullCanvas);
        }
    }

    get3dState(args) {
        return this.isTcShow;
    }

    /**
     * 创建材质
     * @param {object} args
     * @returns {_Wrapper}
     */
    makeMaterial(args, util) {
        const thread = util.thread;
        if (typeof util.stackFrame._inlineLastReturn !== 'undefined') {
            // 阶段3：我们有一个返回值，我们
            // 可以返回值，返回它！
            util.stackFrame._inlineLastReturn = undefined;
            this.threadInfo[thread.topBlock.concat(thread.target.id)].pop();
            return util.stackFrame._inlineReturn;
        } else if (typeof util.stackFrame._inlineReturn !== 'undefined') {
            //第二阶段：我们有一个返回值，但我们将跳过
            //在外块上。
            //为了防止这种情况发生，请再次将其推到堆栈上
            //并有第三阶段
            const returnValue = util.stackFrame._inlineReturn;

            util.thread.popStack();

            util.stackFrame._inlineLastReturn = true;
            util.stackFrame._inlineReturn = returnValue;

            this.threadInfo[thread.topBlock.concat(thread.target.id)].pop();
            return returnValue;
        } else {
            // 第1阶段：运行堆栈。
            // 假设区块返回一个承诺，这样
            // 解释器暂停在块上，
            // 并在execute（）之后继续运行脚本
            // 完成。

            if (util.stackFrame._inlineLoopRan) {
                thread.popStack();
                return '';
            }

            if (
                this.threadInfo[thread.topBlock.concat(thread.target.id)] &&
                this.threadInfo[thread.topBlock.concat(thread.target.id)]
                    .length > 0
            ) {
                this.threadInfo[
                    thread.topBlock.concat(thread.target.id)
                ].push({
                    color: 0,
                    fog: true,
                });
            } else {
                this.threadInfo[thread.topBlock.concat(thread.target.id)] =
                    [{ color: 0, fog: true }];
            }

            const stackFrame = thread.peekStackFrame();
            const oldGoToNextBlock = thread.goToNextBlock;

            const resetGoToNext = function () {
                thread.goToNextBlock = oldGoToNextBlock;
            };
            const blockGlowInFrame = thread.blockGlowInFrame;
            const resetGlowInFrame = function () {
                delete thread.blockGlowInFrame;
                thread.blockGlowInFrame = blockGlowInFrame;
            };

            const trap = () => {
                thread.status = thread.constructor.STATUS_RUNNING;

                const realBlockId = stackFrame.reporting;
                thread.pushStack(realBlockId);

                util.stackFrame._inlineLoopRan = true;
                this.stepToBranchWithBlockId(realBlockId, thread, 1, true);
            };

            // 对边缘激活的帽子（事件触发器）进行拦截，以转入 thread.goToNextBlock
            thread.goToNextBlock = function () {
                resetGlowInFrame();

                trap();

                thread.goToNextBlock = oldGoToNextBlock;
                oldGoToNextBlock.call(this);
                resetGoToNext();
            };
            // 为其他脚本在thread.blockGlowInFrame上添加一个getter
            Object.defineProperty(thread, 'blockGlowInFrame', {
                get() {
                    return blockGlowInFrame;
                },
                set(newValue) {
                    resetGoToNext();
                    trap();
                    resetGlowInFrame();
                },
                enumerable: true,
                configurable: true,
            });

            // 虚假承诺
            return { then: () => { } };
        }
    }

    // 实现stepToBranchWithBlockId方法，用于跳转到指定分支的块
    stepToBranchWithBlockId(blockId, thread, branchNum, isLoop) {
        if (!branchNum) {
            branchNum = 1;
        }
        const currentBlockId = blockId;
        const branchId = thread.target.blocks.getBranch(
            currentBlockId,
            branchNum,
        );
        thread.peekStackFrame().isLoop = isLoop;
        if (branchId) {
            // 将分支ID推送到线程的堆栈中。
            thread.pushStack(branchId);
        } else {
            thread.pushStack(null);
        }
    }

    setMaterialColor({ color }, util) {
        const thread = util.thread;
        try {
            if (
                this.threadInfo[thread.topBlock.concat(thread.target.id)][
                this.threadInfo[
                    thread.topBlock.concat(thread.target.id)
                ].length - 1
                ] === undefined
            )
                return '⚠️请在“创建材质”积木中使用！';
            if (
                Number(this.Scratch.Cast.toString(color)) == Number(this.Scratch.Cast.toString(color))
            ) {
                this.threadInfo[thread.topBlock.concat(thread.target.id)][
                    this.threadInfo[
                        thread.topBlock.concat(thread.target.id)
                    ].length - 1
                ]['color'] = Number(this.Scratch.Cast.toString(color));
            } else {
                this.threadInfo[thread.topBlock.concat(thread.target.id)][
                    this.threadInfo[
                        thread.topBlock.concat(thread.target.id)
                    ].length - 1
                ]['color'] = this.Scratch.Cast.toString(color);
            }
        } catch (err) {
            return '⚠️请在“创建材质”积木中运行！';
        }
    }

    setMaterialFog({ YN }, util) {
        const thread = util.thread;
        try {
            if (
                this.threadInfo[thread.topBlock.concat(thread.target.id)][
                this.threadInfo[
                    thread.topBlock.concat(thread.target.id)
                ].length - 1
                ] === undefined
            )
                return '⚠️请在“创建材质”积木中使用！';
            if (this.Scratch.Cast.toString(YN) === 'ture') {
                this.threadInfo[thread.topBlock.concat(thread.target.id)][
                    this.threadInfo[
                        thread.topBlock.concat(thread.target.id)
                    ].length - 1
                ]['fog'] = true;
            } else {
                this.threadInfo[thread.topBlock.concat(thread.target.id)][
                    this.threadInfo[
                        thread.topBlock.concat(thread.target.id)
                    ].length - 1
                ]['fog'] = false;
            }
        } catch (err) {
            return '⚠️请在“创建材质”积木中运行！';
        }
    }

    // 实现return方法，用于处理返回值
    returnm({ material }, util) {
        material = this.Scratch.Cast.toString(material);
        const thread = util.thread;
        if (
            this.threadInfo[thread.topBlock.concat(thread.target.id)][
            this.threadInfo[thread.topBlock.concat(thread.target.id)]
            ] !== undefined &&
            this.threadInfo[thread.topBlock.concat(thread.target.id)][
            this.threadInfo[thread.topBlock.concat(thread.target.id)]
                .length - 1
            ] === undefined
        )
            return '⚠️请在“创建材质”积木中使用！';

        let blockID = thread.peekStack();
        while (blockID) {
            const block = thread.target.blocks.getBlock(blockID);
            if (
                block &&
                block.opcode ===
                chen_RenderTheWorld_extensionId + '_makeMaterial'
            ) {
                break;
            }
            thread.popStack();
            blockID = thread.peekStack();
        }

        if (thread.stack.length === 0) {
            // 清理干净！
            thread.requestScriptGlowInFrame = false;
            thread.status = thread.constructor.STATUS_DONE;
        } else {
            // 返回值
            let _material = '';

            if (material === 'Basic') {
                _material = new THREE.MeshBasicMaterial();
            } else if (material === 'Lambert') {
                _material = new THREE.MeshLambertMaterial();
            } else if (material === 'Phong') {
                _material = new THREE.MeshPhongMaterial();
            } else {
                _material = new THREE.MeshBasicMaterial();
            }
            _material.fog = true; // 默认受雾效果影响

            if (
                this.threadInfo[thread.topBlock.concat(thread.target.id)][
                this.threadInfo[
                    thread.topBlock.concat(thread.target.id)
                ].length - 1
                ]
            ) {
                for (let key in this.threadInfo[
                    thread.topBlock.concat(thread.target.id)
                ][
                    this.threadInfo[
                        thread.topBlock.concat(thread.target.id)
                    ].length - 1
                ]) {
                    if (key === 'color') {
                        _material.color.set(
                            this.threadInfo[
                            thread.topBlock.concat(thread.target.id)
                            ][
                            this.threadInfo[
                                thread.topBlock.concat(thread.target.id)
                            ].length - 1
                            ][key],
                        );
                    }
                    if (key === 'fog') {
                        _material.fog =
                            this.threadInfo[
                            thread.topBlock.concat(thread.target.id)
                            ][
                            this.threadInfo[
                                thread.topBlock.concat(thread.target.id)
                            ].length - 1
                            ][key];
                    }
                }
            }

            util.stackFrame._inlineReturn = new Wrapper(
                new RTW_Model_Box(_material, true, false, false, undefined),
            );

            thread.status = thread.constructor.STATUS_RUNNING;
        }
    }

    /**
     * 创建或重置模型
     * @param {object} args
     * @param {string} args.name
     * @param {_Wrapper} args.model
     */
    async importModel({ name, model }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }
        if (model === undefined) {
            return '⚠️模型加载失败！';
        }
        model = Wrapper.unwrap(model);

        if (!(model instanceof RTW_Model_Box)) {
            return '⚠️传入的模型无法识别';
        }

        let init_porject_time = this._init_porject_time; // 解决快速点击多次绿旗，模型重复添加问题
        name = this.Scratch.Cast.toString(name);
        this.releaseDuplicates(name);
        if (model.model != undefined && model.model.isObject3D) {
            this.render_engine.objects[name] = model.model;

            if (model.animations != undefined) {
                this.render_engine.animations[name] = model.animations;
            }

            let r = this.runtime.startHatsWithParams(
                chen_RenderTheWorld_extensionId + '_objectLoadingCompleted',
                {
                    parameters: {
                        name: name,
                    },
                },
            );
            r &&
                r.forEach((e) => {
                    this.runtime.sequencer.stepThread(e);
                });
            if (init_porject_time == this._init_porject_time) {
                this.render_engine.scene.add(this.render_engine.objects[name]);
                this.render_engine.render();
            }
        } else if (model.isobj) {
            this._objModel(
                name,
                model.model['objfile'],
                model.model['mtlfile'],
                init_porject_time,
            );
        } else if (model.isgltf) {
            this._gltfModel(
                name,
                model.model['gltffile'],
                init_porject_time,
            );
        }
    }

    shadowSettings({ name, YN, YN2 }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }
        let model = this._getModel(name);
        if (model !== -1) {
            if (this.Scratch.Cast.toString(YN) == 'true') {
                model.castShadow = true;
                model.traverse(function (node) {
                    if (node.isMesh) {
                        node.castShadow = true;
                    }
                });
            } else {
                model.castShadow = false;
                model.traverse(function (node) {
                    if (node.isMesh) {
                        node.castShadow = false;
                    }
                });
            }

            if (this.Scratch.Cast.toString(YN2) == 'true') {
                model.receiveShadow = true;
                model.traverse(function (node) {
                    if (node.isMesh) {
                        node.receiveShadow = true;
                    }
                });
            } else {
                model.receiveShadow = false;
                model.traverse(function (node) {
                    if (node.isMesh) {
                        node.receiveShadow = false;
                    }
                });
            }
        }
    }

    groupModel(args) {
        let _group = new THREE.Group();
        const dynamicArgs = getDynamicArgs(args);
        dynamicArgs.forEach((_model) => {
            _model = this._getModel(_model);
            if (_model === -1) return;
            _group.add(_model);
        });

        return new Wrapper(
            new RTW_Model_Box(_group, false, false, false, undefined),
        );
    }

    cubeModel({ a, b, h, material }) {
        material = Wrapper.unwrap(material);
        if (material !== undefined) {
            if (!material.ismaterial) {
                return '⚠️材质无效！';
            }
            material = material['model'];
        }

        let geometry = new THREE.BoxGeometry(
            this.Scratch.Cast.toNumber(a),

            this.Scratch.Cast.toNumber(b),

            this.Scratch.Cast.toNumber(h),
        );

        return new Wrapper(
            new RTW_Model_Box(
                new THREE.Mesh(geometry, material),
                false,
                false,
                false,
                undefined,
            ),
        );
    }

    sphereModel({ radius, w, h, material }) {
        material = Wrapper.unwrap(material);
        if (material !== undefined) {
            if (!material.ismaterial) {
                return '⚠️材质无效！';
            }
            material = material['model'];
        }

        let geometry = new THREE.SphereGeometry(
            this.Scratch.Cast.toNumber(radius),
            this.Scratch.Cast.toNumber(w),
            this.Scratch.Cast.toNumber(h),
        );

        return new Wrapper(
            new RTW_Model_Box(
                new THREE.Mesh(geometry, material),
                false,
                false,
                false,
                undefined,
            ),
        );
    }

    planeModel({ a, b, material }) {
        material = Wrapper.unwrap(material);
        if (material !== undefined) {
            if (!material.ismaterial) {
                return '⚠️材质无效！';
            }
            material = material['model'];
        }

        let geometry = new THREE.PlaneGeometry(
            this.Scratch.Cast.toNumber(a),
            this.Scratch.Cast.toNumber(b),
        );

        return new Wrapper(
            new RTW_Model_Box(
                new THREE.Mesh(geometry, material),
                false,
                false,
                false,
                undefined,
            ),
        );
    }

    objModel({ objfile, mtlfile }) {
        return new Wrapper(
            new RTW_Model_Box(
                {
                    objfile: objfile,
                    mtlfile: mtlfile,
                },
                false,
                true,
                false,
                undefined,
            ),
        );
    }
    _objModel(name, objfile, mtlfile, init_porject_time) {
        name = this.Scratch.Cast.toString(name);
        // 创建加载器
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        // 加载模型
        mtlLoader.load(this.getFileURL(this.Scratch.Cast.toString(mtlfile)), (mtl) => {
            mtl.preload();
            objLoader.setMaterials(mtl);

            objLoader.load(
                this.getFileURL(this.Scratch.Cast.toString(objfile)),
                (root) => {
                    this.render_engine.objects[name] = root;

                    let r = this.runtime.startHatsWithParams(
                        chen_RenderTheWorld_extensionId +
                        '_objectLoadingCompleted',
                        {
                            parameters: {
                                name: name,
                            },
                        },
                    );
                    r &&
                        r.forEach((e) => {
                            this.runtime.sequencer.stepThread(e);
                        });
                    if (init_porject_time == this._init_porject_time) {
                        this.render_engine.scene.add(this.render_engine.objects[name]);
                        this.render_engine.render();
                    }
                },
            );
        });
    }

    gltfModel({ gltffile }) {
        return new Wrapper(
            new RTW_Model_Box(
                {
                    gltffile: gltffile,
                },
                false,
                false,
                true,
                undefined,
            ),
        );
    }
    _gltfModel(name, gltffile, init_porject_time) {
        name = this.Scratch.Cast.toString(name);
        // 创建加载器
        const gltfLoader = new GLTFLoader();

        const url = this.getFileURL(this.Scratch.Cast.toString(gltffile));
        // 加载模型
        gltfLoader.load(url, (gltf) => {
            const root = gltf.scene;

            // 保存动画数据
            let mixer = new THREE.AnimationMixer(root);
            let clips = gltf.animations;
            this.render_engine.animations[name] = {
                mixer: mixer,
                clips: clips,
                action: {},
            };

            this.render_engine.objects[name] = root;

            let r = this.runtime.startHatsWithParams(
                chen_RenderTheWorld_extensionId + '_objectLoadingCompleted',
                {
                    parameters: {
                        name: name,
                    },
                },
            );
            r &&
                r.forEach((e) => {
                    this.runtime.sequencer.stepThread(e);
                });
            if (init_porject_time == this._init_porject_time) {
                this.render_engine.scene.add(this.render_engine.objects[name]);
                this.render_engine.render();
            }
        });
    }

    /**
         * 启动动画
         * @param {object} args
         * @param {string} args.name
         * @param {string} args.animationName
         */
    playAnimation(args) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }

        let name = this.Scratch.Cast.toString(args.name);
        const dynamicArgs = getDynamicArgs(args);

        let animationNames = [Cast.toString(args.animationName)].concat(
            dynamicArgs,
        );

        if (name in this.render_engine.animations && this.render_engine.animations[name].mixer) {
            animationNames.forEach((animationName) => {
                const cilp = THREE.AnimationClip.findByName(
                    this.render_engine.animations[name].clips,
                    animationName,
                );
                if (cilp) {
                    this.render_engine.animations[name].action[animationName] =
                        this.render_engine.animations[name].mixer.clipAction(cilp);
                    this.render_engine.animations[name].action[animationName].play();
                }
            });
        }
    }

    /**
     * 停止动画
     * @param {object} args
     * @param {string} args.name
     * @param {string} args.animationName
     */

    stopAnimation(args) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }

        let name = this.Scratch.Cast.toString(args.name);
        const dynamicArgs = getDynamicArgs(args);

        let animationNames = [Cast.toString(args.animationName)].concat(
            dynamicArgs,
        );

        if (name in this.render_engine.animations) {
            animationNames.forEach((animationName) => {
                if (animationName in this.render_engine.animations[name].action) {
                    this.render_engine.animations[name].action[animationName].stop();
                }
            });
        }
    }

    /**
     * 推进并更新动画
     * @param {object} args
     * @param {string} args.name
     * @param {number} args.time
     */

    updateAnimation({ name, time }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }

        name = this.Scratch.Cast.toString(name);

        time = this.Scratch.Cast.toNumber(time);
        if (name in this.render_engine.animations && this.render_engine.animations[name].mixer) {
            this.render_engine.animations[name].mixer.update(time);
        }
    }

    /**
     * 获取物体所有的动画
     * @param {object} args
     * @param {string} args.name
     */

    getAnimation({ name }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }

        name = this.Scratch.Cast.toString(name);

        if (name in this.render_engine.animations && this.render_engine.animations[name].clips) {
            const clips = [];
            for (let i = 0; i < this.render_engine.animations[name].clips.length; i++) {
                clips.push(this.render_engine.animations[name].clips[i].name);
            }
            return JSON.stringify(clips);
        } else {
            return '[]';
        }
    }

    /**
     * 销毁物体
     * @param {object} args
     * @param {string} args.name
     */

    destroyObject(args) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }
        const dynamicArgs = getDynamicArgs(args);

        this.releaseDuplicates(args.name);
        dynamicArgs.forEach((_name) => {
            this.releaseDuplicates(_name);
        });
        this.render_engine.render();
    }

    /**
     * 通过导入时设置的名称获取物体
     * @param {object} args
     * @param {string} args.name
     * @returns {Wrapper | ''}
     */
    getObjectByNmae({ name }) {
        name = this.Scratch.Cast.toString(name);
        if (name in this.render_engine.objects) {
            let _animations = undefined;
            if (name in this.render_engine.animations) {
                _animations = this.render_engine.animations[name];
            }
            return new Wrapper(
                new RTW_Model_Box(
                    this.render_engine.objects[name],
                    false,
                    false,
                    false,
                    _animations,
                ),
            );
        } else return '';
    }

    rotationObject({ name, x, y, z }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }

        let model = this._getModel(name);
        if (model === -1) return '⚠️传入的名称或物体有误！';
        model.rotation.set(
            THREE.MathUtils.degToRad(this.Scratch.Cast.toNumber(x)),

            THREE.MathUtils.degToRad(this.Scratch.Cast.toNumber(y)),

            THREE.MathUtils.degToRad(this.Scratch.Cast.toNumber(z)),
        );
        this.render_engine.render();
    }

    moveObject({ name, x, y, z }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }

        let model = this._getModel(name);
        if (model === -1) return '⚠️传入的名称或物体有误！';
        // 设置坐标
        model.position.set(
            this.Scratch.Cast.toNumber(x),

            this.Scratch.Cast.toNumber(y),

            this.Scratch.Cast.toNumber(z),
        );
        this.render_engine.render();
    }

    scaleObject({ name, x, y, z }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }

        let model = this._getModel(name);
        if (model === -1) return '⚠️传入的名称或物体有误！';
        // 设置缩放
        model.scale.set(
            this.Scratch.Cast.toNumber(x),

            this.Scratch.Cast.toNumber(y),

            this.Scratch.Cast.toNumber(z),
        );
    }

    /**
     * 获取物体坐标
     * @param {object} args
     * @param {string} args.name
     * @param {string} args.xyz
     */
    getObjectPos({ name, xyz }) {
        let model = this._getModel(name);
        if (model === -1) return '⚠️传入的名称或物体有误！';
        switch (this.Scratch.Cast.toString(xyz)) {
            case 'x':
                return model.position.x;
            case 'y':
                return model.position.y;
            case 'z':
                return model.position.z;
        }
    }

    /**
     * 获取物体旋转角度
     * @param {object} args
     * @param {string} args.name
     * @param {string} args.xyz
     */

    getObjectRotation({ name, xyz }) {
        let model = this._getModel(name);
        if (model === -1) return '⚠️传入的名称或物体有误！';
        switch (this.Scratch.Cast.toString(xyz)) {
            case 'x':
                return THREE.MathUtils.radToDeg(model.rotation.x);
            case 'y':
                return THREE.MathUtils.radToDeg(model.rotation.y);
            case 'z':
                return THREE.MathUtils.radToDeg(model.rotation.z);
        }
    }

    /**
     * 获取物体缩放
     * @param {object} args
     * @param {string} args.name
     * @param {string} args.xyz
     */
    getObjectScale({ name, xyz }) {
        let model = this._getModel(name);
        if (model === -1) return '⚠️传入的名称或物体有误！';
        switch (this.Scratch.Cast.toString(xyz)) {
            case 'x':
                return model.scale.x;
            case 'y':
                return model.scale.y;
            case 'z':
                return model.scale.z;
        }
    }

    /**
     * 获取物体子物体数量
     * @param {object} args
     * @param {string} args.name
     * @returns {number}
     */
    getChildrenNumInObject({ name }) {
        let model = this._getModel(name);
        if (model === -1) return -1;
        return model.children.length;
    }

    /**
     * 获取物体子物体
     * @param {object} args
     * @param {string} args.name
     * @param {number} args.num
     * @returns {Wrapper | ''}
     */
    getChildrenInObject(args) {
        let model = this._getModel(args.name),
            num = [Cast.toNumber(args.num)].concat(getDynamicArgs(args)),
            cnt = 0;
        while (model !== -1 && cnt < num.length) {
            let _num = num[cnt++] - 1;
            if (_num >= 0 && model.children[_num]) {
                model = model.children[_num];
            }
        }
        return model === -1
            ? ''
            : new Wrapper(
                new RTW_Model_Box(model, false, false, false, undefined),
            );
    }

    getChildrenInObjectByName({ name, name2 }) {
        let model = this._getModel(name);
        if (model === -1) return '';
        let child = model.getObjectByName(this.Scratch.Cast.toString(name2));
        return child === undefined
            ? ''
            : new Wrapper(
                new RTW_Model_Box(child, false, false, false, undefined),
            );
    }

    addChildren({ name, name2 }) {
        let model = this._getModel(name);
        if (model === -1) return '⚠️要添加子物体的物体不正确';
        let model2 = this._getModel(name2);
        if (model2 === -1) return '⚠️要添加的子物体不正确';
        model.add(model2);
    }

    removeChildren({ name, name2 }) {
        let model = this._getModel(name);
        if (model === -1) return '⚠️要删除子物体的物体不正确';
        let model2 = this._getModel(name2);
        if (model2 === -1) return '⚠️要删除的子物体不正确';
        model.remove(model2);
    }

    getScene() {
        return this.render_engine.scene === null
            ? null
            : new Wrapper(
                new RTW_Model_Box(
                    this.render_engine.scene,
                    false,
                    false,
                    false,
                    undefined,
                ),
            );
    }

    pointLight({ color, intensity, x, y, z, decay, YN }) {
        let _point_light = new THREE.PointLight(
            this.Scratch.Cast.toNumber(color),
            this.Scratch.Cast.toNumber(intensity),
            0,
            this.Scratch.Cast.toNumber(decay),
        ); //创建光源
        _point_light.position.set(
            this.Scratch.Cast.toNumber(x),

            this.Scratch.Cast.toNumber(y),

            this.Scratch.Cast.toNumber(z),
        ); //设置光源的位置

        _point_light.shadow.bias = -0.00005;

        if (this.Scratch.Cast.toString(YN) == 'true') {
            _point_light.castShadow = true;
        }
        return new Wrapper(
            new RTW_Model_Box(_point_light, false, false, false, undefined),
        );
    }

    directionalLight({ color, intensity, x, y, z, x2, y2, z2, YN }) {
        let _directional_light = new THREE.DirectionalLight(
            this.Scratch.Cast.toNumber(color),
            this.Scratch.Cast.toNumber(intensity),
        ); //创建光源

        _directional_light.position.set(
            this.Scratch.Cast.toNumber(x),

            this.Scratch.Cast.toNumber(y),

            this.Scratch.Cast.toNumber(z),
        ); //设置光源的位置
        _directional_light.target.position.set(
            this.Scratch.Cast.toNumber(x),

            this.Scratch.Cast.toNumber(y),

            this.Scratch.Cast.toNumber(z),
        ); //设置光源目标的位置

        _directional_light.shadow.bias = -0.00005;
        if (this.Scratch.Cast.toString(YN) == 'true') {
            _directional_light.castShadow = true;
        }

        // 设置平行光范围大一点。
        _directional_light.shadow.camera.left = -20;
        _directional_light.shadow.camera.right = 20;
        _directional_light.shadow.camera.top = 20;
        _directional_light.shadow.camera.bottom = -20;
        _directional_light.shadow.camera.near = 0.1;
        _directional_light.shadow.camera.far = 1000;

        return new Wrapper(
            new RTW_Model_Box(
                _directional_light,
                false,
                false,
                false,
                undefined,
            ),
        );
    }

    /**
     * 设置平行光的阴影投射范围
     * @param {object} args
     * @param {string} args.name
     * @param {number} args.left
     * @param {number} args.right
     * @param {number} args.top
     * @param {number} args.bottom
     */
    setDirectionalLightShawdowCamera({
        name,
        left,
        right,
        top,
        bottom,
        near,
        far,
    }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }

        let model = this._getModel(name);
        if (model === -1) return '⚠️传入的名称或物体有误！';

        if (model.type === 'DirectionalLight') {
            // let _camera = new THREE.OrthographicCamera(
            //    this.Scratch.Cast.toNumber(left),
            //    this.Scratch.Cast.toNumber(right),
            //    this.Scratch.Cast.toNumber(top),
            //    this.Scratch.Cast.toNumber(bottom),
            //    this.Scratch.Cast.toNumber(near),
            //    this.Scratch.Cast.toNumber(far),
            // );
            // _camera.zoom = model.shadow.camera.zoom;
            // model.shadow.camera = _camera;
            model.shadow.camera.left = this.Scratch.Cast.toNumber(left);
            model.shadow.camera.right = this.Scratch.Cast.toNumber(right);
            model.shadow.camera.top = this.Scratch.Cast.toNumber(top);
            model.shadow.camera.bottom = this.Scratch.Cast.toNumber(bottom);
            model.shadow.camera.near = this.Scratch.Cast.toNumber(near);
            model.shadow.camera.far = this.Scratch.Cast.toNumber(far);
        } else {
            return "⚠️'" + Cast.toString(name) + "'不是平行光！";
        }
    }

    /**
     * 设置光源阴影贴图大小
     * @param {object} args
     * @param {string} args.name
     * @param {number} args.xsize
     * @param {number} args.ysize
     */
    setLightMapSize({ name, xsize, ysize }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }

        let model = this._getModel(name);
        if (model === -1) return '⚠️传入的名称或物体有误！';
        if (model.isLight) {
            model.shadow.mapSize.set(
                this.Scratch.Cast.toNumber(xsize),
                this.Scratch.Cast.toNumber(ysize),
            );
        } else {
            return "⚠️'" + Cast.toString(name) + "'不是光源！";
        }
    }

    /**
     * 设置环境光颜色
     * @param {object} args
     * @param {number} args.color
     * @param {number} args.intensity
     */

    setAmbientLightColor({ color, intensity }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }
        // 设置环境光颜色
        this.ambient_light.color = new THREE.Color(this.Scratch.Cast.toNumber(color));

        this.ambient_light.intensity = this.Scratch.Cast.toNumber(intensity);
        this.render_engine.render();
    }

    /**
     * 设置环境光颜色
     * @param {object} args
     * @param {number} args.skyColor
     * @param {number} args.groundColor
     * @param {number} args.intensity
     */

    setHemisphereLightColor({ skyColor, groundColor, intensity }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }
        // 设置环境光颜色
        this.hemisphere_light.color = new THREE.Color(
            this.Scratch.Cast.toNumber(skyColor),
        );
        this.hemisphere_light.groundColor = new THREE.Color(
            this.Scratch.Cast.toNumber(groundColor),
        );

        this.hemisphere_light.intensity = this.Scratch.Cast.toNumber(intensity);
        this.render_engine.render();
    }

    useCamera({ camera }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }
        let model = this._getModel(camera);
        if (model === -1) return '⚠️传入的相机有误！';
        this.camera = model;
    }

    perspectiveCamera({ fov, aspect, near, far }) {
        return new Wrapper(
            new RTW_Model_Box(
                new THREE.PerspectiveCamera(
                    this.Scratch.Cast.toNumber(fov),
                    this.Scratch.Cast.toNumber(aspect),
                    this.Scratch.Cast.toNumber(near),
                    this.Scratch.Cast.toNumber(far),
                ),
                false,
                false,
                false,
                undefined,
            ),
        );
    }

    /**
     * 移动相机
     * @param {object} args
     * @param {number} args.x
     * @param {number} args.y
     * @param {number} args.z
     */

    moveCamera({ x, y, z }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }
        this.camera.position.set(
            this.Scratch.Cast.toNumber(x),
            this.Scratch.Cast.toNumber(y),
            this.Scratch.Cast.toNumber(z),
        );
    }

    /**
     * 旋转相机
     * @param {object} args
     * @param {number} args.x
     * @param {number} args.y
     * @param {number} args.z
     */

    rotationCamera({ x, y, z }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }
        this.camera.rotation.set(
            THREE.MathUtils.degToRad(this.Scratch.Cast.toNumber(x)),

            THREE.MathUtils.degToRad(this.Scratch.Cast.toNumber(y)),

            THREE.MathUtils.degToRad(this.Scratch.Cast.toNumber(z)),
        );
        // const cameraPos = this.camera.position.clone();
        // const controlsTag = this.controls.target.clone();
        // controlsTag.sub(cameraPos);
        // // 麻烦。。。
        // const euler = new THREE.Euler(
        //     THREE.MathUtils.degToRad(this.Scratch.Cast.toNumber(x)),
        //     THREE.MathUtils.degToRad(this.Scratch.Cast.toNumber(y)),
        //     THREE.MathUtils.degToRad(this.Scratch.Cast.toNumber(z)),
        //     'XYZ',
        // );
        // const quaternion = new THREE.Quaternion().setFromEuler(euler);

        // controlsTag.applyQuaternion(quaternion);
        // cameraPos.add(controlsTag);
        // this.controls.target.set(cameraPos.x, cameraPos.y, cameraPos.z);
    }

    /**
     * 让相机面向
     * @param {object} args
     * @param {number} args.x
     * @param {number} args.y
     * @param {number} args.z
     */
    cameraLookAt({ x, y, z }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }
        // this.controls.target.set(
        //    this.Scratch.Cast.toNumber(x),
        //    this.Scratch.Cast.toNumber(y),
        //    this.Scratch.Cast.toNumber(z),
        // );
        this.camera.lookAt(
            this.Scratch.Cast.toNumber(x),
            this.Scratch.Cast.toNumber(y),
            this.Scratch.Cast.toNumber(z),
        );
    }

    /**
     * 获取相机坐标
     * @param {object} args
     * @param {string} args.xyz
     */
    getCameraPos({ xyz }) {
        if (!this.camera) {
            return;
        }

        switch (this.Scratch.Cast.toString(xyz)) {
            case 'x':
                return this.camera.position.x;
            case 'y':
                return this.camera.position.y;
            case 'z':
                return this.camera.position.z;
        }
    }

    /**
     * 获取相机旋转角度
     * @param {object} args
     * @param {string} args.xyz
     */

    getCameraRotation({ xyz }) {
        if (!this.camera) {
            return;
        }

        switch (this.Scratch.Cast.toString(xyz)) {
            case 'x':
                return THREE.MathUtils.radToDeg(this.camera.rotation.x);
            case 'y':
                return THREE.MathUtils.radToDeg(this.camera.rotation.y);
            case 'z':
                return THREE.MathUtils.radToDeg(this.camera.rotation.z);
        }
    }


    mouseControl({ name, yn1, yn2, yn3 }) {
        let model = this._getModel(name);
        if (model === -1 || !model.update) return '⚠️设置的控制器有误！';

        let enablePan = false;
        let enableZoom = false;
        let enableRotate = false;
        if (yn1 == 'true') {
            enablePan = true;
        }
        if (yn2 == 'true') {
            enableZoom = true;
        }
        if (yn3 == 'true') {
            enableRotate = true;
        }

        model.enablePan = enablePan;
        model.enableZoom = enableZoom;
        model.enableRotate = enableRotate;
        model.update();
    }

    createOrbitControls({ name }) {
        let model = this._getModel(name);
        if (model === -1) return '⚠️绑定的对象有误！';

        let _orbitControls = new OrbitControls(
            model,
            this.runtime.renderer.canvas,
        );

        _orbitControls.update();

        return new Wrapper(
            new RTW_Model_Box(
                _orbitControls,
                false,
                false,
                false,
                undefined,
            ),
        );
    }

    updateControls({ name }) {
        let model = this._getModel(name);
        if (model === -1 || !model.update) return '⚠️更新的控制器有误！';

        model.update();
    }

    setControlState({ name, YN }) {
        let model = this._getModel(name);
        if (model === -1 || !model.update) return '⚠️设置的控制器有误！';

        if (this.Scratch.Cast.toString(YN) == 'true') {
            model.enabled = true;
        } else {
            model.enabled = false;
        }
        model.update();
    }

    mouseCanControl({ name }) {
        let model = this._getModel(name);
        if (model === -1 || !model.update) return '⚠️设置的控制器有误！';
        return model.enabled;
    }


    setControlDamping({ name, YN2 }) {
        let model = this._getModel(name);
        if (model === -1 || !model.update) return '⚠️设置的控制器有误！';

        if (this.Scratch.Cast.toString(YN2) == 'yes') {
            model.enableDamping = true;
        } else {
            model.enableDamping = false;
        }
    }

    setControlDampingNum({ name, num }) {
        let model = this._getModel(name);
        if (model === -1 || !model.update) return '⚠️设置的控制器有误！';

        model.dampingFactor = this.Scratch.Cast.toNumber(num);
    }

    setOrbitControlsTarget({ name, x, y, z }) {
        let model = this._getModel(name);
        if (model === -1 || !model.update || !(model.target instanceof THREE.Vector3)) return '⚠️设置的轨道控制器有误！';

        model.target.set(
            this.Scratch.Cast.toNumber(x),
            this.Scratch.Cast.toNumber(y),
            this.Scratch.Cast.toNumber(z),
        );
    }

    /**
     * 启用雾效果并设置雾颜色
     * @param {object} args
     * @param {number} args.color
     * @param {number} args.near
     * @param {number} args.far
     */

    enableFogEffect({ color, near, far }) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }
        this.render_engine.scene.fog = new THREE.Fog(
            this.Scratch.Cast.toNumber(color),

            this.Scratch.Cast.toNumber(near),

            this.Scratch.Cast.toNumber(far),
        );
        this.render_engine.render();
    }

    /**
     * 禁用雾效果
     */

    disableFogEffect(args) {
        // if (!this.render_engine.tc) {
        //     return '⚠️显示器未初始化！';
        // }
        this.render_engine.scene.fog = null;
        this.render_engine.render();
    }

    /**
     * 处理颜色
     * @param {object} args
     * @param {number} args.R
     * @param {number} args.G
     * @param {number} args.B
     * @returns {number}
     */
    color_RGB({ R, G, B }) {
        return (
            Math.min(Math.max(this.Scratch.Cast.toNumber(R), 0), 255) * 65536 +
            Math.min(Math.max(this.Scratch.Cast.toNumber(G), 0), 255) * 256 +
            Math.min(Math.max(this.Scratch.Cast.toNumber(B), 0), 255)
        );
    }
}

export { Extension };
