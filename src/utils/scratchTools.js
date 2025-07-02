/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */
import { RTW_Model_Box, Wrapper, patch } from './RTWTools.js';
import { chen_RenderTheWorld_extensionId } from '../assets/index.js';

/**
 * 改编自系统工具
 */
const inMainWorkspace = (ext) => {
    const ur1 = window.location.pathname;
    const rege = /\/(?:gandi|creator)(?:\/|$)/;
    return rege.test(ur1) && ext.ScratchBlocks.getMainWorkspace() !== null;
};

/**
 * By FurryR
 * Hijacks the Function.prototype.apply method.
 * @param {Function} fn - The function to execute while the apply method is hijacked.
 * @returns {*} The result of the function execution.
 */
function hijack(fn) {
    if (fn === undefined) return 0;
    const _orig = Function.prototype.apply;
    // eslint-disable-next-line no-extend-native
    Function.prototype.apply = (thisArg) => thisArg;
    const result = fn();
    // eslint-disable-next-line no-extend-native
    Function.prototype.apply = _orig;
    return result;
}

/**
 * Retrieves the event listener from an event object.
 * @param {Event|Event[]} e - The event object or array of event objects.
 * @returns {Event} The event listener.
 */
function getEventListener(e) {
    return e instanceof Array ? e[e.length - 1] : e;
}

/**
 * Retrieves ScratchBlocks from the runtime or window object.
 * @param {Runtime} runtime - The runtime object.
 * @returns {Object} The ScratchBlocks object.
 */
function getScratchBlocks(runtime) {
    // In Gandi, ScratchBlocks can be accessed from the runtime.
    // In TW, ScratchBlocks can be directly accessed from the window.

    return (
        hijack(getEventListener(runtime._events.EXTENSION_ADDED))?.ScratchBlocks ||
        runtime.scratchBlocks ||
        window.Blockly?.getMainWorkspace()?.getScratchBlocks?.() ||
        window.ScratchBlocks
    );
}

function getVM(runtime) {
    return (
        hijack(getEventListener(runtime._events["QUESTION"])).props.vm ||
        runtime.extensionManager.scratchBlocks ||  // 如果用户使用了“扩展管理”插件就太好了（
        window.Scratch.vm  // 最坏情况
    );
}

