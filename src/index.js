/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */
// 扩展资源
import {
    chen_RenderTheWorld_extensionId,
    chen_RenderTheWorld_picture,
    chen_RenderTheWorld_icon,
    rightSelectButton,
    rightButton,
    leftButton,
} from './assets/index.js';

import l10n from './l10n/index.js';

// 依赖库
import * as SkeletonUtils from './assets/threejs_ext/SkeletonUtils.js';
import { OrbitControls } from './assets/threejs_ext/OrbitControls.js';
import { GLTFLoader } from './assets/threejs_ext/GLTFLoader.js';
import { OBJLoader } from './assets/threejs_ext/OBJLoader.js';
import { MTLLoader } from './assets/threejs_ext/MTLLoader.js';
import * as THREE from './assets/threejs/src/Three.js';
import WebGL from './assets/threejs_ext/WebGL.js';

// utils
import {
    refactoringVisualReport,
    inMainWorkspace,
    getScratchBlocks,
    getVM,
    hackFun,
} from './utils/scratchTools.js';
import { getDynamicArgs, initExpandableBlocks } from './utils/extendableBlock.js';
import { addRTWStyle, RTW_Model_Box, Wrapper, patch } from './utils/RTWTools.js';
import { addFileType } from './utils/gandiAssetTools.js';
import { Skins } from './utils/canvasSkin.js';
import { mod } from './assets/threejs/build/three.tsl.js';

