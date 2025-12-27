; (function (window, Scratch) {
    function hijack(fn) {
        const _orig = Function.prototype.apply
        Function.prototype.apply = function (thisArg) {
            return thisArg
        }
        const result = fn()
        Function.prototype.apply = _orig
        return result
    }

    const code = "console.log(Scratch.vm)"

    const runtime = Scratch.runtime
    let vm = undefined
    let Blockly = undefined
    if (runtime._events['QUESTION'] instanceof Array) {
        for (const value of runtime._events['QUESTION']) {
            const v = hijack(value)
            if (v?.props?.vm) {
                vm = v?.props?.vm
                break
            }
        }
    } else if (runtime._events['QUESTION']) {
        vm = hijack(runtime._events['QUESTION'])?.props?.vm
    }
    if (!vm) throw new Error('tw2ccw cannot get Virtual Machine instance.')
    if (vm._events['EXTENSION_ADDED'] instanceof Array) {
        for (const value of vm._events['EXTENSION_ADDED']) {
            const v = hijack(value)
            if (v?.ScratchBlocks) {
                Blockly = v?.ScratchBlocks
                break
            }
        }
    } else if (vm._events['EXTENSION_ADDED']) {
        Blockly = hijack(vm._events['EXTENSION_ADDED'])?.ScratchBlocks
    }

    // start construction
    let registerResult = {}
    const scratchInstance = new Proxy(Scratch, {
        get(target, property) {
            if (property === 'vm') {
                return vm
            } else if (property === 'renderer') {
                return vm.runtime.renderer
            } else if (property === 'gui') {
                return {
                    getBlockly: () => Promise.resolve(Blockly ?? new Promise(() => { })),
                    getBlocklyEagerly: () => {
                        throw new Error('Not implemented')
                    }
                }
            }
            return Reflect.get(target, property)
        }
    })
    const windowProxy = new Proxy(window, {
        get(target, property) {
            if (property === 'Scratch') {
                return scratchInstance
            }
            if (property === 'ScratchBlocks') {
                return Blockly
            }
            const v = Reflect.get(target, property)
            if (typeof v === 'function') {
                return new Proxy(v, {
                    apply(target, thisArg, argArray) {
                        return Reflect.apply(
                            target,
                            thisArg === windowProxy ? window : thisArg,
                            argArray
                        )
                    }
                })
            }
            return v
        },
        has(target, property) {
            if (property === 'Scratch' || property === 'ScratchBlocks') return true
            return Reflect.has(target, property)
        }
    })

    class Extension {
        constructor(runtime) { }

        getInfo() {
            return {
                id: '$$test|runow|test$$',
                name: '测试',
                blocks: [
                    {
                        opcode: 'runjs',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Run JS Code: [code]',
                        arguments: {
                            code: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'console.log("Hello, World!")',
                            }
                        }
                    }
                ],
            }
        }

        runjs({ code }) {
            return (new Function('Scratch', 'ScratchBlocks', 'window', code))(scratchInstance, Blockly, windowProxy)
        }
    }
    Scratch.extensions.register(new Extension(runtime))
})(window, Scratch)
