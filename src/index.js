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
} from './assets/index.js';
import { getVM, getScratchBlocks } from './utils/injector.js';
import l10nInit from './l10n/index.js';
import RenderEngine from './core/renderengine.js';
import ExtensionCore from './core/extcore.js';
import Extension from './core/main.js';


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
    } = Scratch;

    /** @type {import('scratch-vm')} */
    const vm = getVM(Scratch.runtime);
    /** @type {import('scratch-blocks')} */
    const ScratchBlocks = getScratchBlocks(Scratch.runtime, vm);
    /** @type {Extension} */
    const extension = new Extension();

    class RenderTheWorld {
        /**
         * @param {import('scratch-vm').Runtime} _runtime
         */
        constructor(_runtime) {
            extension.$initExtension(_runtime ?? Scratch?.vm?.runtime, vm, ScratchBlocks, Scratch);
            if (!extension.runtime) return;

            this.version = extension.$version
            extension.core = new ExtensionCore(extension, extension.vm, extension.ScratchBlocks);
            l10nInit(extension.core);

            extension.renderEngine = new RenderEngine(extension);
        }

        /**
         * 翻译 translate
         * @param {string} id
         * @returns {string}
         */
        $formatMessage(id) {
            return extension.core.translate(id, translate.language);
        }

        $func(args, util, realBlockInfo) {
            realBlockInfo.def.call(extension, args, util, realBlockInfo)
        }

        $loadMenus() {
            extension.core.cleanMenus();
            // extension._core.
            //     registerMenu(
            //         'file_list',
            //         {
            //             acceptReporters: true,
            //             items: '__gandiAssetsJsonFileList',
            //         }
            //     ).registerMenu(
            //         'obj_file_list',
            //         {
            //             acceptReporters: true,
            //             items: '__gandiAssetsObjFileList',
            //         }
            //     ).registerMenu(
            //         'mtl_file_list',
            //         {
            //             acceptReporters: true,
            //             items: '__gandiAssetsMtlFileList',
            //         }
            //     ).registerMenu(
            //         'gltf_file_list',
            //         {
            //             acceptReporters: true,
            //             items: '__gandiAssetsGltfFileList',
            //         }
            //     ).registerMenu(
            //         'xyz',
            //         {
            //             acceptReporters: false,
            //             items: [
            //                 {
            //                     text: this.formatMessage(
            //                         'xyz.x',
            //                     ),
            //                     value: 'x',
            //                 },
            //                 {
            //                     text: this.formatMessage(
            //                         'xyz.y',
            //                     ),
            //                     value: 'y',
            //                 },
            //                 {
            //                     text: this.formatMessage(
            //                         'xyz.z',
            //                     ),
            //                     value: 'z',
            //                 },
            //             ],
            //         }
            //     );
        }

        $loadBlocks() {
            extension.core.cleanBlocks();
            extension.core.
                registerBlock( // API文档跳转按钮
                    {
                        blockType: BlockType.BUTTON,
                        onClick: this.docs,
                    }
                ).registerBlock( // 测试积木
                    {
                        opcode: "test",
                        blockType: BlockType.COMMAND,
                        def: extension.test,
                    }
                ).registerBlockFinish((e) => { // 统一处理，减少行数
                    if (typeof e !== 'string' && e.blockType != BlockType.LABEL) {
                        e.tooltip = this.$formatMessage(
                            ''.concat(e.opcode).concat('.tooltip'),
                        );
                        if (e.opcode) {
                            if (e.def) {
                                e.func = "$func"
                            }
                            if (!e.text) {
                                e.text = this.$formatMessage(e.opcode);
                            }
                        }
                    }
                });
        }

        getInfo(args) {
            this.$loadMenus();
            this.$loadBlocks();

            return {
                id: chen_RenderTheWorld_extensionId,
                docsURI: 'https://learn.ccw.site/article/0d8196d6-fccf-4d92-91b8-ee918a733237',
                name: this.$formatMessage('RenderTheWorld.name'),
                blockIconURI: chen_RenderTheWorld_icon,
                menuIconURI: chen_RenderTheWorld_icon,
                color1: color,
                color2: color_secondary,
                color3: color_tertiary,
                blocks: extension?.core.blocks,
                menus: extension?.core.menus,
            };
        }

        docs() {
            let a = document.createElement('a');
            a.href = 'https://learn.ccw.site/article/aa0cf6d0-6758-447a-96f5-8e5dfdbe14d6';
            a.rel = 'noopener noreferrer';
            a.target = '_blank';
            a.click();
        }
    }

    Scratch.extensions.register(new RenderTheWorld(vm.runtime));
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
