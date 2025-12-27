import ExtensionCore from "../core/extcore";

/**
 * l10n Init
 * @param {ExtensionCore} core 
 */
export default function l10nInit(core) {
    ((info) => {
        const l10n = { 'zh-cn': {}, en: {} };

        const buildL10n = (obj, currentPath) => {
            for (const key in obj) {
                const value = obj[key];

                if (key === 'zh-cn' || key === 'en') {
                    if (!l10n[key]) l10n[key] = {};
                    l10n[key][currentPath] = value;
                }
                else if (typeof value === 'object' && value !== null) {
                    const newPath = currentPath ? `${currentPath}.${key}` : key;
                    buildL10n(value, newPath);
                }
            }
        };
        buildL10n(info, "");

        core.loadformat(l10n);
    })({
        "name": {
            "zh-cn": "渲染世界",
            "en": "Render The World"
        },
        "apidocs": {
            "zh-cn": "📖API文档",
            "en": "📖API Docs",
            "tooltip": {
                "zh-cn": "📖API文档",
                "en": "📖API Docs",
            }
        },
        "test": {
            "zh-cn": "测试",
            "en": "Test",
            "tooltip": {
                "zh-cn": "测试",
                "en": "Test",
            }
        },
    });

    return core;
}
