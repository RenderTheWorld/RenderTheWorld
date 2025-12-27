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

import external from './utils/tw-external.js';
import staticFetch from './utils/tw-static-fetch.js';
import Color from './utils/gandi-color.js';

(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error("RenderTheWorld must be run unsandboxed");
    }

    if (!Scratch.vm?.runtime) {
        throw new Error("RenderTheWorld requires Scratch Runtime");
    }

    /** @type {import('scratch-vm')} */
    const vm = getVM(Scratch.vm?.runtime);

    if (!vm) {
        throw new Error("RenderTheWorld requires Scratch VM");
    }

    /** @type {import('scratch-blocks')} */
    const ScratchBlocks = getScratchBlocks(Scratch.vm?.runtime, vm);

    if (!ScratchBlocks) {
        throw new Error("RenderTheWorld requires Scratch Blocks");
    }

    const scratchInstance = {  // TW & Gandi 兼容的scratchInstance
        ArgumentType: Scratch.ArgumentType,
        BlockType: Scratch.BlockType,
        Cast: Scratch.Cast,
        Color: Scratch.Color || Color,
        TargetType: Scratch.TargetType,
        canDownload: Scratch.canDownload || (async (url, name) => {
            const parsed = parseURL(url);
            if (!parsed) {
                return false;
            }
            // Always reject protocols that would allow code execution.
            // eslint-disable-next-line no-script-url
            if (parsed.protocol === 'javascript:') {
                return false;
            }
            return vm.securityManager.canDownload(url, name);
        }),
        canEmbed: Scratch.canEmbed || (async url => {
            const parsed = parseURL(url);
            if (!parsed) {
                return false;
            }
            return vm.securityManager.canEmbed(parsed.href);
        }),
        canFetch: Scratch.canFetch || (async url => {
            const parsed = parseURL(url);
            if (!parsed) {
                return false;
            }
            // Always allow protocols that don't involve a remote request.
            if (parsed.protocol === 'blob:' || parsed.protocol === 'data:') {
                return true;
            }
            return vm.securityManager.canFetch(parsed.href);
        }),
        canGeolocate: Scratch.canGeolocate || (async () => vm.securityManager.canGeolocate()),
        canNotify: Scratch.canNotify || (async () => vm.securityManager.canNotify()),
        canOpenWindow: Scratch.canOpenWindow || (async url => {
            const parsed = parseURL(url);
            if (!parsed) {
                return false;
            }
            // Always reject protocols that would allow code execution.
            // eslint-disable-next-line no-script-url
            if (parsed.protocol === 'javascript:') {
                return false;
            }
            return vm.securityManager.canOpenWindow(parsed.href);
        }),
        canReadClipboard: Scratch.canReadClipboard || (async () => vm.securityManager.canReadClipboard()),
        canRecordAudio: Scratch.canRecordAudio || (async () => vm.securityManager.canRecordAudio()),
        canRecordVideo: Scratch.canRecordVideo || (async () => vm.securityManager.canRecordVideo()),
        canRedirect: Scratch.canRedirect || (async url => {
            const parsed = parseURL(url);
            if (!parsed) {
                return false;
            }
            // Always reject protocols that would allow code execution.
            // eslint-disable-next-line no-script-url
            if (parsed.protocol === 'javascript:') {
                return false;
            }
            return vm.securityManager.canRedirect(parsed.href);
        }),
        download: Scratch.download || (async (url, name) => {
            if (!await Scratch.canDownload(url, name)) {
                throw new Error(`Permission to download ${name} rejected.`);
            }
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            link.remove();
        }),
        extensions: Scratch.extensions,
        external: Scratch.external || external,
        fetch: Scratch.fetch || (async (url, options) => {
            const actualURL = url instanceof Request ? url.url : url;

            const staticFetchResult = staticFetch(url);
            if (staticFetchResult) {
                return staticFetchResult;
            }

            if (!await Scratch.canFetch(actualURL)) {
                throw new Error(`Permission to fetch ${actualURL} rejected.`);
            }
            return fetch(url, options);
        }),
        gui: Scratch.gui || ({
            /**
             * @returns {Promise<any>} Promise that may eventually resolve to ScratchBlocks
             */
            getBlockly: () => {
                return Promise.resolve(ScratchBlocks);
            },

            /**
             * Not implemented
             */
            getBlocklyEagerly: () => {
                throw new Error('Not implemented');
            }
        }),
        openWindow: Scratch.openWindow || (async (url, features) => {
            if (!await Scratch.canOpenWindow(url)) {
                throw new Error(`Permission to open tab ${url} rejected.`);
            }
            // Use noreferrer to prevent new tab from accessing `window.opener`
            const baseFeatures = 'noreferrer';
            features = features ? `${baseFeatures},${features}` : baseFeatures;
            return window.open(url, '_blank', features);
        }),
        redirect: Scratch.redirect || (async url => {
            if (!await Scratch.canRedirect(url)) {
                throw new Error(`Permission to redirect to ${url} rejected.`);
            }
            location.href = url;
        }),
        renderer: vm.runtime.renderer,
        runtime: vm.runtime,
        translate: Scratch.translate,
        vm: vm,
        ScratchBlocks: ScratchBlocks,
    };

    (function (Scratch) {
        'use strict';

        const { BlockType, translate, extensions, vm } = Scratch;
        const { logSystem } = Scratch.runtime;
        const logError = (...args) => {
            logSystem?.error(...args);
            console.error(...args);
        };

        /** @type {Extension} */
        const extension = new Extension();

        class RenderTheWorld {
            /**
             * @param {import('scratch-vm').Runtime} runtime
             */
            constructor(runtime) {
                extension.$initExtension(Scratch);
                if (!extension.runtime) return;

                this.version = extension.$version
                extension.core = l10nInit(new ExtensionCore(extension));
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
                realBlockInfo.def(args, util, realBlockInfo);
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
                            opcode: "apidocs",
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
                                    e.def = e.def.bind(extension);
                                }
                                if (!e.text) {
                                    e.text = this.$formatMessage(e.opcode);
                                }
                            }
                        }
                    });
            }

            getInfo() {
                this.$loadMenus();
                this.$loadBlocks();

                return {
                    id: chen_RenderTheWorld_extensionId,
                    docsURI: 'https://learn.ccw.site/article/0d8196d6-fccf-4d92-91b8-ee918a733237',
                    name: this.$formatMessage('name'),
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

        extensions.register(new RenderTheWorld(vm.runtime));
        window.IIFEExtensionInfoList = window.IIFEExtensionInfoList || [{}];  // 自定义注册信息，不用window.tempExt
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
    })(scratchInstance);
})(Scratch);