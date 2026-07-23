/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */

// getTHREE 用于获取 THREE 库
let getTHREE = () => null;
// setTHREE 用于在 renderengine.js 中设置 THREE
const setTHREE = (three) => {
    getTHREE = () => three
}

function addRTWStyle(newStyle) {
    let _RTWStyle = !window.RTWStyle
    window.RTWStyle = /** @type {HTMLStyleElement | null} */ (document.getElementById('RTWStyle'))

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
    user-select: text;
    float: left;
    width: 100%;
}
.RTW-visualReport-head {
    justify-content: space-between;
    display: flex;
}
.RTW-visualReport-property {
    display: flex;
    align-items: center;
}
.RTW-visualReport-property>label {
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
.RTW-visualReport-colorSwatch {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 3px;
    border: 1px solid #888;
    margin-right: 6px;
    vertical-align: middle;
}
.RTW-visualReport-section {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.1);
    width: 100%;
}
.RTW-visualReport-sectionTitle {
    color: #888;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
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
        body.classList.add('RTW-visualReport')
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
    /** 颜色色块 + hex 文本 */
    ColorSwatch(hex) {
        const wrapper = document.createElement('span')
        wrapper.style.display = 'inline-flex'
        wrapper.style.alignItems = 'center'
        const swatch = document.createElement('span')
        swatch.classList.add('RTW-visualReport-colorSwatch')
        swatch.style.background = `#${hex}`
        wrapper.appendChild(swatch)
        const text = document.createElement('span')
        text.textContent = `#${hex}`
        wrapper.appendChild(text)
        return wrapper
    }
    /** 分节标题 */
    Section(title) {
        const section = document.createElement('div')
        section.classList.add('RTW-visualReport-section')
        const sectionTitle = document.createElement('div')
        sectionTitle.classList.add('RTW-visualReport-sectionTitle')
        sectionTitle.textContent = title
        section.appendChild(sectionTitle)
        return section
    }
    /** 格式化向量为字符串 */
    Vec3(v, digits = 2) {
        return `${v.x.toFixed(digits)}, ${v.y.toFixed(digits)}, ${v.z.toFixed(digits)}`
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
        const m = this.model
        const THREE = getTHREE()
        let text = ''
        if (this.isobj) {
            text = `OBJ: "${m.objfile}"`
        } else if (this.isgltf) {
            text = `GLTF: "${m.gltffile}"`
            if (m.animations?.length) text += ` (${m.animations.length} 动画)`
        } else if (this.ismaterial) {
            text = `材质: ${m['type'] ?? 'Unknown'}`
            if (m.color) text += ` #${m.color.getHexString()}`
        } else if (m && m.isOrbitControls) {
            text = '轨道控制器'
        } else if (THREE && m?.isLight) {
            text = `光源: ${m.type}`
        } else if (THREE && m?.isCamera) {
            text = `相机: ${m.type}`
        } else if (THREE && m?.isTexture) {
            text = `纹理: ${m.image?.width ?? '?'}x${m.image?.height ?? '?'}`
        } else if (THREE && m instanceof THREE.Quaternion) {
            text = `四元数 (${m.x.toFixed(2)}, ${m.y.toFixed(2)}, ${m.z.toFixed(2)}, ${m.w.toFixed(2)})`
        } else if (THREE && m instanceof THREE.Euler) {
            const deg = THREE.MathUtils.radToDeg
            text = `欧拉角 (${deg(m.x).toFixed(1)}°, ${deg(m.y).toFixed(1)}°, ${deg(m.z).toFixed(1)}°)`
        } else if (THREE && m instanceof THREE.Vector4) {
            text = `向量 (${m.x.toFixed(2)}, ${m.y.toFixed(2)}, ${m.z.toFixed(2)}, ${m.w.toFixed(2)})`
        } else if (THREE && m instanceof THREE.Vector3) {
            text = `向量 (${m.x.toFixed(2)}, ${m.y.toFixed(2)}, ${m.z.toFixed(2)})`
        } else if (THREE && m instanceof THREE.Vector2) {
            text = `向量 (${m.x.toFixed(2)}, ${m.y.toFixed(2)})`
        } else if (THREE && m instanceof THREE.Color) {
            text = `颜色 #${m.getHexString()}`
        } else if (m && typeof m === 'object' && 'r' in m && 'g' in m && 'b' in m) {
            text = `RGB(${Math.round(m.r)}, ${Math.round(m.g)}, ${Math.round(m.b)})`
        } else if (m && typeof m === 'object' && 'h' in m && 's' in m && 'l' in m) {
            text = `HSL(${Number(m.h).toFixed(2)}, ${Math.round(Number(m.s) * 100)}%, ${Math.round(Number(m.l) * 100)}%)`
        } else if (THREE && m instanceof THREE.Matrix4) {
            text = '4x4 矩阵'
        } else if (THREE && m instanceof THREE.Matrix3) {
            text = '3x3 矩阵'
        } else if (THREE && m?.isObject3D) {
            text = `${m.type}`
            if (m.name) text += ` "${m.name}"`
            if (m.children?.length > 0) text += ` [${m.children.length} 子]`
        } else if (Array.isArray(m)) {
            text = `[${m.map(v => (typeof v === 'number' ? Math.round(v * 100) / 100 : String(v))).join(', ')}]`
        } else if (m && typeof m === 'object') {
            try {
                text = JSON.stringify(m)
            } catch {
                text = String(m)
            }
        } else {
            text = String(m)
        }
        return text
    }

    getHTML(isInMonitor = false) {
        const m = this.model
        const THREE = getTHREE()
        const R = RTWVisualReport
        const parts = []

        // ============== 文件类（OBJ/GLTF） ==============
        if (this.isobj) {
            parts.push(
                R.Property('OBJ文件:', m.objfile),
                R.Property('MTL文件:', m.mtlfile)
            )
        } else if (this.isgltf) {
            parts.push(R.Property('GLTF文件:', m.gltffile))
            if (m.animations?.length) {
                parts.push(R.Property('动画数:', String(m.animations.length)))
            }
        } else if (this.ismaterial) {
            // ============== 材质 ==============
            parts.push(R.Property('类型:', m['type'] ?? ''))
            if (m.color) {
                parts.push(R.Property('颜色:', R.ColorSwatch(m.color.getHexString())))
            }
            parts.push(
                R.Property('透明:', String(m.transparent ?? false)),
                R.Property('不透明度:', (m.opacity ?? 1).toFixed(2)),
                R.Property('可见:', String(m.visible ?? true)),
                R.Property('单面:', String(m.side === 0)) // 0=FrontSide
            )
            // PBR 材质属性
            if (m.metalness !== undefined) {
                parts.push(R.Property('金属度:', m.metalness.toFixed(2)))
            }
            if (m.roughness !== undefined) {
                parts.push(R.Property('粗糙度:', m.roughness.toFixed(2)))
            }
            if (m.emissive) {
                parts.push(R.Property('发光色:', R.ColorSwatch(m.emissive.getHexString())))
                if (m.emissiveIntensity !== undefined && m.emissiveIntensity !== 1) {
                    parts.push(R.Property('发光强度:', m.emissiveIntensity.toFixed(2)))
                }
            }
            // 贴图通道列表
            const texChannels = []
            for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'displacementMap', 'alphaMap']) {
                if (m[k]) texChannels.push(k)
            }
            if (texChannels.length > 0) {
                parts.push(R.Property('贴图通道:', texChannels.join(', ')))
            }
            if (m.fog !== undefined) {
                parts.push(R.Property('受雾影响:', String(m.fog)))
            }
        } else if (m && m.isOrbitControls) {
            // ============== OrbitControls ==============
            parts.push(
                R.Property('类型:', '轨道控制器'),
                R.Property('启用:', String(m.enabled)),
                R.Property('阻尼:', String(m.enableDamping)),
                R.Property('平移:', String(m.enablePan)),
                R.Property('缩放:', String(m.enableZoom)),
                R.Property('旋转:', String(m.enableRotate))
            )
            if (m.target) {
                parts.push(R.Property('目标:', R.Vec3(m.target)))
            }
            if (m.minDistance !== -Infinity && m.minDistance !== 0) {
                parts.push(R.Property('最小距离:', m.minDistance.toFixed(2)))
            }
            if (m.maxDistance !== Infinity) {
                parts.push(R.Property('最大距离:', m.maxDistance.toFixed(2)))
            }
        } else if (THREE && m?.isLight) {
            // ============== 光源 ==============
            parts.push(R.Property('类型:', m.type))
            if (m.color) {
                parts.push(R.Property('颜色:', R.ColorSwatch(m.color.getHexString())))
            }
            parts.push(
                R.Property('强度:', m.intensity.toFixed(2)),
                R.Property('投射阴影:', String(m.castShadow ?? false))
            )
            if (m.position) {
                parts.push(R.Property('位置:', R.Vec3(m.position)))
            }
            // SpotLight 特有
            if (m.isSpotLight) {
                const deg = THREE.MathUtils.radToDeg
                parts.push(
                    R.Property('角度:', `${deg(m.angle).toFixed(1)}°`),
                    R.Property('半影:', m.penumbra.toFixed(2)),
                    R.Property('衰减:', m.decay.toFixed(2))
                )
                if (m.target) {
                    parts.push(R.Property('目标:', R.Vec3(m.target.position)))
                }
            }
            // RectAreaLight 特有
            if (m.isRectAreaLight) {
                parts.push(
                    R.Property('宽度:', m.width.toFixed(2)),
                    R.Property('高度:', m.height.toFixed(2))
                )
            }
            // HemisphereLight 特有
            if (m.isHemisphereLight) {
                if (m.color) {
                    parts.push(R.Property('天空色:', R.ColorSwatch(m.color.getHexString())))
                }
                if (m.groundColor) {
                    parts.push(R.Property('地面色:', R.ColorSwatch(m.groundColor.getHexString())))
                }
            }
            // DirectionalLight target
            if (m.isDirectionalLight && m.target) {
                parts.push(R.Property('目标:', R.Vec3(m.target.position)))
            }
        } else if (THREE && m?.isCamera) {
            // ============== 相机 ==============
            parts.push(
                R.Property('类型:', m.type),
                R.Property('位置:', R.Vec3(m.position))
            )
            if (m.rotation) {
                const deg = THREE.MathUtils.radToDeg
                parts.push(R.Property(
                    '旋转:',
                    `${deg(m.rotation.x).toFixed(1)}°, ${deg(m.rotation.y).toFixed(1)}°, ${deg(m.rotation.z).toFixed(1)}°`
                ))
            }
            if (m.isPerspectiveCamera) {
                parts.push(
                    R.Property('视野:', `${m.fov.toFixed(1)}°`),
                    R.Property('近裁面:', String(m.near)),
                    R.Property('远裁面:', String(m.far))
                )
            } else if (m.isOrthographicCamera) {
                parts.push(
                    R.Property('左:', String(m.left)),
                    R.Property('右:', String(m.right)),
                    R.Property('上:', String(m.top)),
                    R.Property('下:', String(m.bottom)),
                    R.Property('缩放:', m.zoom.toFixed(2))
                )
            }
        } else if (THREE && m?.isTexture) {
            // ============== 纹理 ==============
            parts.push(
                R.Property('类型:', m.type ?? 'Texture'),
                R.Property('宽:', String(m.image?.width ?? '?')),
                R.Property('高:', String(m.image?.height ?? '?')),
                R.Property(
                    '重复:',
                    `${m.repeat.x.toFixed(2)}, ${m.repeat.y.toFixed(2)}`
                ),
                R.Property(
                    '偏移:',
                    `${m.offset.x.toFixed(2)}, ${m.offset.y.toFixed(2)}`
                ),
                R.Property('旋转:', `${THREE.MathUtils.radToDeg(m.rotation).toFixed(1)}°`)
            )
            if (m.colorSpace !== undefined) {
                const csName = m.colorSpace === THREE.SRGBColorSpace ? 'sRGB'
                    : m.colorSpace === THREE.LinearSRGBColorSpace ? 'Linear-sRGB'
                    : m.colorSpace === THREE.NoColorSpace ? 'None' : String(m.colorSpace)
                parts.push(R.Property('色彩空间:', csName))
            }
            const wrapMap = { 1000: 'ClampEdge', 1001: 'Repeat', 1002: 'MirroredRepeat' }
            parts.push(
                R.Property('横向包裹:', wrapMap[m.wrapS] ?? String(m.wrapS)),
                R.Property('纵向包裹:', wrapMap[m.wrapT] ?? String(m.wrapT)),
                R.Property('最小过滤:', String(m.minFilter)),
                R.Property('放大过滤:', String(m.magFilter))
            )
            if (m.mapping !== undefined) {
                parts.push(R.Property('映射:', String(m.mapping)))
            }
        } else if (THREE && m instanceof THREE.Quaternion) {
            // ============== 四元数 ==============
            parts.push(
                R.Property('x:', m.x.toFixed(4)),
                R.Property('y:', m.y.toFixed(4)),
                R.Property('z:', m.z.toFixed(4)),
                R.Property('w:', m.w.toFixed(4)),
                R.Property('模长:', Math.sqrt(m.x*m.x + m.y*m.y + m.z*m.z + m.w*m.w).toFixed(4))
            )
            // 显示对应欧拉角（方便开发者理解）
            const euler = new THREE.Euler().setFromQuaternion(m)
            const deg = THREE.MathUtils.radToDeg
            parts.push(R.Section('对应欧拉角'))
            parts.push(
                R.Property('x:', `${deg(euler.x).toFixed(2)}°`),
                R.Property('y:', `${deg(euler.y).toFixed(2)}°`),
                R.Property('z:', `${deg(euler.z).toFixed(2)}°`),
                R.Property('顺序:', euler.order)
            )
        } else if (THREE && m instanceof THREE.Euler) {
            // ============== 欧拉角 ==============
            const deg = THREE.MathUtils.radToDeg
            parts.push(
                R.Property('x:', `${deg(m.x).toFixed(2)}°`),
                R.Property('y:', `${deg(m.y).toFixed(2)}°`),
                R.Property('z:', `${deg(m.z).toFixed(2)}°`),
                R.Property('顺序:', m.order)
            )
            // 显示对应四元数
            const quat = new THREE.Quaternion().setFromEuler(m)
            parts.push(R.Section('对应四元数'))
            parts.push(
                R.Property('x:', quat.x.toFixed(4)),
                R.Property('y:', quat.y.toFixed(4)),
                R.Property('z:', quat.z.toFixed(4)),
                R.Property('w:', quat.w.toFixed(4))
            )
        } else if (THREE && m instanceof THREE.Vector4) {
            // ============== 4D 向量 ==============
            parts.push(
                R.Property('x:', m.x.toFixed(4)),
                R.Property('y:', m.y.toFixed(4)),
                R.Property('z:', m.z.toFixed(4)),
                R.Property('w:', m.w.toFixed(4)),
                R.Property('长度:', m.length().toFixed(4))
            )
        } else if (THREE && m instanceof THREE.Vector3) {
            // ============== 3D 向量 ==============
            parts.push(
                R.Property('x:', m.x.toFixed(4)),
                R.Property('y:', m.y.toFixed(4)),
                R.Property('z:', m.z.toFixed(4)),
                R.Property('长度:', m.length().toFixed(4))
            )
            if (m.length() > 0) {
                const n = m.clone().normalize()
                parts.push(R.Section('归一化'))
                parts.push(R.Property('x:', n.x.toFixed(4)))
                parts.push(R.Property('y:', n.y.toFixed(4)))
                parts.push(R.Property('z:', n.z.toFixed(4)))
            }
        } else if (THREE && m instanceof THREE.Vector2) {
            parts.push(
                R.Property('x:', m.x.toFixed(4)),
                R.Property('y:', m.y.toFixed(4)),
                R.Property('长度:', m.length().toFixed(4))
            )
        } else if (THREE && m instanceof THREE.Color) {
            parts.push(
                R.Property('十六进制:', R.ColorSwatch(m.getHexString())),
                R.Property('r:', m.r.toFixed(4)),
                R.Property('g:', m.g.toFixed(4)),
                R.Property('b:', m.b.toFixed(4))
            )
            const hsl = { h: 0, s: 0, l: 0 }
            m.getHSL(hsl)
            parts.push(R.Section('HSL'))
            parts.push(
                R.Property('色相:', `${(hsl.h * 360).toFixed(1)}°`),
                R.Property('饱和度:', `${(hsl.s * 100).toFixed(1)}%`),
                R.Property('亮度:', `${(hsl.l * 100).toFixed(1)}%`)
            )
        } else if (m && typeof m === 'object' && 'r' in m && 'g' in m && 'b' in m) {
            // ============== RGB 对象 ==============
            const isUnit = m.r <= 1 && m.g <= 1 && m.b <= 1
            parts.push(R.Property('类型:', 'RGB 对象'))
            parts.push(R.Property('r:', isUnit ? m.r.toFixed(4) : Math.round(m.r)))
            parts.push(R.Property('g:', isUnit ? m.g.toFixed(4) : Math.round(m.g)))
            parts.push(R.Property('b:', isUnit ? m.b.toFixed(4) : Math.round(m.b)))
        } else if (m && typeof m === 'object' && 'h' in m && 's' in m && 'l' in m) {
            // ============== HSL 对象 ==============
            parts.push(R.Property('类型:', 'HSL 对象'))
            parts.push(R.Property('色相:', `${Number(m.h).toFixed(3)}`))
            parts.push(R.Property('饱和度:', `${(Number(m.s) * 100).toFixed(1)}%`))
            parts.push(R.Property('亮度:', `${(Number(m.l) * 100).toFixed(1)}%`))
        } else if (THREE && m instanceof THREE.Matrix4) {
            // ============== 4x4 矩阵 ==============
            const e = m.elements
            const fmt = v => v.toFixed(3).padStart(8, ' ')
            parts.push(R.Property('矩阵:', ''))
            for (let r = 0; r < 4; r++) {
                parts.push(R.Property(
                    '',
                    `${fmt(e[r*4])} ${fmt(e[r*4+1])} ${fmt(e[r*4+2])} ${fmt(e[r*4+3])}`
                ))
            }
            // 分解为TRS
            const pos = new THREE.Vector3()
            const quat = new THREE.Quaternion()
            const scale = new THREE.Vector3()
            m.decompose(pos, quat, scale)
            parts.push(R.Section('分解 TRS'))
            parts.push(
                R.Property('平移:', R.Vec3(pos)),
                R.Property('旋转:', `${quat.x.toFixed(3)}, ${quat.y.toFixed(3)}, ${quat.z.toFixed(3)}, ${quat.w.toFixed(3)}`),
                R.Property('缩放:', R.Vec3(scale))
            )
        } else if (THREE && m instanceof THREE.Matrix3) {
            const e = m.elements
            const fmt = v => v.toFixed(3).padStart(8, ' ')
            parts.push(R.Property('3x3矩阵:', ''))
            for (let r = 0; r < 3; r++) {
                parts.push(R.Property(
                    '',
                    `${fmt(e[r*3])} ${fmt(e[r*3+1])} ${fmt(e[r*3+2])}`
                ))
            }
        } else if (THREE && m?.isObject3D) {
            // ============== Object3D（最常用） ==============
            parts.push(
                R.Property('类型:', m.type),
                R.Property('名称:', m.name || '(未命名)'),
                R.Property('可见:', String(m.visible)),
                R.Property('位置:', R.Vec3(m.position))
            )
            if (m.rotation) {
                const deg = THREE.MathUtils.radToDeg
                parts.push(R.Property(
                    '旋转:',
                    `${deg(m.rotation.x).toFixed(1)}°, ${deg(m.rotation.y).toFixed(1)}°, ${deg(m.rotation.z).toFixed(1)}°`
                ))
            }
            if (m.scale) {
                parts.push(R.Property(
                    '缩放:',
                    `${m.scale.x.toFixed(2)}, ${m.scale.y.toFixed(2)}, ${m.scale.z.toFixed(2)}`
                ))
            }
            if (m.castShadow || m.receiveShadow) {
                parts.push(
                    R.Property('投射阴影:', String(m.castShadow)),
                    R.Property('接收阴影:', String(m.receiveShadow))
                )
            }
            if (m.userData && Object.keys(m.userData).length > 0) {
                parts.push(R.Property('自定义数据:', JSON.stringify(m.userData)))
            }
            // 几何体信息
            if (m.geometry) {
                const g = m.geometry
                parts.push(R.Section('几何体'))
                parts.push(
                    R.Property('类型:', g.type || 'BufferGeometry'),
                    R.Property('顶点数:', String(g.attributes?.position?.count ?? '?'))
                )
                if (g.index) {
                    parts.push(R.Property('索引数:', String(g.index.count)))
                }
                if (g.attributes?.normal) {
                    parts.push(R.Property('法线:', '有'))
                }
                if (g.attributes?.uv) {
                    parts.push(R.Property('UV:', '有'))
                }
                if (g.boundingBox) {
                    const s = new THREE.Vector3()
                    g.boundingBox.getSize(s)
                    parts.push(R.Property('尺寸:', R.Vec3(s)))
                }
            }
            // 材质信息
            if (m.material) {
                const mats = Array.isArray(m.material) ? m.material : [m.material]
                parts.push(R.Section('材质'))
                parts.push(R.Property('数量:', String(mats.length)))
                mats.forEach((mat, i) => {
                    const label = mats.length > 1 ? `[${i}] ` : ''
                    parts.push(R.Property(
                        `${label}类型:`,
                        mat.type || 'Material'
                    ))
                    if (mat.color) {
                        parts.push(R.Property(`${label}颜色:`, R.ColorSwatch(mat.color.getHexString())))
                    }
                })
            }
            // 子物体
            if (m.children?.length > 0) {
                parts.push(R.Section(`子物体 (${m.children.length})`))
                parts.push(R.Property('子物体:', R.childrenView(m.children)))
            }
        } else {
            // ============== 兜底 ==============
            parts.push(
                R.Property('类型:', m?.['type'] ?? String(m))
            )
            if (m?.position) {
                parts.push(R.Property('位置:', R.Vec3(m.position)))
            }
            if (m?.children?.length > 0) {
                parts.push(R.Property('子物体:', R.childrenView(m.children)))
            }
        }
        return R.Body(
            R.Title(this.toString()),
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

// ============== 通用工具函数（供各 BlockGroup 复用） ==============

/**
 * 解包可能经过 Wrapper / RTW_Model_Box 包装的值
 * @param {*} value
 * @returns {*}
 */
function unwrapRTWModel(value) {
    const obj = Wrapper.unwrap(value)
    return obj instanceof RTW_Model_Box ? obj.model : obj
}

/**
 * 将值包装为 Wrapper(RTW_Model_Box(...))
 * @param {*} obj
 * @returns {Wrapper}
 */
function wrapRTWModel(obj) {
    return new Wrapper(new RTW_Model_Box(obj, false, false, false, undefined))
}

/**
 * 将任意值解析为 THREE.Vector3
 * @param {*} value
 * @param {any} THREE
 * @param {{toNumber: (v: any) => number}} [cast]
 * @returns {any | null}
 */
function toVector3(value, THREE, cast) {
    const v = unwrapRTWModel(value)
    if (v instanceof THREE.Vector3) return v.clone()
    if (Array.isArray(v) && v.length >= 3) {
        return new THREE.Vector3(
            Number(v[0]) || 0,
            Number(v[1]) || 0,
            Number(v[2]) || 0
        )
    }
    if (v && typeof v === 'object') {
        return new THREE.Vector3(
            cast ? cast.toNumber(v.x) : Number(v.x) || 0,
            cast ? cast.toNumber(v.y) : Number(v.y) || 0,
            cast ? cast.toNumber(v.z) : Number(v.z) || 0
        )
    }
    return null
}

/**
 * 将任意值解析为 THREE.Color
 * 支持：number(hex)、string('#fff'/'rgb(...)'/'hsl(...)')、THREE.Color、
 *       RTW_Model_Box<THREE.Color>、{r,g,b}/{h,s,l} 对象
 * @param {*} value
 * @param {any} THREE
 * @param {{toNumber: (v: any) => number}} [cast]
 * @returns {any}
 */
function toColor(value, THREE, cast) {
    const c = unwrapRTWModel(value)
    if (c instanceof THREE.Color) return c.clone()

    const toN = v => (cast ? cast.toNumber(v) : Number(v)) || 0

    if (Array.isArray(c) && c.length >= 3) {
        return new THREE.Color(
            toN(c[0]) / 255,
            toN(c[1]) / 255,
            toN(c[2]) / 255
        )
    }
    if (typeof c === 'string') {
        const trimmed = c.trim()
        if (trimmed.startsWith('#')) return new THREE.Color(trimmed)
        if (trimmed.startsWith('rgb')) {
            const nums = (trimmed.match(/\d+/g) || []).map(Number)
            if (nums.length >= 3) {
                return new THREE.Color(
                    nums[0] / 255,
                    nums[1] / 255,
                    nums[2] / 255
                )
            }
        }
        if (trimmed.startsWith('hsl')) {
            const nums = (trimmed.match(/\d+(\.\d+)?/g) || []).map(Number)
            if (nums.length >= 3) {
                return new THREE.Color().setHSL(
                    nums[0] / 360,
                    nums[1] / 100,
                    nums[2] / 100
                )
            }
        }
    }
    if (c && typeof c === 'object') {
        if ('r' in c && 'g' in c && 'b' in c) {
            return new THREE.Color(
                toN(c.r) / 255,
                toN(c.g) / 255,
                toN(c.b) / 255
            )
        }
        if ('h' in c && 's' in c && 'l' in c) {
            let h = toN(c.h)
            const s = toN(c.s)
            const l = toN(c.l)
            if (h > 1) h /= 360
            return new THREE.Color().setHSL(h, s, l)
        }
    }
    return new THREE.Color(cast ? cast.toNumber(value) : Number(value))
}

/**
 * 颜色工具集合，统一处理颜色类型转换。
 * 所有接收颜色参数的积木都应通过 ColorTools.parse 解析输入。
 */
const ColorTools = {
    /**
     * 通用颜色解析器
     * @param {*} value
     * @param {any} THREE
     * @param {{toNumber: (v: any) => number}} [cast]
     * @returns {any} THREE.Color
     */
    parse: toColor,

    /**
     * 转十进制 hex 数值（0xRRGGBB）
     */
    toHex(value, THREE, cast) {
        return toColor(value, THREE, cast).getHex()
    },

    /**
     * 转 RGB 对象 {r, g, b}，范围 0-255
     */
    toRGB(value, THREE, cast) {
        const c = toColor(value, THREE, cast)
        return {
            r: Math.round(c.r * 255),
            g: Math.round(c.g * 255),
            b: Math.round(c.b * 255)
        }
    },

    /**
     * 从 HSL 创建 THREE.Color
     * h: 0-360°，s/l: 0-100%（或 0-1）
     */
    fromHSL(h, s, l, THREE, cast) {
        let hh = cast ? cast.toNumber(h) : Number(h) || 0
        const ss = cast ? cast.toNumber(s) : Number(s) || 0
        const ll = cast ? cast.toNumber(l) : Number(l) || 0
        if (hh > 1) hh /= 360
        return new THREE.Color().setHSL(hh, ss / 100, ll / 100)
    },

    /**
     * 转 HSL 对象 {h, s, l}，h 为 0-1，s/l 为 0-1
     */
    toHSL(value, THREE, cast) {
        const c = toColor(value, THREE, cast)
        const hsl = { h: 0, s: 0, l: 0 }
        c.getHSL(hsl)
        return hsl
    },

    /**
     * 转 '#rrggbb' 字符串
     */
    toString(value, THREE, cast) {
        return `#${toColor(value, THREE, cast).getHexString()}`
    }
}

// patch 函数已统一到 injector.js，这里通过 import 复用

export {
    addRTWStyle,
    RTW_Model_Box,
    Wrapper,
    RTWVisualReport as RTWDialog,
    setTHREE,
    unwrapRTWModel,
    wrapRTWModel,
    toVector3,
    toColor,
    ColorTools
}
