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
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.tc });

        const fov = 75;
        const aspect = 2;  // 相机默认值
        const near = 0.1;
        const far = 5;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

        this.camera.position.z = 2;

        this.scene = new THREE.Scene();

        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

        const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });

        const cube = new THREE.Mesh(geometry, material);

        this.scene.add(cube);

        

        requestAnimationFrame(this.render);

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
        time *= 0.001;  // 将时间单位变为秒

        cube.rotation.x = time;
        cube.rotation.y = time;

        renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.render);
    }
}

export default RenderEngine;
