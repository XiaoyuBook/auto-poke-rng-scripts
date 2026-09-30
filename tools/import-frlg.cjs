// The source must be audited by auto-poke-rng/tools/import-frlg-release.py first.
const fs = require('node:fs');
const path = require('node:path');
const { auditFrlg } = require('./audit-frlg.cjs');
if (!process.argv[2]) throw Error('Usage: node tools/import-frlg.cjs <audited-corpus>');
const source = path.resolve(process.argv[2]);
const target = path.resolve(__dirname, '../bundles/frlg-automation/files');
const entries = ['NS火叶全自动一键乱数2.0.ecs', 'NS火叶全自动一键乱数2.0-时间轴.ecs', 'lib', 'ImgLabel', 'Tessdata'];
auditFrlg(source);
for (const entry of entries) {
  if (fs.existsSync(path.join(target, entry))) throw Error('Refusing to overwrite imported resources: ' + entry);
  fs.cpSync(path.join(source, entry), path.join(target, entry), { recursive: true, errorOnExist: true, force: false });
}
