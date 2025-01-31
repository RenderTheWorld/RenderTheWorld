// @ts-nocheck
// 依赖库
import * as THREE from "./assets/threejs/src/Three.js";

import { OBJLoader } from "./assets/threejs_ext/OBJLoader.js";
import { OrbitControls } from "./assets/threejs_ext/OrbitControls.js";
import { MTLLoader } from "./assets/threejs_ext/MTLLoader.js";
import { GLTFLoader } from "./assets/threejs_ext/GLTFLoader.js";
import WebGL from "./assets/threejs_ext/WebGL.js";
import {
    chen_RenderTheWorld_picture,
    chen_RenderTheWorld_icon,
    leftButton,
    rightButton,
} from "./assets/index.js";
import l10n from "./l10n/index.js";
import { initExpandableBlocks, getDynamicArgs } from "./utils/extendableBlock.js";
import { log } from "./assets/threejs/src/Three.TSL.js";

(function (Scratch) {
    "use strict";
    const { logSystem } = Scratch.vm.runtime;
    const logError = (...args) => {
        logSystem?.error(...args);
        console.error(...args);
    };

    function addRTWStyle(newStyle) {
        let _RTWStyle = !(window.RTWStyle);
        window.RTWStyle = document.getElementById('RTWStyle');

        if (!window.RTWStyle) {
            window.RTWStyle = document.createElement('style');
            window.RTWStyle.type = 'text/css';
            window.RTWStyle.id = 'RTWStyle';
            if (_RTWStyle) document.getElementsByTagName('head')[0].appendChild(window.RTWStyle);
        }
        window.RTWStyle.childNodes.forEach((child) => {
            window.RTWStyle.removeChild(child);
        });
        window.RTWStyle.appendChild(document.createTextNode(newStyle));
    }

    addRTWStyle(`
        .RTW-image {
            cursor: pointer;
        }
        .RTW-image:hover {
            filter: brightness(130%);
        }
    `);

    const hackFun = (runtime) => {
        if (!runtime || hackFun.hacked) return;
        hackFun.hacked = true;

        // By Nights: 支持XML的BlockType
        if (!Scratch.BlockType.XML) {
            Scratch.BlockType.XML = "XML";
            const origFun = runtime._convertForScratchBlocks;
            runtime._convertForScratchBlocks = function (
                blockInfo,
                categoryInfo,
            ) {
                if (blockInfo.blockType === Scratch.BlockType.XML) {
                    return {
                        info: blockInfo,
                        xml: blockInfo.xml,
                    };
                }
                return origFun.call(this, blockInfo, categoryInfo);
            };
        }
    };

    /*
     * By: Xeltalliv
     * Link: https://github.com/Xeltalliv/extensions/blob/webgl2-dev/extensions/webgl2.js
     *
     * Modified by: Fath11
     * Link: https://github.com/fath11
     *
     * Please keep this comment if you wanna use this code :3
     */
    class Skins {
        constructor(runtime) {
            this.runtime = runtime;
            const Skin = this.runtime.renderer.exports.Skin;

            class CanvasSkin extends Skin {
                constructor(id, renderer) {
                    super(id, renderer);
                    this.gl = renderer._gl;
                    const texture = this.gl.createTexture();
                    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_WRAP_S,
                        this.gl.CLAMP_TO_EDGE,
                    );
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_WRAP_T,
                        this.gl.CLAMP_TO_EDGE,
                    );
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MIN_FILTER,
                        this.gl.NEAREST,
                    );
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MAG_FILTER,
                        this.gl.NEAREST,
                    );
                    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,255,0,255]));
                    this._texture = texture;
                    this._rotationCenter = [320, 180];
                    this._size = [640, 360];
                }
                dispose() {
                    if (this._texture) {
                        this.renderer.gl.deleteTexture(this._texture);
                        this._texture = null;
                    }
                    super.dispose();
                }
                set size(value) {
                    this._size = value;
                    this._rotationCenter = [value[0] / 2, value[1] / 2];
                }
                get size() {
                    return this._size;
                }
                getTexture(scale) {
                    return this._texture || super.getTexture();
                }
                setContent(textureData) {
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
                    this.gl.texImage2D(
                        this.gl.TEXTURE_2D,
                        0,
                        this.gl.RGBA,
                        this.gl.RGBA,
                        this.gl.UNSIGNED_BYTE,
                        textureData,
                    );
                    this.emit(Skin.Events.WasAltered);
                }
            }

            this.CanvasSkin = CanvasSkin;
        }
    }
    //End of Skins, Please keep this comment if you wanna use this code :3

    const { ArgumentType, BlockType, TargetType, Cast, translate, extensions, runtime } = Scratch;

    function hijack(fn) {
        const _orig = Function.prototype.apply;
        /**
         * Hijack the Function.prototype.apply function.
         * @param thisArg
         * @returns thisArg.
         */
        Function.prototype.apply = function (thisArg) {
            return thisArg;
        };
        const result = fn();
        Function.prototype.apply = _orig;
        return result;
    }
    function getBlockly(vm) {
        let Blockly;
        if (vm._events["EXTENSION_ADDED"] instanceof Array) {
            for (const value of vm._events["EXTENSION_ADDED"]) {
                const v = hijack(value);
                if (v?.ScratchBlocks) {
                    Blockly = v?.ScratchBlocks;
                    break;
                }
            }
        } else if (vm._events["EXTENSION_ADDED"]) {
            Blockly = hijack(vm._events["EXTENSION_ADDED"])?.ScratchBlocks;
        }
        return Blockly;
    }

    const chen_RenderTheWorld_extensionId = "RenderTheWorld";

    // 定义用于存储原始函数的属性名
    const PATCHES_ID = "__patches_" + chen_RenderTheWorld_extensionId;

    /**
     * 来自系统工具
     * 运行环境
     * prod：不在编辑器内
     * dev：在编辑器内
     */
    const is_see_inside = () => {
        const ur1 = window.location.pathname;
        // /gandi
        // ^^^^^^
        // /gandi/project
        // ^^^^^^-
        const rege = /\/(?:gandi|creator)(?:\/|$)/;
        //            \/\_______________/\______/
        //   “/”部分--'         |         |
        //    gandi或者creator--'         |
        //               “/”或者文本末尾--'
        return rege.test(ur1);
    };

    // 定义patch函数，用于修改对象的方法
    const patch = (obj, functions) => {
        if (obj[PATCHES_ID]) return;
        obj[PATCHES_ID] = {};
        for (const name in functions) {
            // 保存原始函数
            const original = obj[name];
            obj[PATCHES_ID][name] = obj[name];
            if (original) {
                // 替换原函数，增加自定义逻辑
                obj[name] = function (...args) {
                    const callOriginal = (...args) =>
                        original.call(this, ...args);
                    return functions[name].call(this, callOriginal, ...args);
                };
            } else {
                // 如果原函数不存在，直接定义新函数
                obj[name] = function (...args) {
                    return functions[name].call(this, () => { }, ...args);
                };
            }
        }
    };

    /** @typedef {string|number|boolean} SCarg 来自Scratch圆形框的参数，虽然这个框可能只能输入数字，但是可以放入变量，因此有可能获得数字、布尔和文本（极端情况下还有 null 或 undefined，需要同时处理 */
    translate.setup(l10n);

    class RTW_Model_Box {
        constructor(model, ismaterial, isobj, isgltf, animations) {
            this.model = model;
            this.ismaterial = ismaterial;
            this.isobj = isobj;
            this.isgltf = isgltf;
            this.animations = animations;
        }

        toString() {
            return String(this.model);
        }

        getHTML() {
            let html = document.createElement("span");
            // html.style.color = this.color;
            // html.style.fontSize = String(this.size) + "px";
            if (this.isobj) {
                html.innerText = `objfile: "${this.model.objfile}" mtlfile: "${this.model.mtlfile}`;
            } else if (this.isgltf) {
                html.innerText = `gltffile: "${this.model.gltffile}"`;
            } else {
                html.innerText = `model: "${this.model["type"] ?? String(this.model)}"`;
            }
            if (this.model instanceof THREE.Group) {
                html.innerText += ` ${JSON.stringify(this.model.children.map((x) => x.type))}`;
            }
            return html;
        }
    }

    let Wrapper = class _Wrapper extends String {
        /**
         * Construct a wrapped value.
         * @param value Value to wrap.
         */
        constructor(value) {
            super(value);
            this.value = value;
        }
        /**
         * Unwraps a wrapped object.
         * @param value Wrapped object.
         * @returns Unwrapped object.
         */
        static unwrap(value) {
            return value instanceof _Wrapper ? value.value : value;
        }
        /**
         * toString method for Scratch monitors.
         * @returns String display.
         */
        toString() {
            return String(this.value);
        }
    };

    function show(Blockly, id, value, textAlign) {
        const workspace = Blockly.getMainWorkspace();
        const block = workspace.getBlockById(id);
        if (!block) return;
        Blockly.DropDownDiv.hideWithoutAnimation();
        Blockly.DropDownDiv.clearContent();
        const contentDiv = Blockly.DropDownDiv.getContentDiv(),
            elem = document.createElement("div");
        elem.setAttribute("class", "valueReportBox");
        elem.append(...value);
        elem.style.maxWidth = "none";
        elem.style.maxHeight = "none";
        elem.style.textAlign = textAlign;
        elem.style.userSelect = "none";
        contentDiv.appendChild(elem);
        Blockly.DropDownDiv.setColour(
            Blockly.Colours.valueReportBackground,
            Blockly.Colours.valueReportBorder,
        );
        Blockly.DropDownDiv.showPositionedByBlock(workspace, block);
        return elem;
    }

    class RenderTheWorld {
        constructor(_runtime) {
            this.runtime = _runtime ?? Scratch?.vm?.runtime;
            if (!this.runtime) return;

            /**
             * 在编辑器自定义返回值显示的方法来自 https://github.com/FurryR/lpp-scratch 的LPP扩展
             */
            this.Blockly = void 0;
            this.vm = this.runtime.extensionManager.vm;
            console.log(this.vm);

            this.Blockly = getBlockly(this.vm);
            if (!this.Blockly)
                this.vm.once("workspaceUpdate", () => {
                    const newBlockly = getBlockly(this.vm);
                    if (newBlockly && newBlockly !== this.Blockly) {
                        this.Blockly = newBlockly;
                    }
                });
            // 使用patch函数修改runtime的visualReport方法，增加自定义逻辑
            patch(this.runtime.constructor.prototype, {
                visualReport: (original, blockId, value) => {
                    if (this.vm.editingTarget) {
                        const block = this.vm.editingTarget.blocks.getBlock(blockId);
                        // 如果当前块是Inline Blocks且不是顶层块，则不执行后续逻辑
                        if (
                            block.opcode ===
                            chen_RenderTheWorld_extensionId + "_makeMaterial" &&
                            !block.topLevel
                        )
                            return;
                    }
                    // 调用原始函数，继续执行后续逻辑
                    original(blockId, value);
                },
            });
            const _visualReport = runtime.visualReport;
            runtime.visualReport = (blockId, value) => {
                const unwrappedValue = Wrapper.unwrap(value);
                if (unwrappedValue instanceof RTW_Model_Box && this.Blockly) {
                    //return _visualReport.call(runtime, blockId, value);
                    show(
                        this.Blockly,
                        blockId,
                        [unwrappedValue.getHTML()],
                        "center",
                    );
                } else {
                    return _visualReport.call(runtime, blockId, value);
                }
            };
            const _requestUpdateMonitor = runtime.requestUpdateMonitor;
            const monitorMap = /* @__PURE__ */ new Map();
            if (_requestUpdateMonitor) {
                const patchMonitorValue = (element, value) => {
                    const unwrappedValue = Wrapper.unwrap(value);
                    const valueElement =
                        element.querySelector('[class*="value"]');
                    if (valueElement instanceof HTMLElement) {
                        const internalInstance = Object.values(
                            valueElement,
                        ).find(
                            (v) =>
                                typeof v === "object" &&
                                v !== null &&
                                Reflect.has(v, "stateNode"),
                        );
                        if (unwrappedValue instanceof RTW_Model_Box) {
                            const inspector = unwrappedValue.getHTML();
                            valueElement.style.textAlign = "left";
                            valueElement.style.backgroundColor = "#121C3D";
                            valueElement.style.color = "#eeeeee";
                            valueElement.style.border = "1px solid #4A76FF";
                            while (valueElement.firstChild)
                                valueElement.removeChild(
                                    valueElement.firstChild,
                                );
                            valueElement.append(inspector);
                        } else {
                            if (internalInstance) {
                                valueElement.style.textAlign = "";
                                valueElement.style.backgroundColor =
                                    internalInstance.memoizedProps?.style
                                        ?.background ?? "";
                                valueElement.style.color =
                                    internalInstance.memoizedProps?.style
                                        ?.color ?? "";
                                while (valueElement.firstChild)
                                    valueElement.removeChild(
                                        valueElement.firstChild,
                                    );
                                valueElement.append(String(value));
                            }
                        }
                    }
                };
                const getMonitorById = (id2) => {
                    const elements = document.querySelectorAll(
                        `[class*="monitor_monitor-container"]`,
                    );
                    for (const element of Object.values(elements)) {
                        const internalInstance = Object.values(element).find(
                            (v) =>
                                typeof v === "object" &&
                                v !== null &&
                                Reflect.has(v, "children"),
                        );
                        if (internalInstance) {
                            const props = internalInstance?.children?.props;
                            if (id2 === props?.id) return element;
                        }
                    }
                    return null;
                };
                this.runtime.requestUpdateMonitor = (state) => {
                    const id2 = state.get("id");
                    if (typeof id2 === "string") {
                        const monitorValue = state.get("value");
                        const unwrappedValue = Wrapper.unwrap(monitorValue);
                        const monitorMode = state.get("mode");
                        const monitorVisible = state.get("visible");
                        const cache = monitorMap.get(id2);
                        if (typeof monitorMode === "string" && cache) {
                            cache.mode = monitorMode;
                            cache.value = void 0;
                        } else if (monitorValue !== void 0) {
                            if (unwrappedValue instanceof RTW_Model_Box) {
                                if (!cache || cache.value !== monitorValue) {
                                    requestAnimationFrame(() => {
                                        const monitor = getMonitorById(id2);
                                        if (monitor) {
                                            patchMonitorValue(
                                                monitor,
                                                monitorValue,
                                            );
                                        }
                                    });
                                    if (!cache) {
                                        monitorMap.set(id2, {
                                            value: monitorValue,
                                            mode: (() => {
                                                if (runtime.getMonitorState) {
                                                    const monitorCached =
                                                        runtime
                                                            .getMonitorState()
                                                            .get(id2);
                                                    if (monitorCached) {
                                                        const mode =
                                                            monitorCached.get(
                                                                "mode",
                                                            );
                                                        return typeof mode ===
                                                            "string"
                                                            ? mode
                                                            : "normal";
                                                    }
                                                }
                                                return "normal";
                                            })(),
                                        });
                                    } else cache.value = monitorValue;
                                }
                                return true;
                            } else {
                                if (monitorMap.has(id2)) {
                                    const monitor = getMonitorById(id2);
                                    if (monitor) {
                                        patchMonitorValue(
                                            monitor,
                                            monitorValue,
                                        );
                                    }
                                    monitorMap.delete(id2);
                                }
                            }
                        } else if (monitorVisible !== void 0) {
                            if (!monitorVisible) monitorMap.delete(id2);
                        }
                    }
                    return _requestUpdateMonitor.call(this.runtime, state);
                };
            }

            hackFun(_runtime);

            // 注册可拓展积木
            console.log("RTW", is_see_inside());

            if (is_see_inside()) {
                // 修复ccw_hat_parameter的颜色问题
                this._RTW_hat_parameters = new Set();
                this.objectLoadingCompletedUpdate = () => {
                    this.Blockly.getMainWorkspace().getAllBlocks().filter((block) => block.type === "ccw_hat_parameter").forEach((hat_parameter) => {
                        if (hat_parameter.svgGroup_.getElementsByTagName("text")[0].textContent === "name") {  // 这里是判断参数的名称，防止误判
                            let flag = hat_parameter["is_RTW_hat_parameter"] == true || this._RTW_hat_parameters.has(hat_parameter.id) ? true : false;
                            let parentBlock_ = hat_parameter.parentBlock_;
                            while (!flag && parentBlock_ !== null) {
                                this._RTW_hat_parameters.add(hat_parameter.id);
                                if (parentBlock_.type === chen_RenderTheWorld_extensionId + "_objectLoadingCompleted") {  // 如果这个ccw_hat_parameter的最高层是objectLoadingCompleted积木，说明他是objectLoadingCompleted的ccw_hat_parameter
                                    flag = true;
                                    break;
                                }
                                parentBlock_ = parentBlock_.parentBlock_;
                            }
                            if (flag) {
                                hat_parameter["is_RTW_hat_parameter"] = true;
                                hat_parameter.colour_ = hat_parameter.svgPath_.style.fill = "#121C3D";
                                hat_parameter.colourTertiary_ = hat_parameter.svgPath_.style.stroke = "#4A76FF";
                            }
                            this._RTW_hat_parameters.forEach((id) => {
                                if (this.Blockly.getMainWorkspace().getBlockById(id) === null) {
                                    this._RTW_hat_parameters.delete(id);
                                }
                            });
                        }
                    });
                }
                this.runtime.on("PROJECT_LOADED", this.objectLoadingCompletedUpdate);     // 项目加载完
                this.runtime.on("BLOCK_DRAG_UPDATE", this.objectLoadingCompletedUpdate);  // 拖动完积木后
                this.runtime.on("BLOCKSINFO_UPDATE", this.objectLoadingCompletedUpdate);  // 切换角色时
                initExpandableBlocks(this, rightButton, leftButton);
            }

            this.is_listener = false;
            this._init_porject_time = 0;

            // 兼容性
            this.isWebglAvailable = false;

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
            this.NullCanvas = document.createElement("canvas");

            // threejs skin
            let index = this.runtime.renderer._groupOrdering.indexOf("video");
            this.runtime.renderer._groupOrdering.splice(
                index + 1,
                0,
                "RenderTheWorld",
            );
            this.runtime.renderer._layerGroups["RenderTheWorld"] = {
                groupIndex: 0,
                drawListOffset:
                    this.runtime.renderer._layerGroups["video"].drawListOffset,
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
                this.runtime.renderer.createDrawable("RenderTheWorld");
            this.runtime.renderer.updateDrawableSkinId(
                this.threeDrawableId,
                this.threeSkinId,
            );

            this.clock = null;
            this._clock = 0;

            this.threadInfo = {};

            // 重新实现“output”和“outputShape”块参数
            const cbfsb = this.runtime._convertBlockForScratchBlocks.bind(this.runtime);
            this.runtime._convertBlockForScratchBlocks = function (blockInfo, categoryInfo) {
                const res = cbfsb(blockInfo, categoryInfo);
                if (blockInfo.outputShape) {
                    if (!res.json.outputShape)
                        res.json.outputShape = blockInfo.outputShape;
                }
                if (blockInfo.output) {
                    if (!res.json.output) res.json.output = blockInfo.output;
                }
                if (!res.json.branchCount) res.json.branchCount = blockInfo.branchCount;
                return res;
            };
        }

        /**
         * 翻译
         * @param {string} id
         * @return {string}
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
                    text: this.formatMessage("RenderTheWorld.apidocs"),
                    onClick: this.docs,
                },
                {
                    opcode: "init",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.init"),
                    arguments: {
                        color: {
                            type: "number",
                            defaultValue: 0,
                        },
                        sizex: {
                            type: "number",
                            defaultValue: 640,
                        },
                        sizey: {
                            type: "number",
                            defaultValue: 360,
                        },
                        Anti_Aliasing: {
                            type: "string",
                            menu: "Anti_Aliasing",
                        },
                    },
                },
                {
                    opcode: "set3dState",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.set3dState"),
                    arguments: {
                        state: {
                            type: "string",
                            menu: "3dState",
                        },
                    },
                },
                {
                    opcode: "get3dState",
                    blockType: BlockType.BOOLEAN,
                    text: this.formatMessage("RenderTheWorld.get3dState"),
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage("RenderTheWorld.tools"),
                },
                {
                    opcode: "color_RGB",
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage("RenderTheWorld.color_RGB"),
                    arguments: {
                        R: {
                            type: "number",
                            defaultValue: 255,
                        },
                        G: {
                            type: "number",
                            defaultValue: 255,
                        },
                        B: {
                            type: "number",
                            defaultValue: 255,
                        },
                    },
                },
                {
                    opcode: "isWebGLAvailable",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.isWebGLAvailable"),
                },
                {
                    opcode: "_isWebGLAvailable",
                    blockType: BlockType.BOOLEAN,
                    text: this.formatMessage(
                        "RenderTheWorld._isWebGLAvailable",
                    ),
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage("RenderTheWorld.objects"),
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage("RenderTheWorld.Material"),
                },
                {
                    opcode: "makeMaterial",
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage("RenderTheWorld.makeMaterial"),
                    arguments: {
                        material: {
                            type: "material",
                            menu: "material",
                            defaultValue: "Basic",
                        },
                    },
                    output: "Boolean",
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
                          `
                },
                {
                    opcode: "setMaterialColor",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.setMaterialColor"),
                    arguments: {
                        color: {
                            type: "string",
                            defaultValue: "",
                        },
                    },
                },
                {
                    opcode: "setMaterialFog",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.setMaterialFog"),
                    arguments: {
                        YN: {
                            type: "string",
                            menu: "YN",
                            defaultValue: "true",
                        },
                    },
                },
                {
                    opcode: "return",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.return"),
                    arguments: {},
                    isTerminal: true,
                    hideFromPalette: true,
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage("RenderTheWorld.Model"),
                },
                {
                    opcode: "objectLoadingCompleted",
                    blockType: BlockType.HAT,
                    text: this.formatMessage(
                        "RenderTheWorld.objectLoadingCompleted",
                    ),
                    isEdgeActivated: false,
                    shouldRestartExistingThreads: false,
                    arguments: {
                        name: {
                            type: "ccw_hat_parameter",
                            defaultValue: "name",
                        },
                    },
                },
                {
                    opcode: "importModel",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.importModel"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        model: {
                            type: null,
                            defaultValue: "",
                        },
                    },
                },
                {
                    opcode: "deleteObject",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.deleteObject"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name1",
                        },
                    },
                    dynamicArgsInfo: {
                        defaultValues: (i) => `name${i + 2}`,
                        afterArg: 'name',
                        joinCh: ', ',
                        dynamicArgTypes: ['s']
                    },
                },
                {
                    opcode: "cubeModel",
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage("RenderTheWorld.cubeModel"),
                    arguments: {
                        a: {
                            type: "number",
                            defaultValue: 5,
                        },
                        b: {
                            type: "number",
                            defaultValue: 5,
                        },
                        h: {
                            type: "number",
                            defaultValue: 5,
                        },
                        material: {
                            type: null,
                            defaultValue: "",
                        },
                    },
                    output: "Reporter",
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: "sphereModel",
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage("RenderTheWorld.sphereModel"),
                    arguments: {
                        radius: {
                            type: "number",
                            defaultValue: 3,
                        },
                        w: {
                            type: "number",
                            defaultValue: 32,
                        },
                        h: {
                            type: "number",
                            defaultValue: 16,
                        },
                        material: {
                            type: null,
                            defaultValue: "",
                        },
                    },
                    output: "Reporter",
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: "planeModel",
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage("RenderTheWorld.planeModel"),
                    arguments: {
                        a: {
                            type: "number",
                            defaultValue: 5,
                        },
                        b: {
                            type: "number",
                            defaultValue: 5,
                        },
                        material: {
                            type: null,
                            defaultValue: "",
                        },
                    },
                    output: "Reporter",
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: "objModel",
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage("RenderTheWorld.objModel"),
                    arguments: {
                        objfile: {
                            type: "string",
                            menu: "file_list",
                        },
                        mtlfile: {
                            type: "string",
                            menu: "file_list",
                        },
                        material: {
                            type: null,
                            defaultValue: "",
                        },
                    },
                    output: "Reporter",
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: "gltfModel",
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage("RenderTheWorld.gltfModel"),
                    arguments: {
                        gltffile: {
                            type: "string",
                            menu: "file_list",
                        },
                        material: {
                            type: null,
                            defaultValue: "",
                        },
                    },
                    output: "Reporter",
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: "groupModel",
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage("RenderTheWorld.groupModel"),
                    arguments: {},
                    dynamicArgsInfo: {
                        defaultValues: 'MODEL',
                        dynamicArgTypes: ['s'],
                        preText: (n) => (n === 0 ? this.formatMessage("RenderTheWorld.groupModel") : `${this.formatMessage("RenderTheWorld.groupModel")}[`),
                        endText: (n) => (n === 0 ? "" : "]"),
                    },
                    output: "Reporter",
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: "shadowSettings",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.shadowSettings"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        YN: {
                            type: "string",
                            menu: "YN",
                        },
                        YN2: {
                            type: "string",
                            menu: "YN",
                        },
                    },
                },

                {
                    opcode: "makeCube",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.makeCube"),
                    hideFromPalette: true,
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        a: {
                            type: "number",
                            defaultValue: 5,
                        },
                        b: {
                            type: "number",
                            defaultValue: 5,
                        },
                        h: {
                            type: "number",
                            defaultValue: 5,
                        },
                        color: {
                            type: "number",
                        },
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                        YN: {
                            type: "string",
                            menu: "YN",
                        },
                        YN2: {
                            type: "string",
                            menu: "YN",
                        },
                    },
                },
                {
                    opcode: "makeSphere",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.makeSphere"),
                    hideFromPalette: true,
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        radius: {
                            type: "number",
                            defaultValue: 3,
                        },
                        w: {
                            type: "number",
                            defaultValue: 32,
                        },
                        h: {
                            type: "number",
                            defaultValue: 16,
                        },
                        color: {
                            type: "number",
                        },
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                        YN: {
                            type: "string",
                            menu: "YN",
                        },
                        YN2: {
                            type: "string",
                            menu: "YN",
                        },
                    },
                },
                {
                    opcode: "makePlane",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.makePlane"),
                    hideFromPalette: true,
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        a: {
                            type: "number",
                            defaultValue: 5,
                        },
                        b: {
                            type: "number",
                            defaultValue: 5,
                        },
                        color: {
                            type: "number",
                        },
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                        YN: {
                            type: "string",
                            menu: "YN",
                        },
                        YN2: {
                            type: "string",
                            menu: "YN",
                        },
                    },
                },
                {
                    opcode: "importOBJ",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.importOBJ"),
                    hideFromPalette: true,
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        objfile: {
                            type: "string",
                            menu: "file_list",
                        },
                        mtlfile: {
                            type: "string",
                            menu: "file_list",
                        },
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                        YN: {
                            type: "string",
                            menu: "YN",
                        },
                        YN2: {
                            type: "string",
                            menu: "YN",
                        },
                    },
                },
                {
                    opcode: "importGLTF",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.importGLTF"),
                    hideFromPalette: true,
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        gltffile: {
                            type: "string",
                            menu: "file_list",
                        },
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                        YN: {
                            type: "string",
                            menu: "YN",
                            defaultValue: "false",
                        },
                        YN2: {
                            type: "string",
                            menu: "YN",
                        },
                    },
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage("RenderTheWorld.Move"),
                },
                {
                    opcode: "rotationObject",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.rotationObject"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: "moveObject",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.moveObject"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: "scaleObject",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.scaleObject"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: "getObjectPos",
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage("RenderTheWorld.getObjectPos"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        xyz: {
                            type: "string",
                            menu: "xyz",
                        },
                    },
                },
                {
                    opcode: "getObjectRotation",
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage(
                        "RenderTheWorld.getObjectRotation",
                    ),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        xyz: {
                            type: "string",
                            menu: "xyz",
                        },
                    },
                },
                {
                    opcode: "getObjectScale",
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage("RenderTheWorld.getObjectScale"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        xyz: {
                            type: "string",
                            menu: "xyz",
                        },
                    },
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage("RenderTheWorld.Animation"),
                },
                {
                    opcode: "playAnimation",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.playAnimation"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        animationName: {
                            type: "string",
                            defaultValue: "animationName1",
                        },
                    },
                    dynamicArgsInfo: {
                        defaultValues: (i) => `animationName${i+2}`,
                        afterArg: 'animationName',
                        joinCh: ', ',
                        dynamicArgTypes: ['s']
                    },
                },
                {
                    opcode: "stopAnimation",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.stopAnimation"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        animationName: {
                            type: "string",
                            defaultValue: "animationName1",
                        },
                    },
                    dynamicArgsInfo: {
                        defaultValues: (i) => `animationName${i+2}`,
                        afterArg: 'animationName',
                        joinCh: ', ',
                        dynamicArgTypes: ['s']
                    },
                },
                {
                    opcode: "updateAnimation",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.updateAnimation"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        time: {
                            type: "number",
                            defaultValue: "1",
                        },
                    },
                },
                {
                    opcode: "getAnimation",
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage("RenderTheWorld.getAnimation"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                    },
                    disableMonitor: true,
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage("RenderTheWorld.lights"),
                },
                {
                    opcode: "pointLight",
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage("RenderTheWorld.pointLight"),
                    arguments: {
                        color: {
                            type: "number",
                        },
                        intensity: {
                            type: "number",
                            defaultValue: 100,
                        },
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                        decay: {
                            type: "number",
                            defaultValue: 2,
                        },
                        YN: {
                            type: "string",
                            menu: "YN",
                        },
                    },
                    output: "Reporter",
                    outputShape: 3,
                    branchCount: 0,
                },
                {
                    opcode: "directionalLight",
                    blockType: BlockType.OUTPUT,
                    text: this.formatMessage("RenderTheWorld.directionalLight"),
                    arguments: {
                        color: {
                            type: "number",
                        },
                        intensity: {
                            type: "number",
                            defaultValue: 100,
                        },
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 1,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                        x2: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y2: {
                            type: "number",
                            defaultValue: 1,
                        },
                        z2: {
                            type: "number",
                            defaultValue: 0,
                        },
                        YN: {
                            type: "string",
                            menu: "YN",
                        },
                    },
                    output: "Reporter",
                    outputShape: 3,
                    branchCount: 0,
                },

                {
                    opcode: "setAmbientLightColor",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        "RenderTheWorld.setAmbientLightColor",
                    ),
                    arguments: {
                        color: {
                            type: "number",
                        },
                        intensity: {
                            type: "number",
                            defaultValue: 1,
                        },
                    },
                },
                {
                    opcode: "setHemisphereLightColor",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        "RenderTheWorld.setHemisphereLightColor",
                    ),
                    arguments: {
                        skyColor: {
                            type: "number",
                        },
                        groundColor: {
                            type: "number",
                        },
                        intensity: {
                            type: "number",
                            defaultValue: 1,
                        },
                    },
                },
                "---",
                {
                    opcode: "setDirectionalLightShawdowCamera",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        "RenderTheWorld.setDirectionalLightShawdowCamera",
                    ),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        left: {
                            type: "number",
                            defaultValue: -20,
                        },
                        right: {
                            type: "number",
                            defaultValue: 20,
                        },
                        top: {
                            type: "number",
                            defaultValue: 20,
                        },
                        bottom: {
                            type: "number",
                            defaultValue: -20,
                        },
                    },
                },
                {
                    opcode: "setLightMapSize",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.setLightMapSize"),
                    arguments: {
                        name: {
                            type: "string",
                            defaultValue: "name",
                        },
                        xsize: {
                            type: "number",
                            defaultValue: 512,
                        },
                        ysize: {
                            type: "number",
                            defaultValue: 512,
                        },
                    },
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage("RenderTheWorld.camera"),
                },
                {
                    opcode: "moveCamera",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.moveCamera"),
                    arguments: {
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: "rotationCamera",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.rotationCamera"),
                    arguments: {
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: "cameraLookAt",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.cameraLookAt"),
                    arguments: {
                        x: {
                            type: "number",
                            defaultValue: 0,
                        },
                        y: {
                            type: "number",
                            defaultValue: 0,
                        },
                        z: {
                            type: "number",
                            defaultValue: 0,
                        },
                    },
                },
                "---",
                {
                    opcode: "getCameraPos",
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage("RenderTheWorld.getCameraPos"),
                    arguments: {
                        xyz: {
                            type: "string",
                            menu: "xyz",
                        },
                    },
                    disableMonitor: true,
                },
                {
                    opcode: "getCameraRotation",
                    blockType: BlockType.REPORTER,
                    text: this.formatMessage(
                        "RenderTheWorld.getCameraRotation",
                    ),
                    arguments: {
                        xyz: {
                            type: "string",
                            menu: "xyz",
                        },
                    },
                    disableMonitor: true,
                },
                "---",
                {
                    opcode: "setControlState",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.setControlState"),
                    hideFromPalette: false,
                    arguments: {
                        YN: {
                            type: "string",
                            menu: "YN",
                        },
                    },
                },
                {
                    opcode: "mouseCanControlCamera",
                    blockType: BlockType.BOOLEAN,
                    text: this.formatMessage(
                        "RenderTheWorld.mouseCanControlCamera",
                    ),
                },
                {
                    opcode: "controlCamera",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.controlCamera"),
                    hideFromPalette: false,
                    arguments: {
                        yn1: {
                            type: "string",
                            menu: "YN",
                        },
                        yn2: {
                            type: "string",
                            menu: "YN",
                        },
                        yn3: {
                            type: "string",
                            menu: "YN",
                        },
                    },
                },
                {
                    opcode: "setControlCameraDamping",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        "RenderTheWorld.setControlCameraDamping",
                    ),
                    arguments: {
                        YN2: {
                            type: "string",
                            menu: "YN2",
                        },
                    },
                },
                {
                    opcode: "setControlCameraDampingNum",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage(
                        "RenderTheWorld.setControlCameraDampingNum",
                    ),
                    arguments: {
                        num: {
                            type: "number",
                            defaultValue: 0.05,
                        },
                    },
                },
                {
                    blockType: BlockType.LABEL,
                    text: this.formatMessage("RenderTheWorld.fogs"),
                },
                {
                    opcode: "enableFogEffect",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.enableFogEffect"),
                    arguments: {
                        color: {
                            type: "number",
                        },
                        near: {
                            type: "number",
                            defaultValue: 1,
                        },
                        far: {
                            type: "number",
                            defaultValue: 1000,
                        },
                    },
                },
                {
                    opcode: "disableFogEffect",
                    blockType: BlockType.COMMAND,
                    text: this.formatMessage("RenderTheWorld.disableFogEffect"),
                },
            ];

            blocks.forEach((e) => {
                if (typeof e !== "string" && e.blockType != BlockType.LABEL) {
                    e.tooltip = this.formatMessage(
                        "RenderTheWorld.".concat(e.opcode).concat(".tooltip"),
                    );
                }
            });
            return {
                id: chen_RenderTheWorld_extensionId, // 拓展id
                docsURI:
                    "https://learn.ccw.site/article/0d8196d6-fccf-4d92-91b8-ee918a733237",
                name: this.formatMessage("RenderTheWorld.name"), // 拓展名
                blockIconURI: chen_RenderTheWorld_icon,
                menuIconURI: chen_RenderTheWorld_icon,
                color1: "#121C3D",
                color2: "#4A76FF",
                color3: "#4A76FF",
                blocks: blocks,
                menus: {
                    file_list: {
                        acceptReporters: true,
                        items: "__gandiAssetsJsonFileList",
                    },
                    xyz: {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.xyz.x",
                                ),
                                value: "x",
                            },
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.xyz.y",
                                ),
                                value: "y",
                            },
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.xyz.z",
                                ),
                                value: "z",
                            },
                        ],
                    },
                    Anti_Aliasing: {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.Anti_Aliasing.enable",
                                ),
                                value: "enable",
                            },
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.Anti_Aliasing.disable",
                                ),
                                value: "disable",
                            },
                        ],
                    },
                    YN: {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.YN.true",
                                ),
                                value: "true",
                            },
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.YN.false",
                                ),
                                value: "false",
                            },
                        ],
                    },
                    YN2: {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.YN2.yes",
                                ),
                                value: "yes",
                            },
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.YN2.no",
                                ),
                                value: "no",
                            },
                        ],
                    },
                    "3dState": {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.3dState.display",
                                ),
                                value: "display",
                            },
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.3dState.hidden",
                                ),
                                value: "hidden",
                            },
                        ],
                    },
                    material: {
                        acceptReporters: false,
                        items: [
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.material.Basic",
                                ),
                                value: "Basic",
                            },
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.material.Lambert",
                                ),
                                value: "Lambert",
                            },
                            {
                                text: this.formatMessage(
                                    "RenderTheWorld.material.Phong",
                                ),
                                value: "Phong",
                            },
                        ],
                    },
                },
            };
        }
        __gandiAssetsJsonFileList() {
            try {
                const list = this.runtime
                    .getGandiAssetsFileList("json")
                    .map((item) => ({
                        text: item.fullName,
                        value: item.fullName,
                    }));
                if (list.length < 1) {
                    return [
                        {
                            text: this.formatMessage(
                                "RenderTheWorld.fileListEmpty",
                            ),
                            value: "fileListEmpty",
                        },
                    ];
                }

                return list;
            } catch (err) {
                return [
                    {
                        text: this.formatMessage(
                            "RenderTheWorld.fileListEmpty",
                        ),
                        value: "fileListEmpty",
                    },
                ];
            }
        }

        /**
         * @param {string} filename
         */
        getFileURL(filename) {
            return this.runtime.getGandiAssetContent(filename).encodeDataURI();
        }

        docs() {
            let a = document.createElement("a");
            a.href =
                "https://learn.ccw.site/article/aa0cf6d0-6758-447a-96f5-8e5dfdbe14d6";
            a.rel = "noopener noreferrer";
            a.target = "_blank";
            a.click();
        }

        /**
         * 兼容性检查
         * @param {object} args
         */

        isWebGLAvailable({ }) {
            this.isWebglAvailable = WebGL.isWebGLAvailable();
        }
        /**
         * 兼容性
         * @param {object} args
         * @return {boolean}
         */

        _isWebGLAvailable({ }) {
            return this.isWebglAvailable;
        }

        objectLoadingCompleted({ name }) {
            if (Cast.toString(name) in this.objects) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * @param {object} model
         */
        _deleteObject(model) {
            if (model.type === "Mesh") {
                model.geometry.dispose();
                model.material.dispose();
            } else if (model.type === "Group") {
                model.traverse((obj) => {
                    if (obj.type === "Mesh") {
                        obj.geometry.dispose();
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach((mat) => {
                                mat.dispose();
                            });
                        } else {
                            obj.material.dispose();
                        }
                    }
                });
            }

            this.scene.remove(model);
        }

        /**
         * @param {string} name
         */
        releaseDuplicates(name) {
            if (name in this.objects) {
                if (name in this.animations) {
                    if (this.animations[name].mixer) {
                        this.animations[name].mixer.stopAllAction();
                    }
                    this.animations[name] = {};
                }
                this._deleteObject(this.objects[name]);
            }
        }

        /**
         * 初始化
         * @param {object} args
         * @param {number} args.color
         * @param {number} args.sizey
         * @param {number} args.sizex
         * @param {string} args.Anti_Aliasing
         */
        init({ color, sizex, sizey, Anti_Aliasing }) {
            this._init_porject_time = new Date().getTime();
            const _draw = this.runtime.renderer.draw;
            this.dirty = false;


            this.clock = new THREE.Clock();
            this._clock = 0;
            this.objects = {};
            this.animations = {};

            if (!this.tc) {
                this.tc = document.createElement("canvas");
                this.tc.className = "RenderTheWorld";
            }

            let _antialias = false;

            // 是否启动抗锯齿
            if (Cast.toString(Anti_Aliasing) == "enable") {
                _antialias = true;
            }
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.tc,
                antialias: _antialias,
            }); // 创建渲染器
            this.renderer.setClearColor("#000000"); // 设置渲染器背景

            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMapEnabled = true;
            this.renderer.setSize(
                Cast.toNumber(sizex),

                Cast.toNumber(sizey),
            );
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;

            this.scene = new THREE.Scene(); // 创建场景

            this.scene.background = new THREE.Color(Cast.toNumber(color)); // 设置背景颜色

            // 创建摄像机
            this.fov = 40; // 视野范围
            this.aspect = this.tc.width / this.tc.height; // 相机默认值 画布的宽高比
            this.near = 0.1; // 近平面
            this.far = 1000; // 远平面
            // 透视投影相机
            this.camera = new THREE.PerspectiveCamera(
                this.fov,
                this.aspect,
                this.near,
                this.far,
            );
            this.controls = new OrbitControls(this.camera, this.runtime.renderer.canvas);
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

            this.render = () => {
                this._clock = this.clock.getDelta();
                this.renderer.render(this.scene, this.camera);
                // this.threeSkin.setContent(this.tc)
                if (this.isTcShow) {
                    this.threeSkin.setContent(this.tc);
                } else {
                    this.threeSkin.setContent(this.NullCanvas);
                }
                this.runtime.requestRedraw();

                if (this.controls.enabled) {
                    this.controls.update();
                }
            };

            this._listener();
        }

        _listener() {
            if (!this.is_listener) {
                this.runtime.on("PROJECT_STOP_ALL", () => {
                    this._init_porject_time = 0;
                    console.log(
                        chen_RenderTheWorld_extensionId + ": Stopping renders",
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
                });
                this.is_listener = true;
                console.log(
                    chen_RenderTheWorld_extensionId + ": Starting renders",
                );
                this.renderer.setAnimationLoop(this.render);
            }
            console.log(
                chen_RenderTheWorld_extensionId + ": Starting renders",
            );
            this.renderer.setAnimationLoop(this.render);
        }

        /**
         * 设置3d渲染器状态
         * @param {object} args
         * @param {string} args.state
         */

        set3dState({ state }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }

            if (Cast.toString(state) === "display") {
                this.isTcShow = true;
            } else {
                this.isTcShow = false;
            }
        }

        get3dState(args) {
            return this.isTcShow;
        }

        /**
         * 创建材质
         * @param {object} args
         * @param {string} args.material
         * @return {_Wrapper}
         */
        makeMaterial({ material }, util) {
            const thread = util.thread;
            if (typeof util.stackFrame._inlineLastReturn !== "undefined") {
                // 阶段3：我们有一个返回值，我们
                // 可以返回值，返回它！
                util.stackFrame._inlineLastReturn = undefined;
                this.threadInfo[thread.topBlock.concat(thread.target.id)].pop()
                return util.stackFrame._inlineReturn;
            } else if (typeof util.stackFrame._inlineReturn !== "undefined") {
                //第二阶段：我们有一个返回值，但我们将跳过
                //在外块上。
                //为了防止这种情况发生，请再次将其推到堆栈上
                //并有第三阶段
                const returnValue = util.stackFrame._inlineReturn;

                util.thread.popStack();

                util.stackFrame._inlineLastReturn = true;
                util.stackFrame._inlineReturn = returnValue;

                this.threadInfo[thread.topBlock.concat(thread.target.id)].pop()
                return returnValue;
            } else {
                // 第1阶段：运行堆栈。
                // 假设区块返回一个承诺，这样
                // 解释器暂停在块上，
                // 并在execute（）之后继续运行脚本
                // 完成。

                if (util.stackFrame._inlineLoopRan) {
                    thread.popStack();
                    return "";
                }

                if (this.threadInfo[thread.topBlock.concat(thread.target.id)] && this.threadInfo[thread.topBlock.concat(thread.target.id)].length > 0) {
                    this.threadInfo[thread.topBlock.concat(thread.target.id)].push({ material: material, color: 0, fog: true });
                } else {
                    this.threadInfo[thread.topBlock.concat(thread.target.id)] = [{ material: material, color: 0, fog: true }];
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
                Object.defineProperty(thread, "blockGlowInFrame", {
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
            if (this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1] === undefined) return "⚠️请在“创建材质”积木中使用！";
            if (Number(Cast.toString(color)) == Number(Cast.toString(color))) {
                this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1]['color'] = Number(
                    Cast.toString(color),
                );
            } else {
                this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1]['color'] = Cast.toString(color);
            }
        }

        setMaterialFog({ YN }, util) {
            const thread = util.thread;
            if (this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1] === undefined) return "⚠️请在“创建材质”积木中使用！";
            if (Cast.toString(YN) === "ture") {
                this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1]['fog'] = true;
            } else {
                this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1]['fog'] = false;
            }
        }

        // 实现return方法，用于处理返回值
        return(args, util) {
            const thread = util.thread;
            if (this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1] === undefined) return "⚠️请在“创建材质”积木中使用！";

            let blockID = thread.peekStack();
            while (blockID) {
                const block = thread.target.blocks.getBlock(blockID);
                if (
                    block &&
                    block.opcode ===
                    chen_RenderTheWorld_extensionId + "_makeMaterial"
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
                let _material = "";

                if (this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1].material === "Basic") {
                    _material = new THREE.MeshBasicMaterial();
                } else if (this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1].material === "Lambert") {
                    _material = new THREE.MeshLambertMaterial();
                } else if (this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1].material === "Phong") {
                    _material = new THREE.MeshPhongMaterial();
                } else {
                    _material = new THREE.MeshBasicMaterial();
                }
                _material.fog = true; // 默认受雾效果影响

                if (this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1]) {
                    for (let key in this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1]) {
                        if (key === "color") {
                            _material.color.set(
                                this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1][key],
                            );
                        }
                        if (key === "fog") {
                            _material.fog = this.threadInfo[thread.topBlock.concat(thread.target.id)][this.threadInfo[thread.topBlock.concat(thread.target.id)].length - 1][key];
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
                return "⚠️显示器未初始化！";
            }
            if (model === undefined) {
                return "⚠️模型加载失败！";
            }
            model = Wrapper.unwrap(model);

            if (!(model instanceof RTW_Model_Box)) {
                return "⚠️传入的模型无法识别";
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
                    chen_RenderTheWorld_extensionId + "_objectLoadingCompleted",
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
                    model.model["objfile"],
                    model.model["mtlfile"],
                    init_porject_time,
                );
            } else if (model.isgltf) {
                this._gltfModel(
                    name,
                    model.model["gltffile"],
                    init_porject_time,
                );
            }
        }

        // "RenderTheWorld.shadowSettings": "设置模型 [name] 的阴影设置: [YN]投射阴影 [YN2]被投射阴影",
        shadowSettings({ name, YN, YN2 }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }
            name = Cast.toString(name);
            if (name in this.objects) {
                if (Cast.toString(YN) == "true") {
                    this.objects[name].castShadow = true;
                    this.objects[name].traverse(function (node) {
                        if (node.isMesh) {
                            node.castShadow = true;
                        }
                    });
                } else {
                    this.objects[name].castShadow = false;
                    this.objects[name].traverse(function (node) {
                        if (node.isMesh) {
                            node.castShadow = false;
                        }
                    });
                }

                if (Cast.toString(YN2) == "true") {
                    this.objects[name].receiveShadow = true;
                    this.objects[name].traverse(function (node) {
                        if (node.isMesh) {
                            node.receiveShadow = true;
                        }
                    });
                } else {
                    this.objects[name].receiveShadow = false;
                    this.objects[name].traverse(function (node) {
                        if (node.isMesh) {
                            node.receiveShadow = false;
                        }
                    });
                }
            }
        }

        groupModel(args) {
            let _group = new THREE.Group()
            const dynamicArgs = getDynamicArgs(args);
            dynamicArgs.forEach((_model) => {
                _model = Wrapper.unwrap(_model);
                if (_model instanceof RTW_Model_Box && _model.model.isObject3D) {
                    _model = _model.model;
                } else if (typeof _model === 'string') {
                    if (!(_model in this.objects)) return;
                    _model = this.objects[_model];

                } else return;

                _group.add(_model);
            });

            return new Wrapper(
                new RTW_Model_Box(
                    _group,
                    false,
                    false,
                    false,
                    undefined,
                ),
            );
        }

        cubeModel({ a, b, h, material }) {
            material = Wrapper.unwrap(material);
            if (material !== undefined) {
                if (!material.ismaterial) {
                    return "⚠️材质无效！";
                }
                material = material["model"];
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
                    return "⚠️材质无效！";
                }
                material = material["model"];
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
                    return "⚠️材质无效！";
                }
                material = material["model"];
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
                            "_objectLoadingCompleted",
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
                    chen_RenderTheWorld_extensionId + "_objectLoadingCompleted",
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
                return "⚠️显示器未初始化！";
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

            if (Cast.toString(YN) == "true") {
                this.objects[name].castShadow;
                this.objects[name].castShadow = true;
            }

            if (Cast.toString(YN2) == "true") {
                this.objects[name].receiveShadow = true;
            }
            let r = this.runtime.startHatsWithParams(
                chen_RenderTheWorld_extensionId + "_objectLoadingCompleted",
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
                return "⚠️显示器未初始化！";
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

            if (Cast.toString(YN) == "true") {
                this.objects[name].castShadow = true;
            }

            if (Cast.toString(YN2) == "true") {
                this.objects[name].receiveShadow = true;
            }
            let r = this.runtime.startHatsWithParams(
                chen_RenderTheWorld_extensionId + "_objectLoadingCompleted",
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
                return "⚠️显示器未初始化！";
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

            if (Cast.toString(YN) == "true") {
                this.objects[name].castShadow = true;
            }

            if (Cast.toString(YN2) == "true") {
                this.objects[name].receiveShadow = true;
            }
            let r = this.runtime.startHatsWithParams(
                chen_RenderTheWorld_extensionId + "_objectLoadingCompleted",
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
                return "⚠️显示器未初始化！";
            }

            if (objfile == "fileListEmpty") {
                return;
            }

            let _filelist = this.runtime
                .getGandiAssetsFileList()
                .map((f) => f.fullName);
            if (_filelist.indexOf(objfile) == -1) {
                return "⚠️OBJ文件不存在！";
            }
            if (_filelist.indexOf(mtlfile) == -1) {
                return "⚠️MTL文件不存在！";
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

                        if (Cast.toString(YN) == "true") {
                            this.objects[name].castShadow = true;
                            this.objects[name].traverse(function (node) {
                                if (node.isMesh) {
                                    node.castShadow = true;
                                }
                            });
                        }

                        if (Cast.toString(YN2) == "true") {
                            this.objects[name].receiveShadow = true;
                            this.objects[name].traverse(function (node) {
                                if (node.isMesh) {
                                    node.receiveShadow = true;
                                }
                            });
                        }
                        let r = this.runtime.startHatsWithParams(
                            chen_RenderTheWorld_extensionId +
                            "_objectLoadingCompleted",
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
                return "⚠️显示器未初始化！";
            }

            if (gltffile == "fileListEmpty") {
                return;
            }

            let _filelist = this.runtime
                .getGandiAssetsFileList()
                .map((f) => f.fullName);
            if (_filelist.indexOf(gltffile) == -1) {
                return "⚠️GLTF文件不存在！";
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

                if (Cast.toString(YN) == "true") {
                    this.objects[name].castShadow = true;
                    this.objects[name].traverse(function (node) {
                        if (node.isMesh) {
                            node.castShadow = true;
                        }
                    });
                }

                if (Cast.toString(YN2) == "true") {
                    this.objects[name].receiveShadow = true;
                    this.objects[name].traverse(function (node) {
                        if (node.isMesh) {
                            node.receiveShadow = true;
                        }
                    });
                }
                let r = this.runtime.startHatsWithParams(
                    chen_RenderTheWorld_extensionId + "_objectLoadingCompleted",
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
                return "⚠️显示器未初始化！";
            }

            let name = Cast.toString(args.name);
            const dynamicArgs = getDynamicArgs(args);

            let animationNames = [Cast.toString(args.animationName)].concat(dynamicArgs);

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
                return "⚠️显示器未初始化！";
            }

            let name = Cast.toString(args.name);
            const dynamicArgs = getDynamicArgs(args);

            let animationNames = [Cast.toString(args.animationName)].concat(dynamicArgs);

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
                return "⚠️显示器未初始化！";
            }

            name = Cast.toString(name);

            time = Cast.toNumber(time);
            if (name in this.animations && this.animations[name].mixer) {
                this.animations[name].mixer.update(time / 1000);
            }
        }

        /**
         * 获取物体所有的动画
         * @param {object} args
         * @param {string} args.name
         */

        getAnimation({ name }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }

            name = Cast.toString(name);

            if (name in this.animations && this.animations[name].clips) {
                const clips = [];
                for (let i = 0; i < this.animations[name].clips.length; i++) {
                    clips.push(this.animations[name].clips[i].name);
                }
                return JSON.stringify(clips);
            } else {
                return "[]";
            }
        }

        /**
         * 删除物体
         * @param {object} args
         * @param {string} args.name
         */

        deleteObject(args) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }
            const dynamicArgs = getDynamicArgs(args);

            this.releaseDuplicates(Cast.toString(args.name));
            dynamicArgs.forEach((_name) => {
                this.releaseDuplicates(_name);
            });
            this.render();
        }

        rotationObject({ name, x, y, z }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }

            name = Cast.toString(name);
            if (name in this.objects) {
                // 设置旋转角度
                this.objects[name].rotation.set(
                    THREE.MathUtils.degToRad(Cast.toNumber(x)),

                    THREE.MathUtils.degToRad(Cast.toNumber(y)),

                    THREE.MathUtils.degToRad(Cast.toNumber(z)),
                );
                this.render();
            } else {
                return;
            }
        }

        moveObject({ name, x, y, z }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }

            name = Cast.toString(name);
            if (name in this.objects) {
                // 设置坐标
                this.objects[name].position.set(
                    Cast.toNumber(x),

                    Cast.toNumber(y),

                    Cast.toNumber(z),
                );
                this.render();
            } else {
                return;
            }
        }

        scaleObject({ name, x, y, z }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }

            name = Cast.toString(name);
            if (name in this.objects) {
                // 设置缩放
                this.objects[name].scale.set(
                    Cast.toNumber(x),

                    Cast.toNumber(y),

                    Cast.toNumber(z),
                );
                this.render();
            } else {
                return;
            }
        }

        /**
         * 获取物体坐标
         * @param {object} args
         * @param {string} args.name
         * @param {string} args.xyz
         */
        getObjectPos({ name, xyz }) {
            name = Cast.toString(name);
            if (name in this.objects) {
                switch (Cast.toString(xyz)) {
                    case "x":
                        return this.objects[name].position.x;
                    case "y":
                        return this.objects[name].position.y;
                    case "z":
                        return this.objects[name].position.z;
                }
            } else {
                return;
            }
        }

        /**
         * 获取物体旋转角度
         * @param {object} args
         * @param {string} args.name
         * @param {string} args.xyz
         */

        getObjectRotation({ name, xyz }) {
            name = Cast.toString(name);
            if (name in this.objects) {
                switch (Cast.toString(xyz)) {
                    case "x":
                        return THREE.MathUtils.radToDeg(
                            this.objects[name].rotation.x,
                        );
                    case "y":
                        return THREE.MathUtils.radToDeg(
                            this.objects[name].rotation.y,
                        );
                    case "z":
                        return THREE.MathUtils.radToDeg(
                            this.objects[name].rotation.z,
                        );
                }
            } else {
                return;
            }
        }

        /**
         * 获取物体缩放
         * @param {object} args
         * @param {string} args.name
         * @param {string} args.xyz
         */
        getObjectScale({ name, xyz }) {
            name = Cast.toString(name);
            if (name in this.objects) {
                switch (Cast.toString(xyz)) {
                    case "x":
                        return this.objects[name].scale.x;
                    case "y":
                        return this.objects[name].scale.y;
                    case "z":
                        return this.objects[name].scale.z;
                }
            } else {
                return;
            }
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

            if (Cast.toString(YN) == "true") {
                _point_light.castShadow = true;
            }
            return new Wrapper(new RTW_Model_Box(_point_light, false, false, false, undefined));
        }

        directionalLight({
            color,
            intensity,
            x,
            y,
            z,
            x2,
            y2,
            z2,
            YN,
        }) {
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
            if (Cast.toString(YN) == "true") {
                _directional_light.castShadow = true;
            }

            // 设置平行光范围大一点。
            _directional_light.shadow.camera.left = -20;
            _directional_light.shadow.camera.right = 20;
            _directional_light.shadow.camera.top = 20;
            _directional_light.shadow.camera.bottom = -20;
            _directional_light.shadow.camera.near = 0.1;
            _directional_light.shadow.camera.far = 1000;

            return new Wrapper(new RTW_Model_Box(_directional_light, false, false, false, undefined));
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
        setDirectionalLightShawdowCamera({ name, left, right, top, bottom }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }

            name = Cast.toString(name);
            if (name in this.objects) {
                if (this.objects[name].type === "DirectionalLight") {
                    let _camera = new THREE.OrthographicCamera(
                        Cast.toNumber(left),
                        Cast.toNumber(right),
                        Cast.toNumber(top),
                        Cast.toNumber(bottom),
                        this.objects[name].shadow.camera.near,
                        this.objects[name].shadow.camera.far,
                    );
                    _camera.zoom = this.objects[name].shadow.camera.zoom;
                    this.objects[name].shadow.camera = _camera;
                } else {
                    return "⚠️'" + name + "'不是平行光！";
                }
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
                return "⚠️显示器未初始化！";
            }

            name = Cast.toString(name);
            if (name in this.objects) {
                if (this.objects[name].isLight) {
                    this.objects[name].shadow.mapSize.width = Cast.toNumber(xsize);
                    this.objects[name].shadow.mapSize.height = Cast.toNumber(ysize);
                } else {
                    return "⚠️'" + name + "'不是光源！";
                }
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
                return "⚠️显示器未初始化！";
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
                return "⚠️显示器未初始化！";
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

        /**
         * 移动相机
         * @param {object} args
         * @param {number} args.x
         * @param {number} args.y
         * @param {number} args.z
         */

        moveCamera({ x, y, z }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }
            if (!this.controls.enabled) {
                this.camera.position.set(
                    Cast.toNumber(x),

                    Cast.toNumber(y),

                    Cast.toNumber(z),
                );
                this.render();
            }
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
                return "⚠️显示器未初始化！";
            }
            if (!this.controls.enabled) {
                this.camera.rotation.set(
                    THREE.MathUtils.degToRad(Cast.toNumber(x)),

                    THREE.MathUtils.degToRad(Cast.toNumber(y)),

                    THREE.MathUtils.degToRad(Cast.toNumber(z)),
                );
                this.render();
            }
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
                return "⚠️显示器未初始化！";
            }
            if (!this.controls.enabled) {
                this.camera.lookAt(
                    Cast.toNumber(x),

                    Cast.toNumber(y),

                    Cast.toNumber(z),
                );
                this.controls.target = new THREE.Vector3(x, y, z);
                this.render();
            }
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
                case "x":
                    return this.camera.position.x;
                case "y":
                    return this.camera.position.y;
                case "z":
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
                case "x":
                    return THREE.MathUtils.radToDeg(this.camera.rotation.x);
                case "y":
                    return THREE.MathUtils.radToDeg(this.camera.rotation.y);
                case "z":
                    return THREE.MathUtils.radToDeg(this.camera.rotation.z);
            }
        }

        /**
         * 鼠标控制相机
         * @param {object} args
         * @param {string} args.yn1
         * @param {string} args.yn2
         * @param {string} args.yn3
         */

        controlCamera({ yn1, yn2, yn3 }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }
            let enablePan = false;
            let enableZoom = false;
            let enableRotate = false;
            if (yn1 == "true") {
                enablePan = true;
            }
            if (yn2 == "true") {
                enableZoom = true;
            }
            if (yn3 == "true") {
                enableRotate = true;
            }

            this.controls.enablePan = enablePan;
            this.controls.enableZoom = enableZoom;
            this.controls.enableRotate = enableRotate;
            this.controls.update();
        }

        setControlState({ YN }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }

            if (Cast.toString(YN) == "true") {
                this.controls.enabled = true;
            } else {
                this.controls.enabled = false;
            }
            this.controls.update();
        }

        mouseCanControlCamera({ }) {
            if (!this.tc) {
                return false;
            }
            return this.controls.enabled;
        }

        /**
         * 启用/禁用鼠标控制相机惯性
         * @param {object} args
         * @param {string} args.YN2
         */

        setControlCameraDamping({ YN2 }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }

            if (Cast.toString(YN2) == "yes") {
                this.controls.enableDamping = true;
            } else {
                this.controls.enableDamping = false;
            }
        }

        /**
         * 获取鼠标控制相机惯性状态
         * @param {object} args
         * @param {number} args.num
         */

        setControlCameraDampingNum({ num }) {
            if (!this.tc) {
                return "⚠️显示器未初始化！";
            }

            this.controls.dampingFactor = Cast.toNumber(num);
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
                return "⚠️显示器未初始化！";
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
                return "⚠️显示器未初始化！";
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
         * @return {number}
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
            name: "RenderTheWorld.name",
            description: "RenderTheWorld.descp",
            extensionId: chen_RenderTheWorld_extensionId,
            iconURL: chen_RenderTheWorld_picture,
            insetIconURL: chen_RenderTheWorld_icon,
            featured: true,
            disabled: false,
            collaborator: "xiaochen004hao @ CCW",
            collaboratorURL:
                "https://www.ccw.site/student/643bb84051bc32279f0c3fa0",
            collaboratorList: [
                {
                    collaborator: "xiaochen004hao @ CCW",
                    collaboratorURL:
                        "https://www.ccw.site/student/643bb84051bc32279f0c3fa0",
                },
                {
                    collaborator: "Fath11@Cocrea",
                    collaboratorURL: "https://cocrea.world/@Fath11",
                },
            ],
        },
        l10n: {
            "zh-cn": {
                "RenderTheWorld.name": "渲染世界",
                "RenderTheWorld.descp": "积木渲染世界",
            },
            en: {
                "RenderTheWorld.name": "Render The World",
                "RenderTheWorld.descp": "Building blocks render the world",
            },
        },
    };
})(Scratch);
