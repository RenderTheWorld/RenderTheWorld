/**
 * 材质分组 —— 创建并配置材质（含内联返回机制）
 *
 * 包含积木：
 *   - makeMaterial       (OUTPUT, hideFromPalette, output:'Boolean', outputShape:3, branchCount:1)
 *                        C 块，含 SUBSTACK，通过内联返回机制把子栈执行结果作为材质返回
 *   - makeMaterial 的 XML 块 (BlockType.XML)：面板里显示预定义的 makeMaterial+returnm 组合块
 *   - setMaterialColor   (COMMAND) 设置当前材质颜色
 *   - setMaterialFog     (COMMAND) 设置当前材质是否受雾影响
 *   - returnm            (COMMAND, isTerminal, hideFromPalette) 材质创建完成 [material]
 *
 * 内联返回机制（移植自旧版）：
 *   makeMaterial 是 OUTPUT 块（含一个分支 SUBSTACK）。执行时通过劫持 thread.goToNextBlock /
 *   blockGlowInFrame 跳入子栈执行 setMaterialColor/setMaterialFog，最后由 returnm 把
 *   构造好的材质写入 util.stackFrame._inlineReturn，再由 makeMaterial 的多阶段返回把它作为
 *   输出值返回。threadInfo 按 topBlock+target.id 维护材质属性栈以支持嵌套。
 */

import BlockGroup from '../BlockGroup.js'
import { RTW_Model_Box, Wrapper, ColorTools } from '../../rendering/RTWTools.js'
import { chen_RenderTheWorld_extensionId } from '../../assets/index.js'

export default class MaterialGroup extends BlockGroup {
    static groupId = 'Materials'
    /**
     * @param {import('../BlockGroup.js').BlockGroupContext} ctx
     */
    constructor(ctx) {
        super(ctx)
        // 旧版 "材质" LABEL 在 InitGroup 末尾已输出，这里不再重复输出
        this.label = this.translate('group.material')
        // 材质属性栈：{ [topBlock+targetId]: [{ color, fog }] }
        // 注意：collectL10n() 时 ext 为 null，需做安全检查
        if (this.ext && !this.ext.threadInfo) this.ext.threadInfo = {}
    }

    /**
     * @returns {(import('../BlockGroup.js').BlockDef | string)[]}
     */
    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate

