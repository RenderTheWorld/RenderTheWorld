/**
 * @fileoverview
 * TurboWarp 外部资源静态获取工具
 *
 * 浏览器的 new URL() 和 fetch() 在处理数十兆字节长度的 data: URL 时容易崩溃。
 * 本模块提供无需经过浏览器 API 的 data: URL 静态解析能力，并附带 Base64 编解码工具。
 */

// 使用浏览器的内置 atob 和 btoa 函数
const atob = globalThis.atob
const btoa = globalThis.btoa

/**
 * Base64 编解码工具
 */
class Base64Util {
    /**
     * Convert a base64 encoded string to a Uint8Array.
     * @param {string} base64 - a base64 encoded string.
     * @return {Uint8Array} - a decoded Uint8Array.
     */
    static base64ToUint8Array(base64) {
        const binaryString = atob(base64)
        const len = binaryString.length
        const array = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
            array[i] = binaryString.charCodeAt(i)
        }
        return array
    }

    /**
     * Convert a Uint8Array to a base64 encoded string.
     * @param {Uint8Array|Array<number>} array - the array to convert.
     * @return {string} - the base64 encoded string.
     */
    static uint8ArrayToBase64(array) {
        let binary = ''
        const len = array.length
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(array[i])
        }
        return btoa(binary)
    }

    /**
     * Convert an array buffer to a base64 encoded string.
     * @param {ArrayBuffer} buffer - an array buffer to convert.
     * @return {string} - the base64 encoded string.
     */
    static arrayBufferToBase64(buffer) {
        return Base64Util.uint8ArrayToBase64(new Uint8Array(buffer))
    }
}

/**
 * 静态解析部分 data: URL，避免经过不可靠的浏览器 API。
 * @param {string} url
 * @returns {Response|null}
 */
const staticFetch = url => {
    try {
        const simpleDataUrlMatch = url.match(/^data:([/-\w\d]*);base64,/i)
        if (simpleDataUrlMatch) {
            const contentType = simpleDataUrlMatch[1].toLowerCase()
            const base64 = url.substring(simpleDataUrlMatch[0].length)
            const decoded = Base64Util.base64ToUint8Array(base64)
            return new Response(/** @type {ArrayBuffer} */ (decoded.buffer), {
                headers: {
                    'content-type': contentType,
                    'content-length': String(decoded.byteLength)
                }
            })
        }
    } catch (e) {
        // not robust enough yet to care about these errors
    }
    return null
}

export { Base64Util }
export default staticFetch