const hackFun = (runtime) => {
    if (!runtime || hackFun.hacked) return;
    hackFun.hacked = true;

    // By Nights: 支持XML的BlockType
    if (!Scratch.BlockType.XML) {
        Scratch.BlockType.XML = 'XML';
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

/**
 * By FurryR
 */
function show(ScratchBlocks, id, value, textAlign) {
    const workspace = ScratchBlocks.getMainWorkspace();
    const block = workspace.getBlockById(id);
    if (!block) return;
    ScratchBlocks.DropDownDiv.hideWithoutAnimation();
    ScratchBlocks.DropDownDiv.clearContent();
    const contentDiv = ScratchBlocks.DropDownDiv.getContentDiv(),
        elem = document.createElement('div');
    elem.setAttribute('class', 'valueReportBox');
    elem.append(...value);
    elem.style.maxWidth = 'none';
    elem.style.maxHeight = 'none';
    elem.style.textAlign = textAlign;
    elem.style.userSelect = 'none';
    contentDiv.appendChild(elem);
    ScratchBlocks.DropDownDiv.setColour(
        ScratchBlocks.Colours.valueReportBackground,
        ScratchBlocks.Colours.valueReportBorder,
    );
    ScratchBlocks.DropDownDiv.showPositionedByBlock(workspace, block);
    return elem;
}

/**
 * By FurryR
 */
const refactoringVisualReport = (ext) => {
    /**
     * 在编辑器自定义返回值显示的方法来自 https://github.com/FurryR/lpp-scratch 的LPP扩展
     */
    // 使用patch函数修改runtime的visualReport方法，增加自定义逻辑
    patch(ext.runtime.constructor.prototype, {
        visualReport: (original, blockId, value) => {
            if (ext.vm.editingTarget) {
                const block = ext.vm.editingTarget.blocks.getBlock(blockId);
                // 如果当前块是Inline Blocks且不是顶层块，则不执行后续逻辑
                if (
                    block !== undefined &&
                    block.opcode ===
                    chen_RenderTheWorld_extensionId +
                    '_makeMaterial' &&
                    !block.topLevel
                )
                    return;
            }
            // 调用原始函数，继续执行后续逻辑
            original(blockId, value);
        },
    });
    const _visualReport = ext.runtime.visualReport;
    ext.runtime.visualReport = (blockId, value) => {
        const unwrappedValue = Wrapper.unwrap(value);
        if (unwrappedValue instanceof RTW_Model_Box && ext.ScratchBlocks) {
            //return _visualReport.call(ext.runtime, blockId, value);
            show(
                ext.ScratchBlocks,
                blockId,
                [unwrappedValue.getHTML()],
                'center',
            );
        } else {
            return _visualReport.call(ext.runtime, blockId, value);
        }
    };
    const _requestUpdateMonitor = ext.runtime.requestUpdateMonitor;
    const monitorMap = /* @__PURE__ */ new Map();
    if (_requestUpdateMonitor) {
        const patchMonitorValue = (element, value) => {
            const unwrappedValue = Wrapper.unwrap(value);
            const valueElement = element.querySelector('[class*="value"]');
            if (valueElement instanceof HTMLElement) {
                const internalInstance = Object.values(
                    valueElement,
                ).find(
                    (v) =>
                        typeof v === 'object' &&
                        v !== null &&
                        Reflect.has(v, 'stateNode'),
                );
                if (unwrappedValue instanceof RTW_Model_Box) {
                    const inspector = unwrappedValue.getHTML(true);
                    valueElement.style.textAlign = 'left';
                    valueElement.style.backgroundColor = '#121C3D';
                    valueElement.style.color = '#eeeeee';
                    valueElement.style.border = '1px solid #4A76FF';
                    while (valueElement.firstChild)
                        valueElement.removeChild(
                            valueElement.firstChild,
                        );
                    valueElement.append(inspector);
                } else {
                    if (internalInstance) {
                        valueElement.style.textAlign = '';
                        valueElement.style.backgroundColor =
                            internalInstance.memoizedProps?.style
                                ?.background ?? '';
                        valueElement.style.color =
                            internalInstance.memoizedProps?.style
                                ?.color ?? '';
                        valueElement.style.border =
                            internalInstance.memoizedProps?.style
                                ?.border ?? '';
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
                        typeof v === 'object' &&
                        v !== null &&
                        Reflect.has(v, 'children'),
                );
                if (internalInstance) {
                    const props = internalInstance?.children?.props;
                    if (id2 === props?.id) return element;
                }
            }
            return null;
        };
        ext.runtime.requestUpdateMonitor = (state) => {
            const id2 = state.get('id');
            if (typeof id2 === 'string') {
                const monitorValue = state.get('value');
                const unwrappedValue = Wrapper.unwrap(monitorValue);
                const monitorMode = state.get('mode');
                const monitorVisible = state.get('visible');
                const cache = monitorMap.get(id2);
                if (typeof monitorMode === 'string' && cache) {
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
                                        if (ext.runtime.getMonitorState) {
                                            const monitorCached =
                                                ext.runtime
                                                    .getMonitorState()
                                                    .get(id2);
                                            if (monitorCached) {
                                                const mode =
                                                    monitorCached.get(
                                                        'mode',
                                                    );
                                                return typeof mode ===
                                                    'string'
                                                    ? mode
                                                    : 'normal';
                                            }
                                        }
                                        return 'normal';
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
            return _requestUpdateMonitor.call(ext.runtime, state);
        };
    }
}

export { refactoringVisualReport, inMainWorkspace, getScratchBlocks, getVM, hackFun };