const assert = require('node:assert/strict');
const { test } = require('node:test');
const { chapters, resolveTrail } = require('../story.js');

test('every encounter offers two choices with distinct immediate consequences', () => {
  for (const chapter of Object.values(chapters)) {
    assert.deepEqual(chapter.steps.map(({ id }) => id), ['wolf', 'forest', 'cottage']);
    for (const step of chapter.steps) {
      assert.equal(step.choices.length, 2);
      assert.notEqual(step.choices[0].id, step.choices[1].id);
      assert.notEqual(step.choices[0].response, step.choices[1].response);
      assert.ok(step.choices.every(({ label, short, response }) => label && short && response));
    }
  }
});

test('every possible route has a coherent result within its own chapter', () => {
  for (const [id, chapter] of Object.entries(chapters)) {
    const [wolf, forest, cottage] = chapter.steps.map(({ choices }) => choices);
    const endings = new Set();
    for (const first of wolf) {
      for (const second of forest) {
        for (const third of cottage) {
          const state = resolveTrail(id, [first.id, second.id, third.id]);
          assert.ok(state.ending.title);
          assert.ok(state.ending.text);
          assert.ok(state.cottage);
          assert.ok(state.wolf);
          endings.add(state.ending.title);
        }
      }
    }
    assert.equal(endings.size, 3);
  }
});

test('Perrault’s wolf uses the shorter road when he learns the address', () => {
  assert.equal(resolveTrail('perrault', ['share']).wolf, 'shortcut');
  assert.equal(resolveTrail('perrault', ['private']).wolf, 'searching');
  assert.equal(resolveTrail('perrault', ['share', 'wander']).cottage, 'wolf');
  assert.equal(resolveTrail('perrault', ['share', 'direct']).cottage, 'grandmother');
  assert.equal(resolveTrail('perrault', ['private', 'wander']).cottage, 'grandmother');
  assert.equal(resolveTrail('perrault', ['share', 'wander', 'trust']).ending.illustration, 'dark');
  assert.equal(resolveTrail('perrault', ['share', 'wander', 'check']).ending.illustration, 'help');
});

test('the Grimm detour exposes Red to the wolf, while checking avoids the ambush', () => {
  assert.equal(resolveTrail('grimm', ['private', 'wander']).cottage, 'wolf');
  assert.equal(resolveTrail('grimm', ['share', 'direct']).cottage, 'grandmother');
  assert.equal(resolveTrail('grimm', ['share', 'wander', 'trust']).ending.illustration, 'rescue');
  assert.equal(resolveTrail('grimm', ['share', 'wander', 'check']).ending.illustration, 'help');
  assert.equal(resolveTrail('grimm', ['private', 'direct', 'trust']).ending.illustration, 'visit');
});

test('in the remix the clearing offers a clue and the lane offers a neighbor', () => {
  assert.equal(resolveTrail('remix', ['share', 'wander']).clue, 'tracks');
  assert.equal(resolveTrail('remix', ['share', 'direct']).clue, 'neighbor');
  assert.equal(resolveTrail('remix', ['share', 'direct', 'trust']).ending.illustration, 'help');
  assert.equal(resolveTrail('remix', ['private', 'direct', 'trust']).ending.illustration, 'retreat');
  assert.equal(resolveTrail('remix', ['share', 'direct', 'check']).ending.illustration, 'expose');
});

test('cottage framing and source details remain specific to each telling', () => {
  const [perrault, grimm, remix] = Object.values(chapters);
  assert.match(perrault.intro, /cakes and a little pot of butter/);
  assert.match(perrault.intro, /no rule/);
  assert.match(perrault.sourceEnding, /[Nn]o rescuer/);
  assert.match(grimm.intro, /cake and wine/);
  assert.match(grimm.intro, /stay on the path/);
  assert.match(grimm.sourceEnding, /scissors.*stones/);
  assert.match(grimm.epilogue.text, /sausage.*trough|trough.*sausage/);
  assert.match(remix.credit, /Original modern remix inspired by Thurber and Dahl/);
});
