/**
 * 积木块定义模块
 */

/**
 * 获取所有积木定义
 * @param {Object} extension - 扩展实例
 * @param {Object} renderTheWorldInstance - RenderTheWorld 实例
 * @param {Object} BlockType - 积木类型枚举
 * @param {Function} translate - 翻译函数
 * @returns {Array} 积木配置数组
 */
export function getBlocks(extension, renderTheWorldInstance, BlockType, translate) {
    return [
        {
            // API 文档跳转按钮
            opcode: "apidocs",
            blockType: BlockType.BUTTON,
            text: translate('apidocs'),
            onClick: renderTheWorldInstance.docs.bind(renderTheWorldInstance),
        },
        {
            // 测试积木
            opcode: "test",
            blockType: BlockType.COMMAND,
            text: translate('test'),
            def: extension.test?.bind(extension),
        },
    ];
}

/**
 * 注册所有积木到核心
 * @param {Object} extension - 扩展实例
 * @param {Object} renderTheWorldInstance - RenderTheWorld 实例
 * @param {Object} core - 扩展核心
 * @param {Object} BlockType - 积木类型枚举
 * @param {Function} translate - 翻译函数
 */
export function loadBlocks(extension, renderTheWorldInstance, core, BlockType, translate) {
    core.cleanBlocks();
    
    const blocks = getBlocks(extension, renderTheWorldInstance, BlockType, translate);
    
    blocks.forEach(block => {
        core.registerBlock(block);
    });
    
    return blocks;
}