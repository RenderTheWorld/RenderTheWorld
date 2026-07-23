/**
 * 嵌套分类工具
 *
 * 参考 f:\ScratchExt\RenderTheWorld\src\test\test4.js 实现，将扩展的积木按 LABEL 分组
 * 组织为 Scratch 工具栏中的父分类 + 可折叠子分类。
 *
 * 工作原理：
 *   1. 使用 ext.patcher 劫持 runtime.getBlocksXML，将本扩展的单个 category 拆分为
 *      [父分类(含首个 LABEL 之前的所有积木), 子分类1, 子分类2, ...]
 *   2. 注入 CSS：隐藏子分类的彩色圆点、折叠状态下隐藏子分类、
 *      展开状态下调整树形连接线
 *   3. 注册事件：
 *      - 双击父分类切换折叠状态
 *      - 单击子分类让 workspace 中该组积木闪烁三下
 *
 * 分组识别：
 *   遍历 extInfo.blocks，遇到 LABEL 块（blockType === 'label'）时
 *   开始新的子分类，后续积木归入当前子分类。
 *   第一个 LABEL 之前的所有积木（包括 apidocs 按钮、XML 预定义块等）归入父分类。
 *   hideFromPalette 的积木会被跳过，不加入任何分类。
 *
 * 子分类 ID：
 *   直接使用 BlockGroup 在注册 LABEL 时提供的 groupId；
 *   若未提供，则使用 `${extId}_${index}` 兜底。
 */

/**
 * 设置嵌套分类
 * @param {Object} options
 * @param {Object} options.vm - Scratch VM 实例（提供 runtime 与 editingTarget）
 * @param {Object} options.patcher - ext.patcher（Arkos Patcher 实例）
 * @param {string} options.extId - 扩展 ID
 * @param {string} options.extName - 扩展显示名称
 * @param {string} [options.menuIconURI] - 分类菜单图标（data URI），设置后父分类 bubble 显示该图标
 * @param {string} options.color1 - 主分类颜色（hex）
 * @param {string} options.color2 - 次分类颜色（hex）
 * @returns {() => void} 清理函数（扩展卸载时调用）
 */
