import * as THREE from 'three';

import {
    chen_RenderTheWorld_extensionId,
} from '../assets/index.js';
import { Wrapper, RTW_Model_Box } from '../utils/RTWTools.js';
import { ExtensionCore, RenderEngine } from './engine';
import { patch } from '../utils/injector.js';


class Extension {
    constructor() {
        /** @type {import('scratch-vm').Runtime} */
        this.runtime;
        /** @type {import('scratch-vm')} */
        this.vm;
        /** @type {import('scratch-blocks')} */
        this.ScratchBlocks;

        /** @type {Scratch} */
        this.Scratch;

        /** @type {ExtensionCore} */
        this._core;
        /** @type {RenderEngine} */
        this.render_engine;

        /** @type {THREE} */
        this._threejs;
    }
    
    /**
     * init extension
     * @param {import('scratch-vm').Runtime} _runtime 
     * @param {import('scratch-vm')} vm 
     * @param {import('scratch-blocks')} ScratchBlocks 
     * @param {Scratch} Scratch 
     */
    $initExtension(_runtime, vm, ScratchBlocks, Scratch) {
        this.runtime = _runtime ?? Scratch?.vm?.runtime;
        this.vm = vm;
        this.ScratchBlocks = ScratchBlocks;

        this.Scratch = Scratch;

        this._threejs = THREE
    }

    test(args, util, realBlockInfo) {
        console.log(this, args, util, realBlockInfo);
        
    }
}

export { Extension };
