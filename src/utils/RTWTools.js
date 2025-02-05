import { chen_RenderTheWorld_extensionId } from "src/assets";
import * as THREE from '../assets/threejs/src/Three.js';

function addRTWStyle(newStyle) {
    let _RTWStyle = !window.RTWStyle;
    window.RTWStyle = document.getElementById('RTWStyle');

    if (!window.RTWStyle) {
        window.RTWStyle = document.createElement('style');
        window.RTWStyle.type = 'text/css';
        window.RTWStyle.id = 'RTWStyle';
        if (_RTWStyle)
            document
                .getElementsByTagName('head')[0]
                .appendChild(window.RTWStyle);
    }
    window.RTWStyle.childNodes.forEach((child) => {
        window.RTWStyle.removeChild(child);
    });
    window.RTWStyle.appendChild(document.createTextNode(newStyle));
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
        // html.style.color = this.color;
        // html.style.fontSize = String(this.size) + "px";
        if (this.isobj) {
            text = `objfile: "${this.model.objfile}" mtlfile: "${this.model.mtlfile}`;
        } else if (this.isgltf) {
            text = `gltffile: "${this.model.gltffile}"`;
        } else {
            text = `model: "${this.model['type'] ?? String(this.model)}"`;
        }
        if (this.model instanceof THREE.Group) {
            text += ` ${JSON.stringify(this.model.children.map((x) => x.type))}`;
        }
        return text;
    }

    getHTML() {
        let html = document.createElement('span');
        html.innerText = this.toString();
        return html;
    }
}

let Wrapper = class _Wrapper extends String {
    /**
     * Construct a wrapped value.
     * @param value Value to wrap.
     */
    constructor(value) {
        super(value);
        this.value = value;
    }
    /**
     * Unwraps a wrapped object.
     * @param value Wrapped object.
     * @returnss Unwrapped object.
     */
    static unwrap(value) {
        return value instanceof _Wrapper ? value.value : value;
    }
    /**
     * toString method for Scratch monitors.
     * @returnss String display.
     */
    toString() {
        return String(this.value);
    }
};

// 定义用于存储原始函数的属性名
const PATCHES_ID = '__patches_' + chen_RenderTheWorld_extensionId;

// 定义patch函数，用于修改对象的方法
const patch = (obj, functions) => {
    if (obj[PATCHES_ID]) return;
    obj[PATCHES_ID] = {};
    for (const name in functions) {
        // 保存原始函数
        const original = obj[name];
        obj[PATCHES_ID][name] = obj[name];
        if (original) {
            // 替换原函数，增加自定义逻辑
            obj[name] = function (...args) {
                const callOriginal = (...args) =>
                    original.call(this, ...args);
                return functions[name].call(this, callOriginal, ...args);
            };
        } else {
            // 如果原函数不存在，直接定义新函数
            obj[name] = function (...args) {
                return functions[name].call(this, () => { }, ...args);
            };
        }
    }
};

export { addRTWStyle, RTW_Model_Box, Wrapper, patch };