const fs = require('fs')
const path = 'src/blocks/BlockGroup.js'
let content = fs.readFileSync(path, 'utf8')
content = content.replace(
    '@property {string} [OUTPUT]\n * @property {string} [XML]',
    '@property {string} OUTPUT\n * @property {string} XML'
)
content = content.replace(
    'instance[b.opcode] = b.onClick',
    "instance[b.opcode || ''] = b.onClick"
)
content = content.replace(
    'instance[b.opcode] = b.handler',
    "instance[b.opcode || ''] = b.handler"
)
fs.writeFileSync(path, content, 'utf8')
console.log('Updated BlockGroup.js')
