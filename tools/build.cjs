const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { zipSync } = require('fflate');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const version = value => typeof value === 'string' && value.length <= 50 && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value) && value.split('.').every(n => Number.isSafeInteger(Number(n)));
const text = (value, limit) => typeof value === 'string' && value.length > 0 && value.length <= limit;
function safePath(value) {
  return typeof value === 'string' && value.length <= 200 && value.split('/').every(part => part && part !== '.' && part !== '..' && !/[<>:"\\|?*\x00-\x1f]/.test(part) && !/[. ]$/.test(part) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part));
}
function build(root) {
  const packages = [], folders = new Set();
  for (const id of fs.readdirSync(path.join(root, 'bundles')).sort()) {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(id)) throw Error('包 ID 无效');
    const directory = path.join(root, 'bundles', id);
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
    if (manifest.schemaVersion !== 1 || manifest.id !== id || !version(manifest.version) || !version(manifest.minimumAppVersion)
      || !text(manifest.name, 100) || !text(manifest.description, 3000) || !text(manifest.game, 50)
      || !Array.isArray(manifest.authors) || !manifest.authors.length || manifest.authors.length > 20 || manifest.authors.some(author => !text(author, 100))
      || (manifest.instructions != null && !text(manifest.instructions, 12000))) throw Error('包描述无效');
    if (!safePath(manifest.installFolder) || manifest.installFolder.includes('/') || manifest.installFolder.startsWith('.') || folders.has(manifest.installFolder.toLowerCase())) throw Error('安装目录无效或重复');
    folders.add(manifest.installFolder.toLowerCase());
    const files = [], entries = {}, seen = new Set();
    function visit(relative = '') {
      for (const item of fs.readdirSync(path.join(directory, 'files', relative), { withFileTypes: true }).sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
        const name = relative ? relative + '/' + item.name : item.name;
        if (!safePath(name) || item.isSymbolicLink() || seen.has(name.toLowerCase())) throw Error('文件路径无效或重复：' + name);
        seen.add(name.toLowerCase());
        if (item.isDirectory()) { visit(name); continue; }
        if (!item.isFile() || !/\.(txt|il|md)$/i.test(name)) throw Error('包内只允许 .txt 脚本、标签和说明：' + name);
        const bytes = fs.readFileSync(path.join(directory, 'files', name));
        if (bytes.length > 12 * 1024 * 1024 || /\.txt$/i.test(name) && bytes.length > 1024 * 1024) throw Error('文件过大');
        if (/\.il$/i.test(name)) {
          const label = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
          if (typeof label.ImgBase64 !== 'string' || !Number.isFinite(label.searchMethod)) throw Error('图像标签无效：' + name);
        }
        files.push({ path: name, bytes: bytes.length, sha256: hash(bytes) });
        entries['files/' + name] = [bytes, { mtime: new Date(1980, 0, 1) }];
      }
    }
    visit();
    if (!files.some(file => /\.txt$/i.test(file.path)) || files.length > 256 || files.reduce((n,f) => n + f.bytes, 0) > 50 * 1024 * 1024) throw Error('脚本包为空或过大');
    const complete = { ...manifest, files };
    entries['manifest.json'] = [Buffer.from(JSON.stringify(complete, null, 2) + '\n'), { mtime: new Date(1980, 0, 1) }];
    const bytes = Buffer.from(zipSync(entries, { level: 9 }));
    if (bytes.length > 20 * 1024 * 1024) throw Error('压缩包过大');
    const archive = `packages/${id}/${manifest.version}.zip`, target = path.join(root, archive);
    if (fs.existsSync(target) && hash(fs.readFileSync(target)) !== hash(bytes)) throw Error('已发布版本不可覆盖，请提高版本号：' + archive);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
    packages.push({ ...manifest, archive, bytes: bytes.length, sha256: hash(bytes) });
  }
  const catalog = { schemaVersion: 1, packages };
  fs.writeFileSync(path.join(root, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  return catalog;
}
if (require.main === module) console.log(`Built ${build(path.resolve(__dirname, '..')).packages.length} packages`);
module.exports = { build };
