/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */
// 扩展资源
import {
    color,
    color_secondary,
    color_tertiary,
    chen_RenderTheWorld_extensionId,
    chen_RenderTheWorld_picture,
    chen_RenderTheWorld_icon,
    rightSelectButton,
    rightButton,
    leftButton,
} from './assets/index.js';
import { getVM, getScratchBlocks } from './utils/injector.js';
import l10n from './l10n/index.js';
import { ExtensionCore, RenderEngine } from './core/engine.js';
import { Extension } from './core/main.js';


(function (Scratch) {
    'use strict';
    const { logSystem } = Scratch.vm?.runtime;
    const logError = (...args) => {
        logSystem?.error(...args);
        console.error(...args);
    };

    const {
        ArgumentType,
        BlockType,
        TargetType,
        Cast,
        translate,
        extensions,
        runtime,
    } = Scratch;

    /** @type {import('scratch-vm')} */
    const vm = getVM(runtime);
    /** @type {import('scratch-blocks')} */
    const ScratchBlocks = getScratchBlocks(runtime, vm);


    class RenderTheWorld extends Extension {
        /**
        * @param {import('scratch-vm').Runtime} _runtime
        */
        constructor(_runtime) {
            super(_runtime ?? Scratch?.vm?.runtime, vm, ScratchBlocks, Scratch);
            if (!this.runtime) return;

            this._core = new ExtensionCore(this, this.vm, this.ScratchBlocks);
            this._core.loadformat(l10n);

            this.render_engine = new RenderEngine(this);

            this.threadInfo = {};
        }

        /**
         * 翻译 translate
         * @param {string} id
         * @returns {string}
         */
        formatMessage(id) {
            return this._core.translate(id, translate.language);
        }

        _initMenus() {
            this._core.cleanMenus();
            this._core.
                registerMenu(
                    'file_list',
                    {
                        acceptReporters: true,
                        items: '__gandiAssetsJsonFileList',
                    }
                ).registerMenu(
                    'obj_file_list',
                    {
                        acceptReporters: true,
                        items: '__gandiAssetsObjFileList',
                    }
                ).registerMenu(
                    'mtl_file_list',
                    {
                        acceptReporters: true,
                        items: '__gandiAssetsMtlFileList',
                    }
                ).registerMenu(
                    'gltf_file_list',
                    {
                        acceptReporters: true,
                        items: '__gandiAssetsGltfFileList',
                    }
                ).registerMenu(
                    'xyz',
                    {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    'xyz.x',
                                ),
                                value: 'x',
                            },
                            {
                                text: this.formatMessage(
                                    'xyz.y',
                                ),
                                value: 'y',
                            },
                            {
                                text: this.formatMessage(
                                    'xyz.z',
                                ),
                                value: 'z',
                            },
                        ],
                    }
                ).registerMenu(
                    'ed',
                    {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    'ed.enable',
                                ),
                                value: 'enable',
                            },
                            {
                                text: this.formatMessage(
                                    'ed.disable',
                                ),
                                value: 'disable',
                            },
                        ],
                    }
                ).registerMenu(
                    'YN',
                    {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    'YN.true',
                                ),
                                value: 'true',
                            },
                            {
                                text: this.formatMessage(
                                    'YN.false',
                                ),
                                value: 'false',
                            },
                        ],
                    }
                ).registerMenu(
                    "YN2",
                    {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    'YN2.yes',
                                ),
                                value: 'yes',
                            },
                            {
                                text: this.formatMessage(
                                    'YN2.no',
                                ),
                                value: 'no',
                            },
                        ],
                    }
                ).registerMenu(
                    '3dState',
                    {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    '3dState.display',
                                ),
                                value: 'display',
                            },
                            {
                                text: this.formatMessage(
                                    '3dState.hidden',
                                ),
                                value: 'hidden',
                            },
                        ],
                    }
                ).registerMenu(
                    'material',
                    {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    'material.Basic',
                                ),
                                value: 'Basic',
                            },
                            {
                                text: this.formatMessage(
                                    'material.Lambert',
                                ),
                                value: 'Lambert',
                            },
                            {
                                text: this.formatMessage(
                                    'material.Phong',
                                ),
                                value: 'Phong',
                            },
                        ],
                    }
                ).registerMenu(
                    'WebGLRendererShadowMapType',
                    {
                        acceptReporters: false,
                        items: [
                            {
                                text: 'BasicShadowMap',
                                value: 'THREE.BasicShadowMap',
                            },
                            {
                                text: 'PCFShadowMap',
                                value: 'THREE.PCFShadowMap',
                            },
                            {
                                text: 'PCFSoftShadowMap',
                                value: 'THREE.PCFSoftShadowMap',
                            },
                            {
                                text: 'VSMShadowMap',
                                value: 'THREE.VSMShadowMap',
                            },
                        ],
                    }
                );
        }

        _initBlocks() {
            this._core.cleanBlocks();
            this._core.
                registerBlock(
                    {
                        blockType: BlockType.BUTTON,
                        text: this.formatMessage('apidocs'),
                        onClick: this.docs,
                    }
                ).registerBlock(
                    {
                        opcode: 'init',
                        blockType: BlockType.COMMAND,
                        text: this.formatMessage('init'),
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
                                defaultValue: "PCFSoftShadowMap",
                                menu: 'WebGLRendererShadowMapType',
                            },
                        },
                    }
                ).registerBlock(
                    {
                        opcode: 'set3dState',
                        blockType: BlockType.COMMAND,
                        text: this.formatMessage('set3dState'),
                        arguments: {
                            state: {
                                type: ArgumentType.STRING,
                                menu: '3dState',
                            },
                        },
                    }
                ).registerBlock(
                    {
                        opcode: 'get3dState',
                        blockType: BlockType.BOOLEAN,
                        text: this.formatMessage('get3dState'),
                        arguments: {},
                    }
                ).registerBlock(
                    {
                        blockType: BlockType.LABEL,
                        text: this.formatMessage('tools'),
                    }
                ).registerBlock(
                    {
                        opcode: 'color_RGB',
                        blockType: BlockType.REPORTER,
                        text: this.formatMessage('color_RGB'),
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
                    }
                ).registerBlock(
                    {
                        opcode: 'isWebGLAvailable',
                        blockType: BlockType.COMMAND,
                        text: this.formatMessage('isWebGLAvailable'),
                        arguments: {},
                    }
                ).registerBlock(
                    {
                        opcode: '_isWebGLAvailable',
                        blockType: BlockType.BOOLEAN,
                        text: this.formatMessage('_isWebGLAvailable'),
                        arguments: {},
                    }
                ).registerBlock(
                    {
                        blockType: BlockType.LABEL,
                        text: this.formatMessage('objects'),
                    }
                ).registerBlock(
                    {
                        blockType: BlockType.LABEL,
                        text: this.formatMessage('Material'),
                    }
                ).registerBlock(
                    {
                        opcode: 'makeMaterial',
                        blockType: BlockType.OUTPUT,
                        text: this.formatMessage('makeMaterial'),
                        arguments: {},
                        output: 'Boolean',
                        outputShape: 3,
                        branchCount: 1,
                        hideFromPalette: true,
                    }
                ).registerBlock(
                    {
                        opcode: 'makeMaterial',
                        blockType: Scratch.BlockType.XML,
                        xml:
                            `<block type="${chen_RenderTheWorld_extensionId}_makeMaterial">` +
                            `<value name="SUBSTACK">` +
                            `<block type="${chen_RenderTheWorld_extensionId}_returnm">` +
                            `<field name="material">Basic</field>` +
                            `</block>` +
                            `</value>` +
                            `</block>`,
                    }
                ).registerBlock(
                    {
                        opcode: 'setMaterialColor',
                        blockType: BlockType.COMMAND,
                        text: this.formatMessage('setMaterialColor'),
                        arguments: {
                            color: {
                                type: ArgumentType.STRING,
                                defaultValue: '',
                            },
                        },
                    }
                ).registerBlock(
                    {
                        opcode: 'setMaterialFog',
                        blockType: BlockType.COMMAND,
                        text: this.formatMessage('setMaterialFog'),
                        arguments: {
                            YN: {
                                type: ArgumentType.STRING,
                                menu: 'YN',
                                defaultValue: 'true',
                            },
                        },
                    }
                ).registerBlock(
                    {
                        opcode: 'returnm',
                        blockType: BlockType.COMMAND,
                        text: this.formatMessage('returnm'),
                        arguments: {
                            material: {
                                type: null,
                                menu: 'material',
                                defaultValue: 'Basic',
                            },
                        },
                        isTerminal: true,
                        hideFromPalette: true,
                    }
                ).registerBlock(
                    {
                        blockType: BlockType.LABEL,
                        text: this.formatMessage('Model'),
                    }
                ).registerBlock(
                    {
                        opcode: 'objectLoadingCompleted',
                        blockType: BlockType.EVENT,
                        text: this.formatMessage(
                            'objectLoadingCompleted',
                        ),
                        isEdgeActivated: false,
                        shouldRestartExistingThreads: false,
                        arguments: {
                            name: {
                                type: ArgumentType.CCW_HAT_PARAMETER,
                                defaultValue: 'name',
                            },
                        },
                    }
                ).registerBlock(
                    {
                        opcode: 'importModel',
                        blockType: BlockType.COMMAND,
                        text: this.formatMessage('importModel'),
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
                    }
                ).registerBlock(
                    {
                        opcode: 'destroyObject',
                        blockType: BlockType.COMMAND,
                        text: this.formatMessage('destroyObject'),
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
                    }
                ).registerBlock(
                    {
                        opcode: 'getObjectByNmae',
                        blockType: BlockType.OUTPUT,
                        text: this.formatMessage('getObjectByNmae'),
                        arguments: {
                            name: {
                                type: ArgumentType.STRING,
                                defaultValue: 'name',
                            },
                        },
                        output: 'Reporter',
                        outputShape: 3,
                        branchCount: 0,
                    }
                ).registerBlock(
                    {
                        opcode: 'cubeModel',
                        blockType: BlockType.OUTPUT,
                        text: this.formatMessage('cubeModel'),
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
                    }
                ).registerBlock(
                    {
                        opcode: 'sphereModel',
                        blockType: BlockType.OUTPUT,
                        text: this.formatMessage('sphereModel'),
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
                    }
                ).registerBlock(
                    {
                        opcode: 'planeModel',
                        blockType: BlockType.OUTPUT,
                        text: this.formatMessage('planeModel'),
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
                    }
                ).registerBlock(
                    {
                        opcode: 'objModel',
                        blockType: BlockType.OUTPUT,
                        text: this.formatMessage('objModel'),
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
                    }
                ).registerBlock(
                    {
                        opcode: 'gltfModel',
                        blockType: BlockType.OUTPUT,
                        text: this.formatMessage('gltfModel'),
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
                    }
                ).registerBlock(
                    {
                        opcode: 'groupModel',
                        blockType: BlockType.OUTPUT,
                        text: this.formatMessage('groupModel'),
                        arguments: {},
                        dynamicArgsInfo: {
                            defaultValues: 'MODEL',
                            dynamicArgTypes: ['s'],
                            joinCh: ', ',
                            preText: (n) =>
                                n === 0
                                    ? this.formatMessage(
                                        'groupModel',
                                    )
                                    : `${this.formatMessage('groupModel')}[`,
                            endText: (n) => (n === 0 ? '' : ']'),
                        },
                        output: 'Reporter',
                        outputShape: 3,
                        branchCount: 0,
                    }
                ).registerBlock(
                    {
                        opcode: 'shadowSettings',
                        blockType: BlockType.COMMAND,
                        text: this.formatMessage('shadowSettings'),
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
                    }
                ).registerBlankLine(
            ).registerBlock({
                opcode: 'getChildrenNumInObject',
                blockType: BlockType.REPORTER,
                text: this.formatMessage(
                    'getChildrenNumInObject',
                ),
                arguments: {
                    name: {
                        type: ArgumentType.STRING,
                        defaultValue: 'name',
                    },
                },
                disableMonitor: true,
            }
            ).registerBlock(
                {
                    opcode: 'getChildrenInObject',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage(
                        'getChildrenInObject',
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
                            'getChildrenInObject.joinCh',
                        ),
                        preText: this.formatMessage(
                            'getChildrenInObject.preText',
                        ),
                    },
                    output: 'Reporter',
                    outputShape: 3,
                    branchCount: 0,
                }
            ).registerBlock(
                {
                    opcode: 'getChildrenInObjectByName',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage(
                        'getChildrenInObjectByName',
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
                }
            ).registerBlock(
                {
                    opcode: 'addChildren',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('addChildren'),
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
                }
            ).registerBlock(
                {
                    opcode: 'removeChildren',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('removeChildren'),
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
                }
            ).registerBlankLine(
            ).registerBlock({
                opcode: 'getScene',
                blockType: BlockType.OUTPUT,
                text: this.formatMessage('getScene'),
                arguments: {},
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
            }
            ).registerBlock(
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('Move'),
                }
            ).registerBlock(
                {
                    opcode: 'rotationObject',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('rotationObject'),
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
                }
            ).registerBlock(
                {
                    opcode: 'moveObject',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('moveObject'),
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
                }
            ).registerBlock(
                {
                    opcode: 'scaleObject',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('scaleObject'),
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
                }
            ).registerBlock(
                {
                    opcode: 'getObjectPos',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage('getObjectPos'),
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
                }
            ).registerBlock(
                {
                    opcode: 'getObjectRotation',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage(
                        'getObjectRotation',
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
                }
            ).registerBlock(
                {
                    opcode: 'getObjectScale',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage('getObjectScale'),
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
                }
            ).registerBlock(
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('Animation'),
                }
            ).registerBlock(
                {
                    opcode: 'playAnimation',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('playAnimation'),
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
                }
            ).registerBlock(
                {
                    opcode: 'stopAnimation',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('stopAnimation'),
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
                }
            ).registerBlock(
                {
                    opcode: 'updateAnimation',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('updateAnimation'),
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
                }
            ).registerBlock(
                {
                    opcode: 'getAnimation',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage('getAnimation'),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                    },
                    disableMonitor: true,
                }
            ).registerBlock(
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('lights'),
                }
            ).registerBlock(
                {
                    opcode: 'pointLight',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('pointLight'),
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
                }
            ).registerBlock(
                {
                    opcode: 'directionalLight',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('directionalLight'),
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
                        'setAmbientLightColor',
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
                }
            ).registerBlock(
                {
                    opcode: 'setHemisphereLightColor',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        'setHemisphereLightColor',
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
                }
            ).registerBlankLine(
            ).registerBlock({
                opcode: 'setDirectionalLightShawdowCamera',
                blockType: BlockType.COMMAND,
                text: this.formatMessage(
                    'setDirectionalLightShawdowCamera',
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
            }
            ).registerBlock(
                {
                    opcode: 'setLightMapSize',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('setLightMapSize'),
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
                }
            ).registerBlock(
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('camera'),
                }
            ).registerBlock(
                {
                    opcode: 'useCamera',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('useCamera'),
                    hideFromPalette: false,
                    arguments: {
                        camera: {
                            type: ArgumentType.STRING,
                            defaultValue: "name",
                        },
                    },
                }
            ).registerBlock(
                {
                    opcode: 'perspectiveCamera',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('perspectiveCamera'),
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
                }
            ).registerBlock(
                {
                    opcode: 'moveCamera',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('moveCamera'),
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
                }
            ).registerBlock(
                {
                    opcode: 'rotationCamera',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('rotationCamera'),
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
                }
            ).registerBlock(
                {
                    opcode: 'cameraLookAt',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('cameraLookAt'),
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
                }
            ).registerBlankLine(
            ).registerBlock({
                opcode: 'getCameraPos',
                blockType: BlockType.REPORTER,
                text: this.formatMessage('getCameraPos'),
                arguments: {
                    xyz: {
                        type: ArgumentType.STRING,
                        menu: 'xyz',
                    },
                },
                disableMonitor: true,
            }
            ).registerBlock(
                {
                    opcode: 'getCameraRotation',
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage(
                        'getCameraRotation',
                    ),
                    arguments: {
                        xyz: {
                            type: ArgumentType.STRING,
                            menu: 'xyz',
                        },
                    },
                    disableMonitor: true,
                }
            ).registerBlock(
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('control'),
                }
            ).registerBlock(
                {
                    opcode: 'createOrbitControls',
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage('createOrbitControls'),
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
                }
            ).registerBlock(
                {
                    opcode: 'updateControls',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('updateControls'),
                    hideFromPalette: false,
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                    },
                }
            ).registerBlock(
                {
                    opcode: 'setControlState',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('setControlState'),
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
                }
            ).registerBlock(
                {
                    opcode: 'mouseCanControl',
                    blockType: BlockType.BOOLEAN,
                    text: this.formatMessage(
                        'mouseCanControl',
                    ),
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name',
                        },
                    },
                }
            ).registerBlock(
                {
                    opcode: 'mouseControl',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('mouseControl'),
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
                }
            ).registerBlock(
                {
                    opcode: 'setControlDamping',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        'setControlDamping',
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
                }
            ).registerBlock(
                {
                    opcode: 'setControlDampingNum',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        'setControlDampingNum',
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
                }
            ).registerBlock(
                {
                    opcode: 'setOrbitControlsTarget',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        'setOrbitControlsTarget',
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
                }
            ).registerBlock(
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage('fogs'),
                }
            ).registerBlock(
                {
                    opcode: 'enableFogEffect',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('enableFogEffect'),
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
                }
            ).registerBlock(
                {
                    opcode: 'disableFogEffect',
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage('disableFogEffect'),
                    arguments: {},
                }
            ).registerBlockFinish((e) => {
                if (typeof e !== 'string' && e.blockType != BlockType.LABEL) {
                    e.tooltip = this.formatMessage(
                        ''.concat(e.opcode).concat('.tooltip'),
                    );
                }
            });
        }

        getInfo() {
            this._initMenus();
            this._initBlocks();

            return {
                id: chen_RenderTheWorld_extensionId,
                docsURI: 'https://learn.ccw.site/article/0d8196d6-fccf-4d92-91b8-ee918a733237',
                name: this.formatMessage('RenderTheWorld.name'),
                blockIconURI: chen_RenderTheWorld_icon,
                menuIconURI: chen_RenderTheWorld_icon,
                color1: color,
                color2: color_secondary,
                color3: color_tertiary,
                blocks: this._core.blocks,
                menus: this._core.menus,
            };
        }

        docs() {
            let a = document.createElement('a');
            a.href =
                'https://learn.ccw.site/article/aa0cf6d0-6758-447a-96f5-8e5dfdbe14d6';
            a.rel = 'noopener noreferrer';
            a.target = '_blank';
            a.click();
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
                        text: this.formatMessage('fileListEmpty'),
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
    }

    extensions.register(new RenderTheWorld(runtime));
    window.IIFEExtensionInfoList = window.IIFEExtensionInfoList || [];  // 自定义注册信息，不用window.tempExt
    window.IIFEExtensionInfoList[0].extensionObject = {
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
