// 可扩展模块
let a, b
console.log('test')
//↙点这里收起
{
    // original by Nights
    const INPUT_TYPES_OPTIONS_LABEL = {
        s: 'ADD_TEXT_PARAMETER',
        n: 'ADD_NUM_PARAMETER',
        b: 'ADD_BOOL_PARAMETER',
        r: 'ADD_REGEN_PARAMETER',
        argument_reporter_string_number: 'ADD_PARAMETER'
    }

    const leftArrow =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNy43NzciIGhlaWdodD0iMTE3LjQ3MiI+PGcgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjIuNDAzIDgyLjM4MiAxLjA2NCA2MS4wNDJhMy4xNDggMy4xNDggMCAwIDEgMC00LjQ1M2wyMS4zNC0yMS4zMzZhMy4xNDggMy4xNDggMCAwIDEgNS4zNzMgMi4yMjZ2NDIuNjc2YTMuMTQ4IDMuMTQ4IDAgMCAxLTUuMzc0IDIuMjI2eiIvPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0wIDExNy40NzJWMGgyNy42MzZ2MTE3LjQ3MnoiLz48L2c+PC9zdmc+'

    const rightArrow =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNy43NzciIGhlaWdodD0iMTE3LjQ3MiI+PGcgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNNS4zNzQgODIuMzgxQTMuMTQ4IDMuMTQ4IDAgMCAxIDAgODAuMTU1VjM3LjQ3OWEzLjE0OCAzLjE0OCAwIDAgMSA1LjM3My0yLjIyNmwyMS4zNCAyMS4zMzZhMy4xNDggMy4xNDggMCAwIDEgMCA0LjQ1M0w1LjM3NCA4Mi4zODJ6Ii8+PHBhdGggZmlsbD0ibm9uZSIgZD0iTS4xNDIgMTE3LjQ3MlYwaDI3LjYzNXYxMTcuNDcyeiIvPjwvZz48L3N2Zz4='

    const minusButton =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw' +
        'MC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPS' +
        'JNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAw' +
        'IDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K'

    const plusButton =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
        '9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMT' +
        'ggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNz' +
        'FjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MW' +
        'MwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS' +
        '44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg=='

    const defaultPlusSelectImage =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTQiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCA1NCAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMC41IiB5PSIwLjUiIHdpZHRoPSI1MyIgaGVpZ2h0PSIzMSIgcng9IjE1LjUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1vcGFjaXR5PSIwLjIiLz4KPHBhdGggZD0iTTE3Ljk5OTggMTAuMTY0MVYyMS44MzA3TTEyLjE2NjUgMTUuOTk3NEgyMy44MzMyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNjY2NjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMzkuNzYzOCAxOC44Mzg2QzM5LjMyNTQgMTkuMjE4MiAzOC42NzQ2IDE5LjIxODIgMzguMjM2MiAxOC44Mzg2TDM1LjMwMzMgMTYuMjk4NkMzNC40ODY4IDE1LjU5MTQgMzQuOTg2OSAxNC4yNSAzNi4wNjcxIDE0LjI1TDQxLjkzMjkgMTQuMjVDNDMuMDEzMSAxNC4yNSA0My41MTMyIDE1LjU5MTQgNDIuNjk2NyAxNi4yOTg2TDM5Ljc2MzggMTguODM4NloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='

    /**
     * A record of enabled dynamic argument blocks.
     * @type {Object}
     */
    // 全局共享，避免覆盖
    if (!window.__ArkosExtendableInfo) {
        window.__ArkosExtendableInfo = {
            enabledDynamicArgBlocksInfo: {},
            extInfo: {}
        }
    }
    const { enabledDynamicArgBlocksInfo, extInfo } =
        window.__ArkosExtendableInfo

    /**
     * Retrieves ScratchBlocks from the runtime or window object.
     * @param {Runtime} runtime - The runtime object.
     * @returns {Object} The ScratchBlocks object.
     */
    function getScratchBlocks(runtime = Scratch?.vm?.runtime) {
        // In Gandi, ScratchBlocks can be accessed from the runtime.
        // In TW, ScratchBlocks can be directly accessed from the window.
        return runtime.scratchBlocks || window.ScratchBlocks
    }

    /**
     * Sets localization messages for Blockly.
     * @param {Blockly} Blockly - The Blockly object.
     */
    function setLocales(Blockly) {
        Object.assign(Blockly.ScratchMsgs.locales.en, {
            ADD_TEXT_PARAMETER: 'Add Text Parameter',
            ADD_NUM_PARAMETER: 'Add Num Parameter',
            ADD_BOOL_PARAMETER: 'Add Booln Parameter',
            DELETE_DYNAMIC_PARAMETER: 'Delete Dynamic Parameter',
            ADD_PARAMETER: 'Add Parameter'
        })

        Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
            ADD_TEXT_PARAMETER: '添加文本参数',
            ADD_NUM_PARAMETER: '添加数字参数',
            ADD_BOOL_PARAMETER: '添加布尔值参数',
            DELETE_DYNAMIC_PARAMETER: '删除动态参数',
            ADD_PARAMETER: '添加参数'
        })
    }

    /**
     * Translates a key using Blockly's translation messages.
     * @param {Blockly} Blockly - The Blockly object.
     * @param {string} key - The key to translate.
     * @returns {string} The translated string.
     */
    function translate(Blockly, key) {
        return Blockly.ScratchMsgs.translate(key)
    }

    /**
     * Creates custom buttons for Blockly blocks.
     * @param {Blockly} Blockly - The Blockly object.
     * @returns {Object} An object containing custom button classes.
     */
    function createButtons(
        Blockly,
        plusImage = rightArrow,
        minusImage = leftArrow
    ) {
        let w = 28
        let h = 118
        let size = 0.35
        if (plusImage === '+') {
            plusImage = plusButton
            w = 18
            h = 18
            size = 0.7
        }
        if (minusImage === '-') {
            minusImage = minusButton
            w = 18
            h = 18
            size = 0.7
        }
        class FieldButton extends Blockly.FieldImage {
            constructor(src, width = w * size, height = h * size) {
                super(src, width, height, undefined, false)
                this.initialized = false
            }

            init() {
                super.init()

                if (!this.initialized) {
                    this.getSvgRoot().style.cursor = 'pointer'
                    Blockly.bindEventWithChecks_(
                        this.getSvgRoot(),
                        'mousedown',
                        this,
                        e => {
                            // Prevent event bubbling, otherwise clicking the button will execute the block (clicking the button).
                            e.stopPropagation()
                        }
                    )
                    Blockly.bindEventWithChecks_(
                        this.getSvgRoot(),
                        'mouseup',
                        this,
                        e => {
                            this.handleClick(e)
                        }
                    )
                }
                this.initialized = true
            }

            handleClick(e) {
                if (!this.sourceBlock_ || !this.sourceBlock_.workspace) return
                if (this.sourceBlock_.workspace.isDragging()) return
                if (this.sourceBlock_.isInFlyout) return
                this.onClick(e)
            }

            onClick() {
                // Implemented by subclass
            }
        }
        // (+ ▽) Optional button for adding new types
        class PlusSelectButton extends FieldButton {
            constructor() {
                super(defaultPlusSelectImage, 54, 32)
            }

            onClick(e) {
                const menuOptions =
                    this.sourceBlock_.dynamicArgOptionalTypes_.map(i => ({
                        text: translate(Blockly, INPUT_TYPES_OPTIONS_LABEL[i]),
                        enabled: true,
                        callback: () => {
                            this.sourceBlock_.addDynamicArg(i)
                        }
                    }))
                Blockly.ContextMenu.show(e, menuOptions, false)
            }
        }
        // + button
        class PlusButton extends FieldButton {
            constructor() {
                super(plusImage)
            }

            onClick() {
                this.sourceBlock_.addDynamicArg(
                    this.sourceBlock_.dynamicArgOptionalTypes_[0]
                )
            }
        }
        // - button
        class MinusButton extends FieldButton {
            constructor() {
                super(minusImage)
            }

            onClick() {
                const { dynamicArgumentIds_ } = this.sourceBlock_
                this.sourceBlock_.removeDynamicArg(
                    dynamicArgumentIds_[dynamicArgumentIds_.length - 1]
                )
            }
        }
        return {
            PlusSelectButton,
            PlusButton,
            MinusButton
        }
    }

    /**
     * Initializes an expandable block with dynamic arguments.
     * @param {Runtime} runtime - The runtime object.
     * @param {Object} blockDefinition - The block definition.
     * @param {string[]} dynamicArgInfo - The dynamic argument types.
     */
    function initExpandableBlock(runtime, blockDefinition, dynamicArgInfo) {
        const { PlusSelectButton, PlusButton, MinusButton } =
            dynamicArgInfo.extInfo
        const Blockly = getScratchBlocks(runtime)

        /**
         * Get value of function/array or the value itself.
         * @param {*} value - value/function/array
         * @param {*} i - The index to pass to the function/array
         * @param {*} defaultValue - (optional) The default value. (if value is undefined)
         * @param {*} valueWhenOutOfRange - (optional) The value when the index is out of range.
         * @returns {*} The result.
         */
        function getValue(value, i, defaultValue, valueWhenOutOfRange) {
            if (value === undefined) return defaultValue
            if (Array.isArray(value)) {
                if (i < value.length) return value[i]
                if (valueWhenOutOfRange !== undefined)
                    return valueWhenOutOfRange
                return value[value.length - 1]
            }
            return typeof value === 'function' ? value(i) : value
        }

        /**
         * 第 i 次（从0开始）点击 + 按钮增加的参数数量，默认 1。越界时返回 0
         * @param {number} i
         * @returns
         */
        function getParamsIncPerClick(i) {
            return getValue(this.dynamicArgInfo_.paramsIncrement, i, 1, 0)
        }

        /**
         * 根据参数数量，计算点了几次 + 按钮的次数
         * @param {number} num 参数数量
         */
        function getAddClickCount(num) {
            let sum = 0
            let i = 0
            while (sum < num) {
                const inc = getParamsIncPerClick.call(this, i)
                if (inc === 0) throw new Error('Unreachable param num') // 无法到达的参数数量
                sum += inc
                i++
            }
            return i
        }

        /**
         * 计算某个编号的参数所属组的索引数组
         * @param {number} num 参数编号
         * @returns {Array<number>}
         */
        function getParamsGroupindexes(num) {
            let sum = 0
            let i = 0
            let inc = 0
            while (sum < num) {
                inc = getParamsIncPerClick.call(this, i)
                if (inc === 0) throw new Error('Unreachable param num') // 无法到达的参数数量
                sum += inc
                i++
            }
            sum -= inc
            return Array.from({ length: inc }, (_, j) => sum + j + 1)
        }

        /**
         * 计算下一次点击 + 按钮增加的参数数量
         * @returns
         */
        function getNextParamInc() {
            return getParamsIncPerClick.call(
                this,
                getAddClickCount.call(this, this.dynamicArgumentTypes_.length)
            )
        }

        const moveButtonToTheRightPlace = function () {
            // this.moveInputBefore('PLUS', null);
            const showPlus = getNextParamInc.call(this) > 0 // 是否显示 +
            if (showPlus) {
                this.getInput('PLUS').setVisible(true)
                // + 按钮不存在，创建
                // if (!this.getInput('PLUS')) this.appendDummyInput('PLUS').appendField(new PlusButton());
                // 调整 + 按钮位置
                const { afterArg, beforeArg } = this.dynamicArgInfo_
                if (afterArg) {
                    this.moveInputBefore('PLUS', afterArg)
                    this.moveInputBefore(afterArg, 'PLUS')
                } else if (beforeArg) {
                    this.moveInputBefore('PLUS', beforeArg)
                } else {
                    this.moveInputBefore('PLUS', null)
                }
            } else {
                // 删除 + 按钮
                this.getInput('PLUS').setVisible(false)
                // this.removeInput('PLUS', true);
            }
            if (this.getInput('ENDTEXT'))
                this.moveInputBefore('ENDTEXT', 'PLUS')
            const cnt = this.dynamicArgumentTypes_.length
            if (cnt === 0) {
                // 删除 - 按钮
                this.removeInput('MINUS')
            } else {
                if (!this.getInput('MINUS')) {
                    this.appendDummyInput('MINUS').appendField(
                        new MinusButton()
                    )
                }
                // 调整 - 按钮位置
                this.moveInputBefore('MINUS', 'PLUS')
            }
        }

        const orgInit = blockDefinition.init
        blockDefinition.init = function () {
            orgInit.call(this)

            this.dynamicArgumentIds_ = []
            this.dynamicArgumentTypes_ = []
            this.dynamicArgInfo_ = dynamicArgInfo
            // 可选的参数类型（数组）
            this.dynamicArgOptionalTypes_ = dynamicArgInfo.dynamicArgTypes
            // 详细指定每个参数的类型（数组）
            this.specifiedArgTypes = dynamicArgInfo.argType
            this.plusButton_ =
                dynamicArgInfo.dynamicArgTypes.length > 1
                    ? new PlusSelectButton()
                    : new PlusButton()
            this.minusButton_ = new MinusButton()

            const { afterArg, endText, beforeArg, preText } = dynamicArgInfo
            if (!this.getInput) return // 避免协作报错
            const endTxt = getValue(endText, 0, '')
            const preTxt = getValue(preText, 0, '')
            const n = this.dynamicArgumentIds_.length
            // console.log(n, preTxt, endTxt);
            if (n === 0 && preTxt + endTxt !== '') {
                if (beforeArg)
                    this.appendDummyInput('ENDTEXT').appendField(
                        preTxt + endTxt,
                        'ENDTEXT'
                    )
            } else if (endTxt !== '') {
                this.appendDummyInput('ENDTEXT').appendField(endTxt, 'ENDTEXT')
            }
            this.appendDummyInput('PLUS').appendField(this.plusButton_)
            // 将 + 按钮移到 afterArg 后面
            if (afterArg || beforeArg) {
                const plusInput = this.getInput('PLUS')
                const endTxtInput = this.getInput('ENDTEXT')
                const plusIndex = this.inputList.indexOf(plusInput)

                const argInput = this.getInput(afterArg ?? beforeArg)
                let argIdx = this.inputList.indexOf(argInput)
                if (plusIndex > -1 && argIdx > -1) {
                    // 删除 PLUS 输入
                    this.inputList.splice(plusIndex, 1)
                    argIdx = this.inputList.indexOf(argInput)
                    if (afterArg) {
                        // 插入 PLUS 输入到 afterArg 后面
                        this.inputList.splice(argIdx + 1, 0, plusInput)
                        const endTxtIndex = this.inputList.indexOf(endTxtInput)
                        if (endTxtIndex > -1) {
                            this.inputList.splice(endTxtIndex, 1)
                            argIdx = this.inputList.indexOf(argInput)
                            this.inputList.splice(argIdx + 1, 0, endTxtInput)
                        }
                        updatePreText(this, 0)
                    } else if (beforeArg) {
                        this.inputList.splice(argIdx, 0, plusInput)
                        const endTxtIndex = this.inputList.indexOf(endTxtInput)
                        if (endTxtIndex > -1) {
                            this.inputList.splice(endTxtIndex, 1)
                            argIdx = this.inputList.indexOf(plusInput)
                            this.inputList.splice(argIdx, 0, endTxtInput)
                        }
                    }
                }
            }
        }

        // Supports deleting specified parameters with right-click
        blockDefinition.customContextMenu = function (contextMenu) {
            this.dynamicArgOptionalTypes_.forEach(i =>
                contextMenu.push({
                    text: translate(Blockly, INPUT_TYPES_OPTIONS_LABEL[i]),
                    enabled: true,
                    callback: () => {
                        this.addDynamicArg(i)
                    }
                })
            )

            // 右键删除有bug，暂时不使用
            // 是否允许右键删除
            // const allowDelete = this.dynamicArgInfo_.allowDeleteByRightClickMenu ?? true; // 默认 true
            // if (allowDelete) {
            //   const len = this.dynamicArgumentIds_.length;
            //   let sum = 0;
            //   let i = 0;
            //   let inc = 0;
            //   const args = [];
            //   while (sum < len) {
            //     inc = getParamsIncPerClick.call(this, i);
            //     sum += inc;
            //     if (sum <= len) args.push(this.dynamicArgumentIds_[sum - 1]);
            //     i++;
            //   }

            //   args.forEach((id, idx) => {
            //     const element = document.createElement('div');
            //     element.innerText = `${Blockly.ScratchMsgs.translate('DELETE_DYNAMIC_PARAMETER')} ${idx + 1}`;

            //     const matches = id.match(/^([^\d]+)(\d+)$/);
            //     const name = matches[1];
            //     const i = Number(matches[2]);
            //     const ids = getParamsGroupindexes.call(this, i).map((it) => `${name}${it}`);
            //     const elems = [];
            //     this.inputList
            //       .filter((it) => ids.includes(it.name))
            //       .forEach((input) => {
            //         const pathElement = input.connection.targetConnection
            //           ? input.connection.targetConnection.sourceBlock_.svgPath_
            //           : input.outlinePath;
            //         element.addEventListener('mouseenter', () => {
            //           const replacementGlowFilterId =
            //             this.workspace.options.replacementGlowFilterId || 'blocklyReplacementGlowFilter';
            //           pathElement.setAttribute('filter', `url(#${replacementGlowFilterId})`);
            //         });
            //         element.addEventListener('mouseleave', () => {
            //           pathElement.removeAttribute('filter');
            //         });
            //         elems.push(pathElement);
            //       });
            //     contextMenu.push({
            //       text: element,
            //       enabled: true,
            //       callback: () => {
            //         elems.forEach((it) => it.removeAttribute('filter'));
            //         this.removeDynamicArg(id);
            //       },
            //     });
            //   });
            // }
        }

        blockDefinition.attachShadow_ = function (
            input,
            argumentType,
            defaultValue = ''
        ) {
            // if (argumentType === 'n' || argumentType === 's') {
            // 忽略布尔类型
            if (argumentType === 'b') return
            let blockType
            switch (argumentType) {
                case 'n':
                    blockType = 'math_number'
                    break
                case 's':
                    blockType = 'text'
                    break
                default:
                    blockType = argumentType
                    break
            }
            Blockly.Events.disable()
            const newBlock = this.workspace.newBlock(blockType)
            try {
                if (argumentType === 'n') {
                    newBlock.setFieldValue(defaultValue, 'NUM')
                } else if (argumentType === 's') {
                    newBlock.setFieldValue(defaultValue, 'TEXT')
                } else if (argumentType === 'argument_reporter_string_number') {
                    newBlock.setFieldValue(defaultValue, 'VALUE')
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
            // }
        }

        blockDefinition.mutationToDom = function () {
            const container = document.createElement('mutation')
            container.setAttribute(
                'dynamicargids',
                JSON.stringify(this.dynamicArgumentIds_)
            )
            container.setAttribute(
                'dynamicargtypes',
                JSON.stringify(this.dynamicArgumentTypes_)
            )
            return container
        }

        blockDefinition.domToMutation = function (xmlElement) {
            this.dynamicArgumentIds_ =
                JSON.parse(xmlElement.getAttribute('dynamicargids')) || []
            this.dynamicArgumentTypes_ =
                JSON.parse(xmlElement.getAttribute('dynamicargtypes')) || []
            this.updateDisplay_()
        }

        blockDefinition.addDynamicArg = function (type) {
            const oldMutationDom = this.mutationToDom()
            const oldMutation =
                oldMutationDom && Blockly.Xml.domToText(oldMutationDom)

            Blockly.Events.setGroup(true)

            let index = 0
            const lastArgName = this.dynamicArgumentIds_.slice(-1)[0]
            if (lastArgName) {
                // 获取最后一个参数的索引
                ;[index] = lastArgName.match(/\d+/g)
            }
            index = Number(index)

            // 计算本次点击增加的参数数量
            const cnt = getNextParamInc.call(this)
            for (let i = 0; i < cnt; i++) {
                this.dynamicArgumentIds_.push(`DYNAMIC_ARGS${index + i + 1}`)
                const specifiedType = this.specifiedArgTypes?.[index + i]
                if (specifiedType) {
                    this.dynamicArgumentTypes_.push(specifiedType)
                } else {
                    this.dynamicArgumentTypes_.push(type)
                }
            }
            this.updateDisplay_()

            const newMutationDom = this.mutationToDom()
            const newMutation =
                newMutationDom && Blockly.Xml.domToText(newMutationDom)
            if (oldMutation !== newMutation) {
                Blockly.Events.fire(
                    new Blockly.Events.BlockChange(
                        this,
                        'mutation',
                        null,
                        oldMutation,
                        newMutation
                    )
                )
            }

            Blockly.Events.setGroup(false)
        }

        /**
         * 根据id删除动态积木（同时成组删除关联的其他参数）
         * @param {string} id 参数id
         */
        blockDefinition.removeDynamicArg = function (id) {
            Blockly.Events.setGroup(true)

            const oldMutationDom = this.mutationToDom()
            const oldMutation =
                oldMutationDom && Blockly.Xml.domToText(oldMutationDom)

            const matches = id.match(/^([^\d]+)(\d+)$/)
            const name = matches[1]
            // 当前动态参数序号
            const i = Number(matches[2])
            // 查找要移除的参数的索引数组
            const paramsToRemove = getParamsGroupindexes.call(this, i)
            // 移除参数组的每个参数
            paramsToRemove.forEach(it => {
                const curId = `${name}${it}`
                const idx = this.dynamicArgumentIds_.indexOf(curId)
                this.dynamicArgumentIds_.splice(idx, 1)
                this.dynamicArgumentTypes_.splice(idx, 1)
                this.removeInput(curId)
            })

            // 更新显示
            this.updateDisplay_()

            const newMutationDom = this.mutationToDom()
            const newMutation =
                newMutationDom && Blockly.Xml.domToText(newMutationDom)
            if (oldMutation !== newMutation) {
                Blockly.Events.fire(
                    new Blockly.Events.BlockChange(
                        this,
                        'mutation',
                        null,
                        oldMutation,
                        newMutation
                    )
                )
                setTimeout(() => {
                    const target = runtime.getEditingTarget()
                    const block = target.blocks._blocks[this.id]
                    Object.keys(block.inputs).forEach(name => {
                        // 对于每个被删除的动态参数
                        if (
                            /^DYNAMIC_ARGS\d+$/.test(name) &&
                            !this.dynamicArgumentIds_.includes(name)
                        ) {
                            target.blocks.deleteBlock(
                                block.inputs[name].shadow,
                                {
                                    source: 'default',
                                    targetId: target.id
                                }
                            )
                            delete block.inputs[name]
                            if (runtime.emitTargetBlocksChanged) {
                                runtime.emitTargetBlocksChanged(target.id, [
                                    'deleteInput',
                                    { id: block.id, inputName: name }
                                ])
                            }
                        }
                    })
                }, 0)
            }

            Blockly.Events.setGroup(false)
        }

        blockDefinition.updateDisplay_ = function () {
            const wasRendered = this.rendered
            this.rendered = false

            const connectionMap = this.disconnectDynamicArgBlocks_()
            this.removeAllDynamicArgInputs_()

            this.createAllDynamicArgInputs_(connectionMap)
            this.deleteShadows_(connectionMap)

            this.rendered = wasRendered
            if (wasRendered && !this.isInsertionMarker()) {
                this.initSvg()
                this.render()
            }
        }

        blockDefinition.disconnectDynamicArgBlocks_ = function () {
            // Remove old stuff
            const connectionMap = {}
            for (let i = 0; this.inputList[i]; i++) {
                const input = this.inputList[i]
                if (input.connection && /^DYNAMIC_ARGS\d+$/.test(input.name)) {
                    const target = input.connection.targetBlock()
                    const saveInfo = {
                        shadow: input.connection.getShadowDom(),
                        block: target
                    }
                    connectionMap[input.name] = saveInfo

                    // Remove the shadow DOM, then disconnect the block.  Otherwise a shadow
                    // block will respawn instantly, and we'd have to remove it when we remove
                    // the input.
                    input.connection.setShadowDom(null)
                    if (target) {
                        input.connection.disconnect()
                    }
                }
            }
            return connectionMap
        }

        blockDefinition.removeAllDynamicArgInputs_ = function () {
            // Delete inputs directly instead of with block.removeInput to avoid splicing
            // out of the input list at every index.
            const inputList = []
            for (let i = 0; this.inputList[i]; i++) {
                const input = this.inputList[i]
                if (/^DYNAMIC_ARGS\d+$/.test(input.name)) {
                    input.dispose()
                } else {
                    inputList.push(input)
                }
            }
            this.inputList = inputList
        }

        function updatePreText(block, num) {
            const { preText, afterArg, beforeArg } = block.dynamicArgInfo_
            if (preText) {
                // 动态参数前的文本修改为 preText
                // console.log(this.inputList);
                let txt = getValue(preText, num, '')
                let input
                if (beforeArg) {
                    return
                } else if (afterArg) {
                    input = block.inputList.find(i => i.name === afterArg) // 改afterArg前面的文本
                } else {
                    input = block.inputList.findLast(
                        it =>
                            it.name !== 'PLUS' &&
                            it.name !== 'MINUS' &&
                            it.name !== 'ENDTEXT'
                    ) // 改第一个参数前的文本
                }

                // 查找afterArg对应的参数前面的文本（Blockly.FieldLabel）
                let field = input.fieldRow.findLast(
                    it => it instanceof Blockly.FieldLabel
                )
                field.setText(txt)
            }
        }

        blockDefinition.createAllDynamicArgInputs_ = function (connectionMap) {
            // Create arguments and labels as appropriate.
            const num = this.dynamicArgumentTypes_.length
            const { endText, joinCh, afterArg, beforeArg, preText } =
                this.dynamicArgInfo_
            updatePreText(this, num)
            for (let i = 0; i < num; i++) {
                const argumentType = this.dynamicArgumentTypes_[i]
                // 可能有特殊的类型比如自定义的regeneable积木
                // if (!(argumentType === 'n' || argumentType === 'b' || argumentType === 's')) {
                //   throw new Error(`Found an dynamic argument with an invalid type: ${argumentType}`);
                // }

                const id = this.dynamicArgumentIds_[i]
                const input = this.appendValueInput(id)
                // 增加参数间的分隔符
                // Add a separator character before the argument, eg. ","
                if (joinCh && (i !== 0 || afterArg)) {
                    input.appendField(getValue(joinCh, i, ''))
                }
                if (beforeArg && i === 0) {
                    input.appendField(getValue(joinCh, i, preText))
                }
                if (argumentType === 'b') {
                    input.setCheck('Boolean')
                }
                this.populateArgument_(
                    argumentType,
                    connectionMap,
                    id,
                    input,
                    i
                )
            }
            // 动态参数后的文本
            let txt = getValue(endText, num, '')
            if (beforeArg && num === 0) txt = getValue(preText, num, '') + txt
            if (txt === '') {
                this.removeInput('ENDTEXT', true) // 删除ENDTEXT输入
            } else {
                // console.log(endTxtInput.fieldRow);
                const field = this.getField('ENDTEXT')
                if (field) field.setValue(txt)
                else
                    this.appendDummyInput('ENDTEXT').appendField(txt, 'ENDTEXT')
            }
            // Move the + and - buttons to the far right.
            // 将动态参数移到某个特定参数之后
            if (afterArg) {
                moveButtonToTheRightPlace.call(this)
                const cnt = this.dynamicArgumentTypes_.length
                for (let i = cnt - 1; i >= 0; i--) {
                    const id = this.dynamicArgumentIds_[i]
                    this.moveInputBefore(id, afterArg)
                    this.moveInputBefore(afterArg, id)
                }
            } else if (beforeArg) {
                const cnt = this.dynamicArgumentTypes_.length
                for (let i = 0; i < cnt; i++) {
                    const id = this.dynamicArgumentIds_[i]
                    this.moveInputBefore(id, beforeArg)
                    // this.moveInputBefore(beforeArg, id);
                }
                moveButtonToTheRightPlace.call(this)
            } else {
                moveButtonToTheRightPlace.call(this)
            }
        }

        blockDefinition.populateArgument_ = function (
            type,
            connectionMap,
            id,
            input,
            i
        ) {
            let oldBlock = null
            let oldShadow = null
            if (connectionMap && id in connectionMap) {
                const saveInfo = connectionMap[id]
                oldBlock = saveInfo.block
                oldShadow = saveInfo.shadow
            }

            const getDefaultValue = (id, i) => {
                const { defaultValues, afterArg } = this.dynamicArgInfo_
                const type = typeof defaultValues
                // 默认值是函数，则调用函数获取默认值
                if (type === 'function') return defaultValues(i, id)
                // 默认值是列表
                if (Array.isArray(defaultValues)) {
                    const len = defaultValues.length
                    if (i <= len - 1) return defaultValues[i]
                    // 超出列表长度，则取最后一项+递增编号。例如最后一项是“value”，则之后是“value2”、“value3”...
                    return `${defaultValues[len - 1]}${i - len + 2}`
                }
                // 使用前一个参数的值
                if (defaultValues === '@PRE_ARG@') {
                    let previousArgName = null
                    let previousArgValue = ''

                    if (i > 0) {
                        previousArgName = `DYNAMIC_ARGS${i}`
                    } else if (afterArg) {
                        previousArgName = afterArg
                    }
                    if (previousArgName) {
                        const previousArgInput = this.getInput(previousArgName)
                        if (previousArgInput && previousArgInput.connection) {
                            const targetBlock =
                                previousArgInput.connection.targetBlock()
                            if (targetBlock && targetBlock.getFieldValue) {
                                previousArgValue =
                                    targetBlock.getFieldValue('TEXT') ||
                                    targetBlock.getFieldValue('NUM') ||
                                    ''
                            }
                        }
                    }
                    return previousArgValue
                }
                // 默认值是数字或字符串，直接返回
                return defaultValues
            }

            if (connectionMap && oldBlock) {
                // Reattach the old block and shadow DOM.
                connectionMap[input.name] = null
                oldBlock.outputConnection.connect(input.connection)
                if (type !== 'b') {
                    const shadowDom = oldShadow || this.buildShadowDom_(type)
                    input.connection.setShadowDom(shadowDom)
                }
            } else {
                this.attachShadow_(input, type, getDefaultValue(id, i))
            }
        }

        blockDefinition.deleteShadows_ =
            Blockly.ScratchBlocks.ProcedureUtils.deleteShadows_

        blockDefinition.buildShadowDom_ =
            Blockly.ScratchBlocks.ProcedureUtils.buildShadowDom_
    }

    /**
     * Proxies the Blockly Blocks object to enable dynamic argument blocks.
     * @param {Runtime} runtime - The runtime object.
     */
    function proxyBlocklyBlocksObject(runtime) {
        const Blockly = getScratchBlocks(runtime)
        if (!Blockly) return
        if (Blockly.Blocks.__proxied) return
        Blockly.Blocks.__proxied = true
        setLocales(Blockly)
        Blockly.Blocks = new Proxy(Blockly.Blocks, {
            set(target, opcode, blockDefinition) {
                if (
                    Object.prototype.hasOwnProperty.call(
                        enabledDynamicArgBlocksInfo,
                        opcode
                    )
                ) {
                    initExpandableBlock(
                        runtime,
                        blockDefinition,
                        enabledDynamicArgBlocksInfo[opcode]
                    )
                }
                return Reflect.set(target, opcode, blockDefinition)
            }
        })
    }

    /**
     * Initializes expandable blocks for a given extension.
     * @param {Object} extension - The extension object.
     * @param {string} plusImage - The image data for the plus button.
     * @param {string} minusImage - The image data for the minus button.
     */
    function initExpandableBlocks(
        extension,
        plusImage = rightArrow,
        minusImage = leftArrow
    ) {
        const { runtime } = extension
        // 详情页不需要设置可扩展积木
        if (runtime.isPlayerOnly) return

        const Blockly = getScratchBlocks(runtime)
        // 如果ScratchBlocks不存在则返回
        if (!Blockly) return
        // 创建按钮
        const { PlusSelectButton, PlusButton, MinusButton } = createButtons(
            Blockly,
            plusImage,
            minusImage
        )
        proxyBlocklyBlocksObject(runtime)

        if (extension.getInfo.__patched) return
        const origGetInfo = extension.getInfo
        // patch getInfo，每次调用时同时刷新最新的可扩展参数信息
        extension.getInfo = function () {
            const info = origGetInfo.call(this)
            const { id, blocks: blocksInfo } = info
            // 注册扩展信息
            extInfo[id] = { id, PlusSelectButton, PlusButton, MinusButton }
            blocksInfo.forEach(i => {
                // 如果积木定义了可扩展参数
                const { dynamicArgsInfo } = i
                if (dynamicArgsInfo) {
                    dynamicArgsInfo.dynamicArgTypes =
                        dynamicArgsInfo.dynamicArgTypes || ['s']
                    dynamicArgsInfo.extInfo = extInfo[id]
                    enabledDynamicArgBlocksInfo[`${id}_${i.opcode}`] =
                        dynamicArgsInfo
                }
            })
            return info
        }
        extension.getInfo.__patched = true
    }

    /**
     * get values of dynamic args from args
     * @param {object} args - arguments objects
     * @returns {Array} values of dynamic args
     */
    function getDynamicArgs(args) {
        // 依赖 Object.keys 确定自定义参数顺序可能有bug
        // return Object.keys(args)
        //   .filter((key) => key.startsWith('DYNAMIC_ARGS'))
        //   .map((key) => args[key]);

        // 尝试通过按序号顺序读取
        const res = []
        for (let i = 1; ; i++) {
            const v = args[`DYNAMIC_ARGS${i}`]
            if (v === undefined) return res
            res.push(v)
        }
    }

    a = initExpandableBlocks
    b = getDynamicArgs
}
const initExpandableBlocks = a
const getDynamicArgs = b

// ——————————————————————————————————————————————————扩展例.js——————————————————————————————————————————————————

const { BlockType, ArgumentType, TargetType, Cast } = Scratch

class ExtendableExample {
    constructor(runtime) {
        this.runtime = runtime
        console.log('installed')

        this._formatMessage = runtime.getFormatMessage({
            'zh-cn': {
                extensionName: '可扩展积木例',
                func: '执行函数[func]',
                join: '连接[A][B]',
                param: '参数',
                clone: '克隆[SPRITE]',
                ID: 'ID为',
                data: '数据:',
                emptyList: '空列表',
                list: '列表',
                emptyObject: '空对象',
                object: '对象'
            },
            en: {
                extensionName: 'Extendable Example',
                func: 'execute func[func]',
                join: 'join[A][B]',
                param: 'param',
                clone: 'clone[SPRITE]',
                ID: 'with ID',
                data: 'data:',
                emptyList: 'new list',
                list: 'list: ',
                emptyObject: 'new object',
                object: 'object: '
            }
        })
        // 注册当前扩展的可扩展积木，默认箭头按钮
        initExpandableBlocks(this)
        // 可以使用 + / - 按钮
        // initExpandableBlocks(this, '+', '-');
    }

    /**
     * 翻译
     * @param {string} id
     * @return {string}
     */
    fm(id) {
        return this._formatMessage({
            id,
            default: id,
            description: id
        })
    }

    getInfo() {
        return {
            id: 'extendableExample', // 拓展id
            name: this.fm('extensionName'), // 拓展名
            color: '#FF8C1A', // 拓展颜色
            blocks: [
                {
                    opcode: 'join',
                    blockType: 'reporter',
                    text: this.fm('join'),
                    arguments: {
                        A: {
                            type: ArgumentType.STRING,
                            defaultValue: 'A'
                        },
                        B: {
                            type: ArgumentType.STRING,
                            defaultValue: 'B'
                        }
                    },
                    // 设置动态参数信息
                    dynamicArgsInfo: {
                        // 各参数的默认值。
                        defaultValues: ['C', 'D', 'E', 'F', 'G']
                        // 也可以是函数
                        // defaultValues: (i) => 'CDEFGHIJK'[i],
                        // 也可以是单个字符串
                        // defaultValues: '默认值',
                    }
                },
                {
                    opcode: 'plus',
                    blockType: 'reporter',
                    text: '[A]+[B]',
                    arguments: {
                        A: {
                            type: ArgumentType.NUMBER,
                            defaultValue: ''
                        },
                        B: {
                            type: ArgumentType.NUMBER,
                            defaultValue: ''
                        }
                    },
                    // 设置动态参数信息
                    dynamicArgsInfo: {
                        defaultValues: '',
                        afterArg: 'B',
                        joinCh: '+',
                        // 动态参数类型：
                        // n: 数字
                        // s: 字符串（默认）
                        // b: 布尔
                        dynamicArgTypes: ['n']
                    }
                },
                {
                    opcode: 'list',
                    blockType: 'reporter',
                    disableMonitor: true,
                    text: '-',
                    // 设置动态参数信息
                    dynamicArgsInfo: {
                        // 第一个动态参数前的文本
                        preText: n =>
                            n === 0
                                ? this.fm('emptyList')
                                : this.fm('list') + '[',
                        // 最后一个动态参数后的文本
                        endText: n => (n === 0 ? '' : ']'),
                        joinCh: ',',
                        // 各参数的默认值。
                        defaultValues: ['apple', 'banana', 'item']
                    }
                },
                {
                    opcode: 'object',
                    blockType: 'reporter',
                    disableMonitor: true,
                    text: '-',
                    // 设置动态参数信息
                    dynamicArgsInfo: {
                        // 第一个动态参数前的文本
                        preText: '{',
                        // 最后一个动态参数后的文本
                        endText: '}',
                        // 连接符
                        joinCh: i => (i % 2 === 1 ? ':' : ','),
                        paramsIncrement: 2, // 每次增加的参数数量
                        // 各参数的默认值。
                        defaultValues: i => {
                            const idx = Math.floor(i / 2)
                            if (i % 2 === 0) return 'key' + idx
                            return 'value' + idx
                        }
                    }
                },
                {
                    opcode: 'print',
                    blockType: 'command',
                    text: this.fm('func'),
                    arguments: {
                        func: {
                            type: 'string',
                            defaultValue: 'func'
                        }
                    },
                    // 设置动态参数信息
                    dynamicArgsInfo: {
                        // 在哪个参数后面插入动态参数
                        afterArg: 'func',
                        // endText: 动态参数末尾的文本，可以是字符串或函数。n：动态参数的数量
                        endText: n => (n === 0 ? '' : ')'),
                        // joinCh: 动态参数之间的连接字符，可以是字符串或函数。i：第 i 个参数前的连接字符
                        joinCh: i => (i === 0 ? '(' : ','),
                        // defaultValues: 动态参数的默认值，可以是字符串或函数。
                        defaultValues: [this.fm('param')]
                    }
                },
                {
                    opcode: 'set',
                    blockType: 'command',
                    text: 'set[K]to[V]',
                    arguments: {
                        K: {
                            type: 'string',
                            defaultValue: 'a'
                        },
                        V: {
                            type: 'string',
                            defaultValue: 'b'
                        }
                    },
                    dynamicArgsInfo: {
                        // (可选)在哪个参数后面插入动态参数
                        afterArg: 'K',
                        joinCh: '.',
                        // 默认值可以函数指定
                        defaultValues: 'a'
                    }
                },
                {
                    opcode: 'clone',
                    blockType: 'command',
                    text: this.fm('clone'),
                    arguments: {
                        SPRITE: {
                            type: 'string',
                            defaultValue: 'sprite1'
                        }
                    },
                    dynamicArgsInfo: {
                        // (可选)在哪个参数后面插入动态参数
                        afterArg: 'SPRITE',
                        // 添加参数时，每次添加的数量。i为第i次点击时（从0开始）
                        // paramsIncrement: (i) => (i === 0 ? 1 : 2), // 第一次增加1个参数，之后增加2个参数
                        paramsIncrement: [1, 2, 2], //也可以是数组
                        // 连接符可以函数指定
                        joinCh: i => {
                            if (i === 0) return this.fm('ID')
                            if (i === 1) return this.fm('data')
                            if (i % 2 === 1) return ','
                            return '='
                        },
                        // 默认值可以函数指定
                        defaultValues: i => {
                            if (i === 0) return 'ID'
                            if (i % 2 === 1) return 'key'
                            return 'value'
                        }
                    }
                }
            ]
        }
    }

    join(args) {
        console.log(args)
        // 读取动态参数（数组）
        const dynamicArgs = getDynamicArgs(args)
        return String(args.A) + String(args.B) + dynamicArgs.join('')
    }

    clone(args) {
        const dynamicArgs = getDynamicArgs(args)
        console.log(dynamicArgs)
    }

    plus(args) {
        const dynamicArgs = getDynamicArgs(args)
        return (
            Number(args.A) +
            Number(args.B) +
            dynamicArgs.reduce((a, b) => a + Number(b), 0)
        )
    }

    list(args) {
        console.log(args)
        const dynamicArgs = getDynamicArgs(args)
        return JSON.stringify(dynamicArgs)
    }

    object(args) {
        console.log(args)
        const dynamicArgs = getDynamicArgs(args)
        const res = {}
        dynamicArgs.forEach((value, i) => {
            if (i % 2 === 0) {
                res[value] = dynamicArgs[i + 1]
            }
        })
        return JSON.stringify(res)
    }
}
Scratch.extensions.register(new ExtendableExample(Scratch.vm.runtime))
