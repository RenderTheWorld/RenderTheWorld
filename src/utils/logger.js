/**
 * 统一日志处理模块
 */
export default class Logger {
    /**
     * @param {import('scratch-vm').Runtime} runtime
     */
    constructor(runtime) {
        this.logSystem = runtime?.logSystem;
    }

    error(...args) {
        this.logSystem?.error(...args);
        console.error(...args);
    }

    warn(...args) {
        this.logSystem?.warn(...args);
        console.warn(...args);
    }

    info(...args) {
        this.logSystem?.info(...args);
        console.info(...args);
    }

    debug(...args) {
        this.logSystem?.debug(...args);
        console.debug(...args);
    }
}