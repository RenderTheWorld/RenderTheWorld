/**
 * Gandi 资源文件类型工具
 *
 * 向 Gandi 文件编辑器注册自定义文件扩展名（OBJ/MTL/GLTF），
 * 使用户可以在文件编辑器中上传和管理这些类型的文件。
 */

/**
 * 注册自定义文件类型到 Gandi 文件编辑器
 *
 * @param {Object} ext - 扩展实例（需有 runtime 和 gandi 引用）
 * @param {string} name - 文件类型名称（如 'OBJ'）
 * @param {string} runtimeFormat - 运行时格式（文件扩展名，如 'obj'）
 * @param {string} [contentType='text/plain'] - MIME 类型
 */
function addFileType(ext, name, runtimeFormat, contentType = 'text/plain') {
    const storage = ext.runtime.storage
    if (!storage || !storage.AssetType) return

    storage.AssetType[name] = {
        contentType: contentType,
        name: name,
        runtimeFormat: runtimeFormat,
        immutable: true
    }

    // 注册到 Gandi 支持的文件类型列表
    const gandi = ext.gandi || ext.runtime.gandi
    if (gandi && Array.isArray(gandi.supportedAssetTypes)) {
        const exists = gandi.supportedAssetTypes.some(
            assetType => assetType.name === storage.AssetType[name].name
        )
        if (!exists) {
            gandi.supportedAssetTypes.push(storage.AssetType[name])
        }
    }
}

export { addFileType }
