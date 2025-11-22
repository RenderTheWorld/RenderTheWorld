/*
 * By: Xeltalliv
 * Link: https://github.com/Xeltalliv/extensions/blob/webgl2-dev/extensions/webgl2.js
 *
 * Modified by: Fath11
 * Link: https://github.com/fath11
 *
 * Please keep this comment if you wanna use this code :3
 */
class Skins {
  constructor(runtime) {
    this.runtime = runtime
    const Skin = this.runtime.renderer.exports.Skin

    class CanvasSkin extends Skin {
      constructor(id, renderer) {
        super(id, renderer)
        this.gl = renderer._gl
        const texture = this.gl.createTexture()
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_S,
          this.gl.CLAMP_TO_EDGE
        )
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_T,
          this.gl.CLAMP_TO_EDGE
        )
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MIN_FILTER,
          this.gl.NEAREST
        )
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MAG_FILTER,
          this.gl.NEAREST
        )
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,255,0,255]));
        this._texture = texture
        this._rotationCenter = [320, 180]
        this._size = [640, 360]
      }
      dispose() {
        if (this._texture) {
          this.renderer.gl.deleteTexture(this._texture)
          this._texture = null
        }
        super.dispose()
      }
      set size(value) {
        this._size = value
        this._rotationCenter = [value[0] / 2, value[1] / 2]
      }
      get size() {
        return this._size
      }
      getTexture(scale) {
        return this._texture || super.getTexture()
      }
      setContent(textureData) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture)
        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          0,
          this.gl.RGBA,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          textureData
        )
        this.emit(Skin.Events.WasAltered)
      }
    }

    this.CanvasSkin = CanvasSkin
  }
}
//End of Skins, Please keep this comment if you wanna use this code :3

export { Skins }
