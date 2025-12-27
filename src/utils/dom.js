/**
 * DOM Utilities - 封装 DOM 操作
 * 提供统一的接口来创建元素、操作样式等
 */
class DOMUtils {
    /**
     * 创建 Canvas 元素
     * @param {number} width
     * @param {number} height
     * @param {boolean} hidden - 是否隐藏
     * @returns {HTMLCanvasElement}
     */
    createCanvas(width, height, hidden = true) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        if (hidden) {
            canvas.style.display = 'none';
        }
        return canvas;
    }

    /**
     * 将元素添加到父元素
     * @param {HTMLElement} element
     * @param {HTMLElement} parent
     */
    appendTo(element, parent) {
        if (parent) {
            parent.appendChild(element);
        }
    }

    /**
     * 创建样式元素并添加到文档头
     * @param {string} cssText - CSS 文本
     * @param {string} id - 样式元素 ID
     * @returns {HTMLStyleElement}
     */
    createAndAppendStyle(cssText, id) {
        let styleElement = document.getElementById(id);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.id = id;
            document.head.appendChild(styleElement);
        }
        styleElement.appendChild(document.createTextNode(cssText));
        return styleElement;
    }

    /**
     * 创建链接元素并触发下载
     * @param {string} url
     * @param {string} filename
     */
    triggerDownload(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    /**
     * 打开新窗口
     * @param {string} url
     * @param {string} features
     * @returns {Window|null}
     */
    openWindow(url, features = '') {
        const baseFeatures = 'noreferrer';
        const finalFeatures = features ? `${baseFeatures},${features}` : baseFeatures;
        return window.open(url, '_blank', finalFeatures);
    }

    /**
     * 设置全局变量（仅在开发模式下）
     * @param {string} key
     * @param {*} value
     * @param {boolean} isDev - 是否开发模式
     */
    setGlobal(key, value, isDev = false) {
        if (isDev && typeof globalThis !== 'undefined') {
            globalThis[key] = value;
        }
    }

    /**
     * 获取全局变量
     * @param {string} key
     * @returns {*}
     */
    getGlobal(key) {
        return typeof globalThis !== 'undefined' ? globalThis[key] : undefined;
    }
}

export default DOMUtils;