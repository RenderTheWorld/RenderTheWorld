/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */
import { patch } from './injector.js'

// three 通过 renderengine.js 动态加载后挂到 window.THREE
const getTHREE = () => window.THREE

function addRTWStyle(newStyle) {
    let _RTWStyle = !window.RTWStyle
    window.RTWStyle = document.getElementById('RTWStyle')

    if (!window.RTWStyle) {
        window.RTWStyle = document.createElement('style')
        window.RTWStyle.type = 'text/css'
        window.RTWStyle.id = 'RTWStyle'
        if (_RTWStyle)
            document
                .getElementsByTagName('head')[0]
                .appendChild(window.RTWStyle)
    }
    // window.RTWStyle.childNodes.forEach((child) => {
    //     window.RTWStyle.removeChild(child);
    // });
    window.RTWStyle.appendChild(document.createTextNode(newStyle))
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
`)

class _RTWVisualReport {
    constructor() {}
    Body(title, parts, isInMonitor) {
        const body = document.createElement('div')
        body.classList.add('RTW-visualReport-body')
        const head = document.createElement('div')
        head.classList.add('RTW-visualReport-head')
        head.appendChild(title)
        const more = document.createElement('div')
        more.style.minWidth = '300px'
        more.classList.add('RTW-visualReport-body')
        more.style.display = 'none'
        if (!isInMonitor) {
            const showMore = this.Button(this.Opacity('详情', 0.7))
            more.append(...parts)

            showMore.addEventListener('click', e => {
                if (e.button === 0) {
                    more.style.display = 'block'
                    head.style.display = 'none'
                }
            })

            head.appendChild(showMore)
        }
        body.appendChild(head)
        body.appendChild(more)
        return body
    }
    Title(text) {
        const _title = document.createElement('div')
        _title.textContent = text
        return _title
    }
    Button(text) {
        const _button = document.createElement('span')
        _button.append(text)
        _button.classList.add('RTW-visualReport-button')
        return _button
    }
    Property(name_, value_) {
        const _property = document.createElement('div')
        _property.classList.add('RTW-visualReport-property')
        const _name = document.createElement('label')
        const _value = document.createElement('div')
        _name.append(name_)
        _value.append(value_)
        _property.append(_name)
        _property.append(_value)
        return _property
    }
    Opacity(text, opacity) {
        const _color = document.createElement('span')
        _color.append(text)
        _color.style.opacity = opacity
        return _color
    }
    childrenView(models) {
        const _childrenView = document.createElement('div')
        _childrenView.classList.add('RTW-visualReport-childrenView')
        if (models.length === 0) {
            _childrenView.append(this.Opacity('无子物体', 0.7))
        } else {
            models.forEach(child_ => {
                const _child = this.Button(
                    child_.type + (child_.name ? ' (' + child_.name + ')' : '')
                )
                _child.classList.add('RTW-visualReport-childrenViewItem')
                const _childBox = document.createElement('div')
                _childBox.classList.add('RTW-visualReport-childrenViewButton')
                _childBox.appendChild(_child)
                const __childrenView = document.createElement('div')
                let _moreView = null
                __childrenView.classList.add('RTW-visualReport-childrenView')
                _child.addEventListener('click', e => {
                    if (e.button === 0) {
                        if (_moreView === null) {
                            _moreView = this.childrenView(child_.children)
                            __childrenView.appendChild(_moreView)
                        } else {
                            if (_moreView.style.display === 'none') {
                                _moreView.style.display = ''
                            } else {
                                _moreView.style.display = 'none'
                            }
                        }
                    }
                })
                __childrenView.appendChild(_childBox)
                _childrenView.appendChild(__childrenView)
            })
        }
        return _childrenView
    }
}

const RTWVisualReport = new _RTWVisualReport()

class RTW_Model_Box {
    constructor(model, ismaterial, isobj, isgltf, animations) {
        this.model = model
        this.ismaterial = ismaterial
        this.isobj = isobj
        this.isgltf = isgltf
        this.animations = animations
    }

    toString() {
        let text = ''
        if (this.isobj) {
            text = `objfile: "${this.model.objfile}" mtlfile: "${this.model.mtlfile}`
        } else if (this.isgltf) {
            text = `gltffile: "${this.model.gltffile}"`
        } else if (this.ismaterial) {
            text = `material: "${this.model['type'] ?? String(this.model)}"`
        } else {
            text = `${this.model['type'] ?? String(this.model)}`
        }
        const THREE = getTHREE()
        if (THREE && this.model instanceof THREE.Group) {
            text += ` ${JSON.stringify(this.model.children.map(x => x.type))}`
        }
        return text
    }

    getHTML(isInMonitor = false) {
        const m = this.model
        const THREE = getTHREE()
        const parts = []

        if (this.isobj) {
            parts.push(
                RTWVisualReport.Property('OBJ文件:', m.objfile),
                RTWVisualReport.Property('MTL文件:', m.mtlfile)
            )
        } else if (this.isgltf) {
            parts.push(RTWVisualReport.Property('GLTF文件:', m.gltffile))
        } else if (this.ismaterial) {
            parts.push(
                RTWVisualReport.Property('类型:', m['type'] ?? ''),
                RTWVisualReport.Property('透明:', String(m.transparent ?? false)),
                RTWVisualReport.Property('可见:', String(m.visible ?? true))
            )
            if (m.color) parts.push(RTWVisualReport.Property('颜色:', `#${m.color.getHexString()}`))
            if (m.map) parts.push(RTWVisualReport.Property('贴图:', '已设置'))
        } else if (m && m.isOrbitControls) {
            parts.push(
                RTWVisualReport.Property('轨道控制器:', ''),
                RTWVisualReport.Property('启用:', String(m.enabled))
            )
        } else if (THREE && m?.isLight) {
            parts.push(
                RTWVisualReport.Property('光源类型:', m.type),
                RTWVisualReport.Property('颜色:', `#${m.color.getHexString()}`),
                RTWVisualReport.Property('强度:', String(m.intensity)),
                RTWVisualReport.Property('投射阴影:', String(m.castShadow ?? false))
            )
            if (m.position)
                parts.push(
                    RTWVisualReport.Property(
                        '位置:',
                        `${m.position.x.toFixed(2)}, ${m.position.y.toFixed(2)}, ${m.position.z.toFixed(2)}`
                    )
                )
        } else if (THREE && m?.isCamera) {
            parts.push(
                RTWVisualReport.Property('相机类型:', m.type),
                RTWVisualReport.Property(
                    '位置:',
                    `${m.position.x.toFixed(2)}, ${m.position.y.toFixed(2)}, ${m.position.z.toFixed(2)}`
                )
            )
            if (m.isPerspectiveCamera) {
                parts.push(
                    RTWVisualReport.Property('视野:', `${m.fov.toFixed(1)}°`),
                    RTWVisualReport.Property('近裁面:', String(m.near)),
                    RTWVisualReport.Property('远裁面:', String(m.far))
                )
            } else if (m.isOrthographicCamera) {
                parts.push(
                    RTWVisualReport.Property('左:', String(m.left)),
                    RTWVisualReport.Property('右:', String(m.right)),
                    RTWVisualReport.Property('上:', String(m.top)),
                    RTWVisualReport.Property('下:', String(m.bottom))
                )
            }
        } else if (THREE && m?.isTexture) {
            parts.push(
                RTWVisualReport.Property('纹理:', m.type),
                RTWVisualReport.Property('宽:', String(m.image?.width ?? '?')),
                RTWVisualReport.Property('高:', String(m.image?.height ?? '?')),
                RTWVisualReport.Property(
                    '重复:',
                    `${m.repeat.x.toFixed(2)}, ${m.repeat.y.toFixed(2)}`
                ),
                RTWVisualReport.Property(
                    '偏移:',
                    `${m.offset.x.toFixed(2)}, ${m.offset.y.toFixed(2)}`
                )
            )
        } else if (THREE && m instanceof THREE.Quaternion) {
            parts.push(
                RTWVisualReport.Property('四元数:', ''),
                RTWVisualReport.Property('x:', m.x.toFixed(4)),
                RTWVisualReport.Property('y:', m.y.toFixed(4)),
                RTWVisualReport.Property('z:', m.z.toFixed(4)),
                RTWVisualReport.Property('w:', m.w.toFixed(4))
            )
        } else if (THREE && m instanceof THREE.Euler) {
            const deg = THREE.MathUtils.radToDeg
            parts.push(
                RTWVisualReport.Property('欧拉角:', ''),
                RTWVisualReport.Property('x:', `${deg(m.x).toFixed(2)}°`),
                RTWVisualReport.Property('y:', `${deg(m.y).toFixed(2)}°`),
                RTWVisualReport.Property('z:', `${deg(m.z).toFixed(2)}°`),
                RTWVisualReport.Property('顺序:', m.order)
            )
        } else if (THREE && m instanceof THREE.Vector3) {
            parts.push(
                RTWVisualReport.Property('向量:', ''),
                RTWVisualReport.Property('x:', m.x.toFixed(4)),
                RTWVisualReport.Property('y:', m.y.toFixed(4)),
                RTWVisualReport.Property('z:', m.z.toFixed(4)),
                RTWVisualReport.Property('长度:', m.length().toFixed(4))
            )
        } else {
            parts.push(
                RTWVisualReport.Property('对象详情', ''),
                RTWVisualReport.Property('类型:', m?.['type'] ?? String(m)),
                RTWVisualReport.Property(
                    '位置:',
                    m?.position
                        ? `${m.position.x.toFixed(2)}, ${m.position.y.toFixed(2)}, ${m.position.z.toFixed(2)}`
                        : 'N/A'
                )
            )
            if (m?.children?.length > 0) {
                parts.push(
                    RTWVisualReport.Property(
                        '子物体:',
                        RTWVisualReport.childrenView(m.children)
                    )
                )
            }
        }
        return RTWVisualReport.Body(
            RTWVisualReport.Title(this.toString()),
            parts,
            isInMonitor
        )
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
        super(value)
        this.value = value
    }
    /**
     * Unwraps a wrapped object.
     * @param value Wrapped object.
     * @returnss Unwrapped object.
     */
    static unwrap(value) {
        return value instanceof _Wrapper ? value.value : value
    }
    /**
     * toString method for Scratch monitors.
     * @returnss String display.
     */
    toString() {
        return String(this.value)
    }
}

// patch 函数已统一到 injector.js，这里通过 import 复用

export {
    addRTWStyle,
    RTW_Model_Box,
    Wrapper,
    patch,
    RTWVisualReport as RTWDialog
}
