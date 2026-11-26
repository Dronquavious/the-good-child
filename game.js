'use strict';

(() => {
  const { chapters, resolveTrail } = story;
  const chapterIds = Object.keys(chapters);
  const canvas = document.getElementById('game');
  const draw = createForest(canvas);
  const book = document.getElementById('book');
  const page = document.getElementById('page');
  const marker = document.getElementById('mapMarker');
  const markerLabel = document.getElementById('mapMarkerLabel');
  const chapterLabel = document.getElementById('chapterLabel');
  const stepLabel = document.getElementById('stepLabel');
  const progress = document.getElementById('chapterProgress');
  const mapCaption = document.getElementById('mapCaption');
  const provision = document.getElementById('provision');
  const touchControls = document.getElementById('touchControls');
  const touchAction = document.getElementById('touchAction');
  const research = document.getElementById('researchDialog');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const keys = new Set();
  const pointers = new Map();
  const player = { x: 125, y: 389 };
  const startPosition = { ...player };
  const summary = [];
  let chapterIndex = 0;
  let mode = 'start';
  let choices = [];
  let trail = resolveTrail(chapterIds[0], []);
  let destinations = [];
  let lastFrame = 0;

  const chapterId = () => chapterIds[chapterIndex];
  const chapter = () => chapters[chapterId()];
  const encounter = () => chapter().steps[choices.length];
  const target = () => forestLayouts[chapterId()].points[encounter().id];
  const button = (label, action, style = '') =>
    `<button class="page-button ${style}" data-action="${action}" type="button">${label}</button>`;
  const heading = (title, tag = 'h2') => `<${tag} tabindex="-1">${title}</${tag}>`;

  function setPage(nextMode, markup, focus = true) {
    mode = nextMode;
    book.dataset.mode = mode;
    page.innerHTML = markup;
    keys.clear();
    pointers.clear();
    destinations = [];
    touchControls.hidden = mode !== 'explore';
    updateFrameLabels();
    if (focus) {
      const title = page.querySelector('h1, h2');
      title.focus({ preventScroll: true });
      title.scrollIntoView({ block: 'nearest' });
    }
  }

  function updateFrameLabels() {
    const reading = mode !== 'start' && mode !== 'end';
    chapterLabel.textContent = reading ? `Chapter ${chapterIndex + 1} of 3` : 'Little Red Riding Hood';
    stepLabel.textContent = reading ? (chapterId() === 'remix' ? 'Modern remix' : chapter().year)
      : mode === 'end' ? 'Comparison' : 'Three tellings';
    progress.hidden = !reading;
    Array.from(progress.children).forEach((item, index) => {
      if (index === chapterIndex && reading) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      item.classList.toggle('done', index < chapterIndex);
    });
    mapCaption.textContent = {
      start: 'The road to Grandmother’s', intro: chapter().name, explore: encounter()?.place,
      question: encounter()?.place, response: chapter().steps[choices.length - 1]?.place,
      result: trail.ending?.title, epilogue: 'Published Grimm epilogue', end: 'The road home'
    }[mode];
    provision.textContent = reading && mode !== 'epilogue' ? chapter().provision : '';
    marker.hidden = mode !== 'explore';
    if (mode === 'explore') {
      marker.style.left = `${target().x / canvas.width * 100}%`;
      marker.style.top = `${(target().y - 43) / canvas.height * 100}%`;
      markerLabel.textContent = `Go to ${encounter().place}`;
    }
  }

  function resetTrail() {
    choices = [];
    trail = resolveTrail(chapterId(), choices);
    Object.assign(player, startPosition);
  }

  function showStart(focus) {
    chapterIndex = 0;
    summary.length = 0;
    resetTrail();
    setPage('start', `
      <p class="eyebrow">An interactive fairy-tale study</p>
      ${heading('The Good<br> Child', 'h1')}
      <p class="lead">Walk Red’s road through three tellings of <i>Little Red Riding Hood</i>. Decide whom to trust, where to go, and when to turn back.</p>
      <ul class="contents"><li><time>1697</time> Perrault</li><li><time>1857</time> Brothers Grimm</li><li><span>Modern</span> Original remix</li></ul>
      <div class="actions">${button('Play · 5–8 minutes <span aria-hidden="true">→</span>', 'start')}</div>
      <p class="controls">Move with WASD or arrow keys. Press E or Space to interact, or select the glowing marker.</p>
    `, focus);
  }

  function showIntro() {
    resetTrail();
    const current = chapter();
    setPage('intro', `
      <p class="eyebrow">${current.credit || `${current.name} · ${current.year}`}</p>
      ${heading(current.title)}
      <p class="lead">${current.intro}</p>
      <p class="reflection">${current.lens}</p>
      <div class="actions">${button('Enter the forest <span aria-hidden="true">→</span>', 'walk')}</div>
    `);
  }

  function showExplore() {
    const next = encounter();
    setPage('explore', `
      <p class="eyebrow">Encounter ${choices.length + 1} of 3</p>
      ${heading(next.place)}
      <p class="lead">Follow the trail to the glowing marker.</p>
      <div class="actions">${button(`Go to ${next.place}`, 'travel')}</div>
      <p class="controls">Use WASD or the arrow keys to walk. Press E or Space when you arrive.</p>
      <p id="nearbyHint" class="reflection" aria-live="polite"></p>
    `);
  }

  function showQuestion() {
    const next = encounter();
    const prompt = typeof next.prompt === 'function' ? next.prompt(trail) : next.prompt;
    setPage('question', `
      <p class="eyebrow">Decision ${choices.length + 1} of 3</p>
      ${heading(next.title)}
      <p class="lead">${prompt}</p>
      <div class="choices">
        ${next.choices.map((choice, index) => button(
          `<span class="key-number" aria-hidden="true">${index + 1}</span><span>${choice.label}</span>`,
          `choose-${index}`, 'choice-button'
        )).join('')}
      </div>
    `);
  }

  function makeChoice(index) {
    if (mode !== 'question') return;
    const choice = encounter().choices[index];
    choices.push(choice.id);
    trail = resolveTrail(chapterId(), choices);
    setPage('response', `
      <p class="eyebrow">Your choice</p>
      ${heading(choice.label)}
      <p class="lead">${choice.response}</p>
      <div class="actions">${button(encounter() ? 'Continue <span aria-hidden="true">→</span>' : 'Read your ending <span aria-hidden="true">→</span>', 'continue')}</div>
    `);
  }

  function recordChapter() {
    summary[chapterIndex] = {
      route: chapter().steps.map((step, index) => step.choices.find(choice => choice.id === choices[index]).short),
      title: trail.ending.title
    };
  }

  function showResult() {
    recordChapter();
    const current = chapter();
    setPage('result', `
      <p class="eyebrow">${current.name} · Chapter ending</p>
      ${heading(trail.ending.title)}
      <section class="outcome">
        <h3>Your what-if ending</h3>
        <p>${trail.ending.text}</p>
      </section>
      <section class="source">
        <h3>What happened in the published ${chapterId() === 'remix' ? 'parodies' : 'story'}</h3>
        <p>${current.sourceEnding}</p>
        <p class="citation">${current.reference}</p>
      </section>
      <p class="reflection">${current.reading}</p>
      <div class="actions">
        ${button(current.epilogue ? 'Read the second wolf episode →' : chapterIndex === 2 ? 'Compare the tellings →' : 'Next chapter →', current.epilogue ? 'epilogue' : 'advance')}
        ${button('Replay chapter', 'replay', 'secondary')}
      </div>
    `);
  }

  function showEpilogue() {
    const { epilogue, reference } = chapter();
    setPage('epilogue', `
      <p class="eyebrow">In the published Grimm tale</p>
      ${heading(epilogue.title)}
      <p class="lead">${epilogue.text}</p>
      <p class="reflection">Red remembers the danger, tells Grandmother, and helps carry out her plan.</p>
      <p class="citation">${reference}</p>
      <div class="actions">${button('Next chapter →', 'advance')}${button('Return to your ending', 'result', 'secondary')}</div>
    `);
  }

  function showEnd() {
    setPage('end', `
      <p class="eyebrow">Three tellings compared</p>
      ${heading('Who gets called good?')}
      <p class="lead">Perrault warns against trusting a charming stranger. The Grimms make obedience explicit and give Red a chance to learn. Thurber and Dahl put the power to act in Red’s hands.</p>
      <div class="comparison">${chapterIds.map((id, index) => `
        <section>
          <h3>${chapters[id].name}</h3>
          <p>${chapters[id].comparison}</p>
          <p class="route"><strong>Your route</strong> ${summary[index].route.join(' · ')}</p>
          <p class="citation">${summary[index].title}</p>
        </section>
      `).join('')}</div>
      <p class="reflection">The same act means something different depending on who tells the story. What did the versions ask Red to know before she made a choice?</p>
      <div class="actions">${button('Play again', 'restart')}<a class="page-button secondary" href="research.html#works-cited">Works cited</a></div>
    `);
  }

  function advance() {
    if (chapterIndex === chapterIds.length - 1) showEnd();
    else {
      chapterIndex += 1;
      showIntro();
    }
  }

  function nearby() {
    const point = target();
    return Math.hypot(player.x - point.x, player.y - point.y) <= 56;
  }

  function interact() {
    if (mode === 'explore' && !research.open && nearby()) showQuestion();
  }

  function travel() {
    if (mode !== 'explore') return;
    if (reducedMotion.matches || nearby()) {
      Object.assign(player, target());
      interact();
    } else {
      const layout = forestLayouts[chapterId()];
      destinations = encounter().id === 'cottage' && trail.route === 'wander'
        ? [...forestDetour(layout).slice(1, -1).map(([x, y]) => ({ x, y })), target()]
        : [target()];
    }
  }

  const actions = {
    start: showIntro, walk: showExplore, travel, 'choose-0': () => makeChoice(0), 'choose-1': () => makeChoice(1),
    continue: () => encounter() ? showExplore() : showResult(), result: showResult,
    epilogue: showEpilogue, advance, replay: showIntro, restart: () => showStart(true)
  };
  page.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action) actions[action]();
  });
  marker.addEventListener('click', travel);
  canvas.addEventListener('click', event => {
    if (mode !== 'explore') return;
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width * canvas.width;
    const y = (event.clientY - bounds.top) / bounds.height * canvas.height;
    const point = target();
    if (Math.hypot(x - point.x, y - point.y) < 74) travel();
  });
  touchAction.addEventListener('click', interact);

  const directions = {
    arrowleft: 'left', a: 'left', arrowup: 'up', w: 'up',
    arrowright: 'right', d: 'right', arrowdown: 'down', s: 'down'
  };
  document.addEventListener('keydown', event => {
    if (research.open || event.altKey || event.metaKey || event.ctrlKey) return;
    const key = event.key.toLowerCase();
    const direction = directions[key];
    if (mode === 'explore' && direction) {
      event.preventDefault();
      keys.add(key);
      destinations = [];
    }
    if (event.repeat) return;
    if (mode === 'question' && (key === '1' || key === '2')) {
      event.preventDefault();
      makeChoice(Number(key) - 1);
    }
    if (mode === 'explore' && (key === 'e' || (key === ' ' && !event.target.closest('button, a')))) {
      event.preventDefault();
      interact();
    }
  });
  document.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => {
    keys.clear();
    pointers.clear();
  });
  document.querySelectorAll('[data-dir]').forEach(control => {
    control.addEventListener('pointerdown', event => {
      event.preventDefault();
      destinations = [];
      pointers.set(event.pointerId, control.dataset.dir);
      control.setPointerCapture(event.pointerId);
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      control.addEventListener(event, pointer => pointers.delete(pointer.pointerId));
    }
  });
  document.getElementById('researchButton').addEventListener('click', () => {
    keys.clear();
    pointers.clear();
    research.showModal();
  });
  research.addEventListener('click', event => {
    if (event.target === research) {
      const bounds = research.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) research.close();
    }
  });

  function move(dt) {
    const destination = destinations[0];
    if (destination) {
      const dx = destination.x - player.x;
      const dy = destination.y - player.y;
      const distance = Math.hypot(dx, dy);
      const stride = Math.min(distance, 490 * dt);
      if (stride === distance) {
        Object.assign(player, destinations.shift());
        if (!destinations.length) interact();
      } else {
        player.x += dx / distance * stride;
        player.y += dy / distance * stride;
      }
      return stride > 0;
    }
    const pressed = new Set([...Array.from(keys, key => directions[key]), ...pointers.values()]);
    const dx = Number(pressed.has('right')) - Number(pressed.has('left'));
    const dy = Number(pressed.has('down')) - Number(pressed.has('up'));
    if (!dx && !dy) return false;
    const stride = 245 * dt / Math.hypot(dx, dy);
    player.x = Math.max(22, Math.min(canvas.width - 22, player.x + dx * stride));
    player.y = Math.max(100, Math.min(canvas.height - 28, player.y + dy * stride));
    return true;
  }

  function frame(now) {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    const walking = mode === 'explore' && !research.open && move(dt);
    if (mode === 'explore') {
      const near = nearby();
      touchAction.disabled = !near;
      const hint = page.querySelector('#nearbyHint');
      const text = near ? 'You’ve reached the marker. Press E or select it to interact.' : '';
      if (hint.textContent !== text) hint.textContent = text;
    }
    draw({
      chapterId: chapterId(), mode, trail, player, walking,
      time: reducedMotion.matches ? 0 : now
    });
    requestAnimationFrame(frame);
  }

  showStart(false);
  requestAnimationFrame(frame);
})();
