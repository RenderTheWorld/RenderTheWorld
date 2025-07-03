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
import ExtensionCore from './core/engine.js';


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
    const vm = getVM(runtime);
    const ScratchBlocks = getScratchBlocks(runtime, vm);
    // console.warn(vm, ScratchBlocks)

    // translate.setup(l10n);

    class RenderTheWorld {
        constructor(_runtime) {
            this.runtime = _runtime ?? Scratch?.vm?.runtime;
            if (!this.runtime) return;
            this.vm = vm;
            this.ScratchBlocks = ScratchBlocks;

            this._core = new ExtensionCore(this, this.vm, this.ScratchBlocks);
            this._core.loadformat(l10n);
        }

        /**
         * 翻译
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
                                defaultValue: 1,
                                menu: 'WebGLRendererShadowMapType',
                            },
                        },
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
