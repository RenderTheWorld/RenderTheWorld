// ExtensionCore 仅用于 JSDoc 类型注解
// import ExtensionCore from '../core/extcore.js'
import { collectL10n } from '../blocks/index.js'

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
        descp: { 'zh-cn': '积木渲染世界', en: 'Render the world using blocks' }
    }

    // 从各积木分组收集翻译
    const blocksL10n = collectL10n()

    // 合并并转换为 FormatMessager 期望的格式：{ 'zh-cn': { key: value }, en: { key: value } }
    const merged = { 'zh-cn': {}, en: {} }
    const allEntries = { ...metaL10n, ...blocksL10n }

    for (const key in allEntries) {
        const entry = allEntries[key]
        if (!entry || typeof entry !== 'object') continue
        for (const lang of ['zh-cn', 'en']) {
            if (entry[lang]) {
                merged[lang][key] = entry[lang]
            }
        }
    }

    core.loadformat(merged)
    return core
}
