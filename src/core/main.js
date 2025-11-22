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
    $initExtension(_runtime, vm, ScratchBlocks, Scratch) {
        this.runtime = _runtime ?? Scratch?.vm?.runtime;
        this.vm = vm;
        this.ScratchBlocks = ScratchBlocks;

        this.Scratch = Scratch;
    }

    /**
     * 改编自系统工具
     */
    $inMainWorkspace() {
        const ur1 = window.location.pathname;
        const rege = /\/(?:gandi|creator)(?:\/|$)/;
        return rege.test(ur1) && this.ScratchBlocks.getMainWorkspace() !== null;
    };

    test(args, util, realBlockInfo) {
        
    }
}

export default Extension;