        return [
            {
                opcode: 'makeMaterial',
                blockType: BT.OUTPUT,
                text: t('makeMaterial'),
                arguments: {},
                output: 'Reporter', // 'Boolean', // Boolean可放在六边形槽里
                outputShape: 3,
                branchCount: 1,
                hideFromPalette: true,
                handler: (args, util) => this._makeMaterial(args, util)
            },
            {
                opcode: 'makeMaterial',
                blockType: BT.XML,
                xml:
                    `<block type="${chen_RenderTheWorld_extensionId}_makeMaterial">` +
                    `<value name="SUBSTACK">` +
                    `<block type="${chen_RenderTheWorld_extensionId}_returnm">` +
                    `<field name="material">Basic</field>` +
                    `</block>` +
                    `</value>` +
                    `</block>`
            },
            {
                opcode: 'setMaterialColor',
                blockType: BT.COMMAND,
                text: t('setMaterialColor'),
                arguments: {
                    color: { type: AT.STRING, defaultValue: '' }
                },
                handler: (args, util) => this._setMaterialColor(args, util)
            },
            {
                opcode: 'setMaterialFog',
                blockType: BT.COMMAND,
                text: t('setMaterialFog'),
                arguments: {
                    YN: {
                        type: AT.STRING,
                        menu: 'YN',
                        defaultValue: 'true'
                    }
                },
                handler: (args, util) => this._setMaterialFog(args, util)
            },
            {
                opcode: 'returnm',
                blockType: BT.COMMAND,
                text: t('returnm'),
                arguments: {
                    material: {
                        type: null,
                        menu: 'material',
                        defaultValue: 'Basic'
                    }
                },
                isTerminal: true,
                hideFromPalette: true,
                handler: (args, util) => this._returnm(args, util)
            }
        ]
    }

    registerMenus() {
        this.core.registerMenu('YN', {
            acceptReporters: false,
            items: [
                { text: this.translate('YN.true'), value: 'true' },
                { text: this.translate('YN.false'), value: 'false' }
            ]
        })
        this.core.registerMenu('material', {
            acceptReporters: false,
            items: [
                { text: this.translate('material.Basic'), value: 'Basic' },
                { text: this.translate('material.Lambert'), value: 'Lambert' },
                { text: this.translate('material.Phong'), value: 'Phong' }
            ]
        })
    }

    // ============== 内联返回机制实现 ==============

    /**
     * @param {any} util
     */
    _key(util) {
        const thread = util.thread
        return thread.topBlock.concat(thread.target.id)
    }

    /**
     * @param {{[key: string]: any}} args
     * @param {any} util
     */
    _makeMaterial(args, util) {
        const ext = this.ext
        const thread = util.thread
        const key = this._key(util)

        if (typeof util.stackFrame._inlineLastReturn !== 'undefined') {
            // 阶段3：返回最终值
            util.stackFrame._inlineLastReturn = undefined
            ;(((ext.threadInfo || {})[key] || /** @type {any[]} */ ([])).pop())
            return util.stackFrame._inlineReturn
        } else if (typeof util.stackFrame._inlineReturn !== 'undefined') {
            // 阶段2：已有返回值，重新压栈以避免跳过外块
            const returnValue = util.stackFrame._inlineReturn
            util.thread.popStack()
            util.stackFrame._inlineLastReturn = true
            util.stackFrame._inlineReturn = returnValue
            ;(((ext.threadInfo || {})[key] || /** @type {any[]} */ ([])).pop())
            return returnValue
        } else {
            // 阶段1：运行子栈
            if (util.stackFrame._inlineLoopRan) {
                thread.popStack()
                return ''
            }

            if ((ext.threadInfo || {})[key] && (ext.threadInfo || {})[key].length > 0) {
                (ext.threadInfo || {})[key].push({ color: 0, fog: true })
            } else {
                (ext.threadInfo || {})[key] = [{ color: 0, fog: true }]
            }

            const stackFrame = thread.peekStackFrame()
            const oldGoToNextBlock = thread.goToNextBlock
            const blockGlowInFrame = thread.blockGlowInFrame

            const resetGoToNext = () => {
                thread.goToNextBlock = oldGoToNextBlock
            }
            const resetGlowInFrame = () => {
                delete thread.blockGlowInFrame
                thread.blockGlowInFrame = blockGlowInFrame
            }

            const trap = () => {
                thread.status = thread.constructor.STATUS_RUNNING
                const realBlockId = stackFrame.reporting
                thread.pushStack(realBlockId)
                util.stackFrame._inlineLoopRan = true
                this._stepToBranchWithBlockId(realBlockId, thread, 1, true)
            }

            // 对边缘激活的帽子进行拦截，转入 thread.goToNextBlock
            thread.goToNextBlock = function () {
                resetGlowInFrame()
                trap()
                thread.goToNextBlock = oldGoToNextBlock
                oldGoToNextBlock.call(this)
                resetGoToNext()
            }
            Object.defineProperty(thread, 'blockGlowInFrame', {
                get() {
                    return blockGlowInFrame
                },
                set() {
                    resetGoToNext()
                    trap()
                    resetGlowInFrame()
                },
                enumerable: true,
                configurable: true
            })

            // 虚假 Promise，让解释器暂停在块上
            return { then: () => {} }
        }
    }

    /**
     * @param {any} blockId
     * @param {any} thread
     * @param {any} branchNum
     * @param {any} isLoop
     */
    _stepToBranchWithBlockId(blockId, thread, branchNum, isLoop) {
        if (!branchNum) branchNum = 1
        const branchId = thread.target.blocks.getBranch(blockId, branchNum)
        thread.peekStackFrame().isLoop = isLoop
        if (branchId) {
            thread.pushStack(branchId)
        } else {
            thread.pushStack(null)
        }
    }

    /**
     * @param {any} args
     * @param {any} util
     */
    _setMaterialColor({ color }, util) {
        const ext = this.ext
        const key = this._key(util)
        try {
            const stack = (ext.threadInfo || {})[key]
            if (!stack || stack[stack.length - 1] === undefined)
                return '⚠️请在"创建材质"积木中使用！'
            const cast = ext.cast
            const THREE = ext.renderEngine?.THREE
            if (!THREE) return '⚠️显示器未初始化！'
            stack[stack.length - 1].color = ColorTools.toHex(
                color,
                THREE,
                cast
            )
        } catch {
            return '⚠️请在"创建材质"积木中运行！'
        }
    }

    /**
     * @param {any} args
     * @param {any} util
     */
    _setMaterialFog({ YN }, util) {
        const ext = this.ext
        const key = this._key(util)
        try {
            const stack = (ext.threadInfo || {})[key]
            if (!stack || stack[stack.length - 1] === undefined)
                return '⚠️请在"创建材质"积木中使用！'
            const cast = ext.cast
            const v = cast ? cast.toString(YN) : String(YN)
            // 保持与旧版一致：旧版用 'ture'（typo），所以条件永远为 false，总是存为 false
            if (v === 'ture') {
                stack[stack.length - 1].fog = true
            } else {
                stack[stack.length - 1].fog = false
            }
        } catch {
            return '⚠️请在"创建材质"积木中运行！'
        }
    }

    /**
     * @param {any} args
     * @param {any} util
     */
    _returnm({ material }, util) {
        const ext = this.ext
        const THREE = ext.renderEngine.THREE
        const cast = ext.cast
        const key = this._key(util)

        const stack = (ext.threadInfo || {})[key]
        if (stack && stack[stack.length - 1] === undefined)
            return '⚠️请在"创建材质"积木中使用！'

        // 向上回溯到 makeMaterial 块
        let blockID = util.thread.peekStack()
        while (blockID) {
            const block = util.thread.target.blocks.getBlock(blockID)
            if (
                block &&
                block.opcode ===
                    chen_RenderTheWorld_extensionId + '_makeMaterial'
            ) {
                break
            }
            util.thread.popStack()
            blockID = util.thread.peekStack()
        }

        if (util.thread.stack.length === 0) {
            util.thread.requestScriptGlowInFrame = false
            util.thread.status = util.thread.constructor.STATUS_DONE
        } else {
            const matType = cast ? cast.toString(material) : String(material)
            let _material
            if (matType === 'Basic') {
                _material = new THREE.MeshBasicMaterial()
            } else if (matType === 'Lambert') {
                _material = new THREE.MeshLambertMaterial()
            } else if (matType === 'Phong') {
                _material = new THREE.MeshPhongMaterial()
            } else {
                _material = new THREE.MeshBasicMaterial()
            }
            _material.fog = true

            const props = stack[stack.length - 1]
            if (props) {
                for (const k in props) {
                    if (k === 'color') _material.color.set(props[k])
                    if (k === 'fog') _material.fog = props[k]
                }
            }

            util.stackFrame._inlineReturn = new Wrapper(
                new RTW_Model_Box(_material, true, false, false, undefined)
            )
            util.thread.status = util.thread.constructor.STATUS_RUNNING
        }
    }

    l10n() {
        return {
            'group.material': { 'zh-cn': '🎨材质', en: '🎨Material' },
            makeMaterial: { 'zh-cn': '创建材质', en: 'make material' },
            setMaterialColor: {
                'zh-cn': '将当前材质颜色设为 [color]',
                en: 'set material color to [color]'
            },
            setMaterialFog: {
                'zh-cn': '让当前材质 [YN] 受雾效果影响',
                en: 'material [YN] be affected by fog'
            },
            returnm: {
                'zh-cn': '以 [material] 类型完成创建',
                en: 'create material type [material]'
            },
            'YN.true': { 'zh-cn': '能', en: 'can' },
            'YN.false': { 'zh-cn': '不能', en: "can't" },
            'material.Basic': { 'zh-cn': '基础', en: 'Basic' },
            'material.Lambert': { 'zh-cn': '朗伯', en: 'Lambert' },
            'material.Phong': { 'zh-cn': '冯氏', en: 'Phong' }
        }
    }
}
