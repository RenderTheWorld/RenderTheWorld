// 基于Nights/FurryR/zxq的可扩展积木
// xiaochen004hao对其进行了一下更改优化
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */

/**
* A record of enabled dynamic argument blocks.
* @type {Object}
*/
const hatParameterColorBlocksInfo = {};
const extInfo = {};

let proxingBlocklyBlocks = false;

/**
* Proxies the Blockly Blocks object to enable dynamic argument blocks.
* @param {Runtime} runtime - The runtime object.
*/
function proxyBlocklyBlocksObject(runtime, Blockly) {
    if (proxingBlocklyBlocks) return;
    proxingBlocklyBlocks = true;
    if (!Blockly) return;
    // setLocales(Blockly);
    Blockly.Blocks = new Proxy(Blockly.Blocks, {
        set(target, opcode, blockDefinition) {
            if (
                Object.prototype.hasOwnProperty.call(
                    hatParameterColorBlocksInfo,
                    opcode,
                )
            ) {
                initHatParameterColorBlock(
                    runtime,
                    blockDefinition,
                    hatParameterColorBlocksInfo[opcode],
                    Blockly,
                );
            }
            return Reflect.set(target, opcode, blockDefinition);
        },
    });
}

/**
* Initializes an expandable block with dynamic arguments.
* @param {Runtime} runtime - The runtime object.
* @param {Object} blockDefinition - The block definition.
* @param {string[]} hatParameterColorBlockInfo - The dynamic argument types.
*/
function initHatParameterColorBlock(
    runtime,
    blockDefinition,
    hatParameterColorBlockInfo,
    Blockly,
) {
    // const { PlusSelectButton, PlusButton, MinusButton } = hatParameterColorBlocksInfo.extInfo;
    const orgInit = blockDefinition.init;
    blockDefinition.init = function () {
        orgInit.call(this);

        this.hatParameterColorBlockInfo_ = hatParameterColorBlockInfo;
        if (!this.getInput) return; // 避免协作报错

    };

    // // Supports deleting specified parameters with right-click
    // blockDefinition.customContextMenu = function (contextMenu) {
    //     if (this.isInFlyout) return;  // 不对toolbax中的积木提供右键菜单支持
    //     console.log("hatParameterColorBlockContextMenu", contextMenu);
    // };

    // blockDefinition.mutationToDom = function () {
    //     const container = document.createElement('mutation');
    //     container.setAttribute(
    //         'hatParameterColorBlockInfoColor1',
    //         JSON.stringify(this.hatParameterColorBlockInfo_.color1),
    //     );
    //     container.setAttribute(
    //         'hatParameterColorBlockInfoColor2',
    //         JSON.stringify(this.hatParameterColorBlockInfo_.color2),
    //     );
    //     if (this.hatParameterColorBlockInfo_.color3) {
    //         container.setAttribute(
    //             'hatParameterColorBlockInfoColor3',
    //             JSON.stringify(this.hatParameterColorBlockInfo_.color3),
    //         );
    //     }
    //     return container;
    // };

    // blockDefinition.domToMutation = function (xmlElement) {
    //     this.hatParameterColorBlockInfo_ = {};
    //     this.hatParameterColorBlockInfo_.color1 = JSON.parse(xmlElement.getAttribute('hatParameterColorBlockInfoColor1')) || "#FF6680";
    //     this.hatParameterColorBlockInfo_.color2 = JSON.parse(xmlElement.getAttribute('hatParameterColorBlockInfoColor2')) || "#FF4D6A";
    //     if (JSON.parse(xmlElement.getAttribute('hatParameterColorBlockInfoColor3'))) {
    //         this.hatParameterColorBlockInfo_.color3 = JSON.parse(xmlElement.getAttribute('hatParameterColorBlockInfoColor3'))
    //     }
    //     this.updateDisplay_();
    // };

    // blockDefinition.updateDisplay_ = function () {
    //     // const wasRendered = this.rendered;
    //     // this.rendered = false;

    //     // const connectionMap = this.disconnectDynamicArgBlocks_();
    //     // this.removeAllDynamicArgInputs_();

    //     // this.createAllDynamicArgInputs_(connectionMap);
    //     // this.deleteShadows_(connectionMap);

    //     // this.rendered = wasRendered;
    //     // if (wasRendered && !this.isInsertionMarker()) {
    //     if (this.rendered && !this.isInsertionMarker()) {
    //         this.initSvg();
    //         this.render();
    //     }
    // };
}

const patchSymbol = Symbol('patch');

/**
* Initializes expandable blocks for a given extension.
* @param {Object} extension - The extension object.
*/
function initHatParameterColor(extension) {
    // 创建按钮
    const { runtime, Blockly } = extension;
    proxyBlocklyBlocksObject(runtime, Blockly);

    if (extension[patchSymbol]) return;
    extension[patchSymbol] = true;
    const origGetInfo = extension.getInfo;
    // patch getInfo，每次调用时同时刷新最新的可扩展参数信息
    extension.getInfo = function () {
        const info = origGetInfo.call(this);
        const { id, blocks: blocksInfo } = info;
        // 注册扩展信息
        extInfo[id] = { id };
        blocksInfo.forEach((i) => {
            // 如果积木定义了可扩展参数
            const { hat_parameter_color, blockType } = i;
            if (hat_parameter_color) {
                hat_parameter_color.color1 = hat_parameter_color.color1 || "#FF6680";
                hat_parameter_color.color2 = hat_parameter_color.color2 || "#FF4D6A";
                // color3可设可不设
                hat_parameter_color.extInfo = extInfo[id];
                hatParameterColorBlocksInfo[`${id}_${i.opcode}`] = hat_parameter_color;
            }
        });
        return info;
    };
}

export { initHatParameterColor };
