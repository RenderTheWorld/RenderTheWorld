import * as THREE from 'three';

import {
    chen_RenderTheWorld_extensionId,
} from '../assets/index.js';
import { Wrapper, RTW_Model_Box } from '../utils/RTWTools.js';
import RenderEngine from './renderengine.js';
import ExtensionCore from './extcore.js';

import { patch } from '../utils/injector.js';


class Extension {
    constructor() {
        this.$version = "Alpha 0.0.1";

        /** @type {import('scratch-vm').Runtime} */
        this.runtime;
        /** @type {import('scratch-vm')} */
        this.vm;
        /** @type {import('scratch-blocks')} */
        this.ScratchBlocks;

        /** @type {Scratch} */
        this.Scratch;

        /** @type {ExtensionCore} */
        this.core;
        /** @type {RenderEngine} */
        this.renderEngine;

        /** @type {THREE} */
        this.threejs;
    }

    /**
     * init extension
     * @param {import('scratch-vm').Runtime} _runtime 
     * @param {import('scratch-vm')} vm 
     * @param {import('scratch-blocks')} ScratchBlocks 
     * @param {Scratch} Scratch 
     */
    $initExtension(Scratch) {
        this.runtime = Scratch.runtime;
        this.vm = Scratch.vm;
        this.ScratchBlocks = Scratch.ScratchBlocks;

        this.Scratch = Scratch;
    }

    $inMainWorkspace() {
        return this.ScratchBlocks.getMainWorkspace() !== null;
    };

    test(args, util, realBlockInfo) {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.renderEngine.tc,
            context: this.renderEngine.tc.getContext('webgl2'),
            powerPreference: "high-performance", // 请求独显
            alpha: true // 根据需要开启
        });

        const fov = 75;
        const aspect = 1287 / 724; // the canvas default
        const near = 0.1;
        const far = 40;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = 2;

        const scene = new THREE.Scene();

        {

            const color = 0xFFFFFF;
            const intensity = 3;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(- 1, 2, 4);
            scene.add(light);

        }

        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

        function makeInstance(geometry, color, x, y, z) {

            const material = new THREE.MeshPhongMaterial({ color });

            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);

            cube.position.set(x, y, z);

            return cube;

        }

        const cubes = [
            makeInstance(geometry, 0x44aa88, 0, 0, 0),
            makeInstance(geometry, 0x8844aa, - 2, 0, 0),
            makeInstance(geometry, 0xaa8844, 2, 0, 0),
        ];

        function createCubeBatch() {
            for (let i = 0; i < 8000; i++) {
                const x = Math.random() * 60 - 30; // -30 到 30
                const y = Math.random() * 60 - 30; // -30 到 30
                const z = Math.random() * -27 - 3; // -3 到 -30

                const color = getRandomColor();
                const cube = makeInstance(geometry, color, x, y, z);
                cubes.push(cube);
            }
        }

        function getRandomColor() {
            return Math.floor(Math.random() * 0xffffff);
        }

        createCubeBatch();

        // 缓存引用，避免在循环中频繁访问 this.renderEngine
        const skin = this.renderEngine.threeSkin; 
        const renderCanvas = this.renderEngine.tc;

        let render = (time) => {
            time *= 0.001;

            const len = cubes.length; 
            for(let i = 0; i < len; i++) {
                const cube = cubes[i];
                const speed = (i < 3) ? (1 + i * 0.1) : (1 + i * 0.001);
                const rot = time * speed;
                cube.rotation.x = rot;
                cube.rotation.y = rot;
            }

            // 1. Three.js 渲染
            renderer.render(scene, camera);

            // 2. [关键] 将 Three.js 的画布数据上传到 Scratch 的 WebGL 纹理
            // 使用我们优化过的 updateTexture 方法
            if (skin) {
                skin.setContent(this.renderEngine.tc);
            }

            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    }
}

export default Extension;
