const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { unzipSync } = require('fflate');
const { build } = require('../tools/build.cjs');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rng-pack-build-'));
  const folder = path.join(root, 'bundles/demo'); fs.mkdirSync(path.join(folder, 'files'), { recursive: true });
  fs.mkdirSync(path.join(root, 'categories/测种'), { recursive: true });
  fs.writeFileSync(path.join(root, 'categories/测种/README.md'), '# 测种\n\n先核对画面。');
  fs.writeFileSync(path.join(root, 'LICENSE.md'), 'Shared GPL-3.0-or-later license');
  const manifest = { schemaVersion: 1, id: 'demo', name: '示例', description: '测试', game: 'BDSP', authors: ['author'], version: '1.0.0', minimumAppVersion: '0.1.0', installFolder: 'Demo', license: 'GPL-3.0-or-later' };
  fs.writeFileSync(path.join(folder, 'manifest.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(folder, 'files/测试.txt'), 'A 1\n');
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { root, folder };
}
test('build emits a complete Unicode package and reproducible hashes', t => {
  const { root } = fixture(t), first = build(root);
  assert.deepEqual(build(root), first);
  const files = unzipSync(fs.readFileSync(path.join(root, first.packages[0].archive)));
  assert.equal(Buffer.from(files['files/测试.txt']).toString(), 'A 1\n');
  const manifest = JSON.parse(Buffer.from(files['manifest.json']));
  assert.equal(manifest.files[0].bytes, 4); assert.match(manifest.files[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal(Buffer.from(files['files/LICENSE.md']).toString(), 'Shared GPL-3.0-or-later license');
});
test('published versions are immutable', t => {
  const { root, folder } = fixture(t); build(root);
  fs.writeFileSync(path.join(folder, 'files/测试.txt'), 'B 1\n');
  assert.throws(() => build(root), /提高版本号/);
});
test('rejects executable payloads and malformed labels', t => {
  const { root, folder } = fixture(t);
  fs.writeFileSync(path.join(folder, 'files/extra.js'), '');
  assert.throws(() => build(root), /只允许/);
  fs.unlinkSync(path.join(folder, 'files/extra.js'));
  fs.writeFileSync(path.join(folder, 'files/label.IL'), '{}');
  assert.throws(() => build(root), /标签无效/);
});

test('published metadata and text limits satisfy the client protocol', t => {
  const { root, folder } = fixture(t), file = path.join(folder, 'manifest.json');
  const valid = JSON.parse(fs.readFileSync(file));
  for (const extra of [{ game: undefined }, { authors: [null] }, { name: 42 }, { installFolder: '.hidden' }, { version: '9007199254740993.0.0' }]) {
    fs.writeFileSync(file, JSON.stringify({ ...valid, ...extra }));
    assert.throws(() => build(root), /无效/);
  }
  fs.writeFileSync(file, JSON.stringify(valid));
  fs.writeFileSync(path.join(folder, 'files/测试.txt'), Buffer.alloc(1024 * 1024 + 1));
  assert.throws(() => build(root), /过大/);
});

test('catalog has one category guide and ZIP copies the shared license', t => {
  const { root, folder } = fixture(t), file = path.join(folder, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(file));
  fs.writeFileSync(file, JSON.stringify({ ...manifest, categories: [{ name: '测种', files: ['测试.txt'] }] }));
  const catalog = build(root), item = catalog.packages[0];
  assert.match(catalog.categoryReadmes['测种'], /先核对画面/);
  assert.equal(item.files.find(file => file.path === '测试.txt').category, '测种');
  const archive = unzipSync(fs.readFileSync(path.join(root, item.archive)));
  const packed = JSON.parse(Buffer.from(archive['manifest.json']));
  assert.deepEqual(item.files, packed.files); assert.equal(item.readme, undefined);
  assert.equal(Buffer.from(archive['files/LICENSE.md']).toString(), fs.readFileSync(path.join(root, 'LICENSE.md'), 'utf8'));
  fs.writeFileSync(file, JSON.stringify({ ...manifest, categories: [{ name: '测种', files: ['不存在.txt'] }] }));
  assert.throws(() => build(root), /不存在/);
});

test('nested game/function folders are allowed, overlapping packages are rejected', t => {
  const { root, folder } = fixture(t), file = path.join(folder, 'manifest.json'), manifest = JSON.parse(fs.readFileSync(file));
  fs.writeFileSync(file, JSON.stringify({ ...manifest, installFolder: '珍钻复刻/测种' }));
  assert.equal(build(root).packages[0].installFolder, '珍钻复刻/测种');
  const second = path.join(root, 'bundles/other'); fs.cpSync(folder, second, { recursive: true });
  fs.writeFileSync(path.join(second, 'manifest.json'), JSON.stringify({ ...manifest, id: 'other', installFolder: '珍钻复刻' }));
  assert.throws(() => build(root), /重叠/);
});

test('labels must be used and sit beside the script that references them', t => {
  const { root, folder } = fixture(t), script = path.join(folder, 'files/测试.txt');
  fs.writeFileSync(script, '$1 = @宝可表\n# @注释\nPRINT "@文本"\nPRINT 说明@文字\n');
  assert.throws(() => build(root), /缺少.*宝可表/);
  fs.mkdirSync(path.join(folder, 'files/ImgLabel'));
  fs.writeFileSync(path.join(folder, 'files/ImgLabel/宝可表.IL'), '{"ImgBase64":"ABC","searchMethod":5}');
  assert.equal(build(root).packages[0].files.filter(file => /\.IL$/i.test(file.path)).length, 1);
  fs.writeFileSync(path.join(folder, 'files/ImgLabel/无关.IL'), '{"ImgBase64":"ABC","searchMethod":5}');
  assert.throws(() => build(root), /未使用/);
});

test('the 0.0.3 categorized catalog retains original scripts and required labels', () => {
  const root = path.resolve(__dirname, '..');
  const original = unzipSync(fs.readFileSync(path.join(root, 'packages/bdsp-official/0.0.1.zip')));
  const seen = new Set();
  for (const id of fs.readdirSync(path.join(root, 'bundles'))) {
    const folder = path.join(root, 'bundles', id), manifest = JSON.parse(fs.readFileSync(path.join(folder, 'manifest.json')));
    assert.equal(manifest.version, '0.0.3');
    const scripts = fs.readdirSync(path.join(folder, 'files')).filter(file => /\.txt$/i.test(file));
    assert.equal(scripts.length, 1);
    const script = scripts[0]; assert.ok(!seen.has(script)); seen.add(script);
    assert.deepEqual(fs.readFileSync(path.join(folder, 'files', script)), Buffer.from(original['files/' + script]));
    const labels = path.join(folder, 'files/ImgLabel');
    if (['bdsp-mesprit', 'bdsp-cresselia'].includes(id)) {
      assert.deepEqual(fs.readdirSync(labels).sort(), ['喷雾消失了.IL', '宝可表.IL', '艾姆利多在水域.IL', '艾姆利多在202路.IL'].sort());
      for (const file of fs.readdirSync(labels)) assert.deepEqual(fs.readFileSync(path.join(labels, file)), Buffer.from(original['files/ImgLabel/' + file]));
    } else assert.equal(fs.existsSync(labels), false);
  }
  assert.equal(seen.size, 22);
  assert.equal(fs.readdirSync(path.join(root, 'categories')).length, 6);
  const categories = Object.fromEntries(fs.readdirSync(path.join(root, 'bundles')).map(id => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'bundles', id, 'manifest.json')));
    return [id, manifest.categories.find(group => group.files.some(file => file.endsWith('.txt')))?.name];
  }));
  assert.equal(categories['bdsp-name'], '撞帧脚本');
  assert.equal(Object.values(categories).filter(category => category === '撞帧脚本').length, 9);
  assert.ok(!Object.hasOwn(categories, 'bdsp-ocr-page'));
  assert.ok(!Object.hasOwn(categories, 'bdsp-record'));
});
