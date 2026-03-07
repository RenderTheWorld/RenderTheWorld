/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */

// 资源导入
import {
    color,
    color_secondary,
    color_tertiary,
    chen_RenderTheWorld_extensionId,
    chen_RenderTheWorld_picture,
    chen_RenderTheWorld_icon,
} from './assets/index.js';

// 核心模块导入
import l10nInit from './l10n/index.js';
import RenderEngine from './core/renderengine.js';
import ExtensionCore from './core/extcore.js';
import Extension from './core/main.js';

// 工具模块导入
import { createScratchInstance } from './utils/scratch-instance.js';
import Logger from './utils/logger.js';
import { loadBlocks } from './blocks/index.js';
import { loadMenus } from './menus/index.js';

(function (Scratch) {
    'use strict';

    // 环境检查
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("RenderTheWorld must be run unsandboxed");
    }

    if (!Scratch.vm?.runtime) {
        throw new Error("RenderTheWorld requires Scratch Runtime");
    }

    // 创建兼容实例
    const scratchInstance = createScratchInstance(Scratch);
    const { BlockType, translate, extensions, vm } = scratchInstance;
    const logger = new Logger(vm.runtime);

    // 初始化扩展核心
    const extension = new Extension();
    extension.$initExtension(scratchInstance);

    /**
     * RenderTheWorld 扩展主类
     */
    class RenderTheWorld {
        constructor(runtime) {
            if (!extension.runtime) return;

            this.version = extension.$version;
            extension.core = l10nInit(new ExtensionCore(extension));
            extension.renderEngine = new RenderEngine(extension);
            extension.logger = logger;
        }

        $formatMessage(id) {
            return extension.core.translate(id, translate.language);
        }

        $func(args, util, realBlockInfo) {
            realBlockInfo.def(args, util, realBlockInfo);
        }

        $loadMenus() {
            loadMenus(extension, extension.core, this.$formatMessage.bind(this));
        }

        $loadBlocks() {
            loadBlocks(extension, this, extension.core, BlockType, this.$formatMessage.bind(this));
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
            const a = document.createElement('a');
            a.href = 'https://learn.ccw.site/article/aa0cf6d0-6758-447a-96f5-8e5dfdbe14d6';
            a.rel = 'noopener noreferrer';
            a.target = '_blank';
            a.click();
        }
    }

    // 注册扩展
    extensions.register(new RenderTheWorld(vm.runtime));

    // 保留原有注册信息
    window.IIFEExtensionInfoList = window.IIFEExtensionInfoList || [{}];
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
            collaboratorURL: 'https://www.ccw.site/student/643bb84051bc32279f0c3fa0',
            collaboratorList: [
                {
                    collaborator: 'xiaochen004hao @ CCW',
                    collaboratorURL: 'https://www.ccw.site/student/643bb84051bc32279f0c3fa0',
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