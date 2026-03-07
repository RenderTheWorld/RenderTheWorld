/**
 * 菜单定义模块
 */

/**
 * 加载所有菜单
 * @param {Object} extension - 扩展实例
 * @param {Object} core - 扩展核心
 * @param {Function} translate - 翻译函数
 */
export function loadMenus(extension, core, translate) {
    core.cleanMenus();
    
    // 如需启用菜单，取消下方注释
    // core.registerMenu('xyz', {
    //     acceptReporters: false,
    //     items: [
    //         { text: translate('xyz.x'), value: 'x' },
    //         { text: translate('xyz.y'), value: 'y' },
    //         { text: translate('xyz.z'), value: 'z' },
    //     ],
    // });
}