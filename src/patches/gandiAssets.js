/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/**
 * Gandi 资源文件补丁
 *
 * 1. 向 Gandi 文件编辑器注册自定义文件扩展名（OBJ/MTL/GLTF）
 * 2. 监听 GANDI_ASSET_UPDATE 事件，确保文件上传后 assetType 正确赋值
 * 3. 提供动态菜单供积木选择 Gandi 资源文件
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

/**
 * 注册 Gandi 自定义文件类型（OBJ/MTL/GLTF）到文件编辑器
 *
 * @param {Object} extension - RenderTheWorld 实例
 * @returns {() => void} 清理函数
 */
export function setupGandiFileTypes(extension) {
    const runtime = extension.runtime
    if (!runtime?.gandi || !runtime?.storage) return () => {}

    extension.gandi = runtime.gandi

    addFileType(extension, 'OBJ', 'obj')
    addFileType(extension, 'MTL', 'mtl')
    addFileType(extension, 'GLTF', 'gltf')

    const onAssetUpdate = ({ data }) => {
        const assetType = runtime.storage.AssetType
        const formats = [
            assetType.OBJ?.runtimeFormat,
            assetType.MTL?.runtimeFormat,
            assetType.GLTF?.runtimeFormat
        ].filter(Boolean)
        if (!formats.includes(data?.dataFormat)) return

        try {
            runtime.getGandiAssetsFileList().forEach(file => {
                if (file.dataFormat === assetType.OBJ.runtimeFormat) {
                    const f = runtime.getGandiAssetFile(file.fullName)
                    f.assetType = f.asset.assetType = assetType.OBJ
                } else if (file.dataFormat === assetType.MTL.runtimeFormat) {
                    const f = runtime.getGandiAssetFile(file.fullName)
                    f.assetType = f.asset.assetType = assetType.MTL
                } else if (file.dataFormat === assetType.GLTF.runtimeFormat) {
                    const f = runtime.getGandiAssetFile(file.fullName)
                    f.assetType = f.asset.assetType = assetType.GLTF
                }
            })
        } catch {
            /* 忽略 */
        }
    }

    runtime.on('GANDI_ASSET_UPDATE', onAssetUpdate)

    return () => {
        runtime.off('GANDI_ASSET_UPDATE', onAssetUpdate)
    }
}

/**
 * 设置 Gandi 资源文件动态菜单
 *
 * @param {Object} extension - RenderTheWorld 实例
 */
export function setupGandiAssetMenus(extension) {
    const getPlaceholder = () => {
        const text =
            typeof extension.$formatMessage === 'function'
                ? extension.$formatMessage('fileListEmpty')
                : '没有文件'
        return [{ text, value: 'fileListEmpty' }]
    }

    const getFileList = names => {
        const runtime = extension.runtime
        if (!runtime?.getGandiAssetsFileList) return getPlaceholder()
        let list = []
        names.forEach(name => {
            try {
                const items = runtime
                    .getGandiAssetsFileList(name)
                    .map(item => ({
                        text: item.fullName,
                        value: item.fullName
                    }))
                list = list.concat(items)
            } catch {
                /* 忽略个别扩展名查询失败 */
            }
        })
        return list.length > 0 ? list : getPlaceholder()
    }

    extension.__gandiAssetsObjFileList = () => getFileList(['obj', 'json'])
    extension.__gandiAssetsMtlFileList = () => getFileList(['mtl', 'json'])
    extension.__gandiAssetsGltfFileList = () => getFileList(['gltf', 'json'])
}
