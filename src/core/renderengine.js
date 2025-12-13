import * as THREE from 'three';

import { Skins } from '../utils/canvasSkin.js';
import { chen_RenderTheWorld_icon, color, color_secondary } from '../assets/index.js'
import Extension from './main.js';


class RenderEngine {
    /**
     * @param {Extension} ext 
     */
    constructor(ext) {
        this.ext = ext;
        this.THREE = THREE;

        this.tc = document.createElement('canvas');
        this.tc.width = 1287;
        this.tc.height = 724;

        // 样式优化：防止 canvas 干扰布局，通常作为纹理源它可以是隐藏的，
        // 除非你需要捕获它的鼠标事件。
        this.tc.style.display = 'none'; 
        this.ext.runtime.renderer.canvas.parentElement.append(this.tc);

        // 插入渲染层级
        let index = this.ext.runtime.renderer._groupOrdering.indexOf('video');
        if (index === -1) index = 0; // 防止找不到 video 层报错
        
        this.ext.runtime.renderer._groupOrdering.splice(
            index + 1,
            0,
            'RenderTheWorld',
        );

        // 初始化层级组
        // 注意：这里需要确保 video layerGroup 存在
        const videoLayer = this.ext.runtime.renderer._layerGroups['video'];
        const drawListOffset = videoLayer ? videoLayer.drawListOffset : 0;

        this.ext.runtime.renderer._layerGroups['RenderTheWorld'] = {
            groupIndex: index + 1,
            drawListOffset: drawListOffset,
        };

        // 更新后续层级的索引
        for (let i = 0; i < this.ext.runtime.renderer._groupOrdering.length; i++) {
            const groupName = this.ext.runtime.renderer._groupOrdering[i];
            if(this.ext.runtime.renderer._layerGroups[groupName]) {
                 this.ext.runtime.renderer._layerGroups[groupName].groupIndex = i;
            }
        }

        // Create drawable and skin
        this.threeSkinId = this.ext.runtime.renderer._nextSkinId++;
        let SkinsClass = new Skins(this.ext.runtime);
        this.threeSkin = new SkinsClass.CanvasSkin(
            this.threeSkinId,
            this.ext.runtime.renderer,
        );
        
        // 初始化设置内容
        this.threeSkin.setContent(this.tc); 
        this.ext.runtime.renderer._allSkins[this.threeSkinId] = this.threeSkin;

        // threejs drawable layer
        this.threeDrawableId = this.ext.runtime.renderer.createDrawable('RenderTheWorld');
        this.ext.runtime.renderer.updateDrawableSkinId(
            this.threeDrawableId,
            this.threeSkinId,
        );

        // 设置 Skin 的大小和缩放，确保它覆盖整个舞台
        // WebGL 坐标系中心是 [0,0]，通常不需要额外设置位置，只需设置大小和Ghost
        const drawable = this.ext.runtime.renderer._allDrawables[this.threeDrawableId];
        if (drawable) {
            // 确保它可见
             drawable.updateVisible(true);
        }

        console.log(
            `%c    RenderTheWorld%c by xiaochen004hao\n      https://github.com/RenderTheWorld/RenderTheWorld\n      Version: ${this.ext.$version}`,
            `background-image: url("${chen_RenderTheWorld_icon}");
             background-size: contain;
             background-repeat: no-repeat;
             padding: 10px;
             color: #def;
             font-weight: bold;
             font-size: 25px;
             font-family: serif;
            `,
            'color: #aaa;',
        );
        if (this.ext.$inMainWorkspace()) {
            globalThis.RTW = {
                THREE: THREE,
                Extension: this.ext,
                VM: this.ext.vm,
                ScratchBlocks: this.ext.ScratchBlocks,
            };

            console.log(
                '%c RTW Developer %c 🔓ON ',
                `padding: 2px 1px; border: 1.5px solid ${color_secondary}; border-right: none; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, ${color}); font-weight: bold;`,
                `padding: 2px 1px; border: 1.5px solid ${color_secondary}; border-left: none; border-radius: 0 3px 3px 0; color: #fff; background: ${color}; font-weight: bold;`
            );
            console.log(
                "%c Internal RTW Extension: %c (RTW.Extension) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.Extension
            );
            console.log(
                "%c Three JS: %c               (RTW.THREE) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.THREE
            );
            console.log(
                "%c Scratch Blocks: %c         (RTW.ScratchBlocks) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.ScratchBlocks
            );
            console.log(
                "%c Scratch VM: %c             (RTW.VM) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.VM
            );
        } else {
            console.log(
                '%c RTW Developer %c 🔒OFF ',
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: ${color}; font-weight: bold;`,
                `padding: 2px 1px; border-radius: 0 3px 3px 0; color: #fff; background: ${color}; font-weight: bold;`
            );
        }
    }

    init(color, sizex, sizey, ed, shadowMapType) {

    }

    render(time) {
    }
}

export default RenderEngine;
