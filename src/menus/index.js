/**
 * 菜单聚合入口
 *
 * 在新版分组加载机制下，菜单由各 BlockGroup 子类在自己的 registerMenus() 中
 * 自行注册到 core，因此这里不再需要集中定义菜单。
 *
 * 保留此文件作为兼容入口；如需全局菜单可在此补充。
 */

/**
 * 加载所有菜单（分组机制下为空操作）
 * @param {Object} extension - 扩展实例
 * @param {Object} core - 扩展核心
 * @param {Function} translate - 翻译函数
 */
export function loadMenus() {
    // 菜单已由各 BlockGroup.registerMenus() 自行注册
    // 此函数保留作为兼容入口
}