export function setupNestedCategory({
    vm,
    patcher,
    extId,
    extName,
    menuIconURI,
    color1,
    color2
}) {
    const runtime = vm.runtime
    color1 = color1 || '#9966ff'
    color2 = color2 || '#774dcb'

    const STYLE_ID = `${extId}-fold-style`
    // 折叠状态属性名，按扩展隔离，避免多扩展联动
    const EXPANDED_ATTR = `data-tw-folder-expanded-${extId}`

    // ============== 从 _blockInfo 提取分组配置 ==============
    /**
     * 按 LABEL 块将积木拆分为父分类和子分类
     * @returns {{
     *   parentXmls: string[],
     *   children: Array<{id: string, name: string, xmls: string[]}>
     * }}
     */
    function extractCategoryConfigs() {
        const extInfo = runtime._blockInfo?.find(info => info.id === extId)
        if (!extInfo || !extInfo.blocks) {
            return { parentXmls: [], children: [] }
        }

        const allBlocks = extInfo.blocks
        const children = []
        let currentChild = null
        let fallbackIndex = 0
        const parentXmls = []

        for (const b of allBlocks) {
            const info = b.info || {}
            const xml = b.xml || ''

            // 跳过高层面板隐藏的积木
            if (info.hideFromPalette) continue

            // LABEL 块：开始新的子分类
            if (info.blockType === 'label') {
                if (currentChild && currentChild.xmls.length > 0) {
                    children.push(currentChild)
                }
                const labelText = String(info.text || '')
                // groupId 由 BlockGroup 提供，未命中则使用数字索引兜底
                const groupId = info.groupId || `${fallbackIndex}`
                currentChild = {
                    id: `${extId}_${groupId}`,
                    name: labelText || `Group ${fallbackIndex}`,
                    xmls: []
                }
                fallbackIndex++
            } else if (currentChild) {
                // 当前在子分类中
                if (xml) currentChild.xmls.push(xml)
            } else {
                // 首个 LABEL 之前的积木归入父分类
                if (xml) parentXmls.push(xml)
            }
        }

        // 收尾最后一个子分类
        if (currentChild && currentChild.xmls.length > 0) {
            children.push(currentChild)
        }

        return { parentXmls, children }
    }

    // ============== 动态更新 CSS ==============
    /**
     * 根据当前子分类配置重新生成 CSS
     */
    function updateStyle() {
        const { children } = extractCategoryConfigs()
        const childIds = children.map(c => c.id)

        const bubbleSelectors = childIds
            .map(id => `.scratchCategoryId-${id} .scratchCategoryItemBubble`)
            .join(', ')
        const hideSelectors = childIds
            .map(
                id =>
                    `body[${EXPANDED_ATTR}="false"] .scratchCategoryId-${id}`
            )
            .join(', ')
        const childCurrent = childIds
            .map(id => `[class*="scratchCategoryId-${id}"]`)
            .join(', ')
        const childNext = childIds
            .map(
                id =>
                    `+ .scratchCategoryMenuRow [class*="scratchCategoryId-${id}"]`
            )
            .join(', ')
        const childItemSelectors = childIds
            .map(id => `.scratchCategoryId-${id}`)
            .join(', ')

        let styleText = ''
        if (bubbleSelectors) {
            styleText += `${bubbleSelectors} { display: none !important; }\n`
        }
        if (hideSelectors) {
            styleText += `${hideSelectors} { display: none !important; }\n`
        }

        // 子分类菜单项高度调整
        if (childItemSelectors) {
            styleText += `${childItemSelectors} { padding: 8px 0px !important; }\n`
        }

        // 父分类菜单图标：若有 menuIconURI，用图标替换彩色圆点
        if (menuIconURI) {
            styleText += `
    .scratchCategoryId-${extId} .scratchCategoryItemBubble {
      background-color: transparent !important;
      background-image: url("${menuIconURI}") !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      background-position: center !important;
      border-color: transparent !important;
    }
  `
        }

        styleText += `
    body[${EXPANDED_ATTR}="true"] .scratchCategoryMenuItem.scratchCategoryId-${extId} {
      padding: 12px 0px 8px 0px !important;
    }
    body[${EXPANDED_ATTR}="true"] .scratchCategoryMenuItem.scratchCategoryId-${extId}::after {
      top: calc(50% - 12px) !important; bottom: 0 !important;
      height: auto !important; transform: none !important;
    }
  `

        if (childCurrent) {
            styleText += `
    body[${EXPANDED_ATTR}="true"] .scratchCategoryMenuRow:has(${childCurrent}):has(${childNext}) .scratchCategoryMenuItem::after {
      top: 0 !important; bottom: 0 !important;
      height: auto !important; transform: none !important;
    }
    body[${EXPANDED_ATTR}="true"] .scratchCategoryMenuRow:has(${childCurrent}):not(:has(${childNext})) .scratchCategoryMenuItem::after {
      top: 0 !important; bottom: calc(50% - 12px) !important;
      height: auto !important; transform: none !important;
    }
  `
        }

        let style = document.getElementById(STYLE_ID)
        if (!style) {
            style = document.createElement('style')
            style.id = STYLE_ID
            document.head.appendChild(style)
        }
        style.textContent = styleText
        if (!document.body.hasAttribute(EXPANDED_ATTR)) {
            document.body.setAttribute(EXPANDED_ATTR, 'true')
        }
    }

    // ============== 子分类点击：组内积木闪烁 ==============
    /**
     * 从子分类 XML 中提取所有 opcode
     * @param {string[]} xmls
     * @returns {string[]}
     */
    function extractOpcodes(xmls) {
        const opcodes = []
        const regex = /type="([^"]+)"/g
        for (const xml of xmls) {
            let match
            while ((match = regex.exec(xml)) !== null) {
                opcodes.push(match[1])
            }
        }
        return opcodes
    }

    /**
     * 让当前编辑角色中指定 opcode 的积木闪烁三下
     * @param {string[]} opcodes
     */
    function flashBlocks(opcodes) {
        const blockIds = opcodes.filter(id => id.startsWith(extId))
        if (!blockIds.length) return

        const FLASH_TIMES = 2  // 闪烁次数
        const INTERVAL = 150
        let count = 0
        const timer = setInterval(() => {
            const glow = count % 2 === 0
            blockIds.forEach(id => {
                try {
                    runtime.glowBlock(id, glow)
                } catch {
                    // 忽略单个积木 glow 失败
                }
            })
            count++
            if (count >= FLASH_TIMES * 2) {
                clearInterval(timer)
                blockIds.forEach(id => {
                    try {
                        runtime.glowBlock(id, false)
                    } catch {
                        // ignore
                    }
                })
            }
        }, INTERVAL)
    }

    /**
     * 处理子分类双击：找到最近子分类并闪烁其积木
     */
    function handleChildCategoryDblClick(e) {
        const childEl = e.target.closest('[class*="scratchCategoryId-"]')
        if (!childEl) return

        // 只处理本扩展的子分类（id 以 extId_ 开头）
        const classMatch = Array.from(childEl.classList).find(cls =>
            cls.startsWith(`scratchCategoryId-${extId}_`)
        )
        if (!classMatch) return

        const childId = classMatch.replace(`scratchCategoryId-`, '')
        const { children } = extractCategoryConfigs()
        const child = children.find(c => c.id === childId)
        if (!child || !child.xmls.length) return

        const opcodes = extractOpcodes(child.xmls)
        if (opcodes.length) flashBlocks(opcodes)
    }

    // ============== 使用 patcher 劫持 getBlocksXML ==============
    // 优先使用 after 钩子（避免 wrapper 层层套娃），在原函数返回后修改 XML
    patcher.patch(runtime, 'getBlocksXML', {
        name: 'nestedCategory',
        after: (res, target) => {
            const extInfo = runtime._blockInfo?.find(
                info => info.id === extId
            )
            if (!extInfo || !extInfo.blocks) return res

            try {
                // 每次打开面板时重新计算分组和 CSS
                updateStyle()

                const { parentXmls, children } = extractCategoryConfigs()

                // 父分类：包含首个 LABEL 之前的所有积木
                let categoryXml = `<category name="${extName}" id="${extId}" colour="${color1}" secondaryColour="${color2}">${parentXmls.join(
                    ''
                )}</category>`

                // 子分类
                for (const child of children) {
                    categoryXml += `<category name="${child.name}" id="${child.id}" colour="${color1}" secondaryColour="${color2}">${child.xmls.join(
                        ''
                    )}</category>`
                }

                return res.map(item =>
                    item.id === extId
                        ? { id: extId, xml: categoryXml }
                        : item
                )
            } catch (e) {
                console.error(`[${extId}] NestedCategory XML Error:`, e)
                return res
            }
        }
    })

    // ============== 事件监听 ==============
    let isExpanded = true

    const onMouseDown = e => {
        const parentEl = e.target.closest(`.scratchCategoryId-${extId}`)
        if (parentEl) {
            // 只阻止冒泡，不阻止默认行为，避免双击失效
            e.stopPropagation()
        }
    }

    const onDblClick = e => {
        // 先判断是否是本扩展的子分类，优先处理闪烁
        const childEl = e.target.closest(`[class*="scratchCategoryId-${extId}_"]`)
        if (childEl) {
            handleChildCategoryDblClick(e)
            // e.stopPropagation()
            return
        }

        // 再判断是否是本扩展的父分类，切换折叠状态
        const parentEl = e.target.closest(`.scratchCategoryId-${extId}`)
        if (parentEl) {
            isExpanded = !isExpanded
            document.body.setAttribute(
                EXPANDED_ATTR,
                isExpanded ? 'true' : 'false'
            )
        }
    }

    document.addEventListener('mousedown', onMouseDown, true)
    document.addEventListener('dblclick', onDblClick, true)

    // ============== 返回清理函数 ==============
    return function cleanupNestedCategory() {
        // patcher.patch 的还原由 extension.patcher.unpatchAll() 统一处理
        const oldStyle = document.getElementById(STYLE_ID)
        if (oldStyle) oldStyle.remove()
        document.removeEventListener('mousedown', onMouseDown, true)
        document.removeEventListener('dblclick', onDblClick, true)
    }
}
