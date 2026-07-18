/**
 * By FurryR
 * Hijacks the Function.prototype.apply method.
 * @param {Function} fn - The function to execute while the apply method is hijacked.
 * @returns {*} The result of the function execution.
 */
function hijack(fn) {
    if (fn === undefined) return 0
    const _orig = Function.prototype.apply
    // eslint-disable-next-line no-extend-native
    Function.prototype.apply = thisArg => thisArg
    const result = fn()
    // eslint-disable-next-line no-extend-native
    Function.prototype.apply = _orig
    return result
}

/**
 * Retrieves the event listener from an event object.
 * @param {Event|Event[]} e - The event object or array of event objects.
 * @returns {Event} The event listener.
 */
function getEventListener(e) {
    return e instanceof Array ? e[e.length - 1] : e
}

/**
 * Retrieves ScratchBlocks from the runtime or window object.
 * @param {Runtime} runtime - The runtime object.
 * @returns {Object} The ScratchBlocks object.
 */
function getScratchBlocks(runtime) {
    // In Gandi, ScratchBlocks can be accessed from the runtime.
    // In TW, ScratchBlocks can be directly accessed from the window.

    return (
        hijack(getEventListener(runtime._events.EXTENSION_ADDED))
            ?.ScratchBlocks ||
        runtime.scratchBlocks ||
        window.Blockly?.getMainWorkspace()?.getScratchBlocks?.() ||
        window.ScratchBlocks
    )
}

/**
 * Retrieves VM from the runtime or window object.
 * @param {Runtime} runtime - The runtime object.
 * @returns {Object} The VM object.
 */
function getVM(runtime) {
    return (
        hijack(getEventListener(runtime._events['QUESTION'])).props.vm ||
        runtime.extensionManager.vm ||
        window.Scratch.vm
    )
}

export { getScratchBlocks, getVM }
