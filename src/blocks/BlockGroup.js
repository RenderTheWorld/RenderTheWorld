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
 * @typedef {Object} BlockDef
 * @property {string} [opcode] - 积木唯一标识（LABEL/BUTTON/XML 可省略）
 * @property {string} blockType - BlockType 枚举值
 * @property {string} [text] - 积木显示文本（已翻译）
 * @property {string} [tooltip] - 提示文本（已翻译）
 * @property {boolean} [hideFromPalette] - 是否从面板隐藏
 * @property {boolean} [disableInternalArgument] - 是否禁用内部参数
 * @property {boolean} [disableMonitor] - 是否禁用监视器
 * @property {boolean} [isTerminal] - 是否为终端块
 * @property {Function} [handler] - 积木执行函数 (args, util) => any
 * @property {Function} [onClick] - 按钮积木的点击回调
 * @property {Record<string, {type: string, defaultValue?: any, menu?: string}>} [arguments] - 参数定义
 * @property {Object} [dynamicArgsInfo] - 可扩展积木配置
 * @property {string} [output] - OUTPUT 块的输出类型
 * @property {number} [outputShape] - OUTPUT 块的形状（3=圆形）
 * @property {number} [branchCount] - OUTPUT 块的分支数
 * @property {string} [xml] - XML 块的 XML 字符串
 * @property {boolean} [isEdgeActivated] - EVENT 块是否边沿触发
 * @property {boolean} [shouldRestartExistingThreads] - EVENT 块是否重启现有线程
 */

class BlockGroup {
    /**
     * @param {Object} ctx - 分组上下文
     * @param {import('../core/main.js').default} ctx.ext - Extension 主对象
     * @param {Object} ctx.BlockType - BlockType 枚举
     * @param {(key: string) => string} ctx.translate - 翻译函数（已绑定语言）
     * @param {import('../core/extcore.js').default} ctx.core - ExtensionCore
     * @param {Object} ctx.ArgumentType - ArgumentType 枚举
     */
    constructor(ctx) {
        this.ext = ctx.ext
        this.core = ctx.core
        this.BlockType = ctx.BlockType
        this.ArgumentType = ctx.ArgumentType || {}
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
     * 注册该分组的所有积木到 core（包含分组标签 LABEL）
     */
    register() {
        const blocks = this.build()
        if (this.label) {
            this.core.registerBlock({
                blockType: this.BlockType.LABEL,
                text: this.label
            })
        }
        blocks.forEach(b => {
            if (b === '---') {
                this.core.registerBlock('---')
            } else {
                this.core.registerBlock(b)
            }
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
