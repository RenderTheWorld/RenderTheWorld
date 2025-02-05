function addFileType(ext, name, runtimeFormat, contentType = 'text/plain') {
    ext.runtime.storage.AssetType[name] = {
        contentType: contentType,
        name: name,
        runtimeFormat: runtimeFormat,
        immutable: true,
    };
    if (
        ext.gandi.supportedAssetTypes.filter(
            (assetType) =>
                assetType.name == ext.runtime.storage.AssetType[name].name,
        ).length === 0
    ) {
        ext.gandi.supportedAssetTypes.push(
            ext.runtime.storage.AssetType[name],
        );
    }
}

export {addFileType};