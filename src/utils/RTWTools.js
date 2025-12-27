/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */
import { chen_RenderTheWorld_extensionId } from '../assets';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import DOMUtils from './dom.js';

const domUtils = new DOMUtils();

function addRTWStyle(newStyle) {
    domUtils.createAndAppendStyle(newStyle, 'RTWStyle');
}

class RTW_Model_Box {
    constructor(model, ismaterial, isobj, isgltf, animations) {
        this.model = model;
        this.ismaterial = ismaterial;
        this.isobj = isobj;
        this.isgltf = isgltf;
        this.animations = animations;
    }

    toString() {
        let text = '';
        if (this.isobj) {
            text = `objfile: "${this.model.objfile}" mtlfile: "${this.model.mtlfile}`;
        } else if (this.isgltf) {
            text = `gltffile: "${this.model.gltffile}"`;
        } else if (this.ismaterial) {
            text = `material: "${this.model['type'] ?? String(this.model)}"`;
        } else {
            text = `model: "${this.model['type'] ?? String(this.model)}"`;
        }
        if (this.model instanceof THREE.Group) {
            text += ` ${JSON.stringify(this.model.children.map((x) => x.type))}`;
        }
        return text;
    }

    getHTML(isInMonitor = false) {
        return RTWVisualReport.Body(
            RTWVisualReport.Title(this.toString()),
            this.isobj
                ? [
                    RTWVisualReport.Property('OBJ文件:', this.model.objfile),
                    RTWVisualReport.Property('MTL文件:', this.model.mtlfile),
                ]
                : this.isgltf
                    ? [RTWVisualReport.Property('GLTF文件:', this.model.gltffile)]
                    : this.ismaterial
                        ? [RTWVisualReport.Property('材质', '')]
                        : this.model instanceof OrbitControls ? [RTWVisualReport.Property('轨道控制器:', '')] : [
                            RTWVisualReport.Property('对象详情', ''),
                            RTWVisualReport.Property(
                                '类型:',
                                this.model['type'] ?? String(this.model),
                            ),
                            RTWVisualReport.Property(
                                '子物体:',
                                RTWVisualReport.childrenView(this.model.children),
                            ),
                        ],
            isInMonitor,
        );
    }
}

let Wrapper = class _Wrapper extends String {
    constructor(value) {
        super(value);
        this.value = value;
    }
    static unwrap(value) {
        return value instanceof _Wrapper ? value.value : value;
    }
    toString() {
        return String(this.value);
    }
};

const PATCHES_ID = '__patches_' + chen_RenderTheWorld_extensionId;

const patch = (obj, functions) => {
    if (obj[PATCHES_ID]) return;
    obj[PATCHES_ID] = {};
    for (const name in functions) {
        const original = obj[name];
        obj[PATCHES_ID][name] = obj[name];
        if (original) {
            obj[name] = function (...args) {
                const callOriginal = (...args) => original.call(this, ...args);
                return functions[name].call(this, callOriginal, ...args);
            };
        } else {
            obj[name] = function (...args) {
                return functions[name].call(this, () => { }, ...args);
            };
        }
    }
};

export {
    addRTWStyle,
    RTW_Model_Box,
    Wrapper,
    patch,
};