import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// words-au.js is a browser script; load it with a window/fetch shim.
const src = readFileSync(join(root, 'public/games/_lib/words-au.js'), 'utf8');
const AU = new Function('window', 'fetch', 'localStorage', 'speechSynthesis',
  src + '\nreturn AU;')({}, () => Promise.reject(new Error('no fetch in tests')), {}, undefined);

test('every staged word: graphemes join back to the word', () => {
  for (const stage of AU.STAGES) {
    if (stage.mode !== 'tiles') continue;
    for (const w of stage.words ?? []) {
      assert.equal(w.g.join(''), w.w, `stage ${stage.id} word "${w.w}"`);
    }
  }
});

test('every tiles-mode stage has a GPC pool', () => {
  for (const stage of AU.STAGES) {
    if (stage.mode === 'tiles') assert.ok(AU.GPC[stage.id], `GPC for stage ${stage.id}`);
  }
});

test('R Sounds stage exists with all five controlled-r graphemes', () => {
  const stage = AU.STAGES.find(s => s.id === 8);
  assert.ok(stage, 'stage 8');
  for (const g of ['ar', 'or', 'er', 'ir', 'ur']) {
    assert.ok(stage.words.some(w => w.g.includes(g)), `stage 8 has a "${g}" word`);
  }
  assert.ok(AU.GPC[8].vowels.includes('ar') && AU.GPC[8].vowels.includes('ur'));
});

test('sorts: words are legal and columns are filled', () => {
  for (const sort of AU.SORTS) {
    for (const col of sort.cols) {
      assert.ok(col.words.length >= 4, `${sort.id}/${col.label} has enough words`);
      for (const w of col.words) {
        assert.ok(!AU.BLOCKED.has(w), `${sort.id}: "${w}" not blocked`);
      }
    }
  }
  assert.ok(AU.SORTS.some(s => s.id === 'ar-or'), 'ar vs or sort exists');
});

test('alien words: aliens are not real words', () => {
  const realElsewhere = new Set(AU.EXTRA_WORDS);
  AU.STAGES.forEach(s => (s.words ?? []).forEach(x => realElsewhere.add(x.w)));
  for (const [level, data] of Object.entries(AU.ALIEN)) {
    for (const a of data.alien) {
      assert.ok(!realElsewhere.has(a), `alien "${a}" (level ${level}) is not a real word`);
      assert.ok(!AU.BLOCKED.has(a), `alien "${a}" (level ${level}) is not blocked`);
    }
  }
});

test('chains: each step changes exactly one grapheme', () => {
  for (const chain of AU.CHAINS) {
    const steps = chain.steps.map(AU.segment);
    for (let i = 0; i < steps.length - 1; i++) {
      assert.equal(steps[i].length, steps[i + 1].length,
        `${chain.id}: "${chain.steps[i]}" -> "${chain.steps[i + 1]}" same grapheme count`);
      const diffs = steps[i].filter((g, j) => g !== steps[i + 1][j]);
      assert.equal(diffs.length, 1,
        `${chain.id}: "${chain.steps[i]}" -> "${chain.steps[i + 1]}" one change`);
    }
    for (const w of chain.steps) {
      assert.equal(AU.segment(w).join(''), w, `segment("${w}") round-trips`);
      assert.ok(!AU.BLOCKED.has(w), `"${w}" not blocked`);
    }
  }
});

test('heart words: tricky part is inside the word', () => {
  for (const h of AU.HEART_WORDS) {
    assert.ok(h.w.includes(h.tricky), `"${h.w}" contains "${h.tricky}"`);
  }
});

test('sentences: each has a retell question and a bossy-r word', () => {
  for (const item of AU.SENTENCES) {
    assert.ok(item.q && item.q.length > 5, `question for "${item.s}"`);
    assert.ok(/\w*(ar|or|er|ir|ur)\w*/i.test(item.s), `"${item.s}" has an r-controlled word`);
  }
});

test('preferFocus puts focus words first', () => {
  AU.focus = ['ar'];
  const list = [
    { w: 'dog', g: ['d', 'o', 'g'] },
    { w: 'car', g: ['c', 'ar'] },
    { w: 'sun', g: ['s', 'u', 'n'] },
  ];
  const out = AU.preferFocus(list);
  assert.equal(out[0].w, 'car');
  AU.focus = [];
});
