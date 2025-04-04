import { Command } from '../Command.js'
import { ObjectLoader } from 'three'

class AddObjectCommand extends Command {
	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} [object=null]
	 * @constructor
	 */
	constructor(editor, object = null) {
		super(editor)

		this.type = 'AddObjectCommand'

		this.object = object

		if (object !== null) {
			this.name =
				editor.strings.getKey('command/AddObject') + ': ' + object.name
		}
	}

	execute() {
		this.editor.addObject(this.object)
		this.editor.select(this.object)
	}

	undo() {
		this.editor.removeObject(this.object)
		this.editor.deselect()
	}

	toJSON() {
		const output = super.toJSON(this)

		output.object = this.object.toJSON()

		return output
	}

	fromJSON(json) {
		super.fromJSON(json)

		this.object = this.editor.objectByUuid(json.object.object.uuid)

		if (this.object === undefined) {
			const loader = new ObjectLoader()
			this.object = loader.parse(json.object)
		}
	}
}

export { AddObjectCommand }
