const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const entries = ['NS火叶全自动一键乱数2.0.ecs', 'NS火叶全自动一键乱数2.0-时间轴.ecs'];
function fingerprint(root, files) {
  const hash = createHash('sha256');
  for (const relative of files) {
    const name = Buffer.from(relative), bytes = fs.readFileSync(path.join(root, relative));
    const nameSize = Buffer.alloc(4), size = Buffer.alloc(8);
    nameSize.writeUInt32BE(name.length); size.writeBigUInt64BE(BigInt(bytes.length));
    hash.update(nameSize).update(name).update(size).update(bytes);
  }
  return hash.digest('hex');
}
function auditFrlg(root) {
  const libs = fs.readdirSync(path.join(root, 'lib'), { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile()).map(entry => path.relative(root, path.join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
    .filter(file => !file.startsWith('lib/seed_backup/')).sort();
  const labels = fs.readdirSync(path.join(root, 'ImgLabel')).filter(file => file.endsWith('.IL')).sort();
  if (libs.length + entries.length !== 33 || fingerprint(root, [...entries, ...libs]) !== 'eb18777c634b7c5ab10c0f5a930fe29d65b1fdca7d18edb10b461c733dd30bbb') throw Error('火叶脚本指纹不匹配');
  if (labels.length !== 1154 || fingerprint(path.join(root, 'ImgLabel'), labels) !== '4d99ab33920f8812dea403b4ab0680b40aabf1c4eb370e1a6678a193898429ac') throw Error('火叶标签指纹不匹配');
  for (const [name, expected] of Object.entries({
    'frlg_battle.traineddata': '7abcaef4936727b33717656b38fd5b5027823e1cafec21abb06cc8ef1f7ff758',
    'FRLG_EN_ALL.traineddata': '3272f23a6f259518813025d89be77d706574ccdf163132ccf6f5be15ca19cfa0',
  })) if (createHash('sha256').update(fs.readFileSync(path.join(root, 'Tessdata', name))).digest('hex') !== expected) throw Error('火叶模型指纹不匹配: ' + name);
  return { scripts: 33, labels: 1154, models: 2 };
}
module.exports = { auditFrlg };
