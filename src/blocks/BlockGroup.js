/**
 * BlockGroup - 积木分组的抽象基类
 *
 * 设计动机：
 *   TurboWarp 默认的积木定义方式将「opcode 列表」「text 翻译」「函数实现」分散在多处，
 *   对于大型扩展难以维护。BlockGroup 把"一类积木"集中在一个文件里：
 *
 *     - 同一类的所有积木定义在一起（blockType / opcode / text / arguments / handler）
 *     - 同一类的菜单、l10n 也归属此分组（可选）
 *     - 子类只需实现 build() 返回积木定义数组
 *     - 最后由 blocks/index.js 统一聚合所有分组
 *
 * 支持的 BlockDef 特殊属性：
 *   - dynamicArgsInfo: 可扩展积木配置（需配合 initExpandableBlocks）
 *   - output / outputShape / branchCount: OUTPUT 类型块的自定义形状（需劫持 _convertBlockForScratchBlocks）
 *   - isTerminal: 终端块（C 形槽最后一块，如 returnm）
 *   - xml: BlockType.XML 块的 XML 字符串（用于面板预定义块）
 *   - isEdgeActivated / shouldRestartExistingThreads: EVENT 块配置
 *   - disableMonitor: 禁用监视器
 *   - filter: 类型过滤
 *
 * build() 可返回 BlockDef 或 '---'（分割线）
 */

/**
 * @typedef {Object} BlockType
 * @property {string} COMMAND
 * @property {string} REPORTER
 * @property {string} BOOLEAN
 * @property {string} HAT
 * @property {string} BUTTON
 * @property {string} LABEL
 * @property {string} CONDITIONAL
 * @property {string} LOOP
 * @property {string} EVENT
 * @property {string} OUTPUT
 * @property {string} XML
 */

/**
 * @typedef {Object} ArgumentType
 * @property {string} ANGLE
 * @property {string} COLOR
 * @property {string} NUMBER
 * @property {string} STRING
 * @property {string} BOOLEAN
 * @property {string} [MATRIX]
 * @property {string} [NOTE]
 * @property {string} [IMAGE]
 * @property {string} [CCW_HAT_PARAMETER]
 */

/**
 * @typedef {Object} BlockArgument
 * @property {string|null} [type]
 * @property {any} [defaultValue]
 * @property {string} [menu]
 * @property {string} [fillIn] - 填充块 opcode，生成 shadow 块供用户拖出使用
 * @property {number} [shape] - 自定义参数形状（用于模型对象等特殊外观）
 */

/**
 * @typedef {Object} DynamicArgsInfo
 * @property {string} [groupId] - 扩展参数组 ID
 * @property {string} [name] - 组名称
 * @property {string[]} [types] - 参数类型缩写数组（s/n/b/color/angle/c）
 * @property {Object|string|Function} [menuText] - 加号按钮文本（对象映射/字符串/函数）
 * @property {string} [afterArg] - 挂载锚点参数名
 * @property {string} joinCh - 参数间连接符
 * @property {any} [preText] - 组前缀文本
 * @property {any} [endText] - 组后缀文本
 * @property {number} [min] - 最小参数数
 * @property {number} [max] - 最大参数数
 * @property {any} [defaultValues] - 默认值数组
 * @property {string[]} [dynamicArgTypes] - 动态参数类型数组（旧版格式）
 * @property {number} [paramsIncrement] - 每次增加的参数数
 */

/**
 * @typedef {Object} MutatorArgDef
 * @property {string} name - 参数输入名（传给 handler 的 args 键）
 * @property {'n'|'s'|'b'} type - 参数类型：n=数字 s=字符串 b=布尔
 * @property {any} [default] - 默认值
 * @property {string} [label] - 输入前显示的标签
 */

/**
 * @typedef {Object} MutatorInfo
 * @property {string} fieldName - 驱动变形的下拉字段名
 * @property {string} defaultValue - 默认选项值
 * @property {Object<string, MutatorArgDef[]>} argMap - 各选项对应的参数列表
 */

