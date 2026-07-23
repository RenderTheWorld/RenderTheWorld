// Name: Swift JSON (JSON and Array)
// ID: CCWSPjson
// Description: Super Fast JSON and Array Extension.
// By: SharkPool
// Licence: MIT

// Version V.1.2.08

;(function (Scratch) {
    'use strict'
    if (!Scratch.extensions.unsandboxed)
        throw new Error('Swift JSON must run unsandboxed!')

    const menuIconURI =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4My4yMjciIGhlaWdodD0iODMuMjI3IiB2aWV3Qm94PSIwIDAgODMuMjI3IDgzLjIyNyI+PHBhdGggZD0iTTAgNDEuNjE0QzAgMTguNjMxIDE4LjYzMSAwIDQxLjYxNCAwczQxLjYxNCAxOC42MzEgNDEuNjE0IDQxLjYxNC0xOC42MzEgNDEuNjE0LTQxLjYxNCA0MS42MTRTMCA2NC41OTcgMCA0MS42MTQiIGZpbGw9IiM1MTYxYTYiLz48cGF0aCBkPSJNNC4zNDQgNDEuNjE0YzAtMjAuNTcgMTYuNjg3LTM3LjI3IDM3LjI3LTM3LjI3czM3LjI3IDE2LjY4NyAzNy4yNyAzNy4yNy0xNS43ODMgMzcuMjctMzcuMjcgMzcuMjctMzcuMjctMTYuNy0zNy4yNy0zNy4yNyIgZmlsbD0iIzc0OGJlZSIvPjxwYXRoIGQ9Ik0zNi43OTggNjQuMjk0YTIuMTk1IDIuMTk1IDAgMCAxLTIuMTk1IDIuMTk0SDI4Ljc1YTUuMTI3IDUuMTI3IDAgMCAxLTUuMTItNS4xMlY1MC4xNjNsLTYuNDk3LTYuOTk3YTIuMTk1IDIuMTk1IDAgMCAxIDAtMy4xMDRsNi40OTYtNi45OTdWMjEuODYxYTUuMTI3IDUuMTI3IDAgMCAxIDUuMTIxLTUuMTIxaDUuODUzYTIuMTk1IDIuMTk1IDAgMSAxIDAgNC4zOUgyOC43NWEuNzMuNzMgMCAwIDAtLjczMS43M3YxMi4xMTRjMCAuNTgzLS4yMzEgMS4xNC0uNjQzIDEuNTUybC01LjU4OCA2LjA4OCA1LjU4OCA2LjA4OGMuNDEyLjQxMS42NDMuOTcuNjQzIDEuNTUydjEyLjExM2MwIC40MDMuMzI4LjczMi43MzEuNzMyaDUuODUzYzEuMjEyIDAgMi4xOTUuOTgyIDIuMTk1IDIuMTk0eiIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjZmZmIi8+PHBhdGggZD0iTTM3LjAxOCA2NC4yOTRhMi4xOTUgMi4xOTUgMCAwIDEtMi4xOTUgMi4xOTRoLTUuODUyYTUuMTI3IDUuMTI3IDAgMCAxLTUuMTIyLTUuMTJWNTAuMTYzbC02LjQ5Ni02Ljk5N2EyLjE5NSAyLjE5NSAwIDAgMSAwLTMuMTA0bDYuNDk2LTYuOTk3VjIxLjg2MWE1LjEyNyA1LjEyNyAwIDAgMSA1LjEyMS01LjEyMWg1Ljg1M2EyLjE5NSAyLjE5NSAwIDEgMSAwIDQuMzloLTUuODUyYS43My43MyAwIDAgMC0uNzMyLjczdjEyLjExNGMwIC41ODMtLjIzMSAxLjE0LS42NDMgMS41NTJsLTUuNTg4IDYuMDg4IDUuNTg4IDYuMDg4Yy40MTIuNDExLjY0My45Ny42NDMgMS41NTJ2MTIuMTEzYzAgLjQwMy4zMjguNzMyLjczMS43MzJoNS44NTNjMS4yMTIgMCAyLjE5NS45ODIgMi4xOTUgMi4xOTR6bTExLjM4Ni0yLjE5NWg1Ljg1M2EuNzMuNzMgMCAwIDAgLjczMi0uNzMyVjQ5LjI1NGMwLS41ODMuMjMxLTEuMTQuNjQzLTEuNTUybDUuNTg4LTYuMDg4LTUuNTg4LTYuMDg4YTIuMiAyLjIgMCAwIDEtLjY0My0xLjU1MlYyMS44NjFhLjczLjczIDAgMCAwLS43MzItLjczMmgtNS44NTJhMi4xOTUgMi4xOTUgMCAwIDEgMC00LjM5aDUuODUyYTUuMTI3IDUuMTI3IDAgMCAxIDUuMTIyIDUuMTIydjExLjIwNGw2LjQ5NiA2Ljk5N2EyLjE5NSAyLjE5NSAwIDAgMSAwIDMuMTA0bC02LjQ5NiA2Ljk5N3YxMS4yMDRhNS4xMjcgNS4xMjcgMCAwIDEtNS4xMjIgNS4xMjFoLTUuODUyYTIuMTk1IDIuMTk1IDAgMCAxIDAtNC4zOXoiIGZpbGw9IiNmZmYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyLjUiLz48L3N2Zz4='

    const arrowURI =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNS44OTMiIGhlaWdodD0iMTUuODkzIiB2aWV3Qm94PSIwIDAgMTUuODkzIDE1Ljg5MyI+PHBhdGggZD0iTTkuMDIxIDEyLjI5NHYtMi4xMDdsLTYuODM5LS45MDVDMS4zOTggOS4xODQuODQ2IDguNDg2Ljk2MiA3LjcyN2MuMDktLjYxMi42MDMtMS4wOSAxLjIyLTEuMTY0bDYuODM5LS45MDVWMy42YzAtLjU4Ni43MzItLjg2OSAxLjE1Ni0uNDY0bDQuNTc2IDQuMzQ1YS42NDMuNjQzIDAgMCAxIDAgLjkxOGwtNC41NzYgNC4zNmMtLjQyNC40MDQtMS4xNTYuMTEtMS4xNTYtLjQ2NSIgZmlsbD0ibm9uZSIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNzUiLz48cGF0aCBkPSJNOS4wMjEgMTIuMjk0di0yLjEwN2wtNi44MzktLjkwNUMxLjM5OCA5LjE4NC44NDYgOC40ODYuOTYyIDcuNzI3Yy4wOS0uNjEyLjYwMy0xLjA5IDEuMjItMS4xNjRsNi44MzktLjkwNVYzLjZjMC0uNTg2LjczMi0uODY5IDEuMTU2LS40NjRsNC41NzYgNC4zNDVhLjY0My42NDMgMCAwIDEgMCAuOTE4bC00LjU3NiA0LjM2Yy0uNDI0LjQwNC0xLjE1Ni4xMS0xLjE1Ni0uNDY1IiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNMCAxNS44OTJWMGgxNS44OTJ2MTUuODkyeiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg=='

    const Cast = Scratch.Cast
    const vm = Scratch.runtime.extensionManager.vm
    const runtime = vm.runtime
    const isPM = Scratch.extensions.isPenguinMo

    if (!Scratch.BlockShape) {
        Scratch.BlockShape = {
            HEXAGONAL: 1,
            ROUND: 2,
            SQUARE: 3
        }
    }

    const OBJ_SHAPE = isPM ? Scratch.BlockShape.PLUS : Scratch.BlockShape.ROUND
    const ARR_SHAPE = Scratch.BlockShape.SQUARE

    const DEFAULT_ARGS = {
        obj: `{"key": "value"}`,
        arr1: `["a", "b", "c"]`,
        arr2: `["a", "b", "b", "a"]`,
        arr3: `["a", "b"]`
    }

    let extContext

    /* extension utilities */
    const genArgument = (type, value) => {
        return {
            type: Scratch.ArgumentType.STRING,
            exemptFromNormalization: true,
            shape:
                type === 'arr'
                    ? ARR_SHAPE
                    : runtime.pmVersion
                      ? OBJ_SHAPE
                      : 'CCWSPjson_objShape',
            defaultValue: value
        }
    }

    const genRegenReporter = (opcode, text) => {
        return {
            opcode,
            text,
            blockType: Scratch.BlockType.REPORTER,
            color1: '#677cd6',
            hideFromPalette: true,
            allowDropAnywhere: true,
            canDragDuplicate: true
        }
    }

    const genXML = blockJSON => {
        let xmlBlock = `<block type="CCWSPjson_${blockJSON.opcode}">`
        for (const [name, arg] of Object.entries(blockJSON.arguments)) {
            if (name === 'IMG' || name === 'BOOL') continue

            if (arg.menu)
                xmlBlock += `<field name="${name}">${arg.defaultValue ?? ''}</field>`
            else {
                const type = arg.type === 'number' ? 'math_number' : 'text'
                const fieldType = arg.type === 'number' ? 'NUM' : 'TEXT'

                xmlBlock += `<value name="${name}"><shadow type="`
                if (arg.fillIn) xmlBlock += `CCWSPjson_${arg.fillIn}">`
                else
                    xmlBlock +=
                        type +
                        `"><field name="${fieldType}">${arg.defaultValue ?? ''}</field>`
                xmlBlock += '</shadow></value>'
            }
        }
        xmlBlock += '</block>'

        return [
            blockJSON,
            {
                blockType: Scratch.BlockType.XML,
                xml: xmlBlock
            }
        ]
    }

    const hasOwn = (obj, prop) =>
        Object.prototype.hasOwnProperty.call(obj, prop)

    const resolveCircular = obj => {
        const seen = new WeakSet()
        const detect = (val, parent, key) => {
            if (val && typeof val === 'object') {
                if (seen.has(val)) {
                    parent[key] = Array.isArray(val) ? '[...]' : '{...}'
                    return
                }

                seen.add(val)
                for (let k in val) {
                    if (hasOwn(val, k)) detect(val[k], val, k)
                }
            }
        }

        detect(obj)
        return obj
    }

    // Fix potential recursive objects in Penguinmod
    vm.on('SERIALIZE', () => {
        for (const target of runtime.targets) {
            const variables = Object.values(target.variables)
            for (const variable of variables) resolveCircular(variable.value)
        }
    })

    /* Blockly */
    ;(() => Promise.resolve(runtime.scratchBlocks))().then(SB => {
        if (isPM) {
            // TODO remove me on penguinmod port
            // custom object shape (penguinmod)
            if (!runtime.pmVersion)
                SB.BlockSvg.registerCustomShape('CCWSPjson_objShape', {
                    emptyInputPath: 'm 0 0 z',
                    emptyInputWidth: 0, // unused
                    leftPath: block => {
                        if (block.isShadow_) {
                            const offset = block.edgeShapeWidth_ - 11
                            const height = block.edgeShapeWidth_ - 16
                            return [
                                `l ${-offset} 0 c -11 0 -1 ${-11 - height} -11 ${-11 - height}`,
                                `c -4 0 -4 -9 0 -9 c 10 0 0 ${-12 - height} 11 ${-12 - height}`
                            ]
                        } else {
                            const steps = []
                            block.edgeShape_ = OBJ_SHAPE
                            block.renderDrawLeft_(steps, 0)
                            return [steps[1]]
                        }
                    },
                    rightPath: block => {
                        if (block.isShadow_) {
                            const offset = block.edgeShapeWidth_ - 11
                            const height = block.edgeShapeWidth_ - 16
                            return [
                                `l ${offset} 0 c 11 0 1 ${11 + height} 11 ${11 + height}`,
                                `c 4 0 4 9 0 9`,
                                `c -10 0 0 ${12 + height} -11 ${12 + height} l ${-offset} 0`
                            ]
                        } else {
                            const steps = []
                            block.edgeShape_ = OBJ_SHAPE
                            block.renderDrawRight_(steps, 0)
                            return [steps[0]]
                        }
                    },
                    blockPadding: {
                        internal: {},
                        external: SB.BlockSvg.SHAPE_IN_SHAPE_PADDING[5]
                    }
                })
            SB.BlockSvg.SHAPE_IN_SHAPE_PADDING[3]['custom-CCWSPjson_objShape'] =
                10
        } else {
            /* turbowarp support */
            // regenerated reporters
            const regenReporters = [
                'CCWSPjson_objKey',
                'CCWSPjson_objValue',
                'CCWSPjson_arrIndex',
                'CCWSPjson_arrValueA',
                'CCWSPjson_arrValueB',
                'CCWSPjson_arrAccum'
            ]

            const ogCheck = SB.scratchBlocksUtils.isShadowArgumentReporter
            SB.scratchBlocksUtils.isShadowArgumentReporter = function (block) {
                const result = ogCheck(block)
                if (result) return true
                return block.isShadow() && regenReporters.includes(block.type)
            }

            // custom object shape
            const jsonBlocks = [
                'objValid',
                'jsonBuilder',
                'getKey',
                'getPath',
                'setKey',
                'setPath',
                'deleteKey',
                'jsonSize',
                'keyIndex',
                'getEntry',
                'extractJson',
                'mergeJson',
                'jsonMap',
                'jsonMake',
                'objBlank'
            ]
            const ignoreOuter = [
                'getKey',
                'getPath',
                'jsonSize',
                'jsonValid',
                'objValid',
                'extractJson'
            ]

            const makeShape = width => {
                width -= 35
                return `
          m20 0h${width}C${width + 30} 0 ${width + 30} 4 ${width + 30} 12
          c0 0 2 0 3 0 1 0 3 2 3 3 0 1 0 8 0 10 0 2-1 3-3 3-2 0-3 0-3 0
          C${width + 30} 37 ${width + 30} 40 ${width + 20} 40h${(width + 10) * -1}
          C5 40 5 36 4 28c0 0-1 0-2 0-2 0-3-1-3-3l0-10c0 0 0-3 4-3 0 0 1 0 1 0C5 4 5 0 10 0z
        `
                    .replaceAll('\n', '')
                    .trim()
            }

            const ogRender = SB.BlockSvg.prototype.render
            SB.BlockSvg.prototype.render = function (...args) {
                const data = ogRender.call(this, ...args)

                const type = this.type.split('_')[1] ?? ''
                if (this.svgPath_ && jsonBlocks.includes(type)) {
                    if (!ignoreOuter.includes(type)) {
                        const fixedWidth = this.width - 35
                        this.svgPath_.setAttribute(
                            'transform',
                            `scale(1, ${this.height / 40})`
                        )
                        this.svgPath_.setAttribute('d', makeShape(this.width))
                    }
                    this.inputList.forEach(input => {
                        if (input.name.startsWith('OBJ')) {
                            const block = input.connection.targetBlock()
                            if (
                                block &&
                                block.type === 'text' &&
                                block.svgPath_
                            ) {
                                block.svgPath_.setAttribute(
                                    'transform',
                                    `scale(1, ${block.height / 40})`
                                )
                                block.svgPath_.setAttribute(
                                    'd',
                                    makeShape(block.width)
                                )
                            }
                        }
                    })
                }
                return data
            }
        }
    })

    /* GUI */
    // if (isPM) {
    // Stringify raw JSON in reporters
    const ogVisReport = runtime.visualReport
    runtime.visualReport = function (...args) {
        const valueArg = runtime.pmVersion ? 2 : 1 // Modern runtime has an extra argument
        const value = args[valueArg]
        if (
            value &&
            (value.constructor?.name === 'Object' ||
                value.constructor?.name === 'Array')
        ) {
            args[valueArg] = JSON.stringify(resolveCircular(value))
        }

        return ogVisReport.call(this, ...args)
    }
    // }

    /* Compiler */
    function getCompiler() {
        if (vm.exports.i_will_not_ask_for_help_when_these_break)
            return vm.exports.i_will_not_ask_for_help_when_these_break()
        else if (vm.exports.JSGenerator && vm.exports.IRGenerator?.exports)
            return {
                ...vm.exports,
                ScriptTreeGenerator:
                    vm.exports.IRGenerator.exports.ScriptTreeGenerator
            }
    }
    const compiler = getCompiler()
    if (compiler) {
        const { JSGenerator, ScriptTreeGenerator } = compiler
        const exp = JSGenerator.exports
            ? JSGenerator.exports
            : JSGenerator.unstable_exports

        /* IRGen Helpers */
        let irContext
        const createIR = (block, type, inputs) => {
            const obj = {
                kind: 'CCWSPjson.' + type
            }

            for (let i = 0; i < inputs.length; i += 2) {
                const irName = inputs[i]
                const bName = inputs[i + 1]
                obj[irName] = irContext.descendInputOfBlock(block, bName)
            }

            return obj
        }

        /* JSGen Helpers */
        const OBJ_UTIL = 'CCWSPjsonUtil'
        const VAR_PREFIX = 'spJ'

        // we cant use 'this.localVariables.next()' because of mutable json and procedure scope issues
        let varCount = 0
        const nextLocalVar = () => VAR_PREFIX + varCount++

        runtime.on('PROJECT_START', () => (varCount = 0))
        runtime.on('PROJECT_STOP_ALL', () => (varCount = 0))

        const _safeReturn = type => {
            return `(typeof ${type} === "undefined" ? "":${type})`
        }

        const _preventACE = imminentObj => {
            if (extContext._preventUnsafeAce) {
                return `(prop = ${imminentObj}, propType = prop?.constructor?.name, typeof prop === "object"? prop.customId || propType === "Object" || propType === "Array" ? prop : "" : prop)`
            }
            return imminentObj
        }

        const _objParser = test => {
            return extContext.alwaysTryParse
                ? OBJ_UTIL + '.parseO(' + test + ')'
                : test
        }
        const _arrParser = test => {
            return extContext.alwaysTryParse
                ? OBJ_UTIL + '.parseA(' + test + ')'
                : test
        }
        const _anyParser = test => {
            return extContext.alwaysTryParse
                ? OBJ_UTIL + '.parse(' + test + ')'
                : test
        }

        const _safeCast = value => {
            if (extContext.alwaysCast) return `${OBJ_UTIL}.safeCast(${value})`
            else return value
        }

        const insertParser = type => {
            const defaultVal = type === null ? 'o' : type === 0 ? '{}' : '[]'
            let script = '(function(o) {\n'

            // raw values
            const rawValue =
                extContext.useNewObj && extContext.alwaysTryParse
                    ? `${OBJ_UTIL}.safeCopy(o)`
                    : 'o'

            if (type === null)
                script += `if (typeof o === "object") return ${rawValue};`
            else if (type === 0)
                script += `if (typeof o === "object" && !Array.isArray(o)) return ${rawValue};`
            else script += `if (Array.isArray(o)) return ${rawValue};`

            // parser
            script += `try{`
            if (type === null) script += `return JSON.parse(o);`
            else
                script += `let p;return (p = JSON.parse(o)) && ${type === 0 ? '!' : ''}Array.isArray(p) ? p : ${defaultVal};`
            script += `}catch{return ${defaultVal}}`
            script += '}),'
            return script
        }

        const insertArrayFreqSort = () => {
            let script = 'freqSort: (function(spA,isComm) {\n'
            script +=
                'const map = {};spA.forEach(i => {map[i] = (map[i] || 0) + 1});\n'
            script +=
                'if (isComm) return spA.sort((a, b) => map[b] - map[a] || spA.indexOf(a) - spA.indexOf(b));\n'
            script +=
                'else return spA.sort((a, b) => map[a] - map[b] || spA.indexOf(a) - spA.indexOf(b));\n'
            script += '}),\n'
            return script
        }

        // Instead of reusing the helpers, just inject them for reuse in the script
        let currentCompiler = compiler
        if (vm.exports.these_broke_before_and_will_break_again) {
            // handle the new compiler's 'createScriptFactory'
            currentCompiler =
                vm.exports.these_broke_before_and_will_break_again()
        }
        const _ogCreateScriptFactory =
            currentCompiler.JSGenerator.prototype.createScriptFactory
        currentCompiler.JSGenerator.prototype.createScriptFactory = function (
            ...args
        ) {
            let utilObj = 'const ' + OBJ_UTIL + ' = {\n'
            utilObj += 'parse: ' + insertParser(null)
            utilObj += 'parseO: ' + insertParser(0)
            utilObj += 'parseA: ' + insertParser(1)
            utilObj += `safeCast: (function(val) {\nreturn typeof val === "object" ? val : (isNaN(val) || val === Infinity || val === -Infinity) ? "" + val : val;\n}),\n`
            utilObj +=
                'hasOwn: (function(obj, prop) {\nreturn Object.prototype.hasOwnProperty.call(obj,prop)\n}),\n'
            utilObj += `safeCopy: (function(obj) {\ntry { return structuredClone(obj) } catch { return obj }\n}),\n`
            utilObj += insertArrayFreqSort()
            utilObj += '};\n'

            this.source = utilObj + this.source
            return _ogCreateScriptFactory.call(this, ...args)
        }

        const _ogIRdescendStack =
            ScriptTreeGenerator.prototype.descendStackedBlock
        ScriptTreeGenerator.prototype.descendStackedBlock = function (block) {
            switch (block.opcode) {
                case 'CCWSPjson_forEach':
                    this.analyzeLoop()
                    return {
                        kind: 'CCWSPjson.forEach',
                        obj: this.descendInputOfBlock(block, 'OBJ'),
                        branch: this.descendSubstack(block, 'SUBSTACK')
                    }
                case 'CCWSPjson_doInput': {
                    const command = this.descendInputOfBlock(block, 'THING')
                    return { kind: 'CCWSPjson.do', command }
                }
                default:
                    return _ogIRdescendStack.call(this, block)
            }
        }
        const _ogJSdescendStack = JSGenerator.prototype.descendStackedBlock
        JSGenerator.prototype.descendStackedBlock = function (node) {
            switch (node.kind) {
                case 'CCWSPjson.forEach':
                    const obj = this.descendInput(node.obj).asUnknown()
                    const objVar = this.localVariables.next()
                    const isArray = this.localVariables.next()
                    const i = this.localVariables.next()

                    this.source += `let ${objVar} = ${_anyParser(obj)};\n`
                    this.source += `const ${isArray} = Array.isArray(${objVar});\n`
                    this.source += `${objVar} = Object.entries(${objVar})\n;`
                    this.source += `for (let ${i} = 0; ${i} < ${objVar}.length; ${i}++) {;\n`
                    this.source += `let [SPobjK, SPobjV] = ${objVar}[${i}];\n`
                    this.source += `if (${isArray}) SPobjK++\n`
                    this.descendStack(node.branch, new exp.Frame(true))
                    this.yieldLoop()
                    this.source += `}\n`
                    break
                case 'CCWSPjson.do':
                    // literally only used to run reporters as commands
                    this.source += `(${this.descendInput(node.command).asUnknown()});\n`
                    break
                default:
                    return _ogJSdescendStack.call(this, node)
            }
        }

        const _ogIRdescendInp = ScriptTreeGenerator.prototype.descendInput
        ScriptTreeGenerator.prototype.descendInput = function (block) {
            irContext = this

            switch (block.opcode) {
                case 'CCWSPjson_arrValueA':
                    return { kind: 'CCWSPjson.arrValA' }
                case 'CCWSPjson_arrValueB':
                    return { kind: 'CCWSPjson.arrValB' }
                case 'CCWSPjson_arrIndex':
                    return { kind: 'CCWSPjson.arrIndex' }
                case 'CCWSPjson_objKey':
                    return { kind: 'CCWSPjson.objKey' }
                case 'CCWSPjson_objValue':
                    return { kind: 'CCWSPjson.objVal' }
                case 'CCWSPjson_arrAccum':
                    return { kind: 'CCWSPjson.arrAccum' }
                /* Objects */
                case 'CCWSPjson_objBlank':
                    return { kind: 'CCWSPjson.obj' }
                case 'CCWSPjson_objValid':
                    return createIR(block, 'isObj', ['obj', 'OBJ'])
                case 'CCWSPjson_jsonBuilder':
                    return createIR(block, 'jsonBuild', [
                        'key',
                        'KEY',
                        'val',
                        'VAL'
                    ])
                case 'CCWSPjson_getKey':
                    return createIR(block, 'getKey', [
                        'obj',
                        'OBJ',
                        'key',
                        'KEY'
                    ])
                case 'CCWSPjson_getPath':
                    return createIR(block, 'getPath', [
                        'obj',
                        'OBJ',
                        'path',
                        'PATH'
                    ])
                case 'CCWSPjson_setKey':
                    return createIR(block, 'setKey', [
                        'obj',
                        'OBJ',
                        'key',
                        'KEY',
                        'val',
                        'VAL'
                    ])
                case 'CCWSPjson_setPath':
                    return createIR(block, 'setPath', [
                        'obj',
                        'OBJ',
                        'path',
                        'PATH',
                        'val',
                        'VAL'
                    ])
                case 'CCWSPjson_deleteKey':
                    return createIR(block, 'deleteKey', [
                        'obj',
                        'OBJ',
                        'key',
                        'KEY'
                    ])
                case 'CCWSPjson_jsonSize':
                    return createIR(block, 'objSize', ['obj', 'OBJ'])
                case 'CCWSPjson_getEntry':
                    return createIR(block, 'getEntry', [
                        'obj',
                        'OBJ',
                        'key',
                        'KEY'
                    ])
                case 'CCWSPjson_extractJson':
                    return createIR(block, 'extractObj', [
                        'obj',
                        'OBJ',
                        'type',
                        'TYPE'
                    ])
                case 'CCWSPjson_mergeJson':
                    return createIR(block, 'mergeObj', [
                        'obj1',
                        'OBJ1',
                        'obj2',
                        'OBJ2'
                    ])
                case 'CCWSPjson_jsonMake':
                    return createIR(block, 'jsonMake', [
                        'txt',
                        'TXT',
                        'split',
                        'SPLIT',
                        'delim',
                        'DELIM'
                    ])
                case 'CCWSPjson_jsonMap':
                    return createIR(block, 'jsonMap', [
                        'obj',
                        'OBJ',
                        'value',
                        'VALUE'
                    ])
                /* Arrays */
                case 'CCWSPjson_arrBlank':
                    return createIR(block, 'arr', [])
                case 'CCWSPjson_arrValid':
                    return createIR(block, 'arrValid', ['arr', 'ARR'])
                case 'CCWSPjson_arrBuilder':
                    return createIR(block, 'arrBuilder', ['val', 'VAL'])
                case 'CCWSPjson_arrAdd':
                    return createIR(block, 'arrAdd', [
                        'arr',
                        'ARR',
                        'item',
                        'ITEM'
                    ])
                case 'CCWSPjson_arrInsert':
                    return createIR(block, 'arrInsert', [
                        'arr',
                        'ARR',
                        'ind',
                        'IND',
                        'item',
                        'ITEM'
                    ])
                case 'CCWSPjson_arrReplace':
                    return createIR(block, 'arrReplace', [
                        'arr',
                        'ARR',
                        'ind',
                        'IND',
                        'item',
                        'ITEM'
                    ])
                case 'CCWSPjson_arrSwap':
                    return createIR(block, 'arrSwap', [
                        'arr',
                        'ARR',
                        'ind1',
                        'IND1',
                        'ind2',
                        'IND2'
                    ])
                case 'CCWSPjson_arrDelete':
                    return createIR(block, 'arrDelete', [
                        'arr',
                        'ARR',
                        'ind',
                        'IND'
                    ])
                case 'CCWSPjson_arrGet':
                    return createIR(block, 'arrGet', [
                        'arr',
                        'ARR',
                        'ind',
                        'IND'
                    ])
                case 'CCWSPjson_arrSlice':
                    return createIR(block, 'arrSlice', [
                        'arr',
                        'ARR',
                        'ind1',
                        'IND1',
                        'ind2',
                        'IND2'
                    ])
                case 'CCWSPjson_arrLength':
                    return createIR(block, 'arrLength', ['arr', 'ARR'])
                case 'CCWSPjson_itemExists':
                    return createIR(block, 'itemExists', [
                        'arr',
                        'ARR',
                        'item',
                        'ITEM'
                    ])
                case 'CCWSPjson_arrMatches':
                    return createIR(block, 'arrMatches', [
                        'arr',
                        'ARR',
                        'item',
                        'ITEM'
                    ])
                case 'CCWSPjson_arrContainers':
                    return createIR(block, 'arrContainers', [
                        'arr',
                        'ARR',
                        'item',
                        'TESTER'
                    ])
                case 'CCWSPjson_itemIndex':
                    return createIR(block, 'itemIndex', [
                        'arr',
                        'ARR',
                        'ind',
                        'IND',
                        'item',
                        'ITEM'
                    ])
                case 'CCWSPjson_mergeArray':
                    return createIR(block, 'arrMerge', [
                        'arr1',
                        'ARR1',
                        'arr2',
                        'ARR2'
                    ])
                case 'CCWSPjson_repeatArray':
                    return createIR(block, 'arrRepeat', [
                        'arr',
                        'ARR',
                        'amt',
                        'NUM'
                    ])
                case 'CCWSPjson_fillArray':
                    return createIR(block, 'arrFill', [
                        'arr',
                        'ARR',
                        'amt',
                        'NUM'
                    ])
                case 'CCWSPjson_flatArray':
                    return createIR(block, 'arrFlat', [
                        'arr',
                        'ARR',
                        'amt',
                        'NUM'
                    ])
                case 'CCWSPjson_arrOrder':
                    return createIR(block, 'arrOrder', [
                        'arr',
                        'ARR',
                        'type',
                        'ORDERER'
                    ])
                case 'CCWSPjson_arrMake':
                    return createIR(block, 'arrMake', [
                        'txt',
                        'TXT',
                        'split',
                        'SPLIT',
                        'type',
                        'TYPE'
                    ])
                case 'CCWSPjson_arrCheck':
                    return {
                        kind: 'CCWSPjson.arrCheck',
                        type: block.fields.TYPE.value,
                        array: this.descendInputOfBlock(block, 'ARR'),
                        bool: this.descendInputOfBlock(block, 'BOOL')
                    }
                case 'CCWSPjson_arrMap':
                    return createIR(block, 'arrMap', [
                        'array',
                        'ARR',
                        'value',
                        'VALUE'
                    ])
                case 'CCWSPjson_arrSort':
                    return createIR(block, 'arrSort', [
                        'array',
                        'ARR',
                        'value',
                        'VALUE'
                    ])
                case 'CCWSPjson_arrReduce':
                    return createIR(block, 'arrReduce', [
                        'array',
                        'ARR',
                        'init',
                        'INIT',
                        'value',
                        'VALUE'
                    ])
                /* Extras */
                case 'CCWSPjson_jsonValid':
                    return createIR(block, 'jsonValid', ['obj', 'OBJ'])
                case 'CCWSPjson_parse':
                    return createIR(block, 'parse', ['obj', 'OBJ'])
                case 'CCWSPjson_clone':
                    return createIR(block, 'clone', ['obj', 'OBJ'])
                case 'CCWSPjson_filterNew':
                    return {
                        kind: 'CCWSPjson.filter',
                        type: block.fields.TYPE.value,
                        obj: this.descendInputOfBlock(block, 'OBJ'),
                        bool: this.descendInputOfBlock(block, 'BOOL')
                    }
                default:
                    return _ogIRdescendInp.call(this, block)
            }
        }
        const _ogJSdescendInp = JSGenerator.prototype.descendInput
        JSGenerator.prototype.descendInput = function (node) {
            switch (node.kind) {
                case 'CCWSPjson.arrValA':
                    return new exp.TypedInput(
                        _safeReturn('SParrA'),
                        exp.TYPE_UNKNOWN
                    )
                case 'CCWSPjson.arrValB':
                    return new exp.TypedInput(
                        _safeReturn('SParrB'),
                        exp.TYPE_UNKNOWN
                    )
                case 'CCWSPjson.arrIndex':
                case 'CCWSPjson.objKey':
                    return new exp.TypedInput(
                        _safeReturn('SPobjK'),
                        exp.TYPE_UNKNOWN
                    )
                case 'CCWSPjson.objVal':
                    return new exp.TypedInput(
                        _safeReturn('SPobjV'),
                        exp.TYPE_UNKNOWN
                    )
                case 'CCWSPjson.arrAccum':
                    return new exp.TypedInput(
                        _safeReturn('SPaccum'),
                        exp.TYPE_UNKNOWN
                    )
                /* Objects */
                case 'CCWSPjson.obj':
                    return new exp.TypedInput('{}', exp.TYPE_UNKNOWN)
                case 'CCWSPjson.isObj': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    const vObj = nextLocalVar()
                    return new exp.TypedInput(
                        `((${vObj} = ${_anyParser(obj)}), typeof ${vObj} === "object" && !Array.isArray(${vObj}))`,
                        exp.TYPE_BOOLEAN
                    )
                }
                case 'CCWSPjson.jsonBuild': {
                    const key = this.descendInput(node.key).asString()
                    const val = this.descendInput(node.val).asUnknown()
                    return new exp.TypedInput(
                        `{[${key}]:${_safeCast(val)}}`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.getKey': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    const key = this.descendInput(node.key).asString()
                    const vObj = nextLocalVar()
                    const vKey = nextLocalVar()
                    if (extContext.alwaysValidateKeys) {
                        return new exp.TypedInput(
                            `(${vObj} = ${_objParser(obj)}, ${vKey} = ${key}, ${OBJ_UTIL}.hasOwn(${vObj}, ${vKey}) ? ${_preventACE(vObj + '[' + vKey + ']')} ?? "" : "")`,
                            exp.TYPE_UNKNOWN
                        )
                    }
                    return new exp.TypedInput(
                        '(' +
                            _preventACE(_objParser(obj) + '[' + key + ']') +
                            ')',
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.getPath': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    const path = this.descendInput(node.path).asUnknown()
                    let script = '((spO,p) => {'
                    script += 'for (const k of p) {'
                    if (extContext.alwaysValidateKeys)
                        script += `if (${OBJ_UTIL}.hasOwn(spO, ("" + k))) spO = spO[("" + k)];`
                    else script += `if (spO[("" + k)]) spO = spO[("" + k)];`
                    script += "else return '';"
                    script += '}return ' + _preventACE('spO') + " ?? '';"
                    script += `})(${_objParser(obj)},${_arrParser(path)})`
                    return new exp.TypedInput(script, exp.TYPE_UNKNOWN)
                }
                case 'CCWSPjson.setKey': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    const key = this.descendInput(node.key).asString()
                    const val = this.descendInput(node.val).asUnknown()
                    const vObj = nextLocalVar()
                    return new exp.TypedInput(
                        `((${vObj} = ${_objParser(obj)}),${vObj}[${key}] = ${_safeCast(val)}, ${vObj})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.setPath': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    const path = this.descendInput(node.path).asUnknown()
                    const val = this.descendInput(node.val).asUnknown()
                    return new exp.TypedInput(
                        `((spO,p,value,i=spO,safe=1)=>(p.forEach((k,idx)=>safe && (i = ${_preventACE('i')} || "", safe = !!i, safe && (i = idx===p.length-1 ? (i[k]=value) : (i[k]=${_preventACE(`i[k]`)} || i[k] || {})))), safe ? spO : ""))(${_objParser(obj)},${_arrParser(path)},${_safeCast(val)})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.deleteKey': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    const key = this.descendInput(node.key).asString()
                    const vObj = nextLocalVar()
                    return new exp.TypedInput(
                        `((${vObj} = ${_objParser(obj)}), delete ${vObj}[${key}], ${vObj})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.objSize': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    return new exp.TypedInput(
                        `Object.keys(${_objParser(obj)}).length`,
                        exp.TYPE_NUMBER
                    )
                }
                case 'CCWSPjson.getEntry': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    const key = this.descendInput(node.key).asString()
                    const vKey = nextLocalVar()
                    return new exp.TypedInput(
                        `(${vKey} = ${key}, {[${vKey}]:${_objParser(obj)}[${vKey}]})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.extractObj': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    const type = this.descendInput(node.type).asString()
                    return new exp.TypedInput(
                        `Object[${type} === "keys"?"keys":${type} === "values"?"values":"entries"](${_objParser(obj)})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.mergeObj': {
                    const obj1 = this.descendInput(node.obj1).asUnknown()
                    const obj2 = this.descendInput(node.obj2).asUnknown()
                    return new exp.TypedInput(
                        `{...${_objParser(obj1)}, ...${_objParser(obj2)}}`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.jsonMake': {
                    const txt = this.descendInput(node.txt).asString()
                    const split = this.descendInput(node.split).asString()
                    const delim = this.descendInput(node.delim).asString()
                    const vObj = nextLocalVar()
                    return new exp.TypedInput(
                        `(${vObj} = {}, ${txt}.split(${split}).forEach((i) => {const v = i.split(${delim}); ${vObj}[v[0]] = v[1] ?? "";}), ${vObj})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.jsonMap': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    const safeValue = this.descendInput(node.value).asUnknown()
                    return new exp.TypedInput(
                        `(function() {
            function* generator() {
              const p = ${_objParser(obj)};
              for (const [SPobjK, SPobjV] of Object.entries(p)) yield [SPobjK, ${safeValue}];
            }
            return Object.fromEntries(generator());
          })()`,
                        exp.TYPE_UNKNOWN
                    )
                }
                /* Arrays */
                case 'CCWSPjson.arr':
                    return new exp.TypedInput('[]', exp.TYPE_UNKNOWN)
                case 'CCWSPjson.arrValid': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    return new exp.TypedInput(
                        `(Array.isArray(${_anyParser(arr)}))`,
                        exp.TYPE_BOOLEAN
                    )
                }
                case 'CCWSPjson.arrBuilder': {
                    const val = this.descendInput(node.val).asUnknown()
                    return new exp.TypedInput(
                        `[${_safeCast(val)}]`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrAdd': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const item = this.descendInput(node.item).asUnknown()
                    const vArr = nextLocalVar()
                    return new exp.TypedInput(
                        `((${vArr} = ${_arrParser(arr)}), ${vArr}.push(${_safeCast(item)}), ${vArr})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrInsert': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const item = this.descendInput(node.item).asUnknown()
                    const ind = this.descendInput(node.ind).asNumber()
                    const vArr = nextLocalVar()
                    const vIt = nextLocalVar()
                    return new exp.TypedInput(
                        `((${vArr} = ${_arrParser(arr)}, ${vIt} = ${_safeCast(item)}, i = Math.max(0, ${ind} - 1)), i ? ${vArr}.splice(i, 0, ${vIt}) : ${vArr}.unshift(${vIt}), ${vArr})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrReplace': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const item = this.descendInput(node.item).asUnknown()
                    const ind = this.descendInput(node.ind).asNumber()
                    const vArr = nextLocalVar()
                    return new exp.TypedInput(
                        `((${vArr} = ${_arrParser(arr)}, i = ${ind} - 1), (() => {while(${vArr}.length <= i) ${vArr}.push("")})(), ${vArr}[i] = ${_safeCast(item)}, ${vArr})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrSwap': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const ind1 = this.descendInput(node.ind1).asNumber()
                    const ind2 = this.descendInput(node.ind2).asNumber()
                    const vArr = nextLocalVar()
                    return new exp.TypedInput(
                        `((${vArr} = ${_arrParser(arr)}, i1 = Math.max(0, ${ind1} - 1), i2 = Math.max(0, ${ind2} - 1), m = Math.max(i1, i2)), (() => {while(${vArr}.length <= m) ${vArr}.push("")})(), t = ${vArr}[i1], ${vArr}[i1] = ${vArr}[i2], ${vArr}[i2] = t, ${vArr})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrDelete': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const ind = this.descendInput(node.ind).asNumber()
                    const vArr = nextLocalVar()
                    return new exp.TypedInput(
                        `((${vArr} = ${_arrParser(arr)}), ${vArr}.splice(${ind} - 1, 1), ${vArr})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrGet': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const ind = this.descendInput(node.ind).asNumber()
                    return new exp.TypedInput(
                        `(${_arrParser(arr)}[${ind} - 1])`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrSlice': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const start = this.descendInput(node.ind1).asNumber()
                    const end = this.descendInput(node.ind2).asNumber()
                    return new exp.TypedInput(
                        `(${_arrParser(arr)}.slice(${start} - 1, ${end}))`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrLength': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    return new exp.TypedInput(
                        `(${_arrParser(arr)}.length)`,
                        exp.TYPE_NUMBER
                    )
                }
                case 'CCWSPjson.itemExists': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const item = this.descendInput(node.item).asUnknown()
                    return new exp.TypedInput(
                        `(${_arrParser(arr)}.indexOf(${_safeCast(item)}) > -1)`,
                        exp.TYPE_BOOLEAN
                    )
                }
                case 'CCWSPjson.arrMatches': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const item = this.descendInput(node.item).asUnknown()
                    const vArr = nextLocalVar()
                    const vIt = nextLocalVar()
                    return new exp.TypedInput(
                        `((${vArr} = ${_arrParser(arr)}, ${vIt} = ${_safeCast(item)}), ${vArr}.filter(i => i == ${vIt}).length)`,
                        exp.TYPE_NUMBER
                    )
                }
                case 'CCWSPjson.arrContainers': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const item = this.descendInput(node.item).asString()
                    const vArr = nextLocalVar()
                    const vIt = nextLocalVar()
                    return new exp.TypedInput(
                        `((${vArr} = ${_arrParser(arr)}, ${vIt} = ${_safeCast(item)}), ${vArr}.filter(i => ("" + i).includes(${vIt})).length)`,
                        exp.TYPE_NUMBER
                    )
                }
                case 'CCWSPjson.itemIndex': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const item = this.descendInput(node.item).asUnknown()
                    const ind = this.descendInput(node.ind).asNumber()
                    const vArr = nextLocalVar()
                    const vIt = nextLocalVar()

                    let script = `((i = -1, c = 0), ${vArr}.some((I, idx) => {`
                    script += `if (I == ${vIt} && ++c == ${ind}) {i = idx + 1;return true;}})`
                    script += ',i > -1 ? i : 0)'
                    return new exp.TypedInput(
                        `((${vArr} = ${_arrParser(arr)}, ${vIt} = ${_safeCast(item)}), ${script})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrMerge': {
                    const arr1 = this.descendInput(node.arr1).asUnknown()
                    const arr2 = this.descendInput(node.arr2).asUnknown()
                    return new exp.TypedInput(
                        `(${_arrParser(arr1)}.concat(${_arrParser(arr2)}))`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrRepeat': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const amt = this.descendInput(node.amt).asNumber()
                    return new exp.TypedInput(
                        `(Array(${amt}).fill(${_arrParser(arr)}).flat())`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrFill': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const amt = this.descendInput(node.amt).asNumber()
                    const vArr = nextLocalVar()
                    return new exp.TypedInput(
                        `((${vArr} = ${_arrParser(arr)}), ${vArr}.concat(Array(Math.max(0, ${amt} - ${vArr}.length)).fill("")))`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrFlat': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const amt = this.descendInput(node.amt).asUnknown()
                    return new exp.TypedInput(
                        `(${_arrParser(arr)}.flat(${amt}))`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrOrder': {
                    const arr = this.descendInput(node.arr).asUnknown()
                    const type = this.descendInput(node.type).asString()

                    let script = '((spA) => {'
                    script += `switch (${type}) {`
                    script += `case "reverse": return spA.reverse();`
                    script += `case "ascending": return spA.sort((a, b) => a - b);`
                    script += `case "descending": return spA.sort((a, b) => b - a);`
                    script += `case "descending by length": return spA.sort((a, b) => b.length - a.length);`
                    script += `case "ascending by length": return spA.sort((a, b) => a.length - b.length);`
                    script += `case "A-z": return spA.sort((a, b) => a.localeCompare(b));`
                    script += `case "z-A": return spA.sort((a, b) => b.localeCompare(a));`
                    script += `case "most common": return ${OBJ_UTIL}.freqSort(spA, true);`
                    script += `case "least common": return ${OBJ_UTIL}.freqSort(spA, false);`
                    script += 'default: for (let i = spA.length; i-- > 1;) {'
                    script += 'const j = Math.random() * i | 0;'
                    script += '[spA[i - 1], spA[j]] = [spA[j], spA[i - 1]];}'
                    script += 'return spA;'
                    script += `}})(${_arrParser(arr)})`
                    return new exp.TypedInput(script, exp.TYPE_UNKNOWN)
                }
                case 'CCWSPjson.arrMake': {
                    const txt = this.descendInput(node.txt).asUnknown()
                    const split = this.descendInput(node.split).asString()
                    const type = this.descendInput(node.type).asString()
                    return new exp.TypedInput(
                        `(${type} === "array" ? ("" + ${txt}).split(${split}) : ${_arrParser(txt)}.join(${split}))`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrCheck': {
                    const obj = this.descendInput(node.array).asUnknown()
                    const safeBool = this.descendInput(node.bool).asBoolean()
                    return new exp.TypedInput(
                        `(yield* (function* () {
            function* runGenerator(gen, input) {
              let result;
              try {
                result = gen.next(input);
              } catch (e) { throw e }

              while (!result.done) {
                let yielded = result.value;
                if (yielded && typeof yielded.next === "function") yielded = yield* runGenerator(yielded);
                else if (yielded && typeof yielded.then === "function") yielded = yield yielded;
                try {
                  result = gen.next(yielded);
                } catch (e) { throw e }
              }
              return result.value;
            }

            function* genCheck(arr, predicate) {
              for (let i = 0; i < arr.length; i++) {
                ${
                    node.type === 'some'
                        ? 'if (yield* predicate(arr[i], i)) return true;'
                        : 'if (!(yield* predicate(arr[i], i))) return false;'
                }
              }
              return ${node.type === 'some' ? 'false' : 'true'};
            }

            const p = ${_arrParser(obj)};
            const result = yield* runGenerator(
              genCheck(p, function* (SPobjV, SPobjK) {
                SPobjK++;
                return ${safeBool};
              })
            );
            return result;
          })())`,
                        exp.TYPE_BOOLEAN
                    )
                }
                case 'CCWSPjson.arrMap': {
                    const obj = this.descendInput(node.array).asUnknown()
                    const safeValue = this.descendInput(node.value).asUnknown()
                    return new exp.TypedInput(
                        `(function() {
            function* generator() {
              const p = ${_arrParser(obj)};
              let SPobjK = 1;
              for (const SPobjV of p) {
                yield ${safeValue};
                SPobjK++;
              }
            }
            return [...generator()];
          })()`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrSort': {
                    const obj = this.descendInput(node.array).asUnknown()
                    const safeValue = this.descendInput(node.value).asUnknown()
                    // this is a rough check, but its the best we can do
                    if (
                        safeValue.includes(`yield* executeInCompat`) &&
                        !safeValue.includes(`"yield* executeInCompat`)
                    ) {
                        return new exp.TypedInput(
                            `(function() {
              function* generator() {
                const p = ${_arrParser(obj)};
                const s = {};
                for (let i = 0; i < p.length; i++) {
                  for (let j = 0; j < p.length; j++) {
                    const SParrA = p[i], SParrB = p[j];
                    s[\`\${i},\${j}\`] = ${safeValue};
                  }
                }
                const sorted = [...p].sort((a, b) => {
                  const ia = p.indexOf(a), ib = p.indexOf(b);
                  if (ia === ib) return 0;
                  return ia < ib ? s[\`\${ia},\${ib}\`] : -s[\`\${ib},\${ia}\`];
                });
                for (const item of sorted) yield item;
              }
              return [...generator()];
            })()`,
                            exp.TYPE_UNKNOWN
                        )
                    } else {
                        return new exp.TypedInput(
                            `(function() {
              function* generator() {
                const p = ${_arrParser(obj)};
                const sorted = [...p].sort((SParrA, SParrB) => ${safeValue});
                for (const item of sorted) yield item;
              }
              return [...generator()];
            })()`,
                            exp.TYPE_UNKNOWN
                        )
                    }
                }
                /* Extras */
                case 'CCWSPjson.filter': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    const safeBool = this.descendInput(node.bool).asBoolean()
                    return new exp.TypedInput(
                        `(function() {
            function* generator() {
              const p = ${_anyParser(obj)};
              const e = Object.entries(p);
              const isO = !Array.isArray(p);

              if (${node.type === 'filter'}) {
                if (isO) {
                  const result = {};
                  for (let [SPobjK, SPobjV] of e) {
                    if (${safeBool}) result[SPobjK] = SPobjV;
                  }
                  yield result;
                } else {
                  const result = [];
                  for (let [SPobjK, SPobjV] of e) {
                    SPobjK++;
                    if (${safeBool}) result.push(SPobjV);
                  }
                  yield result;
                }
              } else {
                const n = [];
                for (let [SPobjK, SPobjV] of e) {
                  if (isO) {
                    if (${safeBool}) n.unshift([SPobjK, SPobjV]);
                    else n.push([SPobjK, SPobjV]);
                  } else {
                    SPobjK++;
                    if (${safeBool}) n.unshift(SPobjV);
                    else n.push(SPobjV);
                  }
                }
                yield isO ? Object.fromEntries(n) : n;
              }
            }
            return [...generator()][0];
          })()`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.arrReduce': {
                    const obj = this.descendInput(node.array).asUnknown()
                    const initial = this.descendInput(node.init).asUnknown()
                    const safeValue = this.descendInput(node.value).asUnknown()
                    return new exp.TypedInput(
                        `(function(SPaccum) {
            function* generator() {
              const p = ${_arrParser(obj)};
              let SPobjK = 1;
              for (const SPobjV of p) {
                SPaccum = yield ${safeValue};
                SPobjK++;
              }
            }

            const g = generator();
            let r = g.next();
            while (!r.done) {r = g.next(r.value)}
            return SPaccum;
          })(${initial})`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.jsonValid': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    let script
                    if (extContext.alwaysParse) {
                        script = `(t = typeof ${obj}, t === "object" ? true : t !== "string" ? false : (() => {try { JSON.parse(${obj}); return true; } catch { return false; }})())`
                    } else {
                        script = `(typeof ${obj} === "object")`
                    }

                    return new exp.TypedInput(script, exp.TYPE_BOOLEAN)
                }
                case 'CCWSPjson.parse': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    const vObj = nextLocalVar()
                    return new exp.TypedInput(
                        `(${vObj} = ${obj}, typeof ${vObj} === "object" ? ${vObj} : (() => {try { return JSON.parse(${vObj}); } catch { return ""; }})())`,
                        exp.TYPE_UNKNOWN
                    )
                }
                case 'CCWSPjson.clone': {
                    const obj = this.descendInput(node.obj).asUnknown()
                    return new exp.TypedInput(
                        `((spO => { try { return typeof spO === "object" ? structuredClone(spO) : JSON.parse(spO); } catch { return ""; }})(${obj}))`,
                        exp.TYPE_UNKNOWN
                    )
                }
                default:
                    return _ogJSdescendInp.call(this, node)
            }
        }
    }

    class CCWSPjson {
        constructor() {
            this._settings = [
                { text: 'always cast values', value: 'alwaysCast' },
                { text: 'always parse text objects', value: 'alwaysParse' },
                { text: 'always try parsing', value: 'alwaysTryParse' },
                {
                    text: 'always validate object keys',
                    value: 'alwaysValidateKeys'
                },
                { text: 'dont edit source objects', value: 'useNewObj' }
            ]
            this.alwaysCast = true
            this.alwaysParse = true
            this.alwaysTryParse = true
            this.useNewObj = true
            this.alwaysValidateKeys = true
            this._preventUnsafeAce = true // hidden option

            this.initParser()
        }
        getInfo() {
            return {
                id: 'CCWSPjson',
                name: 'Swift JSON',
                color1: '#748bee',
                menuIconURI,
                blocks: [
                    genRegenReporter('arrValueA', 'value A'),
                    genRegenReporter('arrValueB', 'value B'),
                    genRegenReporter('arrAccum', 'accumulator'),
                    genRegenReporter('arrIndex', 'index'),
                    genRegenReporter('objKey', 'key'),
                    genRegenReporter('objValue', 'value'),
                    {
                        func: 'warn',
                        blockType: Scratch.BlockType.BUTTON,
                        text: 'Usage Warning'
                    },
                    { blockType: Scratch.BlockType.LABEL, text: 'Objects' },
                    {
                        opcode: 'objBlank',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: OBJ_SHAPE,
                        disableMonitor: true,
                        allowDropAnywhere: true,
                        text: 'new object'
                    },
                    {
                        opcode: 'objValid',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'is object [OBJ] valid?',
                        arguments: {
                            OBJ: genArgument('obj', DEFAULT_ARGS.obj)
                        }
                    },
                    {
                        opcode: 'jsonBuilder',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: OBJ_SHAPE,
                        allowDropAnywhere: true,
                        text: '{ [KEY] : [VAL] }',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'key'
                            },
                            VAL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'value',
                                exemptFromNormalization: true
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'getKey',
                        blockType: Scratch.BlockType.REPORTER,
                        allowDropAnywhere: true,
                        text: 'get [KEY] from [OBJ]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'key'
                            },
                            OBJ: genArgument('obj', DEFAULT_ARGS.obj)
                        }
                    },
                    {
                        opcode: 'getPath',
                        blockType: Scratch.BlockType.REPORTER,
                        allowDropAnywhere: true,
                        text: 'get path [PATH] from [OBJ]',
                        arguments: {
                            PATH: genArgument('arr', `["key", "value1"]`),
                            OBJ: genArgument(
                                'obj',
                                `{"key":{"value1":1, "value2":2}}`
                            )
                        }
                    },
                    {
                        opcode: 'setKey',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: OBJ_SHAPE,
                        allowDropAnywhere: true,
                        text: 'set [KEY] to [VAL] in [OBJ]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'key'
                            },
                            VAL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'value',
                                exemptFromNormalization: true
                            },
                            OBJ: genArgument('obj', '{}')
                        }
                    },
                    {
                        opcode: 'setPath',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: OBJ_SHAPE,
                        allowDropAnywhere: true,
                        text: 'set path [PATH] to [VAL] in [OBJ]',
                        arguments: {
                            PATH: genArgument('arr', `["key1", "key2"]`),
                            VAL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'value',
                                exemptFromNormalization: true
                            },
                            OBJ: genArgument('obj', `{"key1":{}}`)
                        }
                    },
                    {
                        opcode: 'deleteKey',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: OBJ_SHAPE,
                        allowDropAnywhere: true,
                        text: 'delete [KEY] from [OBJ]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'key'
                            },
                            OBJ: genArgument('obj', DEFAULT_ARGS.obj)
                        }
                    },
                    {
                        opcode: 'jsonSize',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'size of [OBJ]',
                        arguments: {
                            OBJ: genArgument('obj', DEFAULT_ARGS.obj)
                        }
                    },
                    '---',
                    {
                        opcode: 'keyIndex',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'index of [KEY] in [OBJ]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'key'
                            },
                            OBJ: genArgument('obj', DEFAULT_ARGS.obj)
                        }
                    },
                    {
                        opcode: 'getEntry',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: OBJ_SHAPE,
                        allowDropAnywhere: true,
                        text: 'get [KEY] entry from [OBJ]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'key'
                            },
                            OBJ: genArgument('obj', DEFAULT_ARGS.obj)
                        }
                    },
                    {
                        opcode: 'mergeJson',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: OBJ_SHAPE,
                        allowDropAnywhere: true,
                        text: 'merge [OBJ1] and [OBJ2]',
                        arguments: {
                            OBJ1: genArgument('obj', DEFAULT_ARGS.obj),
                            OBJ2: genArgument('obj', `{"key2":"value2"}`)
                        }
                    },
                    {
                        opcode: 'jsonMake',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: OBJ_SHAPE,
                        allowDropAnywhere: true,
                        text: 'object from [TXT] split by [SPLIT] delimiter [DELIM]',
                        arguments: {
                            TXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'a:1,b:2,c:3'
                            },
                            SPLIT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ','
                            },
                            DELIM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ':'
                            }
                        }
                    },
                    {
                        opcode: 'extractJson',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'all [TYPE] from [OBJ]',
                        arguments: {
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'OBJ_EXTRACT'
                            },
                            OBJ: genArgument(
                                'obj',
                                `{"key":"value","key2":"value2"}`
                            )
                        }
                    },
                    '---',
                    ...genXML({
                        opcode: 'jsonMap',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: OBJ_SHAPE,
                        allowDropAnywhere: true,
                        text: 'map [OBJ] using rule [IND] [VAL] [IMG] [VALUE]',
                        hideFromPalette: true,
                        arguments: {
                            OBJ: genArgument('obj', DEFAULT_ARGS.obj),
                            IND: { fillIn: 'objKey' },
                            VAL: { fillIn: 'objValue' },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'value-2',
                                exemptFromNormalization: true
                            },
                            IMG: {
                                type: Scratch.ArgumentType.IMAGE,
                                dataURI: arrowURI
                            }
                        }
                    }),
                    { blockType: Scratch.BlockType.LABEL, text: 'Arrays' },
                    {
                        opcode: 'arrBlank',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        disableMonitor: true,
                        text: 'new array'
                    },
                    {
                        opcode: 'arrValid',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'is array [ARR] valid?',
                        arguments: {
                            ARR: genArgument('arr', DEFAULT_ARGS.arr1)
                        }
                    },
                    {
                        opcode: 'arrBuilder',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: '［ [VAL] ］',
                        arguments: {
                            VAL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'value',
                                exemptFromNormalization: true
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'arrAdd',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'add [ITEM] to [ARR]',
                        arguments: {
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'thing',
                                exemptFromNormalization: true
                            },
                            ARR: genArgument('arr', '[]')
                        }
                    },
                    {
                        opcode: 'arrInsert',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'insert [ITEM] at [IND] in [ARR]',
                        arguments: {
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'b',
                                exemptFromNormalization: true
                            },
                            IND: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 2
                            },
                            ARR: genArgument('arr', `["a", "c"]`)
                        }
                    },
                    {
                        opcode: 'arrReplace',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'replace item [IND] with [ITEM] in [ARR]',
                        arguments: {
                            IND: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            },
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'a',
                                exemptFromNormalization: true
                            },
                            ARR: genArgument('arr', `["z", "b", "c"]`)
                        }
                    },
                    {
                        opcode: 'arrSwap',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'swap item [IND1] with item [IND2] in [ARR]',
                        arguments: {
                            IND1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            },
                            IND2: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 3
                            },
                            ARR: genArgument('arr', DEFAULT_ARGS.arr1)
                        }
                    },
                    {
                        opcode: 'arrDelete',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'delete item [IND] in [ARR]',
                        arguments: {
                            IND: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            },
                            ARR: genArgument('arr', DEFAULT_ARGS.arr1)
                        }
                    },
                    {
                        opcode: 'arrGet',
                        blockType: Scratch.BlockType.REPORTER,
                        allowDropAnywhere: true,
                        text: 'item [IND] in [ARR]',
                        arguments: {
                            IND: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            },
                            ARR: genArgument('arr', DEFAULT_ARGS.arr1)
                        }
                    },
                    {
                        opcode: 'arrSlice',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'items [IND1] to [IND2] in [ARR]',
                        arguments: {
                            IND1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 2
                            },
                            IND2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 3
                            },
                            ARR: genArgument('arr', DEFAULT_ARGS.arr1)
                        }
                    },
                    {
                        opcode: 'arrLength',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'length of [ARR]',
                        arguments: {
                            ARR: genArgument('arr', DEFAULT_ARGS.arr1)
                        }
                    },
                    '---',
                    {
                        opcode: 'itemExists',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[ARR] contains [ITEM] ?',
                        arguments: {
                            ARR: genArgument('arr', DEFAULT_ARGS.arr1),
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'b',
                                exemptFromNormalization: true
                            }
                        }
                    },
                    {
                        opcode: 'arrMatches',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '# of times [ITEM] appears in [ARR]',
                        arguments: {
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'a',
                                exemptFromNormalization: true
                            },
                            ARR: genArgument('arr', DEFAULT_ARGS.arr2)
                        }
                    },
                    {
                        opcode: 'arrContainers',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '# of items containing [TESTER] in [ARR]',
                        arguments: {
                            TESTER: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'a'
                            },
                            ARR: genArgument('arr', `["a", "ab", "ba", "bb"]`)
                        }
                    },
                    {
                        opcode: 'itemIndex',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'index # [IND] of item [ITEM] in [ARR]',
                        arguments: {
                            IND: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            },
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'a',
                                exemptFromNormalization: true
                            },
                            ARR: genArgument('arr', DEFAULT_ARGS.arr2)
                        }
                    },
                    '---',
                    {
                        opcode: 'mergeArray',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'merge array [ARR1] and [ARR2]',
                        arguments: {
                            ARR1: genArgument('arr', DEFAULT_ARGS.arr3),
                            ARR2: genArgument('arr', `["c", "d"]`)
                        }
                    },
                    {
                        opcode: 'repeatArray',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'repeat array [ARR] [NUM] times',
                        arguments: {
                            ARR: genArgument('arr', DEFAULT_ARGS.arr3),
                            NUM: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 3
                            }
                        }
                    },
                    {
                        opcode: 'fillArray',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'fill array [ARR] to length [NUM]',
                        arguments: {
                            ARR: genArgument('arr', DEFAULT_ARGS.arr3),
                            NUM: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 5
                            }
                        }
                    },
                    {
                        opcode: 'flatArray',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'flatten array [ARR] depth [NUM]',
                        arguments: {
                            ARR: genArgument('arr', `[[1, 2], [3, [4, 5]]]`),
                            NUM: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'arrOrder',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: 'order [ARR] by [ORDERER]',
                        arguments: {
                            ARR: genArgument(
                                'arr',
                                `["2", "item1", "1", "item12", "1"]`
                            ),
                            ORDERER: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'ORDERING'
                            }
                        }
                    },
                    '---',
                    ...genXML({
                        opcode: 'arrCheck',
                        blockType: Scratch.BlockType.BOOLEAN,
                        allowDropAnywhere: true,
                        text: 'check [ARR] if [TYPE] item [IND] [VAL] [IMG] [BOOL]',
                        hideFromPalette: true,
                        arguments: {
                            ARR: genArgument('arr', DEFAULT_ARGS.arr1),
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'ARRAY_CHECK',
                                defaultValue: 'every'
                            },
                            IND: { fillIn: 'arrIndex' },
                            VAL: { fillIn: 'objValue' },
                            IMG: {
                                type: Scratch.ArgumentType.IMAGE,
                                dataURI: arrowURI
                            },
                            BOOL: { type: Scratch.ArgumentType.BOOLEAN }
                        }
                    }),
                    ...genXML({
                        opcode: 'arrMap',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        text: 'map [ARR] using rule [IND] [VAL] [IMG] [VALUE]',
                        hideFromPalette: true,
                        allowDropAnywhere: true,
                        arguments: {
                            ARR: genArgument('arr', DEFAULT_ARGS.arr1),
                            IND: { fillIn: 'arrIndex' },
                            VAL: { fillIn: 'objValue' },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'd',
                                exemptFromNormalization: true
                            },
                            IMG: {
                                type: Scratch.ArgumentType.IMAGE,
                                dataURI: arrowURI
                            }
                        }
                    }),
                    ...genXML({
                        opcode: 'arrSort',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        text: 'sort [ARR] using rule [A] [B] [IMG] [VALUE]',
                        hideFromPalette: true,
                        allowDropAnywhere: true,
                        arguments: {
                            ARR: genArgument('arr', '[1, 2, 3]'),
                            A: { fillIn: 'arrValueA' },
                            B: { fillIn: 'arrValueB' },
                            VALUE: { type: Scratch.ArgumentType.NUMBER },
                            IMG: {
                                type: Scratch.ArgumentType.IMAGE,
                                dataURI: arrowURI
                            }
                        }
                    }),
                    ...genXML({
                        opcode: 'arrReduce',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        text: 'process [ARR] starting at [INIT] [IND] [VAL] [ACCUM] [IMG] [VALUE]',
                        hideFromPalette: true,
                        allowDropAnywhere: true,
                        arguments: {
                            ARR: genArgument('arr', '[1, 2, 3]'),
                            INIT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '0',
                                exemptFromNormalization: true
                            },
                            IND: { fillIn: 'arrIndex' },
                            VAL: { fillIn: 'objValue' },
                            ACCUM: { fillIn: 'arrAccum' },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                exemptFromNormalization: true
                            },
                            IMG: {
                                type: Scratch.ArgumentType.IMAGE,
                                dataURI: arrowURI
                            }
                        }
                    }),
                    '---',
                    {
                        opcode: 'arrMake',
                        blockType: Scratch.BlockType.REPORTER,
                        blockShape: ARR_SHAPE,
                        allowDropAnywhere: true,
                        text: '[TXT] split by [SPLIT] to [TYPE]',
                        arguments: {
                            TXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'a,b,c',
                                exemptFromNormalization: true
                            },
                            SPLIT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ','
                            },
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'CONVERTS2'
                            }
                        }
                    },
                    { blockType: Scratch.BlockType.LABEL, text: 'Utilities' },
                    {
                        opcode: 'jsonValid',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'is JSON [OBJ] valid?',
                        arguments: {
                            OBJ: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: DEFAULT_ARGS.obj,
                                exemptFromNormalization: true
                            }
                        }
                    },
                    {
                        opcode: 'parse',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'parse [OBJ]',
                        allowDropAnywhere: true,
                        arguments: {
                            OBJ: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: DEFAULT_ARGS.obj,
                                exemptFromNormalization: true
                            }
                        }
                    },
                    {
                        opcode: 'clone',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'duplicate [OBJ]',
                        allowDropAnywhere: true,
                        arguments: {
                            OBJ: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: DEFAULT_ARGS.obj,
                                exemptFromNormalization: true
                            }
                        }
                    },
                    {
                        opcode: 'convert',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '[OBJ] to [TYPE]',
                        allowDropAnywhere: true,
                        arguments: {
                            OBJ: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '{}',
                                exemptFromNormalization: true
                            },
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'CONVERTS'
                            }
                        }
                    },
                    '---',
                    ...genXML({
                        opcode: 'filterNew',
                        blockType: Scratch.BlockType.REPORTER,
                        allowDropAnywhere: true,
                        text: '[TYPE] [OBJ] by [IND] [VAL] [IMG] [BOOL]',
                        hideFromPalette: true,
                        arguments: {
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'CUST_ORDER',
                                defaultValue: 'filter'
                            },
                            OBJ: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: `{"Object":"or array"}`,
                                exemptFromNormalization: true
                            },
                            IND: { fillIn: 'objKey' },
                            VAL: { fillIn: 'objValue' },
                            BOOL: { type: Scratch.ArgumentType.BOOLEAN },
                            IMG: {
                                type: Scratch.ArgumentType.IMAGE,
                                dataURI: arrowURI
                            }
                        }
                    }),
                    ...genXML({
                        opcode: 'forEach',
                        blockType: Scratch.BlockType.LOOP,
                        branchIconURI:
                            'https://m.xiguacity.cn/scratch-base-static/blocks-media/repeat.svg',
                        text: 'for each [IND] [VAL] in [OBJ]',
                        hideFromPalette: true,
                        arguments: {
                            IND: { fillIn: 'objKey' },
                            VAL: { fillIn: 'objValue' },
                            OBJ: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: `{"Object":"or array"}`,
                                exemptFromNormalization: true
                            }
                        }
                    }),
                    '---',
                    {
                        opcode: 'setRawVarValue',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set [TYPE] named [NAME] to [VALUE]',
                        arguments: {
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'VAR_TYPE'
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'my variable'
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                exemptFromNormalization: true
                            }
                        }
                    },
                    {
                        opcode: 'rawVarValue',
                        blockType: Scratch.BlockType.REPORTER,
                        allowDropAnywhere: true,
                        text: 'get raw [TYPE] named [NAME]',
                        arguments: {
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'VAR_TYPE'
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'my variable'
                            }
                        }
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Optimization Settings'
                    },
                    {
                        func: 'optimizeWarn',
                        blockType: Scratch.BlockType.BUTTON,
                        text: 'Safety Warning'
                    },
                    {
                        opcode: 'isSettingOn',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'is [THING] enabled?',
                        arguments: {
                            THING: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'SETTINGS'
                            }
                        }
                    },
                    {
                        opcode: 'toggleSetting',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set [THING] to [TYPE]',
                        arguments: {
                            THING: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'SETTINGS'
                            },
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TOGGLER'
                            }
                        }
                    },
                    {
                        opcode: 'optiReader',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'optimization level'
                    },
                    '---',
                    {
                        opcode: 'doInput',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'do [THING]',
                        arguments: { THING: {} }
                    },
                    /* Deprecation Marker */
                    {
                        opcode: 'filter',
                        blockType: Scratch.BlockType.CONDITIONAL,
                        branchCount: -1,
                        text: 'in thread [TYPE] [OBJ] by [IND] [VAL] [IMG] [BOOL]',
                        hideFromPalette: true,
                        arguments: {
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'CUST_ORDER'
                            },
                            OBJ: {
                                type: Scratch.ArgumentType.STRING,
                                exemptFromNormalization: true
                            },
                            IND: {},
                            VAL: {},
                            BOOL: { type: Scratch.ArgumentType.BOOLEAN },
                            IMG: {
                                type: Scratch.ArgumentType.IMAGE,
                                dataURI: arrowURI
                            }
                        }
                    },
                    {
                        opcode: 'filterResult',
                        blockType: Scratch.BlockType.REPORTER,
                        disableMonitor: true,
                        hideFromPalette: true,
                        text: 'thread filter result'
                    }
                    /* Marker End */
                ],
                menus: {
                    TOGGLER: ['enabled', 'disabled'],
                    CUST_ORDER: ['filter', 'order'],
                    ARRAY_CHECK: ['every', 'some'],
                    VAR_TYPE: ['variable', 'list'],
                    OBJ_EXTRACT: {
                        acceptReporters: true,
                        items: ['keys', 'values', 'entries']
                    },
                    CONVERTS: {
                        acceptReporters: true,
                        items: [
                            'string',
                            'pretty string',
                            'array',
                            'object',
                            'object from entries'
                        ]
                    },
                    CONVERTS2: {
                        acceptReporters: true,
                        items: ['array', 'text']
                    },
                    SETTINGS: { acceptReporters: true, items: this._settings },
                    ORDERING: {
                        acceptReporters: true,
                        items: [
                            'random',
                            'reverse',
                            'ascending',
                            'descending',
                            'ascending by length',
                            'descending by length',
                            'A-z',
                            'z-A',
                            'most common',
                            'least common'
                        ]
                    }
                }
            }
        }

        // Helper Funcs
        initParser() {
            // dynamically create 'tryParse' so its as fast as possible, no need for unused checks
            const fixedClone = obj => {
                try {
                    return structuredClone(obj)
                } catch {
                    return obj
                }
            }

            const isValidObject = (obj, type) => {
                return (
                    obj !== null &&
                    typeof obj === 'object' &&
                    (type
                        ? type === 1
                            ? Array.isArray(obj)
                            : !Array.isArray(obj)
                        : true)
                )
            }

            if (!this.alwaysTryParse) return (this.tryParse = obj => obj)

            if (this.useNewObj && this.alwaysParse) {
                this.tryParse = (obj, optType) => {
                    if (isValidObject(obj, optType)) return fixedClone(obj)
                    const defaultV =
                        optType === undefined ? obj : optType === 0 ? {} : []
                    try {
                        const parsed = JSON.parse(obj)
                        return (optType === 1 && Array.isArray(parsed)) ||
                            (optType === 0 && !Array.isArray(parsed)) ||
                            optType === undefined
                            ? parsed
                            : defaultV
                    } catch {
                        return defaultV
                    }
                }
                return
            }

            if (!this.useNewObj && this.alwaysParse) {
                this.tryParse = (obj, optType) => {
                    if (isValidObject(obj, optType)) return obj
                    const defaultV =
                        optType === undefined ? obj : optType === 0 ? {} : []
                    try {
                        const parsed = JSON.parse(obj)
                        return (optType === 1 && Array.isArray(parsed)) ||
                            (optType === 0 && !Array.isArray(parsed)) ||
                            optType === undefined
                            ? parsed
                            : defaultV
                    } catch {
                        return defaultV
                    }
                }
                return
            }

            if (this.useNewObj && !this.alwaysParse) {
                this.tryParse = (obj, optType) => {
                    if (isValidObject(obj, optType)) return fixedClone(obj)
                    return optType === undefined ? obj : optType === 0 ? {} : []
                }
                return
            }

            if (!this.useNewObj && !this.alwaysParse) {
                this.tryParse = (obj, optType) => {
                    if (isValidObject(obj, optType)) return obj
                    return optType === undefined ? obj : optType === 0 ? {} : []
                }
                return
            }
        }

        tryParse(obj, optType) {
            /* dynamically defined */
        }

        preventACE(imminentObj) {
            if (this._preventUnsafeAce) {
                const objectType = imminentObj?.constructor?.name
                if (typeof imminentObj === 'object')
                    return imminentObj.customId ||
                        objectType === 'Object' ||
                        objectType === 'Array'
                        ? imminentObj
                        : ''
            }
            return imminentObj
        }

        toArrInd(num) {
            return Cast.toNumber(num) - 1
        }

        toSafe(value) {
            if (this.alwaysCast) {
                if (typeof value === 'object') return value
                if (isNaN(value) || value === Infinity || value === -Infinity)
                    return Cast.toString(value)
            }

            return value
        }

        stackFrameInit(util, opt_outerStack, initializers) {
            const frame = opt_outerStack
                ? util.thread.stackFrames[0]
                : util.stackFrame

            if (initializers.length) {
                for (const [name, value] of initializers) {
                    if (name === 'SPwasCompiled' && value === 'FLIP') {
                        if (frame.SPwasCompiled === undefined) {
                            frame.SPwasCompiled = util.thread.isCompiled
                            util.thread.isCompiled = false
                        }
                    } else {
                        frame[name] = value
                    }
                }
            }

            return frame
        }

        reporterYield(util, wasCompiled) {
            let thisBlock = util.thread.blockContainer.getBlock(
                wasCompiled
                    ? util.thread.peekStack()
                    : util.thread.peekStackFrame().op?.id
            )

            if (!thisBlock) thisBlock = util.thread.stackFrames[0].myID
            if (!thisBlock) return true // abort!

            util.thread.stackFrames[0].myID = thisBlock
            util.thread.peekStackFrame().isLoop = true

            const pushBlock =
                thisBlock.inputs.BOOL?.block || thisBlock.inputs.VALUE?.block
            if (pushBlock) util.thread.pushStack(pushBlock)
            util.yield()
        }

        yieldingReporter(
            util,
            reporterInfo,
            createIterable,
            onYield,
            onResult
        ) {
            const EXECUTE_STATE = 0
            const DONE_STATE = 1
            const stackFrame = util.stackFrame
            const outerFrame = util.thread.stackFrames[0]

            if (stackFrame.isExecuting === undefined) {
                // initialize
                const iterable = createIterable(reporterInfo)
                if (iterable.length === 0) return reporterInfo.defaultValue

                this.stackFrameInit(util, true, [
                    ['SPwasCompiled', 'FLIP'],
                    ...(reporterInfo.outerData ?? [])
                ])
                this.stackFrameInit(util, false, [
                    ['isExecuting', EXECUTE_STATE],
                    ['ranOnce', false],
                    ['iterable', iterable],
                    ['index', 0],
                    ['length', iterable.length - 1],
                    ...(reporterInfo.stackData ?? [])
                ])

                if (this.reporterYield(util, outerFrame.SPwasCompiled)) {
                    return reporterInfo.defaultValue // abort!
                }
            } else {
                // callback
                const { index, length, iterable, ranOnce } = stackFrame
                if (index > length) stackFrame.isExecuting = DONE_STATE
                else {
                    if (reporterInfo.isArray)
                        outerFrame.CCWSPjson = [
                            index + ranOnce + 1,
                            iterable[index + ranOnce]
                        ]
                    else outerFrame.CCWSPjson = iterable[index + ranOnce]
                    if (ranOnce) onYield(stackFrame, outerFrame)
                }

                // we need an extra frame to allow the regenerated reporters to store the right value
                if (!ranOnce) stackFrame.ranOnce = true
                else stackFrame.index++
            }

            if (stackFrame.isExecuting === EXECUTE_STATE)
                this.reporterYield(util)
            else {
                outerFrame.CCWSPjson = undefined // cleanup
                util.thread.isCompiled = outerFrame.SPwasCompiled
                return onResult(stackFrame, outerFrame)
            }
        }

        // Buttons and Settings
        warn() {
            alert(
                [
                    'Blocks from this extension returns raw objects to achieve speed.',
                    'This quirk may cause confusion or incorrect assumptions that certain behaviors are bugs.',
                    'One major example is seeing [Object object] show up when using certain text inputs.',
                    'This is not a bug, rather a factor of passing non-normal data types.',
                    'You can convert an object to a string by using the (({}) to (string v)) block below.'
                ].join('\n\n')
            )
        }

        optimizeWarn() {
            alert(
                'Disabling these Settings will improve performance, but may lead to unexpected bugs or issues. These are intentional, do not report them.'
            )
        }

        // Object Funcs
        objBlank() {
            return {}
        }

        objValid(args) {
            const obj = this.tryParse(args.OBJ)
            return typeof obj === 'object' && !Array.isArray(obj)
        }

        jsonBuilder(args) {
            return { [args.KEY]: this.toSafe(args.VAL) }
        }

        getKey(args) {
            const obj = this.tryParse(args.OBJ, 0)
            const key = Cast.toString(args.KEY)
            const value = this.preventACE(obj[key]) ?? ''
            return this.alwaysValidateKeys
                ? hasOwn(obj, key)
                    ? value
                    : ''
                : value
        }

        getPath(args) {
            const path = this.tryParse(args.PATH, 1)
            let objVal = this.tryParse(args.OBJ, 0)
            for (var i = 0; i < path.length; i++) {
                const key = Cast.toString(path[i])

                if (hasOwn(objVal, key)) objVal = objVal[key]
                else return ''
            }

            return this.preventACE(objVal) ?? ''
        }

        setKey(args) {
            const obj = this.tryParse(args.OBJ, 0)
            obj[Cast.toString(args.KEY)] = this.toSafe(args.VAL)
            return obj
        }

        setPath(args) {
            const path = this.tryParse(args.PATH, 1)
            const obj = this.tryParse(args.OBJ, 0)
            let objPath = obj
            for (let i = 0; i < path.length; i++) {
                const key = Cast.toString(path[i])
                if (i === path.length - 1) {
                    if (this.preventACE(objPath[key]))
                        objPath[key] = this.toSafe(args.VAL)
                } else {
                    objPath = objPath[key] ?? {}
                }
            }

            return obj
        }

        deleteKey(args) {
            const obj = this.tryParse(args.OBJ, 0)
            delete obj[Cast.toString(args.KEY)]
            return obj
        }

        jsonSize(args) {
            return Object.keys(this.tryParse(args.OBJ, 0)).length
        }

        keyIndex(args) {
            return (
                Object.keys(this.tryParse(args.OBJ, 0)).indexOf(
                    Cast.toString(args.KEY)
                ) + 1
            )
        }

        getEntry(args) {
            const obj = this.tryParse(args.OBJ, 0)
            const key = Cast.toString(args.KEY)
            if (hasOwn(obj, key)) return { [key]: obj[key] }
            return {}
        }

        extractJson(args) {
            return Object[
                args.TYPE === 'keys'
                    ? 'keys'
                    : args.TYPE === 'values'
                      ? 'values'
                      : 'entries'
            ](this.tryParse(args.OBJ, 0))
        }

        mergeJson(args) {
            return {
                ...this.tryParse(args.OBJ1, 0),
                ...this.tryParse(args.OBJ2, 0)
            }
        }

        jsonMap(args, util) {
            return this.yieldingReporter(
                util,
                { defaultValue: {} },
                /* createIterable */ () =>
                    Object.entries(this.tryParse(args.OBJ, 0)),
                /* onYield */ stackFrame => {
                    stackFrame.iterable[stackFrame.index][1] = args.VALUE
                },
                /* onResult */ stackFrame => {
                    return Object.fromEntries(stackFrame.iterable)
                }
            )
        }

        jsonMake(args) {
            const arr = Cast.toString(args.TXT).split(args.SPLIT)
            const obj = {}
            arr.forEach(item => {
                const value = item.split(args.DELIM)
                obj[value[0]] = value[1] ?? ''
            })

            return obj
        }

        // Array Funcs
        arrBlank() {
            return []
        }

        arrValid(args) {
            return Array.isArray(this.tryParse(args.ARR))
        }

        arrBuilder(args) {
            return [this.toSafe(args.VAL)]
        }

        arrAdd(args) {
            const arr = this.tryParse(args.ARR, 1)
            arr.push(this.toSafe(args.ITEM))
            return arr
        }

        arrInsert(args) {
            const arr = this.tryParse(args.ARR, 1)
            const ind = Math.max(0, this.toArrInd(args.IND))
            if (ind) arr.splice(ind, 0, this.toSafe(args.ITEM))
            else arr.unshift(this.toSafe(args.ITEM))
            return arr
        }

        arrReplace(args) {
            const arr = this.tryParse(args.ARR, 1)
            const ind = this.toArrInd(args.IND)

            while (arr.length <= ind) arr.push('')
            arr[ind] = this.toSafe(args.ITEM)
            return arr
        }

        arrSwap(args) {
            const arr = this.tryParse(args.ARR, 1)
            const ind1 = this.toArrInd(args.IND1)
            const ind2 = this.toArrInd(args.IND2)
            const maxInd = Math.max(ind1, ind2)
            while (arr.length <= maxInd) arr.push('')

            ;[arr[ind1], arr[ind2]] = [arr[ind2], arr[ind1]]
            return arr
        }

        arrDelete(args) {
            const arr = this.tryParse(args.ARR, 1)
            arr.splice(this.toArrInd(args.IND), 1)
            return arr
        }

        arrGet(args) {
            const arr = this.tryParse(args.ARR, 1)
            const ind = this.toArrInd(args.IND)
            return (
                arr[ind > -1 ? ind : ind < 0 ? arr.length + ind + 1 : -1] ?? ''
            )
        }

        arrSlice(args) {
            return this.tryParse(args.ARR, 1).slice(
                this.toArrInd(args.IND1),
                Cast.toNumber(args.IND2)
            )
        }

        arrLength(args) {
            return this.tryParse(args.ARR, 1).length
        }

        itemExists(args) {
            return (
                this.tryParse(args.ARR, 1).indexOf(this.toSafe(args.ITEM)) > -1
            )
        }

        arrMatches(args) {
            const arr = this.tryParse(args.ARR, 1)
            return arr.filter(item => item == this.toSafe(args.ITEM)).length
        }

        arrContainers(args) {
            const arr = this.tryParse(args.ARR, 1)
            return arr.filter(item =>
                Cast.toString(item).includes(this.toSafe(args.TESTER))
            ).length
        }

        itemIndex(args) {
            const arr = this.tryParse(args.ARR, 1)
            const ind = Cast.toNumber(args.IND)
            const safe = this.toSafe(args.ITEM)

            if (ind < 2) return arr.indexOf(safe) + 1 // faster behavior
            let count = 0
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] == safe && ++count === ind) return i + 1
            }

            return 0
        }

        mergeArray(args) {
            return this.tryParse(args.ARR1, 1).concat(
                this.tryParse(args.ARR2, 1)
            )
        }

        repeatArray(args) {
            const times = Cast.toNumber(args.NUM)
            return Array(times).fill(this.tryParse(args.ARR, 1)).flat()
        }

        fillArray(args) {
            const length = Cast.toNumber(args.NUM)
            const arr = this.tryParse(args.ARR, 1)
            return arr.concat(Array(Math.max(0, length - arr.length)).fill(''))
        }

        flatArray(args) {
            const arr = this.tryParse(args.ARR, 1)
            return arr.flat(Cast.toNumber(args.NUM))
        }

        arrOrder(args) {
            let arr = this.tryParse(args.ARR, 1)
            const sortFreq = (array, useCommon) => {
                const freqMap = {}
                array.forEach(i => {
                    freqMap[i] = (freqMap[i] || 0) + 1
                })
                if (useCommon)
                    return array.sort(
                        (a, b) =>
                            freqMap[b] - freqMap[a] ||
                            array.indexOf(a) - array.indexOf(b)
                    )
                else
                    return array.sort(
                        (a, b) =>
                            freqMap[a] - freqMap[b] ||
                            array.indexOf(a) - array.indexOf(b)
                    )
            }

            switch (args.ORDERER) {
                case 'reverse':
                    return arr.reverse()
                case 'ascending':
                    return arr.sort((a, b) => a - b)
                case 'descending':
                    return arr.sort((a, b) => b - a)
                case 'descending by length':
                    return arr.sort((a, b) => b.length - a.length)
                case 'ascending by length':
                    return arr.sort((a, b) => a.length - b.length)
                case 'A-z':
                    return arr.sort((a, b) => a.localeCompare(b))
                case 'z-A':
                    return arr.sort((a, b) => b.localeCompare(a))
                case 'most common':
                    return sortFreq(arr, true)
                case 'least common':
                    return sortFreq(arr, false)
                default:
                    for (let i = arr.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1))
                        ;[arr[i], arr[j]] = [arr[j], arr[i]]
                    }

                    return arr // random
            }
        }

        arrMake(args) {
            if (args.TYPE === 'array')
                return Cast.toString(args.TXT).split(args.SPLIT)
            else return this.tryParse(args.TXT, 1).join(args.SPLIT)
        }

        arrCheck(args, util) {
            return this.yieldingReporter(
                util,
                {
                    defaultValue: false,
                    isArray: true,
                    stackData: [['checks', []]]
                },
                /* createIterable */ () => this.tryParse(args.ARR, 1),
                /* onYield */ stackFrame =>
                    stackFrame.checks.push(Cast.toBoolean(args.BOOL)),
                /* onResult */ stackFrame => {
                    return args.TYPE === 'every'
                        ? stackFrame.checks.indexOf(false) === -1
                        : stackFrame.checks.indexOf(true) > -1
                }
            )
        }

        arrMap(args, util) {
            return this.yieldingReporter(
                util,
                { defaultValue: [], isArray: true },
                /* createIterable */ () => this.tryParse(args.ARR, 1),
                /* onYield */ stackFrame => {
                    stackFrame.iterable[stackFrame.index] = args.VALUE
                },
                /* onResult */ stackFrame => stackFrame.iterable
            )
        }

        arrSort(args, util) {
            const unsorted = this.tryParse(args.ARR, 1)
            return this.yieldingReporter(
                util,
                {
                    defaultValue: [],
                    stackData: [
                        ['comparables', {}],
                        ['unsorted', unsorted]
                    ]
                },
                /* createIterable */ () => {
                    const combos = []
                    for (var i = 0; i < unsorted.length; i++) {
                        for (var j = 0; j < unsorted.length; j++) {
                            if (j == i) continue
                            combos.push([i, j])
                        }
                    }

                    return combos
                },
                /* onYield */ (stackFrame, outerFrame) => {
                    const [i, j] = stackFrame.iterable[stackFrame.index]
                    stackFrame.comparables[`${i},${j}`] = Cast.toNumber(
                        args.VALUE
                    )
                },
                /* onResult */ stackFrame => {
                    const comparables = stackFrame.comparables
                    return stackFrame.unsorted
                        .map((v, i) => ({ v, i }))
                        .sort((a, b) => comparables[`${a.i},${b.i}`] ?? 0)
                        .map(x => x.v)
                }
            )
        }

        arrReduce(args, util) {
            return this.yieldingReporter(
                util,
                {
                    defaultValue: [],
                    isArray: true,
                    outerData: [['accumulator', args.INIT]]
                },
                /* createIterable */ () => this.tryParse(args.ARR, 1),
                /* onYield */ (_, outerFrame) => {
                    outerFrame.accumulator = args.VALUE
                },
                /* onResult */ (_, outerFrame) => {
                    const value = outerFrame.accumulator
                    delete outerFrame.accumulator
                    return value
                }
            )
        }

        // Util Funcs
        jsonValid(args) {
            const obj = args.OBJ
            const type = typeof obj
            if (type === 'object') return true
            if (this.alwaysParse) {
                if (type !== 'string') return false
                try {
                    JSON.parse(obj)
                    return true
                } catch {
                    return false
                }
            }
            return false
        }

        parse(args) {
            const obj = args.OBJ
            if (typeof obj === 'object') return obj
            try {
                return JSON.parse(obj)
            } catch {
                return ''
            }
        }

        clone(args) {
            const obj = args.OBJ
            try {
                if (typeof obj === 'object') return structuredClone(obj)
                return JSON.parse(obj)
            } catch {
                return ''
            }
        }

        convert(args) {
            switch (args.TYPE) {
                case 'array':
                    return Object.entries(this.tryParse(args.OBJ))
                case 'JSON':
                case 'object':
                    return Object.assign({}, this.tryParse(args.OBJ))
                case 'object from entries': {
                    try {
                        return Object.fromEntries(this.tryParse(args.OBJ, 1))
                    } catch {
                        return {}
                    }
                }
                case 'pretty string':
                    return JSON.stringify(
                        resolveCircular(this.tryParse(args.OBJ)),
                        undefined,
                        '\t'
                    )
                default:
                    return JSON.stringify(
                        resolveCircular(this.tryParse(args.OBJ))
                    )
            }
        }

        objKey(_, util) {
            const arr = util.thread.stackFrames[0].CCWSPjson
            if (arr) {
                if (util.thread.stackFrames[0].isArray)
                    return Cast.toNumber(arr[0]) + 1 ?? ''
                else return arr[0] ?? ''
            }
            return ''
        }
        arrIndex(_, util) {
            return this.objKey(null, util)
        }
        objValue(_, util, __, opt_item) {
            const arr = util.thread.stackFrames[0].CCWSPjson
            return arr ? (arr[opt_item ?? 1] ?? '') : ''
        }
        arrValueA(_, util) {
            return this.objValue(null, util, null, 0)
        }
        arrValueB(_, util) {
            return this.objValue(null, util)
        }
        arrAccum(_, util) {
            return util.thread.stackFrames[0].accumulator ?? ''
        }

        filterNew(args, util) {
            return this.yieldingReporter(
                util,
                {
                    defaultValue: '',
                    stackData: [['result', []]]
                },
                /* createIterable */ context => {
                    const parsed = this.tryParse(args.OBJ)
                    const entries = Object.entries(parsed)

                    context.isArray = Array.isArray(parsed)
                    this.stackFrameInit(util, true, [
                        ['isArray', context.isArray]
                    ])
                    return entries
                },
                /* onYield */ (stackFrame, outerFrame) => {
                    const entry = stackFrame.iterable[stackFrame.index]
                    const item = outerFrame.isArray ? entry[1] : entry
                    if (args.BOOL) stackFrame.result.unshift(item)
                    else if (args.TYPE === 'order') stackFrame.result.push(item)
                },
                /* onResult */ (stackFrame, outerFrame) => {
                    const value =
                        args.TYPE === 'filter'
                            ? stackFrame.result.reverse()
                            : stackFrame.result
                    return outerFrame.isArray
                        ? value
                        : Object.fromEntries(value)
                }
            )
        }

        forEach(args, util) {
            if (util.stackFrame.execute) {
                util.stackFrame.index++
                const { index, entries } = util.stackFrame
                if (index > entries.length - 1) return
                util.thread.stackFrames[0].CCWSPjson = entries[index]
            } else {
                const parse = this.tryParse(args.OBJ)
                const entries = Object.entries(parse)
                if (entries.length === 0) return

                this.stackFrameInit(util, true, [
                    ['CCWSPjson', entries[0]],
                    ['isArray', Array.isArray(parse)]
                ])
                this.stackFrameInit(util, false, [
                    ['execute', true],
                    ['entries', entries],
                    ['index', 0]
                ])
            }

            util.startBranch(1, true)
        }

        setRawVarValue(args, util) {
            const name = Cast.toString(args.NAME)
            const type = args.TYPE === 'variable' ? '' : 'list'
            const stage = runtime.getTargetForStage()

            let variable = stage.lookupVariableByNameAndType(name, type)
            if (!variable)
                variable = util.target.lookupVariableByNameAndType(name, type)

            if (variable) {
                if (type === 'list' && !Array.isArray(args.VALUE)) return
                variable.value = args.VALUE
            }
        }

        rawVarValue(args, util) {
            const name = Cast.toString(args.NAME)
            const type = args.TYPE === 'variable' ? '' : 'list'
            const stage = runtime.getTargetForStage()

            let variable = stage.lookupVariableByNameAndType(name, type)
            if (!variable)
                variable = util.target.lookupVariableByNameAndType(name, type)

            return variable ? variable.value : ''
        }

        toggleSetting(args) {
            const opt = this._settings.find(
                item => item.value === args.THING
            )?.value
            if (opt) {
                this[opt] = args.TYPE === 'enabled'
                this.initParser()
            }
        }

        isSettingOn(args) {
            const opt = this._settings.find(
                item => item.value === args.THING
            )?.value
            return opt ? this[opt] : false
        }

        optiReader() {
            // these numbers arent accurate but represent what works well
            let optiLevel = 100

            if (this.alwaysCast) optiLevel -= 5
            if (this.alwaysValidateKeys) optiLevel -= 5

            // alwaysTryParse removes a bunch of logic, so only evaluate this
            if (!this.alwaysTryParse) return `${optiLevel} [UNSAFE MODE]`

            if (this.useNewObj) optiLevel -= 40
            if (this.alwaysParse) optiLevel -= 50

            return `${optiLevel} [SAFE MODE]`
        }

        doInput() {
            /* noop */
        }

        /* Deprecation Marker */
        filterResult(_, util) {
            return util.thread.CCWSPjsonFilterRes ?? ''
        }
        filter(args, util) {}
        /* Marker End */
    }

    extContext = new CCWSPjson()
    Scratch.extensions.register(extContext)

    window.IIFEExtensionInfoList = window.IIFEExtensionInfoList || [{}]
    const targetInfo = window.IIFEExtensionInfoList.find(
        info => info.extensionInstance === extContext
    )
    const extensionObject = {
        Extension: CCWSPjson,
        info: {
            name: 'CCWSPjson.name',
            description: 'CCWSPjson.descp',
            extensionId: 'CCWSPjson',
            iconURL:
                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDkuMjk4IiBoZWlnaHQ9IjE1OS42NDgiIHZpZXdCb3g9IjAgMCAzMDkuMjk4IDE1OS42NDgiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCB4MT0iMjQwIiB5MT0iMTA1LjY3NSIgeDI9IjI0MCIgeTI9IjI1NS4zMjMiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBpZD0iYSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMzg0MzczIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNTA1ZmE2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTcuMTU4IDE1Mi45ODRWNS42NjVIMzAyLjE0djE0Ny4zMTh6IiBmaWxsPSIjNzQ4YmVlIi8+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlLW9wYWNpdHk9Ii41MDIiIHN0cm9rZT0iIzhjYTFmZiIgc3Ryb2tlLXdpZHRoPSI2LjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0xNDcuNDYxIDIwLjcyLTIxLjg0NiAxMi42MTMtMjEuODQ3LTEyLjYxM1Y0LjM5OGg0My42OTN6Ii8+PHBhdGggZD0ibTEyNS4yMDMgNTcuODE4LTIxLjg0NyAxMi42MTNMODEuNTEgNTcuODE4VjMyLjU5MmwyMS44NDYtMTIuNjE0IDIxLjg0NyAxMi42MTR6Ii8+PHBhdGggZD0iTTEwMi45NDQgMjAuNzIgODEuMDk4IDMzLjMzMyA1OS4yNTIgMjAuNzJWNC4zOThoNDMuNjkyem0xMjIuMjkyIDEwOC4zNzItMjEuODQ2IDEyLjYxMy0yMS44NDctMTIuNjEzdi0yNS4yMjZsMjEuODQ3LTEyLjYxMyAyMS44NDYgMTIuNjEzeiIvPjxwYXRoIGQ9Im0yMDIuOTc4IDkxLjk5NS0yMS44NDcgMTIuNjEzLTIxLjg0Ni0xMi42MTNWNjYuNzY5bDIxLjg0Ni0xMi42MTMgMjEuODQ3IDEyLjYxM3oiLz48cGF0aCBkPSJtMTgwLjcxOSAxMjkuMDkyLTIxLjg0NiAxMi42MTMtMjEuODQ2LTEyLjYxM3YtMjUuMjI2bDIxLjg0Ni0xMi42MTMgMjEuODQ2IDEyLjYxM3ptMTE2Ljc5NS00Ni44NC0yMS44NDYtMTIuNjEzVjQ0LjQxM0wyOTcuNTE0IDMxLjh6bS0yMi42Ny0xMi42MTMtMjEuODQ2IDEyLjYxMy0yMS44NDctMTIuNjEzVjQ0LjQxM0wyNTIuOTk4IDMxLjhsMjEuODQ2IDEyLjYxM3oiLz48cGF0aCBkPSJtMjk3LjEwMiAzMi41NDItMjEuODQ2IDEyLjYxMy0yMS44NDYtMTIuNjEzVjcuMzE2aDQzLjY5MnptLTQ0LjUxNiAwLTIxLjg0OCAxMi42MTMtMjEuODQ2LTEyLjYxM1Y3LjMxNmg0My42OTN6TTE4LjIyOCAxNDcuMjdjLTcuMTItNC4xMS0zLjAyMy0zMi4xMDctMy4wMjMtMzIuMTA3bDIxLjg0NiAxMi42MTN2MjUuMjI2cy0xMS4zOTItMS40NDItMTguODIzLTUuNzMyem0xOS42NDctMTkuNDk0IDIxLjg0Ni0xMi42MTMgMjEuODQ3IDEyLjYxM3YyNS4yMjZIMzcuODc1eiIvPjxwYXRoIGQ9Im0xNS42MTcgOTAuNjc5IDIxLjg0Ni0xMi42MTMgMjEuODQ2IDEyLjYxM3YyNS4yMjZsLTIxLjg0NiAxMi42MTMtMjEuODQ2LTEyLjYxM3ptNjYuNzc1IDM3LjA5NyAyMS44NDYtMTIuNjEzIDIxLjg0NiAxMi42MTN2MjUuMjI2SDgyLjM5MnoiLz48cGF0aCBkPSJNNjAuMTMzIDkwLjY3OSA4MS45OCA3OC4wNjZsMjEuODQ2IDEyLjYxM3YyNS4yMjZMODEuOTggMTI4LjUxOGwtMjEuODQ3LTEyLjYxM3oiLz48L2c+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjc3ZWU2IiBzdHJva2Utd2lkdGg9IjYuNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTE2NC4wODUgNC4zOThoNDMuNjkzVjIwLjcybC0yMS44NDYgMTIuNjEzLTIxLjg0Ny0xMi42MTN6Ii8+PHBhdGggZD0ibTE4Ni4zNDQgMzIuNTkyIDIxLjg0Ni0xMi42MTQgMjEuODQ2IDEyLjYxNHYyNS4yMjZMMjA4LjE5IDcwLjQzMWwtMjEuODQ2LTEyLjYxM3oiLz48cGF0aCBkPSJNMjA4LjYwMiA0LjM5OGg0My42OTNWMjAuNzJsLTIxLjg0NyAxMi42MTMtMjEuODQ2LTEyLjYxM3pNODYuMzExIDEwMy44NjZsMjEuODQ2LTEyLjYxMyAyMS44NDYgMTIuNjEzdjI1LjIyNmwtMjEuODQ1IDEyLjYxMy0yMS44NDYtMTIuNjEzeiIvPjxwYXRoIGQ9Im0xMDguNTY4IDY2Ljc2OSAyMS44NDctMTIuNjEzIDIxLjg0NyAxMi42MTN2MjUuMjI2bC0yMS44NDcgMTIuNjEzLTIxLjg0Ni0xMi42MTN6Ii8+PHBhdGggZD0ibTEzMC44MjggMTAzLjg2NiAyMS44NDUtMTIuNjEzIDIxLjg0NyAxMi42MTN2MjUuMjI2bC0yMS44NDYgMTIuNjEzLTIxLjg0Ny0xMi42MTN6TTE0LjAzMiAzMS44bDIxLjg0NyAxMi42MTN2MjUuMjI2TDE0LjAzMiA4Mi4yNTJ6bTIyLjY3IDEyLjYxM0w1OC41NDkgMzEuOGwyMS44NDYgMTIuNjEzdjI1LjIyNkw1OC41NDkgODIuMjUyIDM2LjcwMiA2OS42Mzl6Ii8+PHBhdGggZD0iTTE0LjQ0NCA3LjMxNmg0My42OTN2MjUuMjI2TDM2LjI5MSA0NS4xNTUgMTQuNDQ0IDMyLjU0MnptNDQuNTE3IDBoNDMuNjkydjI1LjIyNkw4MC44MDggNDUuMTU1IDU4Ljk2MiAzMi41NDJ6bTIxNS41MzQgMTQ1LjY4NnYtMjUuMjI2bDIxLjg0Ny0xMi42MTNzNC4wOTYgMjcuOTk2LTMuMDI0IDMyLjEwN2MtNy40MzEgNC4yOS0xOC44MjMgNS43MzItMTguODIzIDUuNzMyem0tLjgyNCAwaC00My42OTJ2LTI1LjIyNmwyMS44NDYtMTIuNjEzIDIxLjg0NiAxMi42MTN6Ii8+PHBhdGggZD0ibTI5NS45MyAxMTUuOTA1LTIxLjg0NyAxMi42MTMtMjEuODQ2LTEyLjYxM1Y5MC42NzlsMjEuODQ2LTEyLjYxMyAyMS44NDcgMTIuNjEzem0tNjYuNzc1IDM3LjA5N2gtNDMuNjkzdi0yNS4yMjZsMjEuODQ2LTEyLjYxMyAyMS44NDcgMTIuNjEzeiIvPjxwYXRoIGQ9Im0yNTEuNDEzIDExNS45MDUtMjEuODQ2IDEyLjYxMy0yMS44NDctMTIuNjEzVjkwLjY3OWwyMS44NDctMTIuNjEzIDIxLjg0NiAxMi42MTN6Ii8+PC9nPjxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzU3NmZkOSIgc3Ryb2tlLXdpZHRoPSI2LjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xNTcuNTg1IDQuMzk4aDQzLjY5M1YyMC43MmwtMjEuODQ2IDEyLjYxMy0yMS44NDctMTIuNjEzeiIvPjxwYXRoIGQ9Im0xNzkuODQ0IDMyLjU5MiAyMS44NDYtMTIuNjE0IDIxLjg0NiAxMi42MTR2MjUuMjI2TDIwMS42OSA3MC40MzFsLTIxLjg0Ni0xMi42MTN6Ii8+PHBhdGggZD0iTTIwMi4xMDIgNC4zOThoNDMuNjkzVjIwLjcybC0yMS44NDcgMTIuNjEzLTIxLjg0Ni0xMi42MTN6TTc5LjgxMSAxMDMuODY2bDIxLjg0Ni0xMi42MTMgMjEuODQ2IDEyLjYxM3YyNS4yMjZsLTIxLjg0NSAxMi42MTMtMjEuODQ2LTEyLjYxM3oiLz48cGF0aCBkPSJtMTAyLjA2OCA2Ni43NjkgMjEuODQ3LTEyLjYxMyAyMS44NDcgMTIuNjEzdjI1LjIyNmwtMjEuODQ3IDEyLjYxMy0yMS44NDYtMTIuNjEzeiIvPjxwYXRoIGQ9Im0xMjQuMzI4IDEwMy44NjYgMjEuODQ1LTEyLjYxMyAyMS44NDcgMTIuNjEzdjI1LjIyNmwtMjEuODQ3IDEyLjYxMy0yMS44NDYtMTIuNjEzek03LjUzMiAzMS44bDIxLjg0NyAxMi42MTN2MjUuMjI2TDcuNTMyIDgyLjI1MnptMjIuNjcgMTIuNjEzTDUyLjA0OSAzMS44bDIxLjg0NiAxMi42MTN2MjUuMjI2TDUyLjA0OSA4Mi4yNTIgMzAuMjAyIDY5LjYzOXoiLz48cGF0aCBkPSJNNy45NDQgNy4zMTZoNDMuNjkzdjI1LjIyNkwyOS43OTEgNDUuMTU1IDcuOTQ0IDMyLjU0MnptNDQuNTE3IDBoNDMuNjkydjI1LjIyNkw3NC4zMDggNDUuMTU1IDUyLjQ2MiAzMi41NDJ6bTIyNy4wMzQgMTQ4LjY4NnYtMjUuMjI2bDIxLjg0Ny0xMi42MTNzNC4wOTYgMjcuOTk2LTMuMDI0IDMyLjEwN2MtNy40MzEgNC4yOS0xOC44MjMgNS43MzItMTguODIzIDUuNzMyem0tLjgyNCAwaC00My42OTJ2LTI1LjIyNmwyMS44NDYtMTIuNjEzIDIxLjg0NiAxMi42MTN6Ii8+PHBhdGggZD0ibTMwMC45MyAxMTguOTA1LTIxLjg0NyAxMi42MTMtMjEuODQ2LTEyLjYxM1Y5My42NzlsMjEuODQ2LTEyLjYxMyAyMS44NDcgMTIuNjEzem0tNjYuNzc1IDM3LjA5N2gtNDMuNjkzdi0yNS4yMjZsMjEuODQ2LTEyLjYxMyAyMS44NDcgMTIuNjEzeiIvPjxwYXRoIGQ9Im0yNTYuNDEzIDExOC45MDUtMjEuODQ2IDEyLjYxMy0yMS44NDctMTIuNjEzVjkzLjY3OWwyMS44NDctMTIuNjEzIDIxLjg0NiAxMi42MTN6Ii8+PC9nPjxwYXRoIGQ9Ik05MC4zNTIgMTE4LjE3YzAtNi4zOTggNS45MTUtMTIuNDk0IDEzLjEyLTEyLjQ5NGgyNzIuNjFjOC42MTMgMCAxMy41NjggNC42NDIgMTMuNTY4IDEyLjI0NXYxMjUuNzA1YzAgNi4wNC00Ljg2IDExLjY5Ny0xMy4zMiAxMS42OTdIMTAzLjcyYy03LjMyNyAwLTEzLjM2OC00LjUyMy0xMy4zNjgtMTEuOTQ3eiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ1cmwoI2EpIiBzdHJva2Utd2lkdGg9IjEwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtODUuMzUyIC0xMDAuNjc1KSIvPjxwYXRoIGQ9Ik0yMi41NjUgMTI3LjkzcTAtMS4xMjIuNjYtMi42MTUuNjU4LTEuNSAxLjQ0LTIuMDM4IDEuNDcgMS4wODMgMi45ODUgMS4wODNsMS4yMDUtLjE5cTIuMDkyLS42MiAyLjE2OC0zLjM0MXYtOS44OWgtMy4xcS0uNjYgMC0uOTMyLTEuNjc1LS4xMi0uODExLS4xMjEtMS42NiAwLS44NTcuMTIxLTEuNjc1LjI3My0xLjY2Ny45MzItMS42NjdoOS4yMzFxLjc4IDAgMS4xNjcuNDQ3dC4zODcgMS4wNjh2MTguMzFxMCAzLjgwNS0yLjU0NyA1Ljc4My0yLjUzOCAxLjk3OC02LjA5MyAxLjk3OC0zLjU0NyAwLTUuNTI1LTEuMDQ2LTEuOTc4LTEuMDQ1LTEuOTc4LTIuODcyem0yMC41MjYtNS45NzJxLjczNS41ODQgMi41NCAxLjU5MSAxLjgxIDEuMDA4IDMuNDU1IDEuMDA4IDEuNjUyIDAgMS42NTItMS4yOCAwLS41ODQtLjQ3LTEuMDMxLS40NjItLjQ0OC0xLjcwNS0xLjAyM2E1MSA1MSAwIDAgMS0xLjg2NC0uOTFxLS42MjEtLjMzMy0xLjY1Mi0xLjA5MS0xLjAyMy0uNzU3LTEuNTctMS41NzYtMS41NDUtMi4yMDUtMS41NDUtNS42MjQgMC0zLjQxNyAyLjUzOS01Ljc2IDIuNTM4LTIuMzQ5IDYuNjU0LTIuMzQ5IDIuNzk2IDAgNS4xNi42MDYgMi4zNjUuNTk5IDIuNDQxIDEuNTd2LjIyN3EwIDEuMzY0LS44NTYgMy40NC0uODQ5IDIuMDctMS4xOTggMi4zMDQtMi40ODYtMS4yOC00LjQ0OC0xLjI4LTEuOTU2IDAtMS45NTYgMS4zOTQgMCAuODU2IDEuNDQgMS41MTYuMzEuMTU5Ljg4Ny40MzIuNTg0LjI2NSAxLjM0MS42MzYuNzU5LjM3MSAxLjYzLjkzMnQxLjg4NyAxLjQ5M3EyLjA1NCAxLjk0IDIuMDU0IDUuMTI0IDAgNC4xNTMtMi4yODkgNi43OXQtNy4wNjMgMi43MTNxLTIuMzI3IDAtNC4yMTQtLjM4Ni0xLjg4LS4zODctMy4yODItMS41MDgtMS4zOTUtMS4xMy0xLjM5NC0yLjcyMSAwLTEuNTkyLjU4My0zLjE2LjU4NS0xLjU3NyAxLjI0My0yLjA3N3ptMzEuMTM5IDkuODUycS01LjQ0OSAwLTguODgyLTMuNTd0LTMuNDMzLTEwLjQxMnEwLTYuODUyIDMuNDctMTAuMzgzIDMuNDcxLTMuNTMyIDguOTU5LTMuNTMyIDUuNDk0IDAgOC44NjcgMy40NzEgMy4zOCAzLjQ3IDMuMzggMTAuNTIgMCA3LjA0LTMuNDU2IDEwLjQ3My0zLjQ0OCAzLjQzMy04LjkwNSAzLjQzM3ptLjAyMy0yMC40NDdxLTEuODY1IDAtMy4xMyAxLjcxM2MtLjgzOSAxLjEzNi4zNDUgMi43MzMuMzQ1IDQuNzlzLTEuMjAyIDMuNjM1LS4zOTggNC43MzZxMS4yMDQgMS42NDUgMy4xNiAxLjY0NSAxLjk2MyAwIDMuMTgzLTEuNjY4IDEuMjItMS42NzQgMS4yMi00Ljc3NCAwLTMuMTA4LTEuMjU4LTQuNzc1dC0zLjEyMi0xLjY2N3ptMzYuNzA3IDE5LjIwNHEwIC44MTktMy42NTMuODE5LTMuNjQ1IDAtMy45NTYtLjU4NGwtNi40OC0xMi4xMDN2MTIuMDY1cTAgLjY5OC0zLjU5Mi42OTgtMy41ODUgMC0zLjU4NS0uNjk4di0yNS45NTdxMC0uNTgzIDMuMDYyLS41ODMgMS4yMDUgMCAyLjgxMi4yMTIgMS42MTQuMjEyIDEuOTYzLjc5Nmw2LjIwNyAxMS45NTF2LTEyLjE4NnEwLS43MzUgMy42MDctLjczNSAzLjYxNSAwIDMuNjE1LjczNXptMTMuNDI0LTEzLjIzMnEtMS4wODMtMS45NC0xLjA4My0zLjE2dC42NTktMS41N3EyLjIwNS0uOTcgNi4wNjMtLjk3IDMuODY1IDAgNS40NTcgMS44MDQgMS41OSAxLjgwNCAxLjU5MSA1LjMzNnY2LjEzMWgxLjMxOXEuNjYgMCAxLjAzLjc4LjM3Mi43NzQuMzcyIDIuMTMgMCAxLjM1Ny0uNjgyIDIuNjc1LS42ODMgMS4zMi0xLjg0MiAxLjMyLTIuMSAwLTMuMzgtMS4xMjNhMy4yIDMuMiAwIDAgMS0uODg3LTEuMTI5cS0xLjc4OCAyLjI1LTUuNTU1IDIuMjUxLTIuODI2IDAtNC43NjctMi4wMTYtMS45NC0yLjAxNi0xLjk0LTQuNzc0IDAtNi4zMiA3LjU2NC02LjMyaDIuMTM3di0uMzk1cTAtMS4wMDgtLjMzNC0xLjI5Ni0uMzI2LS4yODgtMS41My0uMjg4LTEuNDc5IDAtNC4xOTIuNjE0em0zLjEwOCA3LjE0N3EwIC44NDguNDYyIDEuMjk2LjQ2Mi40NDcgMS4xODIuNDQ3dDEuMzA0LS41ODR2LTIuOTg2aC0xLjA5MnEtMS44NTYgMC0xLjg1NiAxLjgyN3ptMjIuNjE1IDYuNzA3cTAgLjI3My0yLjc5LjI3My0zLjg4LS4xMTQtMy44OC0uNDI1di0xMi41NzJoLTEuMDA4cS0xLjAwOCAwLTEuMzE4LTEuNzA1YTYgNiAwIDAgMS0uMDg0LTEuMDA4cTAtMS4yMDUuNDctMi40MS42OTgtMS43MDUgMi4xNjgtMS43MDUgMS40NzggMCAyLjYzNy42OTcgMS4xNjguNjk4IDEuNTYxIDEuMzk0IDIuNDQtMi4wOTEgNS44MTMtMi4wOTEgMy4zOCAwIDQuODg4IDEuODI2IDEuNTE1IDEuODE5IDEuNTE2IDUuOTcydjExLjY0MXEwIC40NjItMy4zMi40NjItMy4zMSAwLTMuMzExLS40NjJWMTE5Ljg2cTAtMS45NC0xLjM1Ny0xLjk0LS4zOTMgMC0xLjA5MS4zMzMtLjY5OC4zMjYtLjg5NC40ODV6bTIzLjA5My0yNi42OTJxMC0uNTg0IDMuMDYyLS41ODQgMS4wNDUgMCAyLjQyNS4xMzYgMS4zOC4xMzcgMS4zNzkuMzY0djIwLjQ1NWgxLjM1N3EuOTcgMCAxLjI4IDEuNzQzLjA3Ni41MDguMDc2IDEuMzggMCAuODctLjUzOCAyLjExNC0uNzggMS43MDUtMi40ODYgMS43MDUtMS4yOCAwLTIuMjczLS41LS45ODYtLjUwOC0xLjMzNC0xLjA1M2wtLjM0OS0uNXEtMi4xMzcgMi4wNTMtNS4zNTggMi4wNTN0LTUuNTEtMi42NzUtMi4yODgtNy40NjVxMC00Ljc5NyAyLjQwMi03LjQxMiAyLjQxLTIuNjIyIDYuMDE4LTIuNjIyIDEuMDQ2IDAgMi4xMzcuMjM1em0tMS4yODEgMTMuMzQ2Yy0xLjQ1IDAtNS4yOTIgMS4yMTctNS4yOTIgMy44MjkgMCAxLjMxOCAzLjMyNCAyLjM2IDMuNzM4IDIuOTQ2cS42MjIuODcyIDEuMzguODcydDEuNDU1LS42NnYtNi42cS0uNjYtLjM4Ny0xLjI4MS0uMzg3em0zOS4xMDkgMTMuNjU2cS0zLjM3MyAwLTMuNjQ2LTEuMDgzbC0xLjI4LTUuMDFoLTYuMTdsLTEuMTIxIDQuODEzcS0uMjM1IDEuMjA1LTMuNzI5IDEuMjA1LTEuODY0IDAtMi43NTktLjIxMy0uODg2LS4yMTItLjg4Ni0uMzMzbDYuODY2LTI2LjI2OHEwLS4zMSA1LjMxMy0uMzEgNS4zMiAwIDUuMzIuMzFsNi43MTUgMjYuMzA2cTAgLjI3My0xLjc4OS40MzItMS43OC4xNS0yLjgzNC4xNTF6bS0xMC4xMjYtMTEuMDE5aDQuMDc4bC0xLjc1LTguMDMzaC0uMjI4em0yNi4xNDggMTAuOTA2YzAgLjE4Mi0xLjcxMi4yNzMtNC4wNjYuMjczcS0zLjUzMi0uMDg0LTMuNTMyLS4zMTF2LTEyLjg4NGgtMS4wNDZxLS42MjEgMC0uOTkzLS43NTgtLjM3LS43NTgtLjM3MS0xLjg4IDAtNC4xOSAyLjQ4Ni00LjE5IDEuNzQzIDAgMi45MSAxLjA2OCAxLjE2NyAxLjA2MiAxLjE2NyAyLjQyNS44MS0xLjU5IDIuMTktMi41MzggMS4zOC0uOTU1IDIuODEyLS45NTUgMi4yNTEgMCAyLjcyIDEuMTYuMTE1LjMxLjExNC45MTYgMCAuNi0uMzcgMi4xNTMtLjM2NCAxLjU1My0uNzU5IDIuMjUtLjM4Ni42OTgtLjQ2Mi42OTgtLjA3NSAwLS43Mi0uMjg4LS42MzYtLjI5Ni0xLjE0NC0uMjk2LTEuNDcgMC0xLjQ3IDIuMzI3em0xNC44MzEgMHEwIC4yNzMtMy41MzEuMjczYy0yLjM1NS0uMDU2LTQuMzMzLS4xNi00LjMzMy0uMzExIDAgMC0uOTktMTMuMTM3LTEuMjM4LTEzLjY0MnEtLjM3LS43NTgtLjM3MS0xLjg4IDAtNC4xOSAyLjQ4Ni00LjE5IDEuNzQzIDAgMi45MSAxLjA2OCAxLjE2NyAxLjA2MiAxLjE2NyAyLjQyNS44MS0xLjU5IDIuMTktMi41MzggMS4zOC0uOTU1IDIuODEyLS45NTUgMi4yNSAwIDIuNzIgMS4xNi4xMTUuMzEuMTE0LjkxNiAwIC42LS4zNzEgMi4xNTMtLjM2MyAxLjU1My0uNzU4IDIuMjUtLjM4Ni42OTgtLjQ2Mi42OTgtLjA3NSAwLS43Mi0uMjg4LS42MzYtLjI5Ni0xLjE0NC0uMjk2LTEuNDcgMC0xLjQ3IDIuMzI3em05LjMxLTE0LjA1MXEtMS4wODMtMS45NC0xLjA4My0zLjE2dC42Ni0xLjU3cTIuMjA1LS45NyA2LjA2Mi0uOTcgMy44NjUgMCA1LjQ1NyAxLjgwNHQxLjU5MSA1LjMzNnY2LjEzMWgxLjMycS42NTggMCAxLjAzLjc4LjM3Ljc3NC4zNzEgMi4xMyAwIDEuMzU3LS42ODIgMi42NzUtLjY4MiAxLjMyLTEuODQxIDEuMzItMi4xIDAtMy4zOC0xLjEyM2EzLjIgMy4yIDAgMCAxLS44ODctMS4xMjlxLTEuNzg5IDIuMjUtNS41NTUgMi4yNTEtMi44MjggMC00Ljc2Ny0yLjAxNnQtMS45NC00Ljc3NHEwLTYuMzIgNy41NjMtNi4zMmgyLjEzN3YtLjM5NXEwLTEuMDA4LS4zMzMtMS4yOTYtLjMyNy0uMjg4LTEuNTMxLS4yODgtMS40NzggMC00LjE5MS42MTR6bTMuMTA4IDcuMTQ3cTAgLjg0OC40NjIgMS4yOTYuNDYzLjQ0NyAxLjE4My40NDd0MS4zMDMtLjU4NHYtMi45ODZoLTEuMDkxcS0xLjg1NyAwLTEuODU3IDEuODI3em0xMy4xNS0xMi4yNjNxMC0uNDMyIDMuNTQ2LS40MzIgMy41NTUgMCAzLjY3Ni4zODdsMi43ODkgOS4xNjIgMi42NzUtOS4yMzhxLjE2LS4zMSAyLjQxLS4zMSA1LjE2IDAgNC45MjYuNTA3bC05LjExNyAyNS45NTdxLS4wMzguMjM1LTIuMTE0LjIzNXQtMy44NjYtLjEzNnEtMS43OC0uMTM3LTEuNzA1LS4zMzRsMy4zOC04LjE0N3oiIGZpbGw9Im5vbmUiIHN0cm9rZS1vcGFjaXR5PSIuNTAyIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iOC41IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTIyLjU2NSAxMjcuOTNxMC0xLjEyMi42Ni0yLjYxNS42NTgtMS41IDEuNDQtMi4wMzggMS40NyAxLjA4MyAyLjk4NSAxLjA4M2wxLjIwNS0uMTlxMi4wOTItLjYyIDIuMTY4LTMuMzQxdi05Ljg5aC0zLjFxLS42NiAwLS45MzItMS42NzUtLjEyLS44MTEtLjEyMS0xLjY2IDAtLjg1Ny4xMjEtMS42NzUuMjczLTEuNjY3LjkzMi0xLjY2N2g5LjIzMXEuNzggMCAxLjE2Ny40NDd0LjM4NyAxLjA2OHYxOC4zMXEwIDMuODA1LTIuNTQ3IDUuNzgzLTIuNTM4IDEuOTc4LTYuMDkzIDEuOTc4LTMuNTQ3IDAtNS41MjUtMS4wNDYtMS45NzgtMS4wNDUtMS45NzgtMi44NzJtMjAuNTI2LTUuOTcycS43MzUuNTg0IDIuNTQgMS41OTEgMS44MSAxLjAwOCAzLjQ1NSAxLjAwOCAxLjY1MiAwIDEuNjUyLTEuMjggMC0uNTg0LS40Ny0xLjAzMS0uNDYyLS40NDgtMS43MDUtMS4wMjNhNTEgNTEgMCAwIDEtMS44NjQtLjkxcS0uNjIxLS4zMzMtMS42NTItMS4wOTEtMS4wMjMtLjc1Ny0xLjU3LTEuNTc2LTEuNTQ1LTIuMjA1LTEuNTQ1LTUuNjI0IDAtMy40MTcgMi41MzktNS43NiAyLjUzOC0yLjM0OSA2LjY1NC0yLjM0OSAyLjc5NiAwIDUuMTYuNjA2IDIuMzY1LjU5OSAyLjQ0MSAxLjU3di4yMjdxMCAxLjM2NC0uODU2IDMuNDQtLjg0OSAyLjA3LTEuMTk4IDIuMzA0LTIuNDg2LTEuMjgtNC40NDgtMS4yOC0xLjk1NiAwLTEuOTU2IDEuMzk0IDAgLjg1NiAxLjQ0IDEuNTE2LjMxLjE1OS44ODcuNDMyLjU4NC4yNjUgMS4zNDEuNjM2Ljc1OS4zNzEgMS42My45MzJ0MS44ODcgMS40OTNxMi4wNTQgMS45NCAyLjA1NCA1LjEyNCAwIDQuMTUzLTIuMjg5IDYuNzl0LTcuMDYzIDIuNzEzcS0yLjMyNyAwLTQuMjE0LS4zODYtMS44OC0uMzg3LTMuMjgyLTEuNTA4LTEuMzk1LTEuMTMtMS4zOTQtMi43MjEgMC0xLjU5Mi41ODMtMy4xNi41ODUtMS41NzcgMS4yNDMtMi4wNzdtMzEuMTM5IDkuODUycS01LjQ0OSAwLTguODgyLTMuNTd0LTMuNDMzLTEwLjQxMnEwLTYuODUyIDMuNDctMTAuMzgzIDMuNDcxLTMuNTMyIDguOTU5LTMuNTMyIDUuNDk0IDAgOC44NjcgMy40NzEgMy4zOCAzLjQ3IDMuMzggMTAuNTIgMCA3LjA0LTMuNDU2IDEwLjQ3My0zLjQ0OCAzLjQzMy04LjkwNSAzLjQzM20uMDIzLTIwLjQ0N3EtMS44NjUgMC0zLjEzIDEuNzEzLTEuMjU4IDEuNzA0LTEuMjU4IDQuNzkgMCAzLjA4NCAxLjIwNSA0LjczNiAxLjIwNCAxLjY0NSAzLjE2IDEuNjQ1IDEuOTYzIDAgMy4xODMtMS42NjggMS4yMi0xLjY3NCAxLjIyLTQuNzc0IDAtMy4xMDgtMS4yNTgtNC43NzV0LTMuMTIyLTEuNjY3bTM2LjcwNyAxOS4yMDRxMCAuODE5LTMuNjUzLjgxOS0zLjY0NSAwLTMuOTU2LS41ODRsLTYuNDgtMTIuMTAzdjEyLjA2NXEwIC42OTgtMy41OTIuNjk4LTMuNTg1IDAtMy41ODUtLjY5OHYtMjUuOTU3cTAtLjU4MyAzLjA2Mi0uNTgzIDEuMjA1IDAgMi44MTIuMjEyIDEuNjE0LjIxMiAxLjk2My43OTZsNi4yMDcgMTEuOTUxdi0xMi4xODZxMC0uNzM1IDMuNjA3LS43MzUgMy42MTUgMCAzLjYxNS43MzV6bTEzLjQyNC0xMy4yMzJxLTEuMDgzLTEuOTQtMS4wODMtMy4xNnQuNjU5LTEuNTdxMi4yMDUtLjk3IDYuMDYzLS45NyAzLjg2NSAwIDUuNDU3IDEuODA0IDEuNTkgMS44MDQgMS41OTEgNS4zMzZ2Ni4xMzFoMS4zMTlxLjY2IDAgMS4wMy43OC4zNzIuNzc0LjM3MiAyLjEzIDAgMS4zNTctLjY4MiAyLjY3NS0uNjgzIDEuMzItMS44NDIgMS4zMi0yLjEgMC0zLjM4LTEuMTIzYTMuMiAzLjIgMCAwIDEtLjg4Ny0xLjEyOXEtMS43ODggMi4yNS01LjU1NSAyLjI1MS0yLjgyNiAwLTQuNzY3LTIuMDE2LTEuOTQtMi4wMTYtMS45NC00Ljc3NCAwLTYuMzIgNy41NjQtNi4zMmgyLjEzN3YtLjM5NXEwLTEuMDA4LS4zMzQtMS4yOTYtLjMyNi0uMjg4LTEuNTMtLjI4OC0xLjQ3OSAwLTQuMTkyLjYxNG0zLjEwOCA3LjE0N3EwIC44NDguNDYyIDEuMjk2LjQ2Mi40NDcgMS4xODIuNDQ3dDEuMzA0LS41ODR2LTIuOTg2aC0xLjA5MnEtMS44NTYgMC0xLjg1NiAxLjgyN20yMi42MTUgNi43MDdxMCAuMjczLTIuNzkuMjczLTMuODgtLjExNC0zLjg4LS40MjV2LTEyLjU3MmgtMS4wMDhxLTEuMDA4IDAtMS4zMTgtMS43MDVhNiA2IDAgMCAxLS4wODQtMS4wMDhxMC0xLjIwNS40Ny0yLjQxLjY5OC0xLjcwNSAyLjE2OC0xLjcwNSAxLjQ3OCAwIDIuNjM3LjY5NyAxLjE2OC42OTggMS41NjEgMS4zOTQgMi40NC0yLjA5MSA1LjgxMy0yLjA5MSAzLjM4IDAgNC44ODggMS44MjYgMS41MTUgMS44MTkgMS41MTYgNS45NzJ2MTEuNjQxcTAgLjQ2Mi0zLjMyLjQ2Mi0zLjMxIDAtMy4zMTEtLjQ2MlYxMTkuODZxMC0xLjk0LTEuMzU3LTEuOTQtLjM5MyAwLTEuMDkxLjMzMy0uNjk4LjMyNi0uODk0LjQ4NXptMjMuMDkzLTI2LjY5MnEwLS41ODQgMy4wNjItLjU4NCAxLjA0NSAwIDIuNDI1LjEzNiAxLjM4LjEzNyAxLjM3OS4zNjR2MjAuNDU1aDEuMzU3cS45NyAwIDEuMjggMS43NDMuMDc2LjUwOC4wNzYgMS4zOCAwIC44Ny0uNTM4IDIuMTE0LS43OCAxLjcwNS0yLjQ4NiAxLjcwNS0xLjI4IDAtMi4yNzMtLjUtLjk4Ni0uNTA4LTEuMzM0LTEuMDUzbC0uMzQ5LS41cS0yLjEzNyAyLjA1My01LjM1OCAyLjA1M3QtNS41MS0yLjY3NS0yLjI4OC03LjQ2NXEwLTQuNzk3IDIuNDAyLTcuNDEyIDIuNDEtMi42MjIgNi4wMTgtMi42MjIgMS4wNDYgMCAyLjEzNy4yMzV6bS0xLjI4MSAxMy4zNDZxLTIuMTc1IDAtMi4xNzUgMy45MTggMCAxLjk3Ny42MjEgMi44NTcuNjIyLjg3MiAxLjM4Ljg3MnQxLjQ1NS0uNjZ2LTYuNnEtLjY2LS4zODgtMS4yODEtLjM4N20zOS4xMDkgMTMuNjU2cS0zLjM3MyAwLTMuNjQ2LTEuMDgzbC0xLjI4LTUuMDFoLTYuMTdsLTEuMTIxIDQuODEzcS0uMjM1IDEuMjA1LTMuNzI5IDEuMjA1LTEuODY0IDAtMi43NTktLjIxMy0uODg2LS4yMTItLjg4Ni0uMzMzbDYuODY2LTI2LjI2OHEwLS4zMSA1LjMxMy0uMzEgNS4zMiAwIDUuMzIuMzFsNi43MTUgMjYuMzA2cTAgLjI3My0xLjc4OS40MzItMS43OC4xNS0yLjgzNC4xNTFtLTEwLjEyNi0xMS4wMTloNC4wNzhsLTEuNzUtOC4wMzNoLS4yMjh6bTI1LjYxMyAxMC45MDZxMCAuMjczLTMuNTMxLjI3My0zLjUzMi0uMDg0LTMuNTMyLS4zMTF2LTEyLjg4NGgtMS4wNDZxLS42MjEgMC0uOTkzLS43NTgtLjM3LS43NTgtLjM3MS0xLjg4IDAtNC4xOSAyLjQ4Ni00LjE5IDEuNzQzIDAgMi45MSAxLjA2OCAxLjE2NyAxLjA2MiAxLjE2NyAyLjQyNS44MS0xLjU5IDIuMTktMi41MzggMS4zOC0uOTU1IDIuODEyLS45NTUgMi4yNTEgMCAyLjcyIDEuMTYuMTE1LjMxLjExNC45MTYgMCAuNi0uMzcgMi4xNTMtLjM2NCAxLjU1My0uNzU5IDIuMjUtLjM4Ni42OTgtLjQ2Mi42OTgtLjA3NSAwLS43Mi0uMjg4LS42MzYtLjI5Ni0xLjE0NC0uMjk2LTEuNDcgMC0xLjQ3IDIuMzI3em0xNS4zNjYgMHEwIC4yNzMtMy41MzEuMjczLTMuNTMyLS4wODQtMy41MzItLjMxMXYtMTIuODg0aC0xLjA0NnEtLjYyMSAwLS45OTMtLjc1OC0uMzctLjc1OC0uMzcxLTEuODggMC00LjE5IDIuNDg2LTQuMTkgMS43NDMgMCAyLjkxIDEuMDY4IDEuMTY3IDEuMDYyIDEuMTY3IDIuNDI1LjgxLTEuNTkgMi4xOS0yLjUzOCAxLjM4LS45NTUgMi44MTItLjk1NSAyLjI1IDAgMi43MiAxLjE2LjExNS4zMS4xMTQuOTE2IDAgLjYtLjM3MSAyLjE1My0uMzYzIDEuNTUzLS43NTggMi4yNS0uMzg2LjY5OC0uNDYyLjY5OC0uMDc1IDAtLjcyLS4yODgtLjYzNi0uMjk2LTEuMTQ0LS4yOTYtMS40NyAwLTEuNDcgMi4zMjd6bTkuMzEtMTQuMDUxcS0xLjA4My0xLjk0LTEuMDgzLTMuMTZ0LjY2LTEuNTdxMi4yMDUtLjk3IDYuMDYyLS45NyAzLjg2NSAwIDUuNDU3IDEuODA0dDEuNTkxIDUuMzM2djYuMTMxaDEuMzJxLjY1OCAwIDEuMDMuNzguMzcuNzc0LjM3MSAyLjEzIDAgMS4zNTctLjY4MiAyLjY3NS0uNjgyIDEuMzItMS44NDEgMS4zMi0yLjEgMC0zLjM4LTEuMTIzYTMuMiAzLjIgMCAwIDEtLjg4Ny0xLjEyOXEtMS43ODkgMi4yNS01LjU1NSAyLjI1MS0yLjgyOCAwLTQuNzY3LTIuMDE2dC0xLjk0LTQuNzc0cTAtNi4zMiA3LjU2My02LjMyaDIuMTM3di0uMzk1cTAtMS4wMDgtLjMzMy0xLjI5Ni0uMzI3LS4yODgtMS41MzEtLjI4OC0xLjQ3OCAwLTQuMTkxLjYxNG0zLjEwOCA3LjE0N3EwIC44NDguNDYyIDEuMjk2LjQ2My40NDcgMS4xODMuNDQ3dDEuMzAzLS41ODR2LTIuOTg2aC0xLjA5MXEtMS44NTcgMC0xLjg1NyAxLjgyN20xMy4xNS0xMi4yNjNxMC0uNDMyIDMuNTQ2LS40MzIgMy41NTUgMCAzLjY3Ni4zODdsMi43ODkgOS4xNjIgMi42NzUtOS4yMzhxLjE2LS4zMSAyLjQxLS4zMSA1LjE2IDAgNC45MjYuNTA3bC05LjExNyAyNS45NTdxLS4wMzguMjM1LTIuMTE0LjIzNXQtMy44NjYtLjEzNnEtMS43OC0uMTM3LTEuNzA1LS4zMzRsMy4zOC04LjE0N3oiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNOTcuOTQ4IDgyLjQ1OWEyLjQ4IDIuNDggMCAwIDEgMi40OC0yLjQ4aDYuNjE3YS44My44MyAwIDAgMCAuODI2LS44MjdWNjUuNDYxYzAtLjY1OC4yNjEtMS4yOS43MjctMS43NTVsNi4zMTYtNi44OC02LjMxNi02Ljg4MmEyLjQ4IDIuNDggMCAwIDEtLjcyNy0xLjc1NFYzNC40OTdhLjgyNS44MjUgMCAwIDAtLjgyOC0uODI1aC02LjYxNGEyLjQ4MSAyLjQ4MSAwIDAgMSAwLTQuOTYyaDYuNjE2YTUuNzk1IDUuNzk1IDAgMCAxIDUuNzg4IDUuNzg4djEyLjY2NGw3LjM0MiA3LjkwOWMuOTcuOTY5Ljk3IDIuNTQgMCAzLjUwOGwtNy4zNDIgNy45MXYxMi42NjRhNS43OTUgNS43OTUgMCAwIDEtNS43OSA1Ljc4N2gtNi42MTRjLTEuMzcgMC0yLjQ4LTEuMTEtMi40ODEtMi40OHptLTE5LjcxNS0yLjQ4YTIuNDgxIDIuNDgxIDAgMSAxIDAgNC45NjFoLTYuNjE0YTUuNzk1IDUuNzk1IDAgMCAxLTUuNzktNS43ODhWNjYuNDg4bC03LjM0Mi03LjkwOWEyLjQ4IDIuNDggMCAwIDEgMC0zLjUwOGw3LjM0Mi03LjkwOVYzNC40OThhNS43OTUgNS43OTUgMCAwIDEgNS43OS01Ljc5aDYuNjE0YTIuNDgyIDIuNDgyIDAgMCAxIDAgNC45NjNoLTYuNjE0YS44MjUuODI1IDAgMCAwLS44MjguODI3VjQ4LjE5YzAgLjY1Ny0uMjYyIDEuMjg4LS43MjcgMS43NTRsLTYuMzE2IDYuODgxIDYuMzE2IDYuODgxYTIuNDggMi40OCAwIDAgMSAuNzI3IDEuNzU1djEzLjY5MWEuODI1LjgyNSAwIDAgMCAuODI4LjgyN3oiIGZpbGw9Im5vbmUiIHN0cm9rZS1vcGFjaXR5PSIuNTAyIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMTAiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNOTcuOTQ4IDgyLjQ1OWEyLjQ4IDIuNDggMCAwIDEgMi40OC0yLjQ4aDYuNjE3YS44My44MyAwIDAgMCAuODI2LS44MjdWNjUuNDYxYzAtLjY1OC4yNjEtMS4yOS43MjctMS43NTVsNi4zMTYtNi44OC02LjMxNi02Ljg4MmEyLjQ4IDIuNDggMCAwIDEtLjcyNy0xLjc1NFYzNC40OTdhLjgyNS44MjUgMCAwIDAtLjgyOC0uODI1aC02LjYxNGEyLjQ4MSAyLjQ4MSAwIDAgMSAwLTQuOTYyaDYuNjE2YTUuNzk1IDUuNzk1IDAgMCAxIDUuNzg4IDUuNzg4djEyLjY2NGw3LjM0MiA3LjkwOWMuOTcuOTY5Ljk3IDIuNTQgMCAzLjUwOGwtNy4zNDIgNy45MXYxMi42NjRhNS43OTUgNS43OTUgMCAwIDEtNS43OSA1Ljc4N2gtNi42MTRjLTEuMzcgMC0yLjQ4LTEuMTEtMi40ODEtMi40OHptLTE5LjcxNS0yLjQ4YTIuNDgxIDIuNDgxIDAgMSAxIDAgNC45NjFoLTYuNjE0YTUuNzk1IDUuNzk1IDAgMCAxLTUuNzktNS43ODhWNjYuNDg4bC03LjM0Mi03LjkwOWEyLjQ4IDIuNDggMCAwIDEgMC0zLjUwOGw3LjM0Mi03LjkwOVYzNC40OThhNS43OTUgNS43OTUgMCAwIDEgNS43OS01Ljc5aDYuNjE0YTIuNDgyIDIuNDgyIDAgMCAxIDAgNC45NjNoLTYuNjE0YS44MjUuODI1IDAgMCAwLS44MjguODI3VjQ4LjE5YzAgLjY1Ny0uMjYyIDEuMjg4LS43MjcgMS43NTRsLTYuMzE2IDYuODgxIDYuMzE2IDYuODgxYTIuNDggMi40OCAwIDAgMSAuNzI3IDEuNzU1djEzLjY5MWEuODI1LjgyNSAwIDAgMCAuODI4LjgyN3oiIGZpbGw9IiNmZmYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTIyMi44MDIgODIuMTUxYTIuNzkgMi43OSAwIDAgMSAyLjc5LTIuNzg4aDcuNDM3YS45My45MyAwIDAgMCAuOTI5LS45M1YzNS4yMTVhLjkzLjkzIDAgMCAwLS45My0uOTI3aC03LjQzN2EyLjc5IDIuNzkgMCAxIDEgMC01LjU3OWg3LjQzOGE2LjUxNSA2LjUxNSAwIDAgMSA2LjUwOCA2LjUwOHY0My4yMTZhNi41MTUgNi41MTUgMCAwIDEtNi41MSA2LjUwNmgtNy40MzZhMi43OSAyLjc5IDAgMCAxLTIuNzktMi43ODh6bS0xOS42MDQtMi43OWEyLjc5IDIuNzkgMCAxIDEgMCA1LjU4aC03LjQzN2E2LjUxNSA2LjUxNSAwIDAgMS02LjUwOS02LjUwOFYzNS4yMThhNi41MTUgNi41MTUgMCAwIDEgNi41MS02LjUxaDcuNDM2YTIuNzkgMi43OSAwIDEgMSAwIDUuNThoLTcuNDM3YS45My45MyAwIDAgMC0uOTMuOTN2NDMuMjE1YS45My45MyAwIDAgMCAuOTMuOTNoNy40Mzh6IiBmaWxsPSJub25lIiBzdHJva2Utb3BhY2l0eT0iLjUwMiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTIyMi44MDIgODIuMTUxYTIuNzkgMi43OSAwIDAgMSAyLjc5LTIuNzg4aDcuNDM3YS45My45MyAwIDAgMCAuOTI5LS45M1YzNS4yMTVhLjkzLjkzIDAgMCAwLS45My0uOTI3aC03LjQzN2EyLjc5IDIuNzkgMCAxIDEgMC01LjU3OWg3LjQzOGE2LjUxNSA2LjUxNSAwIDAgMSA2LjUwOCA2LjUwOHY0My4yMTZhNi41MTUgNi41MTUgMCAwIDEtNi41MSA2LjUwNmgtNy40MzZhMi43OSAyLjc5IDAgMCAxLTIuNzktMi43ODh6bS0xOS42MDQtMi43OWEyLjc5IDIuNzkgMCAxIDEgMCA1LjU4aC03LjQzN2E2LjUxNSA2LjUxNSAwIDAgMS02LjUwOS02LjUwOFYzNS4yMThhNi41MTUgNi41MTUgMCAwIDEgNi41MS02LjUxaDcuNDM2YTIuNzkgMi43OSAwIDEgMSAwIDUuNThoLTcuNDM3YS45My45MyAwIDAgMC0uOTMuOTN2NDMuMjE1YS45My45MyAwIDAgMCAuOTMuOTNoNy40Mzh6IiBmaWxsPSIjZmZmIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0xNTkuMTM0IDU0LjU4Mmg3Ljg0N2ExLjEyMiAxLjEyMiAwIDAgMSAxLjExIDEuMjc0IDEuMTMgMS4xMyAwIDAgMS0uMjU0LjU3NGwtMTcuNjczIDIwLjU3MlY1OS4wNjdoLTcuODQ4YTEuMTIyIDEuMTIyIDAgMCAxLS44NTUtMS44NDVsMTcuNjczLTIwLjU3NXoiIGZpbGw9Im5vbmUiIHN0cm9rZS1vcGFjaXR5PSIuNTAyIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iOC41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTU5LjEzNCA1NC41ODJoNy44NDdhMS4xMjIgMS4xMjIgMCAwIDEgMS4xMSAxLjI3NCAxLjEzIDEuMTMgMCAwIDEtLjI1NC41NzRsLTE3LjY3MyAyMC41NzJWNTkuMDY3aC03Ljg0OGExLjEyMiAxLjEyMiAwIDAgMS0uODU1LTEuODQ1bDE3LjY3My0yMC41NzV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+Cg==',
            insetIconURL: menuIconURI,
            featured: true,
            disabled: false,
            collaborator: 'SharkPool @ Github',
            collaboratorURL: 'https://github.com/SharkPool-SP/',
            collaboratorList: [
                {
                    collaborator: 'SharkPool @ Github',
                    collaboratorURL: 'https://github.com/SharkPool-SP/'
                }
            ]
        },
        l10n: {
            'zh-cn': {
                'CCWSPjson.name': 'Swift JSON',
                'CCWSPjson.descp': 'Super Fast JSON and Array extension'
            },
            en: {
                'CCWSPjson.name': 'Swift JSON',
                'CCWSPjson.descp': 'Super Fast JSON and Array extension'
            }
        }
    }
    if (targetInfo) {
        targetInfo.extensionObject = extensionObject
    } else {
        window.IIFEExtensionInfoList[0].extensionObject = extensionObject
    }
})(Scratch)
