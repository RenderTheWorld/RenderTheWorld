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

        console.log(
            '%c    RenderTheWorld%cby xiaochen004hao',
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
                "%c Three JS: %c        (RTW.THREE) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.THREE
            );
            console.log(
                "%c Inner Extension: %c (RTW.Extension) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.Extension
            );
            console.log(
                "%c Scratch VM: %c      (RTW.VM) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.VM
            );
            console.log(
                "%c Scratch Blocks: %c  (RTW.ScratchBlocks) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.ScratchBlocks
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

    render() {

    }
}

export default RenderEngine;