(function (Scratch) {
    'use strict';
    const { logSystem } = Scratch.vm.runtime;
    const logError = (...args) => {
        logSystem?.error(...args);
        console.error(...args);
    };

    addRTWStyle(`
        .RTW-blockbutton {
            cursor: pointer;
        }
        .RTW-blockbutton:hover {
            filter: brightness(150%);
        }
    `);

    const {
        ArgumentType,
        BlockType,
        TargetType,
        Cast,
        translate,
        extensions,
        runtime,
    } = Scratch;

    translate.setup(l10n);

    class RenderTheWorld {
        constructor(_runtime) {
            this.runtime = _runtime ?? Scratch?.vm?.runtime;
            if (!this.runtime) return;
            hackFun(this.runtime);

            this.ScratchBlocks = void 0;
            this.vm = getVM(this.runtime);

            this.ScratchBlocks = getScratchBlocks(this.runtime);
            if (!this.ScratchBlocks) {
                this.vm.once('workspaceUpdate', () => {
                    const newScratchBlocks = getScratchBlocks(this.vm);
                    if (newScratchBlocks && newScratchBlocks !== this.ScratchBlocks) {
                        this.ScratchBlocks = newScratchBlocks;
                    }
                });
            }
            console.log(this.ScratchBlocks);


            this.gandi = this.runtime.gandi;
            addFileType(this, 'OBJ', 'obj');
            addFileType(this, 'MTL', 'mtl');
            addFileType(this, 'GLTF', 'gltf');

            this.vm.runtime.on('GANDI_ASSET_UPDATE', ({ data, type }) => {
                if (
                    data.dataFormat ===
                    this.runtime.storage.AssetType.OBJ.runtimeFormat ||
                    data.dataFormat ===
                    this.runtime.storage.AssetType.MTL.runtimeFormat ||
                    data.dataFormat ===
                    this.runtime.storage.AssetType.GLTF.runtimeFormat
                )
                    this.runtime.getGandiAssetsFileList().forEach((file) => {
                        let assetType = this.runtime.storage.AssetType;
                        if (file.dataFormat === assetType.OBJ.runtimeFormat) {
                            this.runtime.getGandiAssetFile(
                                file.fullName,
                            ).assetType = this.runtime.getGandiAssetFile(
                                file.fullName,
                            ).asset.assetType = assetType.OBJ;
                        } else if (
                            file.dataFormat === assetType.MTL.runtimeFormat
                        ) {
                            this.runtime.getGandiAssetFile(
                                file.fullName,
                            ).assetType = this.runtime.getGandiAssetFile(
                                file.fullName,
                            ).asset.assetType = assetType.MTL;
                        } else if (
                            file.dataFormat === assetType.GLTF.runtimeFormat
                        ) {
                            this.runtime.getGandiAssetFile(
                                file.fullName,
                            ).assetType = this.runtime.getGandiAssetFile(
                                file.fullName,
                            ).asset.assetType = assetType.GLTF;
                        }
                    });
            });
            refactoringVisualReport(this);
            // 注册可拓展积木
            console.log('RTW', inMainWorkspace(this));
            if (inMainWorkspace(this)) {
                // 修复ccw_hat_parameter的颜色问题
                this._RTW_hat_parameters = new Set();
                this.objectLoadingCompletedUpdate = () => {
                    this.ScratchBlocks.getMainWorkspace()
                        .getAllBlocks()
                        .filter((block) => block.type === 'ccw_hat_parameter')
                        .forEach((hat_parameter) => {
                            if (
                                hat_parameter.svgGroup_.getElementsByTagName(
                                    'text',
                                )[0].textContent === 'name'
                            ) {
                                // 这里是判断参数的名称，防止误判
                                let flag =
                                    hat_parameter['is_RTW_hat_parameter'] ==
                                        true ||
                                        this._RTW_hat_parameters.has(
                                            hat_parameter.id,
                                        )
                                        ? true
                                        : false;
                                let parentBlock_ = hat_parameter.parentBlock_;
                                while (!flag && parentBlock_ !== null) {
                                    this._RTW_hat_parameters.add(
                                        hat_parameter.id,
                                    );
                                    if (
                                        parentBlock_.type ===
                                        chen_RenderTheWorld_extensionId +
                                        '_objectLoadingCompleted'
                                    ) {
                                        // 如果这个ccw_hat_parameter的最高层是objectLoadingCompleted积木，说明他是objectLoadingCompleted的ccw_hat_parameter
                                        flag = true;
                                        break;
                                    }
                                    parentBlock_ = parentBlock_.parentBlock_;
                                }
                                if (flag) {
                                    hat_parameter['is_RTW_hat_parameter'] =
                                        true;
                                    hat_parameter.colour_ =
                                        hat_parameter.svgPath_.style.fill =
                                        '#121C3D';
                                    hat_parameter.colourTertiary_ =
                                        hat_parameter.svgPath_.style.stroke =
                                        '#4A76FF';
                                }
                                this._RTW_hat_parameters.forEach((id) => {
                                    if (
                                        this.ScratchBlocks.getMainWorkspace().getBlockById(
                                            id,
                                        ) === null
                                    ) {
                                        this._RTW_hat_parameters.delete(id);
                                    }
                                });
                            }
                        });
                };
                this.runtime.on(
                    'PROJECT_LOADED',
                    this.objectLoadingCompletedUpdate,
                ); // 项目加载完
                this.runtime.on(
                    'BLOCK_DRAG_UPDATE',
                    this.objectLoadingCompletedUpdate,
                ); // 拖动完积木后
                this.runtime.on(
                    'BLOCKSINFO_UPDATE',
                    this.objectLoadingCompletedUpdate,
                ); // 切换角色时
                initExpandableBlocks(
                    this,
                    rightButton,
                    leftButton,
                    rightSelectButton,
                );
            }

            this.is_listener = false;
            this._init_porject_time = 0;

            // 兼容性
            // this.isWebglAvailable = false;
            if (WebGL.isWebGL2Available()) {
                this.isWebglAvailable = true;
            } else {
                this.isWebglAvailable = false;
                window.alert(
                    'RenderTheWorld:\nYour graphics card does not seem to support WebGL 2',
                );
            }

            // 渲染器
            this.renderer = null;
            // 场景
            this.scene = null;

            // 相机配置
            this.fov = null;
            this.aspect = null;
            this.near = null;
            this.far = null;
            this.camera = null;
            this.controls = null;

            // 环境光
            this.ambient_light = null;
            // 半球光
            this.hemisphere_light = null;

            // 物体
            this.objects = {};
            // 动画
            this.animations = {};

            // threejs显示canvas
            this.tc = null;
            this.isTcShow = false;
            this.NullCanvas = document.createElement('canvas');

            // threejs skin
            let index = this.runtime.renderer._groupOrdering.indexOf('video');
            this.runtime.renderer._groupOrdering.splice(
                index + 1,
                0,
                'RenderTheWorld',
            );
            this.runtime.renderer._layerGroups['RenderTheWorld'] = {
                groupIndex: 0,
                drawListOffset:
                    this.runtime.renderer._layerGroups['video'].drawListOffset,
            };
            for (
                let i = 0;
                i < this.runtime.renderer._groupOrdering.length;
                i++
            ) {
                this.runtime.renderer._layerGroups[
                    this.runtime.renderer._groupOrdering[i]
                ].groupIndex = i;
            }

            // Create drawable and skin
            this.threeSkinId = this.runtime.renderer._nextSkinId++;
            let SkinsClass = new Skins(this.runtime);
            this.threeSkin = new SkinsClass.CanvasSkin(
                this.threeSkinId,
                this.runtime.renderer,
            );
            this.threeSkin.setContent(this.NullCanvas); // 修复一加载扩展物体就显示画布的问题
            this.runtime.renderer._allSkins[this.threeSkinId] = this.threeSkin;

            // threejs drawable layer
            this.threeDrawableId =
                this.runtime.renderer.createDrawable('RenderTheWorld');
            this.runtime.renderer.updateDrawableSkinId(
                this.threeDrawableId,
                this.threeSkinId,
            );

            // this.clock = null;
            // this._clock = 0;

            this.threadInfo = {};

            // 重新实现“output”和“outputShape”块参数
            const cbfsb = this.runtime._convertBlockForScratchBlocks.bind(
                this.runtime,
            );
            this.runtime._convertBlockForScratchBlocks = function (
                blockInfo,
                categoryInfo,
            ) {
                const res = cbfsb(blockInfo, categoryInfo);
                if (blockInfo.outputShape) {
                    if (!res.json.outputShape)
                        res.json.outputShape = blockInfo.outputShape;
                }
                if (blockInfo.output) {
                    if (!res.json.output) res.json.output = blockInfo.output;
                }
                if (!res.json.branchCount)
                    res.json.branchCount = blockInfo.branchCount;
                return res;
            };
        }

        /**
         * 翻译
         * @param {string} id
         * @returns {string}
         */
        formatMessage(id) {
            return translate({
                id,
                default: id,
                description: id,
            });
        }

        getInfo() {
            // 在获取积木信息时重新加载translate.setup，可以避免有时候积木文本变成类似于“extid.opcode”的情况，这里比lpp更进了一步！
            translate.setup(l10n);

            let blocks = [
                {
                    blockType: BlockType.BUTTON,
                    text: this.formatMessage('RenderTheWorld.apidocs'),
                    onClick: this.docs,
                },
                {
                    opcode: 'init',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.init'),
                    arguments: {
                        color: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        sizex: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 640,
                        },
                        sizey: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 360,
                        },
                        ed: {
                            type: ArgumentType.STRING,
                            menu: 'ed',
                        },
                        shadowMapType: {
                            type: ArgumentType.STRING,
                            defaultValue: 1,
                            menu: 'WebGLRendererShadowMapType',
                        },
                    },
                    // dynamicArgsInfo: {
                    //     defaultValues: 'shadowMapType',
                    //     dynamicArgTypes: ['l'],
                    // },
                },
                {
                    opcode: 'set3dState',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.set3dState'),
                    arguments: {
                        state: {
                            type: ArgumentType.STRING,
                            menu: '3dState',
                        },
                    },
                },
                {
                    opcode: 'get3dState',
                    blockType: BlockType.BOOLEAN,
                    text: this.formatMessage('RenderTheWorld.get3dState'),
                    arguments: {},
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('RenderTheWorld.tools'),
                },
                {
                    opcode: 'color_RGB',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage('RenderTheWorld.color_RGB'),
                    arguments: {
                        R: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 255,
                        },
                        G: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 255,
                        },
                        B: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 255,
                        },
                    },
                    disableMonitor: true,
                },
                {
                    opcode: 'isWebGLAvailable',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.isWebGLAvailable'),
                    arguments: {},
                },
                {
                    opcode: '_isWebGLAvailable',
                    blockType: BlockType.BOOLEAN,
                    text: this.formatMessage(
                        'RenderTheWorld._isWebGLAvailable',
                    ),
                    arguments: {},
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('RenderTheWorld.objects'),
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('RenderTheWorld.Material'),
                },
                {
                    opcode: 'makeMaterial',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.makeMaterial'),
                    arguments: {
                        material: {
                            type: null,
                            menu: 'material',
                            defaultValue: 'Basic',
                        },
                    },
                    output: 'Boolean',
                    outputShape: 3,
                    branchCount: 1,
                    hideFromPalette: true,
                },
                {
                    opcode: 'makeMaterial',
                    blockType: Scratch.BlockType.XML,
                    xml: `
                          <block type="${chen_RenderTheWorld_extensionId}_makeMaterial">
                              <value name="SUBSTACK">
                                  <block type="${chen_RenderTheWorld_extensionId}_return"></block>
                              </value>
                          </block>
                          `,
                },
                {
                    opcode: 'setMaterialColor',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.setMaterialColor'),
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: '',
                        },
                    },
                },
                {
                    opcode: 'setMaterialFog',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.setMaterialFog'),
                    arguments: {
                        YN: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                            defaultValue: 'true',
                        },
                    },
                },
                {
                    opcode: 'return',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.return'),
                    arguments: {},
                    isTerminal: true,
                    hideFromPalette: true,
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('RenderTheWorld.Model'),
                },
                {
                    opcode: 'objectLoadingCompleted',
                    blockType: BlockType.EVENT,
                    text: this.formatMessage(
                        'RenderTheWorld.objectLoadingCompleted',
                    ),
                    isEdgeActivated: false,
                    shouldRestartExistingThreads: false,
                    arguments: {
                        name: {
                            type: ArgumentType.CCW_HAT_PARAMETER,
                            defaultValue: 'name',
                        },
                    },
                },
                {
                    opcode: 'importModel',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.importModel'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        model: {
                            type: null,
                            defaultValue: '',
                        },
                    },
                },
                {
                    opcode: 'destroyObject',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.destroyObject'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name1',
                        },
                    },
                    dynamicArgsInfo: {
                        defaultValues: (i) => `name${i + 2}`,
                        afterArg: 'name',
                        joinCh: ', ',
                        dynamicArgTypes: ['s'],
                    },
                },
                {
                    opcode: 'getObjectByNmae',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.getObjectByNmae'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'cubeModel',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.cubeModel'),
                    arguments: {
                        a: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                        b: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                        h: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                        material: {
                            type: null,
                            defaultValue: '',
                        },
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'sphereModel',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.sphereModel'),
                    arguments: {
                        radius: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3,
                        },
                        w: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 32,
                        },
                        h: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 16,
                        },
                        material: {
                            type: null,
                            defaultValue: '',
                        },
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'planeModel',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.planeModel'),
                    arguments: {
                        a: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                        b: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                        material: {
                            type: null,
                            defaultValue: '',
                        },
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'objModel',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.objModel'),
                    arguments: {
                        objfile: {
                            type: ArgumentType.STRING,
                            menu: 'obj_file_list',
                        },
                        mtlfile: {
                            type: ArgumentType.STRING,
                            menu: 'mtl_file_list',
                        },
                        material: {
                            type: null,
                            defaultValue: '',
                        },
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'gltfModel',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.gltfModel'),
                    arguments: {
                        gltffile: {
                            type: ArgumentType.STRING,
                            menu: 'gltf_file_list',
                        },
                        material: {
                            type: null,
                            defaultValue: '',
                        },
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'groupModel',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.groupModel'),
                    arguments: {},
                    dynamicArgsInfo: {
                        defaultValues: 'MODEL',
                        dynamicArgTypes: ['s'],
                        joinCh: ', ',
                        preText: (n) =>
                            n === 0
                                ? this.formatMessage(
                                    'RenderTheWorld.groupModel',
                                )
                                : `${this.formatMessage('RenderTheWorld.groupModel')}[`,
                        endText: (n) => (n === 0 ? '' : ']'),
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'shadowSettings',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.shadowSettings'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        YN: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                        YN2: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                    },
                },

                {
                    opcode: 'makeCube',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.makeCube'),
                    hideFromPalette: true,
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        a: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                        b: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                        h: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                        color: {
                            type: ArgumentType.NUMBER,
                        },
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        YN: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                        YN2: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                    },
                },
                {
                    opcode: 'makeSphere',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.makeSphere'),
                    hideFromPalette: true,
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        radius: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3,
                        },
                        w: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 32,
                        },
                        h: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 16,
                        },
                        color: {
                            type: ArgumentType.NUMBER,
                        },
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        YN: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                        YN2: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                    },
                },
                {
                    opcode: 'makePlane',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.makePlane'),
                    hideFromPalette: true,
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        a: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                        b: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                        color: {
                            type: ArgumentType.NUMBER,
                        },
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        YN: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                        YN2: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                    },
                },
                {
                    opcode: 'importOBJ',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.importOBJ'),
                    hideFromPalette: true,
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        objfile: {
                            type: ArgumentType.STRING,
                            menu: 'obj_file_list',
                        },
                        mtlfile: {
                            type: ArgumentType.STRING,
                            menu: 'mtl_file_list',
                        },
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        YN: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                        YN2: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                    },
                },
                {
                    opcode: 'importGLTF',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.importGLTF'),
                    hideFromPalette: true,
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        gltffile: {
                            type: ArgumentType.STRING,
                            menu: 'gltf_file_list',
                        },
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        YN: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                            defaultValue: 'false',
                        },
                        YN2: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                    },
                },
                '---',
                {
                    opcode: 'getChildrenNumInObject',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage(
                        'RenderTheWorld.getChildrenNumInObject',
                    ),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                    },
                    disableMonitor: true,
                },
                {
                    opcode: 'getChildrenInObject',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage(
                        'RenderTheWorld.getChildrenInObject',
                    ),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        num: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                        },
                    },
                    dynamicArgsInfo: {
                        afterArg: 'num',
                        defaultValues: '1',
                        dynamicArgTypes: ['n'],
                        joinCh: this.formatMessage(
                            'RenderTheWorld.getChildrenInObject.joinCh',
                        ),
                        preText: this.formatMessage(
                            'RenderTheWorld.getChildrenInObject.preText',
                        ),
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'getChildrenInObjectByName',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage(
                        'RenderTheWorld.getChildrenInObjectByName',
                    ),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        name2: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'addChildren',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.addChildren'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        name2: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                    },
                },
                {
                    opcode: 'removeChildren',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.removeChildren'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        name2: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                    },
                },
                '---',
                {
                    opcode: 'getScene',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.getScene'),
                    arguments: {},
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('RenderTheWorld.Move'),
                },
                {
                    opcode: 'rotationObject',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.rotationObject'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: 'moveObject',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.moveObject'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: 'scaleObject',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.scaleObject'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: 'getObjectPos',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage('RenderTheWorld.getObjectPos'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        xyz: {
                            type: ArgumentType.STRING,
                            menu: 'xyz',
                        },
                    },
                    disableMonitor: true,
                },
                {
                    opcode: 'getObjectRotation',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage(
                        'RenderTheWorld.getObjectRotation',
                    ),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        xyz: {
                            type: ArgumentType.STRING,
                            menu: 'xyz',
                        },
                    },
                    disableMonitor: true,
                },
                {
                    opcode: 'getObjectScale',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage('RenderTheWorld.getObjectScale'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        xyz: {
                            type: ArgumentType.STRING,
                            menu: 'xyz',
                        },
                    },
                    disableMonitor: true,
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('RenderTheWorld.Animation'),
                },
                {
                    opcode: 'playAnimation',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.playAnimation'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        animationName: {
                            type: ArgumentType.STRING,
                            defaultValue: 'animationName1',
                        },
                    },
                    dynamicArgsInfo: {
                        defaultValues: (i) => `animationName${i + 2}`,
                        afterArg: 'animationName',
                        joinCh: ', ',
                        dynamicArgTypes: ['s'],
                    },
                },
                {
                    opcode: 'stopAnimation',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.stopAnimation'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        animationName: {
                            type: ArgumentType.STRING,
                            defaultValue: 'animationName1',
                        },
                    },
                    dynamicArgsInfo: {
                        defaultValues: (i) => `animationName${i + 2}`,
                        afterArg: 'animationName',
                        joinCh: ', ',
                        dynamicArgTypes: ['s'],
                    },
                },
                {
                    opcode: 'updateAnimation',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.updateAnimation'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        time: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                        },
                    },
                },
                {
                    opcode: 'getAnimation',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage('RenderTheWorld.getAnimation'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                    },
                    disableMonitor: true,
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('RenderTheWorld.lights'),
                },
                {
                    opcode: 'pointLight',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.pointLight'),
                    arguments: {
                        color: {
                            type: ArgumentType.NUMBER,
                        },
                        intensity: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100,
                        },
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        decay: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2,
                        },
                        YN: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'directionalLight',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.directionalLight'),
                    arguments: {
                        color: {
                            type: ArgumentType.NUMBER,
                        },
                        intensity: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100,
                        },
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        x2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                        },
                        z2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        YN: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },

                {
                    opcode: 'setAmbientLightColor',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        'RenderTheWorld.setAmbientLightColor',
                    ),
                    arguments: {
                        color: {
                            type: ArgumentType.NUMBER,
                        },
                        intensity: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                        },
                    },
                },
                {
                    opcode: 'setHemisphereLightColor',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        'RenderTheWorld.setHemisphereLightColor',
                    ),
                    arguments: {
                        skyColor: {
                            type: ArgumentType.NUMBER,
                        },
                        groundColor: {
                            type: ArgumentType.NUMBER,
                        },
                        intensity: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                        },
                    },
                },
                '---',
                {
                    opcode: 'setDirectionalLightShawdowCamera',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        'RenderTheWorld.setDirectionalLightShawdowCamera',
                    ),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        left: {
                            type: ArgumentType.NUMBER,
                            defaultValue: -20,
                        },
                        right: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 20,
                        },
                        top: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 20,
                        },
                        bottom: {
                            type: ArgumentType.NUMBER,
                            defaultValue: -20,
                        },
                        near: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.1,
                        },
                        far: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1000,
                        },
                    },
                },
                {
                    opcode: 'setLightMapSize',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.setLightMapSize'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        xsize: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 512,
                        },
                        ysize: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 512,
                        },
                    },
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('RenderTheWorld.camera'),
                },
                {
                    opcode: 'useCamera',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.useCamera'),
                    hideFromPalette: false,
                    arguments: {
                        camera: {
                            type: ArgumentType.STRING,
                            defaultValue: "name",
                        },
                    },
                },
                {
                    opcode: 'perspectiveCamera',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.perspectiveCamera'),
                    hideFromPalette: false,
                    arguments: {
                        fov: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 40,
                        },
                        aspect: {
                            type: ArgumentType.NUMBER,
                            defaultValue: (this.runtime.renderer.canvas.width / this.runtime.renderer.canvas.height).toFixed(2),
                        },
                        near: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.1,
                        },
                        far: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1000,
                        },
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'moveCamera',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.moveCamera'),
                    arguments: {
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: 'rotationCamera',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.rotationCamera'),
                    arguments: {
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: 'cameraLookAt',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.cameraLookAt'),
                    arguments: {
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                '---',
                {
                    opcode: 'getCameraPos',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage('RenderTheWorld.getCameraPos'),
                    arguments: {
                        xyz: {
                            type: ArgumentType.STRING,
                            menu: 'xyz',
                        },
                    },
                    disableMonitor: true,
                },
                {
                    opcode: 'getCameraRotation',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage(
                        'RenderTheWorld.getCameraRotation',
                    ),
                    arguments: {
                        xyz: {
                            type: ArgumentType.STRING,
                            menu: 'xyz',
                        },
                    },
                    disableMonitor: true,
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('RenderTheWorld.control'),
                },
                {
                    opcode: 'createOrbitControls',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('RenderTheWorld.createOrbitControls'),
                    hideFromPalette: false,
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: "name",
                        },
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: 'updateControls',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.updateControls'),
                    hideFromPalette: false,
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                    },
                },
                {
                    opcode: 'setControlState',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.setControlState'),
                    hideFromPalette: false,
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        YN: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                    },
                },
                {
                    opcode: 'mouseCanControl',
                    blockType: BlockType.BOOLEAN,
                    text: this.formatMessage(
                        'RenderTheWorld.mouseCanControl',
                    ),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                    },
                },
                {
                    opcode: 'mouseControl',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.mouseControl'),
                    hideFromPalette: false,
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        yn1: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                        yn2: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                        yn3: {
                            type: ArgumentType.STRING,
                            menu: 'YN',
                        },
                    },
                },
                {
                    opcode: 'setControlDamping',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        'RenderTheWorld.setControlDamping',
                    ),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        YN2: {
                            type: ArgumentType.STRING,
                            menu: 'YN2',
                        },
                    },
                },
                {
                    opcode: 'setControlDampingNum',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        'RenderTheWorld.setControlDampingNum',
                    ),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        num: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.05,
                        },
                    },
                },
                {
                    opcode: 'setOrbitControlsTarget',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        'RenderTheWorld.setOrbitControlsTarget',
                    ),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                        x: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('RenderTheWorld.fogs'),
                },
                {
                    opcode: 'enableFogEffect',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.enableFogEffect'),
                    arguments: {
                        color: {
                            type: ArgumentType.NUMBER,
                        },
                        near: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                        },
                        far: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1000,
                        },
                    },
                },
                {
                    opcode: 'disableFogEffect',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('RenderTheWorld.disableFogEffect'),
                    arguments: {},
                },
            ];

            blocks.forEach((e) => {
                if (typeof e !== 'string' && e.blockType != BlockType.LABEL) {
                    e.tooltip = this.formatMessage(
                        'RenderTheWorld.'.concat(e.opcode).concat('.tooltip'),
                    );
                }
            });
            return {
                id: chen_RenderTheWorld_extensionId, // 拓展id
                docsURI:
                    'https://learn.ccw.site/article/0d8196d6-fccf-4d92-91b8-ee918a733237',
                name: this.formatMessage('RenderTheWorld.name'), // 拓展名
                blockIconURI: chen_RenderTheWorld_icon,
                menuIconURI: chen_RenderTheWorld_icon,
                color1: '#121C3D',
                color2: '#4A76FF',
                color3: '#4A76FF',
                blocks: blocks,
                menus: {
                    file_list: {
                        acceptReporters: true,
                        items: '__gandiAssetsJsonFileList',
                    },
                    obj_file_list: {
                        acceptReporters: true,
                        items: '__gandiAssetsObjFileList',
                    },
                    mtl_file_list: {
                        acceptReporters: true,
                        items: '__gandiAssetsMtlFileList',
                    },
                    gltf_file_list: {
                        acceptReporters: true,
                        items: '__gandiAssetsGltfFileList',
                    },
                    xyz: {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.xyz.x',
                                ),
                                value: 'x',
                            },
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.xyz.y',
                                ),
                                value: 'y',
                            },
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.xyz.z',
                                ),
                                value: 'z',
                            },
                        ],
                    },
                    ed: {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.ed.enable',
                                ),
                                value: 'enable',
                            },
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.ed.disable',
                                ),
                                value: 'disable',
                            },
                        ],
                    },
                    YN: {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.YN.true',
                                ),
                                value: 'true',
                            },
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.YN.false',
                                ),
                                value: 'false',
                            },
                        ],
                    },
                    YN2: {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.YN2.yes',
                                ),
                                value: 'yes',
                            },
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.YN2.no',
                                ),
                                value: 'no',
                            },
                        ],
                    },
                    '3dState': {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.3dState.display',
                                ),
                                value: 'display',
                            },
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.3dState.hidden',
                                ),
                                value: 'hidden',
                            },
                        ],
                    },
                    material: {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.material.Basic',
                                ),
                                value: 'Basic',
                            },
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.material.Lambert',
                                ),
                                value: 'Lambert',
                            },
                            {
                                text: this.formatMessage(
                                    'RenderTheWorld.material.Phong',
                                ),
                                value: 'Phong',
                            },
                        ],
                    },
                    WebGLRendererShadowMapType: {
                        acceptReporters: false,
                        items: [
                            {
                                text: 'BasicShadowMap',
                                value: THREE.BasicShadowMap,
                            },
                            {
                                text: 'PCFShadowMap',
                                value: THREE.PCFShadowMap,
                            },
                            {
                                text: 'PCFSoftShadowMap',
                                value: THREE.PCFSoftShadowMap,
                            },
                            {
                                text: 'VSMShadowMap',
                                value: THREE.VSMShadowMap,
                            },
                        ],
                    },
                },
            };
        }

        _gandiAssetsFileList(names) {
            let list = [];
            names.forEach((name) => {
                try {
                    const _list = this.runtime
                        .getGandiAssetsFileList(name)
                        .map((item) => ({
                            text: item.fullName,
                            value: item.fullName,
                        }));
                    list = list.concat(_list);
                } catch (err) { }
            });
            if (list.length < 1) {
                return [
                    {
                        text: this.formatMessage(
                            'RenderTheWorld.fileListEmpty',
                        ),
                        value: 'fileListEmpty',
                    },
                ];
            } else return list;
        }

        __gandiAssetsJsonFileList() {
            return this._gandiAssetsFileList(['json']);
        }
        __gandiAssetsObjFileList() {
            return this._gandiAssetsFileList(['obj', 'json']);
        }
        __gandiAssetsMtlFileList() {
            return this._gandiAssetsFileList(['mtl', 'json']);
        }
        __gandiAssetsGltfFileList() {
            return this._gandiAssetsFileList(['gltf', 'json']);
        }

        /**
         * @param {string} filename
         */
        getFileURL(filename) {
            const _content = this.runtime.getGandiAssetContent(filename);
            return _content ? _content.encodeDataURI() : '';
        }

        docs() {
            let a = document.createElement('a');
            a.href =
                'https://learn.ccw.site/article/aa0cf6d0-6758-447a-96f5-8e5dfdbe14d6';
            a.rel = 'noopener noreferrer';
            a.target = '_blank';
            a.click();
        }

        /**
         * 兼容性检查
         * @param {object} args
         */
        isWebGLAvailable({ }) {
            this.isWebglAvailable = WebGL.isWebGL2Available();
        }

        /**
         * 兼容性
         * @param {object} args
         * @returns {boolean}
         */
        _isWebGLAvailable({ }) {
            return this.isWebglAvailable;
        }

        // objectLoadingCompleted({ name }) {
        //     if (Cast.toString(name) in this.objects) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // }

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
            name = Cast.toString(name);
            if (name in this.animations) {
                if (this.animations[name].mixer) {
                    this.animations[name].mixer.stopAllAction();
                }
                this.animations[name] = {};
            }
            this._disposeObject(model);
        }

        /**
         * 初始化
         * @param {object} args
         * @param {number} args.color
         * @param {number} args.sizey
         * @param {number} args.sizex
         * @param {string} args.ed
         * @param {THREE.BasicShadowMap || THREE.PCFShadowMap || THREE.PCFSoftShadowMap || THREE.VSMShadowMap} args.shadowMapType
         */
        init({ color, sizex, sizey, ed, shadowMapType }) {
            this._init_porject_time = new Date().getTime();
            const _draw = this.runtime.renderer.draw;
            this.dirty = false;

            // this.clock = new THREE.Clock();
            // this._clock = 0;
            this.objects = {};
            this.animations = {};

            if (!this.tc) {
                this.tc = document.createElement('canvas');
                this.tc.className = 'RenderTheWorld';
                this.tc.width = 5120;
                this.tc.height = 1440;
            }

            let _antialias = false;

            // 是否启动抗锯齿
            if (Cast.toString(ed) == 'enable') {
                _antialias = true;
            }
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.tc,
                antialias: _antialias,
                context: this.tc.getContext('webgl2'),
            }); // 创建渲染器
            this.renderer.setClearColor('#000000'); // 设置渲染器背景

            this.renderer.shadowMap.enabled = true;

            // 效果（高 -> 低）& 速度（慢 -> 快）
            // VSMShadowMap    PCFSoftShadowMap    PCFShadowMap    BasicShadowMap
            // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // 启用软阴影
            // this.renderer.shadowMap.type = THREE.VSMShadowMap; // 启用软阴影
            this.renderer.shadowMap.type = Cast.toNumber(shadowMapType);

            this.renderer.setSize(
                Cast.toNumber(sizex),

                Cast.toNumber(sizey),
            );
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;

            this.scene = new THREE.Scene(); // 创建场景

            this.scene.background = new THREE.Color(Cast.toNumber(color)); // 设置背景颜色

            // 创建摄像机
            this.fov = 40; // 视野范围
            this.aspect = this.runtime.renderer.canvas.width / this.runtime.renderer.canvas.height; // 相机默认值 画布的宽高比
            this.near = 0.1; // 近平面
            this.far = 1000; // 远平面
            // 透视投影相机
            this.camera = new THREE.PerspectiveCamera(
                this.fov,
                this.aspect,
                this.near,
                this.far,
            );
            this.controls = new OrbitControls(
                this.camera,
                this.runtime.renderer.canvas,
            );
            this.controls.enabled = false;
            this.controls.enableDamping = false;
            this.controls.enablePan = false; //禁止右键拖拽
            this.controls.enableZoom = false; //禁止缩放
            this.controls.enableRotate = false; //禁止旋转
            // this.controls.addEventListener('change', function () {
            //     this.renderer.render(this.scene, this.camera);
            // });
            this.controls.update();

            // 创建环境光
            this.ambient_light = new THREE.AmbientLight(0x000000);
            this.scene.add(this.ambient_light);

            // 创建半球光
            this.hemisphere_light = new THREE.HemisphereLight(
                0x000000,
                0x000000,
            );
            this.scene.add(this.hemisphere_light);

            this.isTcShow = false;

            this.threeSkin.setContent(this.NullCanvas);
            this.render = () => {
                // this._clock = this.clock.getDelta();
                // 优化
                if (this.isTcShow) {
                    this.renderer.render(this.scene, this.camera);
                    this.threeSkin.setContent(this.tc);
                    this.runtime.requestRedraw();
                } else {
                    this.threeSkin.setContent(this.NullCanvas);
                }
                this.controls.update();
            };

            this._listener();
        }

        _listener() {
            if (!this.is_listener) {
                this.runtime.on('PROJECT_STOP_ALL', () => {
                    this._init_porject_time = 0;
                    console.log(
                        chen_RenderTheWorld_extensionId + ': Stopping renders',
                    );
                    this.renderer.setAnimationLoop(null);
                    this.scene.traverse((child) => {
                        if (child.material) {
                            child.material.dispose();
                        }
                        if (child.geometry) {
                            child.geometry.dispose();
                        }
                        child = null;
                    });
                    this.renderer.dispose();
                    this.scene.clear();
                    this.controls.dispose();
                });
                this.is_listener = true;
            }
            console.log(chen_RenderTheWorld_extensionId + ': Starting renders');
            this.renderer.setAnimationLoop(this.render);
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
            } else if (Cast.toString(obj) in this.objects) {
                return this.objects[Cast.toString(obj)];
            } else return -1;
        }

        /**
         * 设置3d渲染器状态
         * @param {object} args
         * @param {string} args.state
         */

        set3dState({ state }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            if (Cast.toString(state) === 'display') {
                this.isTcShow = true;
                this.threeSkin.setContent(this.tc);
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
         * @param {string} args.material
         * @returns {_Wrapper}
         */
        makeMaterial({ material }, util) {
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
                        material: material,
                        color: 0,
                        fog: true,
                    });
                } else {
                    this.threadInfo[thread.topBlock.concat(thread.target.id)] =
                        [{ material: material, color: 0, fog: true }];
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
                    Number(Cast.toString(color)) == Number(Cast.toString(color))
                ) {
                    this.threadInfo[thread.topBlock.concat(thread.target.id)][
                        this.threadInfo[
                            thread.topBlock.concat(thread.target.id)
                        ].length - 1
                    ]['color'] = Number(Cast.toString(color));
                } else {
                    this.threadInfo[thread.topBlock.concat(thread.target.id)][
                        this.threadInfo[
                            thread.topBlock.concat(thread.target.id)
                        ].length - 1
                    ]['color'] = Cast.toString(color);
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
                if (Cast.toString(YN) === 'ture') {
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
        return(args, util) {
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

                if (
                    this.threadInfo[thread.topBlock.concat(thread.target.id)][
                        this.threadInfo[
                            thread.topBlock.concat(thread.target.id)
                        ].length - 1
                    ].material === 'Basic'
                ) {
                    _material = new THREE.MeshBasicMaterial();
                } else if (
                    this.threadInfo[thread.topBlock.concat(thread.target.id)][
                        this.threadInfo[
                            thread.topBlock.concat(thread.target.id)
                        ].length - 1
                    ].material === 'Lambert'
                ) {
                    _material = new THREE.MeshLambertMaterial();
                } else if (
                    this.threadInfo[thread.topBlock.concat(thread.target.id)][
                        this.threadInfo[
                            thread.topBlock.concat(thread.target.id)
                        ].length - 1
                    ].material === 'Phong'
                ) {
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            if (model === undefined) {
                return '⚠️模型加载失败！';
            }
            model = Wrapper.unwrap(model);

            if (!(model instanceof RTW_Model_Box)) {
                return '⚠️传入的模型无法识别';
            }

            let init_porject_time = this._init_porject_time; // 解决快速点击多次绿旗，模型重复添加问题
            name = Cast.toString(name);
            this.releaseDuplicates(name);
            if (model.model != undefined && model.model.isObject3D) {
                this.objects[name] = model.model;

                if (model.animations != undefined) {
                    this.animations[name] = model.animations;
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
                    this.scene.add(this.objects[name]);
                    this.render();
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            let model = this._getModel(name);
            if (model !== -1) {
                if (Cast.toString(YN) == 'true') {
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

                if (Cast.toString(YN2) == 'true') {
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
                Cast.toNumber(a),

                Cast.toNumber(b),

                Cast.toNumber(h),
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
                Cast.toNumber(radius),
                Cast.toNumber(w),
                Cast.toNumber(h),
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
                Cast.toNumber(a),
                Cast.toNumber(b),
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
            name = Cast.toString(name);
            // 创建加载器
            const objLoader = new OBJLoader();
            const mtlLoader = new MTLLoader();

            // 加载模型
            mtlLoader.load(this.getFileURL(Cast.toString(mtlfile)), (mtl) => {
                mtl.preload();
                objLoader.setMaterials(mtl);

                objLoader.load(
                    this.getFileURL(Cast.toString(objfile)),
                    (root) => {
                        this.objects[name] = root;

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
                            this.scene.add(this.objects[name]);
                            this.render();
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
            name = Cast.toString(name);
            // 创建加载器
            const gltfLoader = new GLTFLoader();

            const url = this.getFileURL(Cast.toString(gltffile));
            // 加载模型
            gltfLoader.load(url, (gltf) => {
                const root = gltf.scene;

                // 保存动画数据
                let mixer = new THREE.AnimationMixer(root);
                let clips = gltf.animations;
                this.animations[name] = {
                    mixer: mixer,
                    clips: clips,
                    action: {},
                };

                this.objects[name] = root;

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
                    this.scene.add(this.objects[name]);
                    this.render();
                }
            });
        }

        /**
         * 创建或重置长方体
         * @param {object} args
         * @param {string} args.name
         * @param {number} args.a
         * @param {number} args.b
         * @param {number} args.h
         * @param {number} args.color
         * @param {number} args.x
         * @param {number} args.y
         * @param {number} args.z
         * @param {string} args.YN
         * @param {string} args.YN2
         */
        makeCube({ name, a, b, h, color, x, y, z, YN, YN2 }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            let init_porject_time = this._init_porject_time; // 解决快速点击多次绿旗，模型重复添加问题
            // 名称

            name = Cast.toString(name);
            // 长方体
            let geometry = new THREE.BoxGeometry(
                Cast.toNumber(a),

                Cast.toNumber(b),

                Cast.toNumber(h),
            );
            // let material = new THREE.MeshPhongMaterial({
            //     color: Cast.toNumber(args.color),
            // });
            // 纹理
            let material = new THREE.MeshLambertMaterial({
                color: Cast.toNumber(color),
            });
            material.fog = true;

            // 添加到场景
            this.releaseDuplicates(name);

            this.objects[name] = new THREE.Mesh(geometry, material);
            this.objects[name].position.set(
                Cast.toNumber(x),

                Cast.toNumber(y),

                Cast.toNumber(z),
            );

            if (Cast.toString(YN) == 'true') {
                this.objects[name].castShadow;
                this.objects[name].castShadow = true;
            }

            if (Cast.toString(YN2) == 'true') {
                this.objects[name].receiveShadow = true;
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
                this.scene.add(this.objects[name]);
                this.render();
            }
        }

        /**
         * 创建或重置球体
         * @param {object} args
         * @param {string} args.name
         * @param {number} args.radius
         * @param {number} args.w
         * @param {number} args.h
         * @param {number} args.color
         * @param {number} args.x
         * @param {number} args.y
         * @param {number} args.z
         * @param {string} args.YN
         * @param {string} args.YN2
         */

        makeSphere({ name, radius, w, h, color, x, y, z, YN, YN2 }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            let init_porject_time = this._init_porject_time;
            // 名称

            name = Cast.toString(name);
            // 长方体
            let geometry = new THREE.SphereGeometry(
                Cast.toNumber(radius),

                Cast.toNumber(w),

                Cast.toNumber(h),
            );
            // let material = new THREE.MeshPhongMaterial({
            //     color: Cast.toNumber(args.color),
            // });
            // 纹理
            let material = new THREE.MeshLambertMaterial({
                color: Cast.toNumber(color),
            });
            material.fog = true;

            // 添加到场景
            this.releaseDuplicates(name);

            this.objects[name] = new THREE.Mesh(geometry, material);
            this.objects[name].position.set(
                Cast.toNumber(x),

                Cast.toNumber(y),

                Cast.toNumber(z),
            );

            if (Cast.toString(YN) == 'true') {
                this.objects[name].castShadow = true;
            }

            if (Cast.toString(YN2) == 'true') {
                this.objects[name].receiveShadow = true;
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
                this.scene.add(this.objects[name]);
                this.render();
            }
        }

        /**
         * 创建或重置平面
         * @param {object} args
         * @param {string} args.name
         * @param {number} args.a
         * @param {number} args.b
         * @param {number} args.color
         * @param {number} args.x
         * @param {number} args.y
         * @param {number} args.z
         * @param {string} args.YN
         * @param {string} args.YN2
         */

        makePlane({ name, a, b, color, x, y, z, YN, YN2 }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            let init_porject_time = this._init_porject_time;
            // 名称

            name = Cast.toString(name);
            // 长方体
            let geometry = new THREE.PlaneGeometry(
                Cast.toNumber(a),

                Cast.toNumber(b),
            );
            // let material = new THREE.MeshPhongMaterial({
            //     color: Cast.toNumber(args.color),
            // });
            // 纹理
            let material = new THREE.MeshLambertMaterial({
                color: Cast.toNumber(color),
            });
            material.fog = true;

            // 添加到场景
            this.releaseDuplicates(name);

            this.objects[name] = new THREE.Mesh(geometry, material);
            this.objects[name].position.set(
                Cast.toNumber(x),

                Cast.toNumber(y),

                Cast.toNumber(z),
            );

            if (Cast.toString(YN) == 'true') {
                this.objects[name].castShadow = true;
            }

            if (Cast.toString(YN2) == 'true') {
                this.objects[name].receiveShadow = true;
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
                this.scene.add(this.objects[name]);
                this.render();
            }
        }

        /**
         * 导入或重置OBJ模型
         * @param {object} args
         * @param {string} args.name
         * @param {string} args.objfile
         * @param {string} args.mtlfile
         * @param {number} args.x
         * @param {number} args.y
         * @param {number} args.z
         * @param {string} args.YN
         * @param {string} args.YN2
         */

        importOBJ({ name, objfile, mtlfile, x, y, z, YN, YN2 }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            if (objfile == 'fileListEmpty') {
                return;
            }

            let _filelist = this.runtime
                .getGandiAssetsFileList()
                .map((f) => f.fullName);
            if (_filelist.indexOf(objfile) == -1) {
                return '⚠️OBJ文件不存在！';
            }
            if (_filelist.indexOf(mtlfile) == -1) {
                return '⚠️MTL文件不存在！';
            }
            let init_porject_time = this._init_porject_time;
            // 名称

            name = Cast.toString(name);
            // 创建加载器
            const objLoader = new OBJLoader();
            const mtlLoader = new MTLLoader();
            // 添加到场景
            this.releaseDuplicates(name);
            // 加载模型

            mtlLoader.load(this.getFileURL(Cast.toString(mtlfile)), (mtl) => {
                mtl.preload();
                objLoader.setMaterials(mtl);

                objLoader.load(
                    this.getFileURL(Cast.toString(objfile)),
                    (root) => {
                        this.objects[name] = root;
                        // this.objects[name].position.set(Cast.toNumber(args.x), Cast.toNumber(args.y), Cast.toNumber(args.z));

                        this.objects[name].position.x = Cast.toNumber(x);

                        this.objects[name].position.y = Cast.toNumber(y);

                        this.objects[name].position.z = Cast.toNumber(z);

                        if (Cast.toString(YN) == 'true') {
                            this.objects[name].castShadow = true;
                            this.objects[name].traverse(function (node) {
                                if (node.isMesh) {
                                    node.castShadow = true;
                                }
                            });
                        }

                        if (Cast.toString(YN2) == 'true') {
                            this.objects[name].receiveShadow = true;
                            this.objects[name].traverse(function (node) {
                                if (node.isMesh) {
                                    node.receiveShadow = true;
                                }
                            });
                        }
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
                            this.scene.add(this.objects[name]);
                            this.render();
                        }
                    },
                );
            });
        }

        /**
         * 导入或重置GLTF模型
         * @param {object} args
         * @param {object} args
         * @param {string} args.name
         * @param {string} args.gltffile
         * @param {number} args.x
         * @param {number} args.y
         * @param {number} args.z
         * @param {string} args.YN
         * @param {string} args.YN2
         */

        importGLTF({ name, gltffile, x, y, z, YN, YN2 }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            if (gltffile == 'fileListEmpty') {
                return;
            }

            let _filelist = this.runtime
                .getGandiAssetsFileList()
                .map((f) => f.fullName);
            if (_filelist.indexOf(gltffile) == -1) {
                return '⚠️GLTF文件不存在！';
            }
            let init_porject_time = this._init_porject_time;
            // 名称

            name = Cast.toString(name);
            // 创建加载器
            const gltfLoader = new GLTFLoader();

            const url = this.getFileURL(Cast.toString(gltffile));
            // 添加到场景
            this.releaseDuplicates(name);
            // 加载模型
            gltfLoader.load(url, (gltf) => {
                const root = gltf.scene;

                // 保存动画数据
                let mixer = new THREE.AnimationMixer(root);
                let clips = gltf.animations;
                this.animations[name] = {
                    mixer: mixer,
                    clips: clips,
                    action: {},
                };

                this.objects[name] = root;

                this.objects[name].position.x = Cast.toNumber(x);

                this.objects[name].position.y = Cast.toNumber(y);

                this.objects[name].position.z = Cast.toNumber(z);

                if (Cast.toString(YN) == 'true') {
                    this.objects[name].castShadow = true;
                    this.objects[name].traverse(function (node) {
                        if (node.isMesh) {
                            node.castShadow = true;
                        }
                    });
                }

                if (Cast.toString(YN2) == 'true') {
                    this.objects[name].receiveShadow = true;
                    this.objects[name].traverse(function (node) {
                        if (node.isMesh) {
                            node.receiveShadow = true;
                        }
                    });
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
                    this.scene.add(this.objects[name]);
                    this.render();
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            let name = Cast.toString(args.name);
            const dynamicArgs = getDynamicArgs(args);

            let animationNames = [Cast.toString(args.animationName)].concat(
                dynamicArgs,
            );

            if (name in this.animations && this.animations[name].mixer) {
                animationNames.forEach((animationName) => {
                    const cilp = THREE.AnimationClip.findByName(
                        this.animations[name].clips,
                        animationName,
                    );
                    if (cilp) {
                        this.animations[name].action[animationName] =
                            this.animations[name].mixer.clipAction(cilp);
                        this.animations[name].action[animationName].play();
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            let name = Cast.toString(args.name);
            const dynamicArgs = getDynamicArgs(args);

            let animationNames = [Cast.toString(args.animationName)].concat(
                dynamicArgs,
            );

            if (name in this.animations) {
                animationNames.forEach((animationName) => {
                    if (animationName in this.animations[name].action) {
                        this.animations[name].action[animationName].stop();
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            name = Cast.toString(name);

            time = Cast.toNumber(time);
            if (name in this.animations && this.animations[name].mixer) {
                this.animations[name].mixer.update(time);
            }
        }

        /**
         * 获取物体所有的动画
         * @param {object} args
         * @param {string} args.name
         */

        getAnimation({ name }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            name = Cast.toString(name);

            if (name in this.animations && this.animations[name].clips) {
                const clips = [];
                for (let i = 0; i < this.animations[name].clips.length; i++) {
                    clips.push(this.animations[name].clips[i].name);
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            const dynamicArgs = getDynamicArgs(args);

            this.releaseDuplicates(args.name);
            dynamicArgs.forEach((_name) => {
                this.releaseDuplicates(_name);
            });
            this.render();
        }

        /**
         * 通过导入时设置的名称获取物体
         * @param {object} args
         * @param {string} args.name
         * @returns {Wrapper | ''}
         */
        getObjectByNmae({ name }) {
            name = Cast.toString(name);
            if (name in this.objects) {
                let _animations = undefined;
                if (name in this.animations) {
                    _animations = this.animations[name];
                }
                return new Wrapper(
                    new RTW_Model_Box(
                        this.objects[name],
                        false,
                        false,
                        false,
                        _animations,
                    ),
                );
            } else return '';
        }

        rotationObject({ name, x, y, z }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            let model = this._getModel(name);
            if (model === -1) return '⚠️传入的名称或物体有误！';
            model.rotation.set(
                THREE.MathUtils.degToRad(Cast.toNumber(x)),

                THREE.MathUtils.degToRad(Cast.toNumber(y)),

                THREE.MathUtils.degToRad(Cast.toNumber(z)),
            );
            this.render();
        }

        moveObject({ name, x, y, z }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            let model = this._getModel(name);
            if (model === -1) return '⚠️传入的名称或物体有误！';
            // 设置坐标
            model.position.set(
                Cast.toNumber(x),

                Cast.toNumber(y),

                Cast.toNumber(z),
            );
            this.render();
        }

        scaleObject({ name, x, y, z }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            let model = this._getModel(name);
            if (model === -1) return '⚠️传入的名称或物体有误！';
            // 设置缩放
            model.scale.set(
                Cast.toNumber(x),

                Cast.toNumber(y),

                Cast.toNumber(z),
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
            switch (Cast.toString(xyz)) {
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
            switch (Cast.toString(xyz)) {
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
            switch (Cast.toString(xyz)) {
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
            let child = model.getObjectByName(Cast.toString(name2));
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
            return this.scene === null
                ? null
                : new Wrapper(
                    new RTW_Model_Box(
                        this.scene,
                        false,
                        false,
                        false,
                        undefined,
                    ),
                );
        }

        pointLight({ color, intensity, x, y, z, decay, YN }) {
            let _point_light = new THREE.PointLight(
                Cast.toNumber(color),
                Cast.toNumber(intensity),
                0,
                Cast.toNumber(decay),
            ); //创建光源
            _point_light.position.set(
                Cast.toNumber(x),

                Cast.toNumber(y),

                Cast.toNumber(z),
            ); //设置光源的位置

            _point_light.shadow.bias = -0.00005;

            if (Cast.toString(YN) == 'true') {
                _point_light.castShadow = true;
            }
            return new Wrapper(
                new RTW_Model_Box(_point_light, false, false, false, undefined),
            );
        }

        directionalLight({ color, intensity, x, y, z, x2, y2, z2, YN }) {
            let _directional_light = new THREE.DirectionalLight(
                Cast.toNumber(color),
                Cast.toNumber(intensity),
            ); //创建光源

            _directional_light.position.set(
                Cast.toNumber(x),

                Cast.toNumber(y),

                Cast.toNumber(z),
            ); //设置光源的位置
            _directional_light.target.position.set(
                Cast.toNumber(x),

                Cast.toNumber(y),

                Cast.toNumber(z),
            ); //设置光源目标的位置

            _directional_light.shadow.bias = -0.00005;
            if (Cast.toString(YN) == 'true') {
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            let model = this._getModel(name);
            if (model === -1) return '⚠️传入的名称或物体有误！';

            if (model.type === 'DirectionalLight') {
                // let _camera = new THREE.OrthographicCamera(
                //     Cast.toNumber(left),
                //     Cast.toNumber(right),
                //     Cast.toNumber(top),
                //     Cast.toNumber(bottom),
                //     Cast.toNumber(near),
                //     Cast.toNumber(far),
                // );
                // _camera.zoom = model.shadow.camera.zoom;
                // model.shadow.camera = _camera;
                model.shadow.camera.left = Cast.toNumber(left);
                model.shadow.camera.right = Cast.toNumber(right);
                model.shadow.camera.top = Cast.toNumber(top);
                model.shadow.camera.bottom = Cast.toNumber(bottom);
                model.shadow.camera.near = Cast.toNumber(near);
                model.shadow.camera.far = Cast.toNumber(far);
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }

            let model = this._getModel(name);
            if (model === -1) return '⚠️传入的名称或物体有误！';
            if (model.isLight) {
                model.shadow.mapSize.set(
                    Cast.toNumber(xsize),
                    Cast.toNumber(ysize),
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            // 设置环境光颜色
            this.ambient_light.color = new THREE.Color(Cast.toNumber(color));

            this.ambient_light.intensity = Cast.toNumber(intensity);
            this.render();
        }

        /**
         * 设置环境光颜色
         * @param {object} args
         * @param {number} args.skyColor
         * @param {number} args.groundColor
         * @param {number} args.intensity
         */

        setHemisphereLightColor({ skyColor, groundColor, intensity }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            // 设置环境光颜色
            this.hemisphere_light.color = new THREE.Color(
                Cast.toNumber(skyColor),
            );
            this.hemisphere_light.groundColor = new THREE.Color(
                Cast.toNumber(groundColor),
            );

            this.hemisphere_light.intensity = Cast.toNumber(intensity);
            this.render();
        }

        useCamera({ camera }) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            let model = this._getModel(camera);
            if (model === -1) return '⚠️传入的相机有误！';
            this.camera = model;
        }

        perspectiveCamera({ fov, aspect, near, far }) {
            return new Wrapper(
                new RTW_Model_Box(
                    new THREE.PerspectiveCamera(
                        Cast.toNumber(fov),
                        Cast.toNumber(aspect),
                        Cast.toNumber(near),
                        Cast.toNumber(far),
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            this.camera.position.set(
                Cast.toNumber(x),
                Cast.toNumber(y),
                Cast.toNumber(z),
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            this.camera.rotation.set(
                THREE.MathUtils.degToRad(Cast.toNumber(x)),

                THREE.MathUtils.degToRad(Cast.toNumber(y)),

                THREE.MathUtils.degToRad(Cast.toNumber(z)),
            );
            // const cameraPos = this.camera.position.clone();
            // const controlsTag = this.controls.target.clone();
            // controlsTag.sub(cameraPos);
            // // 麻烦。。。
            // const euler = new THREE.Euler(
            //     THREE.MathUtils.degToRad(Cast.toNumber(x)),
            //     THREE.MathUtils.degToRad(Cast.toNumber(y)),
            //     THREE.MathUtils.degToRad(Cast.toNumber(z)),
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            // this.controls.target.set(
            //     Cast.toNumber(x),
            //     Cast.toNumber(y),
            //     Cast.toNumber(z),
            // );
            this.camera.lookAt(
                Cast.toNumber(x),
                Cast.toNumber(y),
                Cast.toNumber(z),
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

            switch (Cast.toString(xyz)) {
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

            switch (Cast.toString(xyz)) {
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

            if (Cast.toString(YN) == 'true') {
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

            if (Cast.toString(YN2) == 'yes') {
                model.enableDamping = true;
            } else {
                model.enableDamping = false;
            }
        }

        setControlDampingNum({ name, num }) {
            let model = this._getModel(name);
            if (model === -1 || !model.update) return '⚠️设置的控制器有误！';

            model.dampingFactor = Cast.toNumber(num);
        }

        setOrbitControlsTarget({ name, x, y, z }) {
            let model = this._getModel(name);
            if (model === -1 || !model.update || !(model.target instanceof THREE.Vector3)) return '⚠️设置的轨道控制器有误！';

            model.target.set(
                Cast.toNumber(x),
                Cast.toNumber(y),
                Cast.toNumber(z),
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
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            this.scene.fog = new THREE.Fog(
                Cast.toNumber(color),

                Cast.toNumber(near),

                Cast.toNumber(far),
            );
            this.render();
        }

        /**
         * 禁用雾效果
         */

        disableFogEffect(args) {
            if (!this.tc) {
                return '⚠️显示器未初始化！';
            }
            this.scene.fog = null;
            this.render();
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
                Math.min(Math.max(Cast.toNumber(R), 0), 255) * 65536 +
                Math.min(Math.max(Cast.toNumber(G), 0), 255) * 256 +
                Math.min(Math.max(Cast.toNumber(B), 0), 255)
            );
        }
    }
    extensions.register(new RenderTheWorld(runtime));
    window.tempExt = {
        Extension: RenderTheWorld,
        info: {
            name: 'RenderTheWorld.name',
            description: 'RenderTheWorld.descp',
            extensionId: chen_RenderTheWorld_extensionId,
            iconURL: chen_RenderTheWorld_picture,
            insetIconURL: chen_RenderTheWorld_icon,
            featured: true,
            disabled: false,
            collaborator: 'xiaochen004hao @ CCW',
            collaboratorURL:
                'https://www.ccw.site/student/643bb84051bc32279f0c3fa0',
            collaboratorList: [
                {
                    collaborator: 'xiaochen004hao @ CCW',
                    collaboratorURL:
                        'https://www.ccw.site/student/643bb84051bc32279f0c3fa0',
                },
                {
                    collaborator: 'Fath11@Cocrea',
                    collaboratorURL: 'https://cocrea.world/@Fath11',
                },
            ],
        },
        l10n: {
            'zh-cn': {
                'RenderTheWorld.name': '渲染世界',
                'RenderTheWorld.descp': '积木渲染世界',
            },
            en: {
                'RenderTheWorld.name': 'Render The World',
                'RenderTheWorld.descp': 'Building blocks render the world',
            },
        },
    };
})(Scratch);
