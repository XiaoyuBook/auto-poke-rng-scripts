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
  const manifest = { schemaVersion: 1, id: 'demo', name: '示例', description: '测试', game: 'BDSP', authors: ['author'], version: '1.0.0', minimumAppVersion: '0.1.0', installFolder: 'Demo' };
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
