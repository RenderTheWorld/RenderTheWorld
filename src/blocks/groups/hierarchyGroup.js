/**
 * 层级分组 —— 子物体管理与场景获取
 *
 * 无独立标签（以 '---' 分割线开始），位于模型分组之后。
 *
 * 包含积木：
 *   - getChildrenNumInObject       (REPORTER, disableMonitor) 子物体数量
 *   - getChildrenInObject          (OUTPUT, dynamicArgsInfo) 按序号获取子物体
 *   - getChildrenInObjectByName    (OUTPUT) 按名称获取子物体
 *   - addChildren                  (COMMAND) 添加子物体
 *   - removeChildren               (COMMAND) 移除子物体
 *   - getScene                     (OUTPUT) 获取场景对象
 */

import BlockGroup from '../BlockGroup.js'
import { RTW_Model_Box, Wrapper } from '../../utils/RTWTools.js'
import { getDynamicArgs } from '../../utils/extendableBlock.js'

export default class HierarchyGroup extends BlockGroup {
    constructor(ctx) {
        super(ctx)
        // 无标签分组
    }

    build() {
        const BT = this.BlockType
        const AT = this.ArgumentType
        const t = this.translate
        const ext = this.ext

        return [
            '---',
            {
                opcode: 'getChildrenNumInObject',
                blockType: BT.REPORTER,
                text: t('getChildrenNumInObject'),
                disableMonitor: true,
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' }
                },
                handler: args => {
                    const model = ext.renderEngine.getModel(args.name)
                    if (!model) return -1
                    return model.children.length
                }
            },
            {
                opcode: 'getChildrenInObject',
                blockType: BT.OUTPUT,
                text: t('getChildrenInObject'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    num: { type: AT.NUMBER, defaultValue: '1' }
                },
                dynamicArgsInfo: {
                    afterArg: 'num',
                    defaultValues: '1',
                    dynamicArgTypes: ['n'],
                    joinCh: t('getChildrenInObject.joinCh'),
                    preText: t('getChildrenInObject.preText')
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    let model = ext.renderEngine.getModel(args.name)
                    // 保持与旧版一致：第一个 num 转数字，动态参数保持原值（循环中 -1 会自动转型）
                    const nums = [cast.toNumber(args.num)].concat(
                        getDynamicArgs(args)
                    )
                    let cnt = 0
                    // 保持与旧版一致：索引无效时 model 不变，继续循环
                    while (model && cnt < nums.length) {
                        const idx = nums[cnt++] - 1
                        if (idx >= 0 && model.children[idx]) {
                            model = model.children[idx]
                        }
                    }
                    return model
                        ? new Wrapper(
                              new RTW_Model_Box(
                                  model,
                                  false,
                                  false,
                                  false,
                                  undefined
                              )
                          )
                        : ''
                }
            },
            {
                opcode: 'getChildrenInObjectByName',
                blockType: BT.OUTPUT,
                text: t('getChildrenInObjectByName'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    name2: { type: AT.STRING, defaultValue: 'name' }
                },
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: args => {
                    const cast = ext.cast
                    const model = ext.renderEngine.getModel(args.name)
                    if (!model) return ''
                    const child = model.getObjectByName(
                        cast.toString(args.name2)
                    )
                    return child
                        ? new Wrapper(
                              new RTW_Model_Box(
                                  child,
                                  false,
                                  false,
                                  false,
                                  undefined
                              )
                          )
                        : ''
                }
            },
            {
                opcode: 'addChildren',
                blockType: BT.COMMAND,
                text: t('addChildren'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    name2: { type: AT.STRING, defaultValue: 'name' }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    const parent = engine.getModel(args.name)
                    if (!parent) return '⚠️要添加子物体的物体不正确'
                    const child = engine.getModel(args.name2)
                    if (!child) return '⚠️要添加的子物体不正确'
                    parent.add(child)
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'removeChildren',
                blockType: BT.COMMAND,
                text: t('removeChildren'),
                arguments: {
                    name: { type: AT.STRING, defaultValue: 'name' },
                    name2: { type: AT.STRING, defaultValue: 'name' }
                },
                handler: args => {
                    const engine = ext.renderEngine
                    const parent = engine.getModel(args.name)
                    if (!parent) return '⚠️要删除子物体的物体不正确'
                    const child = engine.getModel(args.name2)
                    if (!child) return '⚠️要删除的子物体不正确'
                    parent.remove(child)
                    engine.setDirty3D()
                }
            },
            {
                opcode: 'getScene',
                blockType: BT.OUTPUT,
                text: t('getScene'),
                arguments: {},
                output: 'Reporter',
                outputShape: 3,
                branchCount: 0,
                handler: () => {
                    const scene = ext.renderEngine.scene
                    if (!scene) return null
                    return new Wrapper(
                        new RTW_Model_Box(scene, false, false, false, undefined)
                    )
                }
            }
        ]
    }

    l10n() {
        return {
            getChildrenNumInObject: {
                'zh-cn': '获取物体: [name] 中的子物体数量',
                en: 'children count of [name]'
            },
            getChildrenInObject: {
                'zh-cn': '获取物体: [name] 中的第 [num] 个子物体',
                en: 'child [num] of [name]'
            },
            'getChildrenInObject.joinCh': { 'zh-cn': ' 的', en: ' of ' },
            'getChildrenInObject.preText': { 'zh-cn': '子物体', en: 'child' },
            getChildrenInObjectByName: {
                'zh-cn': '获取物体: [name] 中第一个名为 [name2] 的子物体',
                en: 'child named [name2] in [name]'
            },
            addChildren: {
                'zh-cn': '给物体: [name] 添加子物体: [name2]',
                en: 'add [name2] as child of [name]'
            },
            removeChildren: {
                'zh-cn': '给物体: [name] 删除子物体: [name2]',
                en: 'remove [name2] from [name]'
            },
            getScene: { 'zh-cn': '获取场景', en: 'get scene' }
        }
    }
}