/**
 * @typedef {Object} BlockDef
 * @property {string} [opcode] - 积木唯一标识（LABEL/BUTTON/XML 可省略）
 * @property {string} blockType - BlockType 枚举值
 * @property {string} [text] - 积木显示文本（已翻译）
 * @property {string} [tooltip] - 提示文本（已翻译）
 * @property {boolean} [hideFromPalette] - 是否从面板隐藏
 * @property {boolean} [allowDropAnywhere] - 是否允许拖放到任意位置（TurboWarp/Gandi）
 * @property {boolean} [canDragDuplicate] - 是否允许拖动复制（TurboWarp/Gandi）
 * @property {number} [blockShape] - 自定义积木形状（用于模型对象等特殊外观，3=方形带缺口）
 * @property {boolean} [disableInternalArgument] - 是否禁用内部参数
 * @property {boolean} [disableMonitor] - 是否禁用监视器
 * @property {boolean} [isTerminal] - 是否为终端块
 * @property {(args: {[key: string]: any}, util?: any) => any} [handler] - 积木执行函数
 * @property {((args?: {[key: string]: any}) => any) | string} [onClick] - 按钮积木的点击回调
 * @property {string} [func] - BUTTON 块绑定的实例方法名
 * @property {{[key: string]: BlockArgument | undefined}} [arguments] - 参数定义
 * @property {DynamicArgsInfo} [dynamicArgsInfo] - 可扩展积木配置
 * @property {MutatorInfo} [mutatorInfo] - 下拉驱动动态参数配置
 * @property {string} [output] - OUTPUT 块的输出类型
 * @property {number} [outputShape] - OUTPUT 块的形状（3=圆形）
 * @property {number} [branchCount] - OUTPUT 块的分支数
 * @property {string} [xml] - XML 块的 XML 字符串
 * @property {boolean} [isEdgeActivated] - EVENT 块是否边沿触发
 * @property {boolean} [shouldRestartExistingThreads] - EVENT 块是否重启现有线程
 * @property {string} [groupId] - 子 LABEL 块的分组 ID
 * @property {string} [filter] - 类型过滤
 */

/**
 * @typedef {Object} ExtLike
 * @property {import('scratch-vm').Runtime} runtime
 * @property {import('scratch-vm')} vm
 * @property {{toNumber: (v: any) => number, toString: (v: any) => string, toBoolean: (v: any) => boolean}} cast
 * @property {any} renderEngine
 * @property {{[key: string]: any}} [threadInfo]
 * @property {string} [_currentObjectLoadingName] - 最后一次触发 objectLoadingCompleted 的对象名
 * @property {import('../core/extcore.js').default} [core]
 * @property {{warn: (...args: any[]) => void}} [logger]
 * @property {any} [patcher]
 * @property {any} [ScratchBlocks]
 */

/**
 * @typedef {Object} BlockGroupContext
 * @property {ExtLike} ext
 * @property {import('../core/extcore.js').default} core
 * @property {BlockType} BlockType
 * @property {ArgumentType} ArgumentType
 * @property {(key: string) => string} translate
 */

class BlockGroup {
    /**
     * 子类可覆盖的分组 ID
     * @type {string | undefined}
     */
    static groupId

    /**
     * 从类名自动推断的分组 ID（ getter，子类无需覆盖）
     * @returns {string}
     */
    static get inferredGroupId() {
        const name = this.name
        if (!name || typeof name !== 'string') return ''
        return name.replace(/Group$/, '')
    }

    /**
     * 生成带 fillIn shadow 的积木 XML
     *
     * 参考 test4.js 的 fillIn 实现：将参数槽预填为指定 opcode 的 shadow 块，
     * 用户可将其拖出作为局部变量/事件参数使用。
     *
     * @param {string} extId - 扩展 ID
     * @param {string} opcode - 主积木 opcode
     * @param {{[key: string]: BlockArgument}} args - 参数定义（支持 fillIn / menu）
     * @returns {string}
     */
    static generateFillInXML(extId, opcode, args) {
        let xml = `<block type="${extId}_${opcode}">`
        for (const [name, arg] of Object.entries(args)) {
            if (!arg || typeof arg !== 'object') continue
            if (arg.menu) {
                xml += `<field name="${name}">${arg.defaultValue ?? ''}</field>`
            } else if (arg.fillIn) {
                xml += `<value name="${name}"><shadow type="${extId}_${arg.fillIn}"></shadow></value>`
            }
        }
        xml += '</block>'
        return xml
    }

    /**
     * @param {Object} ctx - 分组上下文
     * @param {ExtLike} ctx.ext - Extension 主对象
     * @param {BlockType} ctx.BlockType - BlockType 枚举
     * @param {(key: string) => string} ctx.translate - 翻译函数（已绑定语言）
     * @param {import('../core/extcore.js').default} ctx.core - ExtensionCore
     * @param {ArgumentType} ctx.ArgumentType - ArgumentType 枚举
     */
    constructor(ctx) {
        /** @type {ExtLike} */
        this.ext = ctx.ext
        /** @type {import('../core/extcore.js').default} */
        this.core = ctx.core
        /** @type {BlockType} */
        this.BlockType = ctx.BlockType
        /** @type {ArgumentType} */
        this.ArgumentType = ctx.ArgumentType || /** @type {ArgumentType} */ ({})
        /** @type {(key: string) => string} */
        this.translate = ctx.translate
        /** @type {string} 分组标签文本（用于 LABEL 块） */
        this.label = ''
    }

    /**
     * 子类实现：返回该分组的所有积木定义
     * 可包含 '---' 字符串作为分割线
     * @returns {(BlockDef|string)[]}
     */
    build() {
        return []
    }

