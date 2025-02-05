import { RTW_Model_Box, Wrapper } from './RTWTools.js';
import {patch} from './RTWTools.js'; 

/**
 * 改编自系统工具
 */
const inMainWorkspace = (ext) => {
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
    return rege.test(ur1) && ext.Blockly.getMainWorkspace() !== null;
};

function getBlockly(runtime) {
    return runtime.scratchBlocks || window.ScratchBlocks || window.Blockly;
}

function getVM(runtime) {  // ?.vm是为了防止creator报错（
    return runtime.extensionManager?.vm || window.Scratch.vm;
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

function show(Blockly, id, value, textAlign) {
    const workspace = Blockly.getMainWorkspace();
    const block = workspace.getBlockById(id);
    if (!block) return;
    Blockly.DropDownDiv.hideWithoutAnimation();
    Blockly.DropDownDiv.clearContent();
    const contentDiv = Blockly.DropDownDiv.getContentDiv(),
        elem = document.createElement('div');
    elem.setAttribute('class', 'valueReportBox');
    elem.append(...value);
    elem.style.maxWidth = 'none';
    elem.style.maxHeight = 'none';
    elem.style.textAlign = textAlign;
    elem.style.userSelect = 'none';
    contentDiv.appendChild(elem);
    Blockly.DropDownDiv.setColour(
        Blockly.Colours.valueReportBackground,
        Blockly.Colours.valueReportBorder,
    );
    Blockly.DropDownDiv.showPositionedByBlock(workspace, block);
    return elem;
}

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
        if (unwrappedValue instanceof RTW_Model_Box && ext.Blockly) {
            //return _visualReport.call(ext.runtime, blockId, value);
            show(
                ext.Blockly,
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
                    const inspector = unwrappedValue.getHTML();
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

export { refactoringVisualReport, inMainWorkspace, getBlockly, getVM, hackFun };