/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */
import { chen_RenderTheWorld_extensionId } from '../assets';
import * as THREE from '../assets/threejs/src/Three.js';
import { OrbitControls } from '../assets/threejs_ext/OrbitControls.js';

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
    // window.RTWStyle.childNodes.forEach((child) => {
    //     window.RTWStyle.removeChild(child);
    // });
    window.RTWStyle.appendChild(document.createTextNode(newStyle));
}

addRTWStyle(`
.RTW-visualReport-body {
    float: left;
    width: 100%;
}
.RTW-visualReport-head {
    justify-content: space-between;
    display: flex;
}
.RTW-visualReport-property {
    display: flex;
}
.RTW-visualReport-property》label {
    min-width: 50px;
}
.RTW-visualReport-head>*, .RTW-visualReport-property>*, .RTW-visualReport-childrenViewButton>span {
    margin-right: 15px;
    text-align: left;
}
.RTW-visualReport-head>*:last-child, .RTW-visualReport-childrenViewButton>span:last-child {
    margin-right: 0px;
}
.RTW-visualReport-button {
    cursor: pointer;
}
.RTW-visualReport-button:hover {
    text-shadow: 0px 0px 5px #aaaaaa;
}
.RTW-visualReport-childrenViewItem {
    display: list-item;
}
.RTW-visualReport-childrenView {
    margin-left: 8px;
    text-align: left;
    width: 100%;
}

.RTW-visualReport-childrenViewButton {
    display: flex;
}
.blocklyDropDownContent:has(.RTW-visualReport-body) {
    max-width: 100%;
    max-height: 100%;
}
`);

class _RTWVisualReport {
    constructor() { }
    Body(title, parts, isInMonitor, childMoreView = false) {
        const body = document.createElement('div');
        body.classList.add('RTW-visualReport-body');
        const head = document.createElement('div');
        head.classList.add('RTW-visualReport-head');
        head.appendChild(title);
        const more = document.createElement('div');
        more.style.minWidth = '300px';
        more.classList.add('RTW-visualReport-body');
        more.style.display = 'none';
        if (!isInMonitor) {
            const showMore = this.Button(this.Opacity('详情', 0.7));
            more.append(...parts);

            showMore.addEventListener('click', (e) => {
                if (e.button === 0) {
                    more.style.display = 'block';
                    head.style.display = 'none';
                }
            });

            head.appendChild(showMore);
        }
        body.appendChild(head);
        body.appendChild(more);
        return body;
    }
    Title(text) {
        const _title = document.createElement('div');
        _title.textContent = text;
        return _title;
    }
    Button(text) {
        const _button = document.createElement('span');
        _button.append(text);
        _button.classList.add('RTW-visualReport-button');
        return _button;
    }
    Property(name_, value_) {
        const _property = document.createElement('div');
        _property.classList.add('RTW-visualReport-property');
        const _name = document.createElement('label');
        const _value = document.createElement('div');
        _name.append(name_);
        _value.append(value_);
        _property.append(_name);
        _property.append(_value);
        return _property;
    }
    Opacity(text, opacity) {
        const _color = document.createElement('span');
        _color.append(text);
        _color.style.opacity = opacity;
        return _color;
    }
    childrenView(models) {
        const _childrenView = document.createElement('div');
        _childrenView.classList.add('RTW-visualReport-childrenView');
        if (models.length === 0) {
            _childrenView.append(this.Opacity('无子物体', 0.7));
        } else {
            models.forEach((child_) => {
                const _child = this.Button(child_.type + (child_.name ? ' ('+child_.name+')' : ''));
                _child.classList.add('RTW-visualReport-childrenViewItem');
                const _childBox = document.createElement('div');
                _childBox.classList.add('RTW-visualReport-childrenViewButton');
                _childBox.appendChild(_child);
                const __childrenView = document.createElement('div');
                let _moreView = null;
                __childrenView.classList.add('RTW-visualReport-childrenView');
                _child.addEventListener('click', (e) => {
                    if (e.button === 0) {
                        if (_moreView === null) {
                            _moreView = this.childrenView(child_.children);
                            __childrenView.appendChild(_moreView);
                        } else {
                            if (_moreView.style.display === 'none') {
                                _moreView.style.display = '';
                            } else {
                                _moreView.style.display = 'none';
                            }
                        }
                    }
                });
                __childrenView.appendChild(_childBox);
                _childrenView.appendChild(__childrenView);
            });
        }
        return _childrenView;
    }
}

const RTWVisualReport = new _RTWVisualReport();

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

    // displayInstance(element) {
    //     // 显示model属性
    //     this.createPropertyElement(element, 'Material:', this.model.type);
    //     if (this.ismaterial) {
    //         this.createPropertyElement(element, 'Material:', this.model.type);
    //     } else if (this.isobj) {
    //         this.createPropertyElement(element, 'OBJ File:', this.model.objfile);
    //         this.createPropertyElement(element, 'MTL File:', this.model.mtlfile);
    //     } else if (this.isgltf) {
    //         this.createPropertyElement(element, 'GLTF File:', this.model.gltffile);
    //     }

    //     // 显示animations属性
    //     if (this.animations) {
    //         this.createPropertyElement(element, 'Animations:', '');
    //         this.createPropertyElement(element, 'Mixer:', this.animations.mixer);
    //         this.createPropertyElement(element, 'Clips:', `${this.animations.clips.length} clips`);
    //         this.createPropertyElement(element, 'Actions:', `${Object.keys(this.animations.action).length} actions`);
    //     }
    // }
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
                const callOriginal = (...args) => original.call(this, ...args);
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

export {
    addRTWStyle,
    RTW_Model_Box,
    Wrapper,
    patch,
    RTWVisualReport as RTWDialog,
};