    /**
     * 分组 ID，用于嵌套分类。
     * 优先使用子类显式声明的 static groupId，否则从类名去掉 Group 后缀自动推断。
     * @returns {string}
     */
    get groupId() {
        const ctor = /** @type {typeof BlockGroup} */ (this.constructor)
        return ctor.groupId || ctor.inferredGroupId || ''
    }

    /**
     * 将 BlockDef 转换为 scratch-vm 需要的标准格式
     * @param {BlockDef} b
     * @returns {Object}
     */
    _buildScratchBlockDef(b) {
        /** @type {BlockDef & {[key: string]: any}} */
        const blockDef = {
            opcode: b.opcode,
            blockType: b.blockType,
            text: b.text,
            arguments: b.arguments || {}
        }

        // 可选标准属性
        if (b.hideFromPalette !== undefined)
            blockDef.hideFromPalette = b.hideFromPalette
        if (b.disableInternalArgument !== undefined)
            blockDef.disableInternalArgument = b.disableInternalArgument
        if (b.disableMonitor !== undefined)
            blockDef.disableMonitor = b.disableMonitor
        if (b.isTerminal !== undefined) blockDef.isTerminal = b.isTerminal
        if (b.tooltip !== undefined) blockDef.tooltip = b.tooltip
        if (b.allowDropAnywhere !== undefined)
            blockDef.allowDropAnywhere = b.allowDropAnywhere
        if (b.canDragDuplicate !== undefined)
            blockDef.canDragDuplicate = b.canDragDuplicate
        if (b.blockShape !== undefined)
            blockDef.blockShape = b.blockShape

        // OUTPUT 块自定义形状属性
        if (b.output !== undefined) blockDef.output = b.output
        if (b.outputShape !== undefined) blockDef.outputShape = b.outputShape
        if (b.branchCount !== undefined) blockDef.branchCount = b.branchCount

        // EVENT 块属性
        if (b.isEdgeActivated !== undefined)
            blockDef.isEdgeActivated = b.isEdgeActivated
        if (b.shouldRestartExistingThreads !== undefined)
            blockDef.shouldRestartExistingThreads = b.shouldRestartExistingThreads

        // XML 块
        if (b.xml !== undefined) blockDef.xml = b.xml

        // 可扩展积木配置
        if (b.dynamicArgsInfo !== undefined)
            blockDef.dynamicArgsInfo = b.dynamicArgsInfo

        // 下拉驱动动态参数配置
        if (b.mutatorInfo !== undefined) blockDef.mutatorInfo = b.mutatorInfo

        return blockDef
    }

    /**
     * 注册该分组的所有积木到 core（包含分组标签 LABEL）。
     * 由 blocks/index.js 统一调用。
     * @param {{[key: string]: any}} [instance] - RenderTheWorld 实例，用于挂载 handler/onClick
     */
    register(instance) {
        const blocks = this.build()
        if (this.label) {
            this.core.registerBlock({
                blockType: this.BlockType.LABEL,
                text: this.label,
                groupId: this.groupId
            })
        }
        blocks.forEach(b => {
            if (b === '---') {
                this.core.registerBlankLine()
                return
            }

            // 此时 b 一定是 BlockDef
            if (typeof b !== 'object' || b === null) return

            // 子 LABEL 块（理论上 build() 中不常用，保留兼容）
            if (b.blockType === this.BlockType.LABEL) {
                this.core.registerBlock({
                    blockType: this.BlockType.LABEL,
                    text: b.text,
                    groupId: b.groupId || this.groupId
                })
                return
            }

            // BUTTON 块
            if (b.blockType === this.BlockType.BUTTON) {
                /** @type {BlockDef & {[key: string]: any}} */
                const blockDef = {
                    blockType: this.BlockType.BUTTON,
                    text: b.text
                }
                if (typeof b.onClick === 'function' && instance) {
                    instance[b.opcode || ''] = b.onClick
                    blockDef.func = b.opcode
                } else if (typeof b.onClick === 'string') {
                    blockDef.func = b.onClick
                } else if (b.func) {
                    blockDef.func = b.func
                }
                this.core.registerBlock(blockDef)
                return
            }

            // 挂载 handler 到实例
            if (b.handler && instance) {
                instance[b.opcode || ''] = b.handler
            }

            this.core.registerBlock(this._buildScratchBlockDef(b))
        })
    }

    /**
     * 注册该分组的菜单到 core（可选重写）
     */
    registerMenus() {
        // 默认无菜单，子类按需重写
    }

    /**
     * 返回该分组的 l10n 数据（可选重写）
     * 返回格式：
     *   {
     *     'opcode.text': { 'zh-cn': '...', 'en': '...' },
     *     'opcode.tooltip': { 'zh-cn': '...', 'en': '...' },
     *     ...
     *   }
     * @returns {Object}
     */
    l10n() {
        return {}
    }
}

export default BlockGroup
