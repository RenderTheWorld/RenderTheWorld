// ExtensionCore 仅用于 JSDoc 类型注解
// import ExtensionCore from '../core/extcore.js'
import { collectL10n } from '../blocks/index.js'

/**
 * @typedef {import('../core/extcore.js').default} ExtensionCore
 */

/**
 * l10n 初始化
 *
 * 自动从各积木分组（BlockGroup.l10n()）收集翻译数据，
 * 同时附加扩展自身的元信息（名称/描述等）。
 *
 * @param {ExtensionCore} core - 扩展核心
 * @returns {ExtensionCore}
 */
export default function l10nInit(core) {
    // 扩展自身的元信息翻译
    const metaL10n = {
        name: { 'zh-cn': '渲染世界', en: 'Render The World' },
        descp: { 'zh-cn': '积木渲染世界', en: 'Render the world using blocks' },
        apidocs: { 'zh-cn': '📖API文档', en: '📖API Docs' }
    }

    // 从各积木分组收集翻译
    const blocksL10n = collectL10n()

    // 合并并转换为 FormatMessager 期望的格式：{ 'zh-cn': { key: value }, en: { key: value } }
    const l10n = { 'zh-cn': {}, en: {} }
    const allEntries = { ...metaL10n, ...blocksL10n }

    /**
     * 递归构建 l10n 对象，将嵌套结构转换为扁平化的点号路径
     * @param {Object} obj - 当前遍历的对象
     * @param {string} currentPath - 当前累积的路径
     */
    const buildL10n = (obj, currentPath) => {
        for (const key in obj) {
            const value = obj[key]

            if (key === 'zh-cn' || key === 'en') {
                if (!l10n[key]) l10n[key] = {}
                l10n[key][currentPath] = value
            } else if (typeof value === 'object' && value !== null) {
                const newPath = currentPath ? `${currentPath}.${key}` : key
                buildL10n(value, newPath)
            }
        }
    }

    buildL10n(allEntries, '')

    core.loadformat(l10n)
    return core
}
