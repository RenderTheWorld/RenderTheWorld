import { leftButton, rightButton } from '../assets/index.js'

const PICTRUE = {
    plus: rightButton,
    minus: leftButton
}

let expandableBlockInit = false
const setExpandableBlocks = extension => {
    if (expandableBlockInit) return
    expandableBlockInit = true
    const runtime = extension.runtime
    const { id, blocks: blocksInfo } = extension.getInfo()
    let expandableBlocks = {}
    // 创建按钮
    const createButtons = Blockly => {
        // 按钮
        class FieldButton extends Blockly.FieldImage {
            constructor(src) {
                super(src, 20, 20, undefined, false)
                this.initialized = false
            }
            init() {
                // Field has already been initialized once.
                super.init()
                this.getSvgRoot()
                    .getElementsByTagName('image')[0]
                    .classList.add('RTW-image')
                if (!this.initialized) {
                    // 初始化按钮
                    Blockly.bindEventWithChecks_(
                        this.getSvgRoot(),
                        'mousedown',
                        this,
                        e => {
                            e.stopPropagation()
                            // 阻止事件冒泡，要不然你点按钮就会执行积木（点击积木）
                        }
                    )
                    Blockly.bindEventWithChecks_(
                        this.getSvgRoot(),
                        'mouseup',
                        this,
                        this.handleClick.bind(this)
                    )
                    // 绑定上这个按钮点击事件
                }
                this.initialized = true
            }
            handleClick(e) {
                if (!this.sourceBlock_ || !this.sourceBlock_.workspace) {
                    return false
                }
                if (this.sourceBlock_.workspace.isDragging()) {
                    return false
                }
                if (this.sourceBlock_.isInFlyout) {
                    return false
                }
                this.onclick(e)
            }
            onclick(e) {
                // 子类实现
            }
        }
        // + 按钮
        class PlusButton extends FieldButton {
            constructor() {
                super(plusImage)
            }
            onclick(e) {
                if (e.button == 0) {
                    const block = this.sourceBlock_
                    // 增加积木数量改变
                    block.itemCount_ += 1
                    block.updateShape() // 更新
                }
            }
        }
        // - 按钮
        class MinusButton extends FieldButton {
            constructor() {
                super(minusImage)
            }
            onclick(e) {
                if (e.button == 0) {
                    // 获取这个 field 的积木
                    const block = this.sourceBlock_
                    // 增加积木数量改变
                    block.itemCount_ -= 1
                    if (block.itemCount_ < 0) {
                        // 不能有 -1 个参数
                        block.itemCount_ = 0
                    }
                    block.updateShape() // 更新
                }
            }
        }
        // 图片
        const minusImage = PICTRUE.minus
        const plusImage = PICTRUE.plus

        return {
            PlusButton,
            MinusButton
        }
    }

    const createExpandableBlock = (runtime, Blockly) => {
        const { PlusButton, MinusButton } = createButtons(Blockly)
        // 这个是scratch函数的utils
        const ProcedureUtils = Blockly.ScratchBlocks.ProcedureUtils

        return {
            attachShadow_: function (input, argumentType, text) {
                if (argumentType == 'number' || argumentType == 'string') {
                    let blockType = argumentType == 'number' ? 'math_number' : 'text'
                    Blockly.Events.disable()
                    let newBlock
                    try {
                        newBlock = this.workspace.newBlock(blockType)
                        if (argumentType == 'number') {
                            newBlock.setFieldValue(Scratch.Cast.toString(text), 'NUM')
                        } else if (argumentType == 'string') {
                            newBlock.setFieldValue(Scratch.Cast.toString(text), 'TEXT')
                        }
                        newBlock.setShadow(true)
                        if (!this.isInsertionMarker()) {
                            newBlock.initSvg()
                            newBlock.render(false)
                        }
                    } finally {
                        Blockly.Events.enable()
                    }
                    if (Blockly.Events.isEnabled()) {
                        Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock))
                    }
                    newBlock.outputConnection.connect(input.connection)
                }
            },
            updateShape: function () {
                let wasRendered = this.rendered
                this.rendered = false

                // 更新参数
                Blockly.Events.setGroup(true)
                // 先记录现在的 mutation
                let oldExtraState = Blockly.Xml.domToText(this.mutationToDom(this))

                // 创建新的积木
                let opcode_ = this.opcode_,
                    expandableArgs = this.expandableArgs,
                    inputKeys = Object.keys(expandableArgs),
                    i
                for (i = 1; i <= this.itemCount_; i++) {
                    if (!this.getInput(`${inputKeys[0]}_${i}`)) {
                        for (let j = 0; j < inputKeys.length; j++) {
                            let inputKey = inputKeys[j],
                                inputKeyID = `${inputKey}_${i}`

                            this.ARGS.push(inputKeyID)
                            let input,
                                type = expandableArgs[inputKey][0],
                                text = expandableArgs[inputKey][1] || null,
                                canEndInput = expandableArgs[inputKey][2] || 0

                            input =
                                type === 'substack'
                                    ? this.appendStatementInput(inputKeyID)
                                    : type === 'list' || type === 'text'
                                        ? this.appendDummyInput(inputKeyID)
                                        : this.appendValueInput(inputKeyID)
                            if (type === 'text') {
                                input.appendField('text')
                            } else if (type === 'boolean') {
                                input.setCheck('Boolean')
                            } else if (type === 'list') {
                                input.appendField(new Blockly.FieldDropdown(text), inputKeyID)
                                const fields = runtime
                                    .getEditingTarget()
                                    ?.blocks.getBlock(this.id)?.fields
                                if (fields) {
                                    fields[inputKeyID] = {
                                        id: null,
                                        name: inputKeyID,
                                        value: '+'
                                    }
                                }
                                this.moveInputBefore(inputKeyID, 'END')
                            } else if (type === 'substack') {
                                input.setCheck(null)
                            } else {
                                this.attachShadow_(input, type, text)
                            }
                        }
                    }
                }
                if (runtime._editingTarget) {
                    // 移除 input 并记录

                    if (this.getInput('SUBSTACK')) {
                        try {
                            const blocks = runtime._editingTarget.blocks
                            const targetBlock = blocks.getBlock(this.id)
                            const input = targetBlock.inputs['SUBSTACK']
                            if (input) {
                                if (input.block !== null) {
                                    const blockInInput = targetBlock.getBlock(input.block)
                                    blockInInput.topLevel = true
                                    blockInInput.parent = null
                                    blocks.moveBlock({
                                        id: blockInInput.id,
                                        oldParent: this.id,
                                        oldInput: 'SUBSTACK',
                                        newParent: undefined,
                                        newInput: undefined
                                    })
                                }
                                if (input.shadow !== null && input.shadow == input.block) {
                                    blocks.deleteBlock(input.shadow)
                                }
                            }
                            this.removeInput('SUBSTACK')
                            delete targetBlock.inputs['SUBSTACK']
                        } catch {
                            // nothing
                        }
                    }

                    let iTemp = i
                    for (let j = 0; j < inputKeys.length; j++) {
                        i = iTemp
                        const blocks = runtime._editingTarget.blocks
                        const targetBlock = blocks.getBlock(this.id)
                        const toDel = []
                        let inputKey = inputKeys[j],
                            inputKeyID = `${inputKey}_${i}`,
                            type = expandableArgs[inputKey][0]
                        while (this.getInput(inputKeyID)) {
                            this.ARGS.pop(inputKeyID)
                            const input = targetBlock.inputs[inputKeyID]
                            if (input) {
                                if (input.block !== null) {
                                    const blockInInput = blocks.getBlock(input.block)
                                    blockInInput.topLevel = true
                                    blockInInput.parent = null
                                    blocks.moveBlock({
                                        id: blockInInput.id,
                                        oldParent: this.id,
                                        oldInput: inputKeyID,
                                        newParent: undefined,
                                        newInput: undefined
                                        //newCoordinate: e.newCoordinate
                                    })
                                }
                                if (input.shadow !== null) {
                                    if (input.shadow == input.block)
                                        blocks.deleteBlock(input.shadow)
                                    else blocks.deleteBlock(input.block)
                                }
                            }
                            this.removeInput(inputKeyID)
                            if (type === 'list') {
                                const fields = runtime
                                    .getEditingTarget()
                                    ?.blocks.getBlock(this.id)?.fields
                                if (fields) {
                                    delete fields[inputKeyID]
                                }
                            } else {
                                toDel.push(inputKeyID)
                            }
                            i++
                        }
                        setTimeout(() => {
                            toDel.forEach(i => {
                                delete targetBlock.inputs[i]
                            })
                        }, 0)
                    }
                }

                // 移动按钮
                this.removeInput('BEGIN')
                if (this.itemCount_ > 0) {
                    this.appendDummyInput('BEGIN').appendField(this.textBegin)
                    this.moveInputBefore('BEGIN', 'BEGIN')
                }

                const getArg = str => {
                    let str_ = str.match(/^[A-Z0-9]+/)
                    if (Array.isArray(str_)) {
                        str_ = str_[0]
                        let num_ = Number(str.replace(str_ + '_', ''))
                        return [str_, isNaN(num_) ? 1 : num_]
                    } else {
                        return false
                    }
                }
                let inputList = this.inputList
                for (i = 0; i < inputList.length; i++) {
                    let name = inputList[i].name,
                        args = getArg(name)
                    if (
                        args === false &&
                        this.defaultText &&
                        Array.isArray(this.defaultText) &&
                        i === this.defaultIndex
                    ) {
                        this.inputList[this.defaultIndex].fieldRow[0].setText(
                            this.itemCount_ === 0 ? this.defaultText[0] : this.defaultText[1]
                        )
                    } else {
                        if (expandableArgs[args[0]]) {
                            let arg = expandableArgs[args[0]],
                                type = arg[0],
                                text = arg[1],
                                rule = arg[2] || 0
                            if (type === 'text') {
                                if (rule === 1) {
                                    if (Array.isArray(text)) {
                                        this.inputList[i].fieldRow[0].setText(
                                            args[1] === 1 ? text[0] : text[1]
                                        )
                                    } else this.inputList[i].fieldRow[0].setText(text)
                                } else {
                                    let flag1 = args[1] !== 1 && args[1] !== this.itemCount_,
                                        index = inputKeys.indexOf(args[0]),
                                        flag2 = index > 0 && index < inputKeys.length - 1,
                                        flag3 = args[1] > 1 || index > 0,
                                        flag4 =
                                            args[1] < this.itemCount_ || index < inputKeys.length - 1
                                    if (flag1 || flag2 || (flag3 && flag4)) {
                                        this.inputList[i].fieldRow[0].setText(text)
                                        this.inputList[i].setVisible(true)
                                    } else {
                                        this.inputList[i].fieldRow[0].setText('')
                                        this.inputList[i].setVisible(false)
                                    }
                                }
                            }
                        }
                    }
                }
                for (i = 1; i <= this.itemCount_; i++) {
                    for (let j = 0; j < inputKeys.length; j++) {
                        this.moveInputBefore(`${inputKeys[j]}_${i}`, null)
                    }
                }
                this.removeInput('END')
                if (this.itemCount_ > 0) {
                    this.appendDummyInput('END').appendField(this.textEnd)
                    this.moveInputBefore('END', null)
                }
                this.removeInput('MINUS')
                if (this.itemCount_ > 0) {
                    this.minusButton = new MinusButton()
                    this.appendDummyInput('MINUS').appendField(this.minusButton)
                    this.moveInputBefore('MINUS', null)
                }
                this.moveInputBefore('PLUS', null)

                // 更新 oldItemCount，oldItemCount用于生成domMutation的
                this.oldItemCount = this.itemCount_
                // 新的 mutation
                const newExtraState = Blockly.Xml.domToText(this.mutationToDom(this))
                if (oldExtraState != newExtraState) {
                    // 判断是否一样，不一样就fire一个mutation更新事件
                    Blockly.Events.fire(
                        new Blockly.Events.BlockChange(
                            this,
                            'mutation',
                            null,
                            oldExtraState,
                            newExtraState // 状态
                        )
                    )
                    setTimeout(() => {
                        const target = runtime._editingTarget
                        const block = target.blocks._blocks[this.id]
                        try {
                            Object.keys(block.inputs).forEach(name => {
                                let argName = name.match(/^[A-Z0-9]+/)[0]
                                if (
                                    !this.ARGS.includes(name) &&
                                    this.expandableArgs[argName] &&
                                    this.expandableArgs[argName][0] !== 'text'
                                ) {
                                    target.blocks.deleteBlock(block.inputs[name].shadow, {
                                        source: 'default',
                                        targetId: target.id
                                    })
                                    delete block.inputs[name]
                                    if (runtime.emitTargetBlocksChanged) {
                                        runtime.emitTargetBlocksChanged(target.id, [
                                            'deleteInput',
                                            {
                                                id: block.id,
                                                inputName: name
                                            }
                                        ])
                                    }
                                }
                            })
                        } catch {
                            // nothing
                        }
                    }, 0)
                }
                Blockly.Events.setGroup(false)

                this.rendered = wasRendered
                if (wasRendered && !this.isInsertionMarker()) {
                    this.initSvg()
                    this.render()
                }
            },
            mutationToDom: function () {
                // 可以保存别的数据，会保存到sb3中，oldItemCount就是有多少个参数
                const container = document.createElement('mutation')
                container.setAttribute('items', `${this.oldItemCount}`)
                return container
            },
            domToMutation: function (xmlElement) {
                // 读取 mutationToDom 保存的数据
                this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 0)
                this.updateShape() // 读了之后更新
            },
            init: function (type) {
                // 积木初始化
                this.itemCount_ = 0
                this.oldItemCount = this.itemCount_
                this.opcode_ = type.opcode
                this.expandableBlock = type.expandableBlock
                this.expandableArgs = this.expandableBlock.expandableArgs
                this.textBegin = this.expandableBlock.textBegin
                this.textEnd = this.expandableBlock.textEnd
                this.defaultIndex = this.expandableBlock.defaultIndex || 0
                this.defaultText = this.expandableBlock.defaultText
                this.plusButton = new PlusButton()
                this.ARGS = []

                if (this.removeInput) this.removeInput('PLUS')
                this.appendDummyInput('PLUS').appendField(this.plusButton)
                if (this.moveInputBefore) this.moveInputBefore('PLUS', null)

                // 支持右键的时候可以删除指定的参数
                this.customContextMenu = function (contextMenu) {
                    // type.forEach(i =>
                    //     contextMenu.push({
                    //         text: translate(Blockly, INPUT_TYPES_OPTIONS_LABEL[i]),
                    //         enabled: true,
                    //         callback: () => {
                    //             this.sourceBlock_.addDynamicArg(i)
                    //         }
                    //     })
                    // )
                    this.dynamicArgumentIds_.forEach((id, idx) => {
                        const element = document.createElement('div')
                        element.innerText = '删除动态参数 ' + (idx + 1)
                        const input = this.inputList.find(i => i.name === id)
                        const pathElement = input.connection.targetConnection
                            ? input.connection.targetConnection.sourceBlock_.svgPath_
                            : input.outlinePath
                        element.addEventListener('mouseenter', () => {
                            const replacementGlowFilterId =
                                this.workspace.options.replacementGlowFilterId ||
                                'blocklyReplacementGlowFilter'
                            pathElement.setAttribute(
                                'filter',
                                'url(#' + replacementGlowFilterId + ')'
                            )
                        })
                        element.addEventListener('mouseleave', () => {
                            pathElement.removeAttribute('filter')
                        })
                        contextMenu.push({
                            text: element,
                            enabled: true,
                            callback: () => {
                                pathElement.removeAttribute('filter')
                                this.removeDynamicArg(id)
                            }
                        })
                    })
                }
            }
        }
    }

    blocksInfo.forEach(block => {
        if (block.expandableBlock)
            expandableBlocks[`${id}_${block.opcode}`] = {
                opcode: block.opcode,
                expandableBlock: block.expandableBlock
            }
    })
    const scratchBlocks = extension.Blockly
    if (!scratchBlocks) return
    const expandableAttr = createExpandableBlock(runtime, scratchBlocks)
    scratchBlocks.Blocks = new Proxy(scratchBlocks.Blocks, {
        set(target, opcode, value) {
            if (expandableBlocks.hasOwnProperty(opcode)) {
                Object.keys(expandableAttr).forEach(key => {
                    if (key != 'init') {
                        // 除了init设置
                        value[key] = expandableAttr[key]
                    }
                })
                const orgInit = value.init
                value.init = function () {
                    // 先用原本的init
                    orgInit.call(this)
                    // init expandable
                    expandableAttr.init.call(this, expandableBlocks[opcode])
                }
            }

            // if (opcode == "sb_CreporterRun") {
            //   const orgInit = value.init;
            //   value.init = function () {
            //     // 先用原本的 init
            //     orgInit.call(this);
            //     // 你要搞的999神秘的事情
            //     this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE);
            //   };
            // }
            //保证C型reporter积木样式正常
            return Reflect.set(target, opcode, value)
        }
    })
}

const getDynamicArgs = (args, name) => {
    // 依赖 Object.keys 确定自定义参数顺序可能有bug
    // return Object.keys(args)
    //   .filter((key) => key.startsWith('DYNAMIC_ARGS'))
    //   .map((key) => args[key]);

    // 尝试通过按序号顺序读取
    const res = []
    for (let i = 1; ; i++) {
        const v = args[`${name}_${i}`]
        if (v === undefined) return res
        res.push(v)
    }
}

export { getDynamicArgs, setExpandableBlocks }
