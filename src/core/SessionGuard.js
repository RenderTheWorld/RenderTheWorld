/**
 * SessionGuard —— 会话保护器
 *
 * 替代旧版的 _init_porject_time 机制，用更优雅的方式解决：
 *   "快速点击绿旗时异步加载（OBJ/GLTF）回调可能在项目已重启后执行，导致模型重复添加"
 *
 * 原理：
 *   每次 init() / PROJECT_RUN_START 时递增 session 版本号，
 *   异步加载开始时记录当前版本号，回调执行时校验版本号是否一致。
 *   若不一致说明会话已变更（项目重启），直接丢弃回调。
 *
 * 优势：
 *   - 比 Date.now() 更精确（整数自增，无时钟漂移问题）
 *   - 语义清晰：isCurrent(sessionId) 比 initProjectTime === engine._initProjectTime 更易读
 *   - 集中管理：所有异步操作都通过 beginSession/isCurrent 统一校验
 */

class SessionGuard {
    constructor() {
        /** @type {number} 当前会话版本号 */
        this._version = 0
        /** @type {Set<number>} 活跃的会话 ID 集合（用于调试） */
        this._activeSessions = new Set()
    }

    /**
     * 开始新的会话（在 init / PROJECT_RUN_START 时调用）
     * @returns {number} 新的会话版本号
     */
    begin() {
        this._version++
        this._activeSessions.clear()
        this._activeSessions.add(this._version)
        return this._version
    }

    /**
     * 创建一个会话令牌（异步操作开始时调用）
     * @returns {number} 会话令牌（当前版本号）
     */
    createToken() {
        const token = this._version
        this._activeSessions.add(token)
        return token
    }

    /**
     * 校验会话令牌是否仍然有效
     * @param {number} token - 会话令牌
     * @returns {boolean}
     */
    isValid(token) {
        return token === this._version
    }

    /**
     * 作废一个会话令牌
     * @param {number} token
     */
    invalidate(token) {
        this._activeSessions.delete(token)
    }

    /**
     * 当前会话版本号
     * @returns {number}
     */
    get current() {
        return this._version
    }
}

export default SessionGuard
