import * as THREE from 'three';

import { Skins } from '../utils/canvasSkin.js';
import { color, color_secondary } from '../assets/index.js'


class RenderEngine {
    constructor(ext) {
        this.ext = ext;
        console.log(
            `%c RTW Developer %c ${this.ext.$inMainWorkspace() ? '🔓ON' : '🔒OFF'} `,
            `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: ${color}; font-weight: bold; height: 100%;`,
            `padding: 2px 1px; border-radius: 0 3px 3px 0; color: #fff; background: ${this.ext.$inMainWorkspace() ? color_secondary : color}; font-weight: bold; height: 100%;`,
        );

    }

    init(color, sizex, sizey, ed, shadowMapType) {

    }

    render() {

    }
}

export default RenderEngine ;
