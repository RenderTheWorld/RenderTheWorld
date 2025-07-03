class FormatMessager {
    constructor(default_lang='zh-cn') {
        this._format = {};
        this.default_lang = default_lang;
    }
    
    load(l10n = {}) {
        Object.keys(l10n).forEach(lang => {
            if (!this._format[lang]) {
                this._format[lang] = {};
            }
            if (l10n[lang]) {
                Object.assign(this._format[lang], l10n[lang]);
            }
        });
    }

    /**
     * @param {string} key
     * @param {string} [lang='zh-cn']
     * @returns {string}
     */
    translate(key, lang=this._format.default_lang) {
        return this._format[lang][key] || key;
    }
}

export default FormatMessager;
