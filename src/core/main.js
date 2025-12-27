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
}

export default Extension;
