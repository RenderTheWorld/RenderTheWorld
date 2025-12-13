/*
 * By: Xeltalliv
 * Link: https://github.com/Xeltalliv/extensions/blob/webgl2-dev/extensions/webgl2.js
 *
 * Modified by: Fath11 & Optimized by AI
 * Link: https://github.com/fath11
 */
class Skins {
    constructor(runtime) {
        this.runtime = runtime;
        const Skin = this.runtime.renderer.exports.Skin;

        class CanvasSkin extends Skin {
            constructor(id, renderer) {
                super(id, renderer);
                this.gl = renderer._gl;
                this._texture = this.gl.createTexture();
                this._textureSize = [0, 0]; // 记录当前纹理尺寸

                this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

                this._rotationCenter = [320, 180];
                this._size = [640, 360];
            }

            dispose() {
                if (this._texture) {
                    this.renderer.gl.deleteTexture(this._texture);
                    this._texture = null;
                }
                super.dispose();
            }

            set size(value) {
                this._size = value;
                this._rotationCenter = [value[0] / 2, value[1] / 2];
            }

            get size() {
                return this._size;
            }

            getTexture(scale) {
                return this._texture || super.getTexture();
            }

            /**
             * 优化后的 setContent
             * 使用 texSubImage2D 替代 texImage2D 以提升性能
             */
            setContent(textureData) {
                if (!this._texture || !textureData.width || !textureData.height) return;

                this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);

                // 检查纹理尺寸是否发生变化
                const currentWidth = textureData.width;
                const currentHeight = textureData.height;

                if (this._textureSize[0] !== currentWidth || this._textureSize[1] !== currentHeight) {
                    // 尺寸改变或首次加载：使用 texImage2D (重新分配显存)
                    this.gl.texImage2D(
                        this.gl.TEXTURE_2D,
                        0,
                        this.gl.RGBA,
                        this.gl.RGBA,
                        this.gl.UNSIGNED_BYTE,
                        textureData
                    );
                    this._textureSize = [currentWidth, currentHeight];
                } else {
                    // 尺寸未变：使用 texSubImage2D (仅更新数据，性能极高)
                    this.gl.texSubImage2D(
                        this.gl.TEXTURE_2D,
                        0,
                        0,
                        0,
                        this.gl.RGBA,
                        this.gl.UNSIGNED_BYTE,
                        textureData
                    );
                }

                this.emit(Skin.Events.WasAltered);
            }
        }

        this.CanvasSkin = CanvasSkin;
    }
}

export { Skins };