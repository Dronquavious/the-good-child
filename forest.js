'use strict';

const forestLayouts = {
  perrault: {
    points: { wolf: { x: 310, y: 388 }, forest: { x: 526, y: 352 }, cottage: { x: 819, y: 308 } },
    turn: [611, 421], ground: '#2e4b3b', shadow: '#223b30', light: '#426049',
    path: '#a68a63', leaf: ['#213c30', '#2d513d', '#3e6448', '#56764f']
  },
  grimm: {
    points: { wolf: { x: 302, y: 374 }, forest: { x: 555, y: 355 }, cottage: { x: 804, y: 304 } },
    turn: [614, 245], ground: '#354934', shadow: '#263926', light: '#536347',
    path: '#a6946b', leaf: ['#263b29', '#345038', '#496145', '#667852']
  },
  remix: {
    points: { wolf: { x: 297, y: 407 }, forest: { x: 526, y: 349 }, cottage: { x: 808, y: 294 } },
    turn: [639, 423], ground: '#2b4341', shadow: '#223536', light: '#3c5551',
    path: '#9f896d', leaf: ['#1e3534', '#2b4844', '#3a5a52', '#507269']
  }
};

function forestDetour(layout) {
  const { forest, cottage } = layout.points;
  const bend = [cottage.x - 73, cottage.y + (layout.turn[1] > cottage.y ? 48 : -31)];
  return [[forest.x, forest.y], layout.turn, bend, [cottage.x, cottage.y]];
}

function createForest(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const landscapes = new Map();

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function oval(x, y, rx, ry, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function shape(points, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    ctx.fill();
  }

  function line(points, color, size) {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.stroke();
  }

  function rng(seed) {
    return () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
  }

  function tree(x, y, size, palette, oak = false) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(size, size);
    oval(0, 1, 25, 8, '#13282078');
    rect(-4, -41, 8, 45, '#443b2d');
    rect(-3, -34, 3, 36, '#68543a');
    if (oak) {
      oval(-12, -44, 22, 22, palette[0]);
      oval(12, -48, 25, 23, palette[1]);
      oval(0, -60, 26, 22, palette[2]);
      oval(-8, -65, 16, 12, palette[3]);
    } else {
      shape([[-30, -13], [-19, -34], [-24, -34], [-13, -52], [-16, -52], [0, -82], [16, -52], [13, -52], [24, -34], [19, -34], [30, -13]], palette[0]);
      shape([[-23, -25], [0, -61], [22, -27], [11, -24], [-1, -30], [-12, -24]], palette[1]);
      shape([[-17, -44], [0, -73], [16, -46], [7, -47], [-5, -44]], palette[2]);
      shape([[-9, -57], [0, -74], [6, -61], [-1, -61]], palette[3]);
    }
    ctx.restore();
  }

  function flowers(x, y, color) {
    rect(x, y - 8, 2, 9, '#66845b');
    rect(x - 3, y - 10, 8, 3, color);
    rect(x, y - 12, 2, 7, '#e8bf80');
  }

  function lantern(x, y, lit = true) {
    if (lit) {
      const light = ctx.createRadialGradient(x, y - 24, 4, x, y - 24, 56);
      light.addColorStop(0, '#ffd07f7d');
      light.addColorStop(1, '#ffd07f00');
      oval(x, y - 24, 56, 56, light);
    }
    rect(x - 2, y - 32, 4, 34, '#3e372c');
    rect(x - 7, y - 35, 14, 14, '#3c352e');
    rect(x - 4, y - 32, 8, 8, lit ? '#f7c97c' : '#686052');
    rect(x - 8, y - 36, 16, 3, '#231f1c');
  }

  function mill() {
    const x = 668;
    const y = 235;
    oval(x, y + 15, 48, 12, '#16292299');
    shape([[x - 29, y + 15], [x - 19, y - 63], [x + 19, y - 63], [x + 30, y + 15]], '#b7a685');
    shape([[x - 25, y - 61], [x, y - 82], [x + 25, y - 61]], '#704638');
    rect(x - 7, y - 7, 14, 22, '#58493a');
    line([[x - 35, y - 68], [x + 35, y - 3]], '#4b3b2c', 4);
    line([[x - 36, y - 3], [x + 36, y - 68]], '#4b3b2c', 4);
    for (const [dx, dy] of [[-28, -62], [27, -60], [26, -12], [-28, -12]]) {
      oval(x + dx, y + dy, 10, 5, '#d7b88b');
    }
    oval(x, y - 35, 5, 5, '#755437');
  }

  function cottage(x, y, state, door) {
    const danger = state === 'wolf';
    const wallTop = y - 90;
    oval(x, y + 6, 69, 14, '#14281f9e');
    rect(x - 54, wallTop, 108, 83, '#b5946b');
    rect(x - 54, wallTop, 13, 83, '#8c7051');
    for (let row = 0; row < 5; row++) rect(x - 54, y - 17 - row * 13, 108, 2, '#78634869');
    rect(x + 23, y - 131, 15, 42, '#755748');
    shape([[x - 67, y - 82], [x - 51, y - 94], [x, y - 137], [x + 64, y - 82]], '#64382f');
    shape([[x - 66, y - 86], [x, y - 138], [x + 67, y - 86]], '#a85f48');
    line([[x - 55, y - 93], [x + 54, y - 93]], '#7d493b', 3);
    line([[x - 38, y - 106], [x + 37, y - 106]], '#86513d', 3);
    line([[x - 21, y - 119], [x + 21, y - 119]], '#86513d', 3);
    for (const dx of [-34, 20]) {
      rect(x + dx - 3, y - 67, 24, 28, '#5c4635');
      rect(x + dx, y - 64, 18, 22, danger ? '#715651' : '#edbe75');
      rect(x + dx + 8, y - 64, 2, 22, '#664d3a');
      rect(x + dx, y - 55, 18, 2, '#664d3a');
    }
    rect(x - 12, y - 57, 26, 50, '#594638');
    rect(x - 8, y - 54, 18, 46, danger && door !== 'check' ? '#322d29' : '#896747');
    rect(x + 5, y - 29, 3, 3, '#d7b177');
    rect(x - 18, y - 7, 37, 5, '#a3937c');
  }

  function red(x, y, time, walking, bouquet) {
    const step = walking ? Math.sin(time / 60) * 3 : 0;
    oval(x, y + 12, 17, 6, '#18271eaa');
    rect(x - 8, y + 4 + step, 5, 12, '#392b2a');
    rect(x + 3, y + 4 - step, 5, 12, '#392b2a');
    shape([[x - 7, y - 19], [x + 8, y - 19], [x + 17, y + 9], [x - 16, y + 9]], '#a33e3d');
    shape([[x - 7, y - 17], [x, y - 12], [x - 1, y + 8], [x - 14, y + 8]], '#ca5448');
    oval(x, y - 23, 14, 16, '#c9554a');
    oval(x + 2, y - 22, 8, 10, '#f0c49a');
    rect(x, y - 23, 2, 2, '#523b34');
    rect(x + 5, y - 23, 2, 2, '#523b34');
    line([[x + 13, y], [x + 15, y - 8], [x + 20, y - 8], [x + 23, y]], '#a48353', 2);
    rect(x + 11, y - 2, 14, 8, '#cb9a58');
    rect(x + 12, y + 2, 12, 2, '#8b653f');
    if (bouquet) {
      flowers(x + 14, y - 1, '#e5a2a4');
      flowers(x + 20, y + 2, '#ede1b6');
    }
  }

  function wolf(x, y, face = '#525753') {
    oval(x, y + 7, 22, 6, '#1a3027a4');
    shape([[x - 18, y - 22], [x - 20, y - 49], [x - 5, y - 32], [x + 7, y - 32], [x + 20, y - 49], [x + 18, y - 20], [x + 13, y + 5], [x - 12, y + 5]], face);
    shape([[x - 18, y - 44], [x - 15, y - 32], [x - 10, y - 34]], '#927872');
    shape([[x + 17, y - 44], [x + 11, y - 33], [x + 15, y - 30]], '#927872');
    oval(x + 1, y - 9, 10, 9, '#777368');
    rect(x - 9, y - 22, 4, 3, '#e7ba74');
    rect(x + 6, y - 22, 4, 3, '#e7ba74');
    oval(x + 1, y - 12, 5, 3, '#2c2b2a');
  }

  function figure(x, y, color) {
    oval(x, y + 9, 13, 5, '#1a3027a4');
    shape([[x - 7, y - 19], [x + 7, y - 19], [x + 13, y + 7], [x - 13, y + 7]], color);
    oval(x, y - 23, 8, 9, '#d9b58a');
    rect(x - 9, y - 29, 18, 4, '#665744');
  }

  function footprints(x, y, endX, endY) {
    for (let i = 0; i < 9; i++) {
      const ratio = i / 9;
     const px = x + (endX - x) * ratio;
      const py = y + (endY - y) * ratio + (i % 2 ? 6 : -6);
      oval(px, py, 4, 3, '#544c42');
      for (let toe = 0; toe < 3; toe++) oval(px - 3 + 3 * toe, py - 4, 1, 1, '#544c42');
    }
  }

  function drawRoad(points, palette, size) {
    line(points, '#4b4935', size + 14);
    line(points, '#77664d', size + 6);
    line(points, palette.path, size);
  }

  function pathPoints(layout) {
    const { wolf: start, forest, cottage: end } = layout.points;
    return [[-12, 452], [117, 395], [start.x, start.y], [forest.x, forest.y], [end.x, end.y], [990, end.y + 37]];
  }

  function background(id, layout) {
    rect(0, 0, width, height, layout.ground);
    const random = rng(686);
    for (let i = 0; i < 270; i++) {
      const x = random() * width;
      const y = random() * height;
      oval(x, y, 6 + random() * 46, 2 + random() * 16, i % 3 ? layout.shadow + '55' : layout.light + '60');
    }
    for (let i = 0; i < 1480; i++) {
      const x = random() * width;
      const y = random() * height;
      rect(x, y, 2 + random() * 6, 1 + random() * 3, i % 4 ? layout.light + '82' : '#c8b78060');
    }
    const { cottage: house } = layout.points;
    drawRoad(pathPoints(layout), layout, 59);
    drawRoad(forestDetour(layout), layout, id === 'perrault' ? 32 : 20);
    for (let i = 0; i < 350; i++) {
      const x = random() * width;
      const y = random() * height;
      rect(x, y, 2 + random() * 4, 2, '#473b2e2f');
    }

    const trees = [];
    for (let i = 0; i < 230; i++) {
      const x = random() * width;
      const y = 50 + random() * (height - 29);
      const clearing = (x > 200 && x < 920 && y > 209 && y < 466) ||
        (x < 200 && y > 318 && y < 479);
      if (!clearing) trees.push({ x, y, size: 0.60 + random() * 0.91 });
    }
    trees.sort((a, b) => a.y - b.y);
    for (const { x, y, size } of trees) tree(x, y, size, layout.leaf, id === 'grimm' && x > 670);

    if (id === 'perrault') {
      mill();
      for (let i = 0; i < 9; i++) oval(567 + i * 11, 446 + i % 3 * 9, 4, 3, '#927052');
    }
    if (id === 'grimm') {
      for (let i = 0; i < 3; i++) tree(house.x - 65 + i * 65, 184 - i % 2 * 19, 1.27, layout.leaf, true);
      for (let i = 0; i < 11; i++) oval(243 + i * 15, 302 - i * 2, 14, 11, i % 2 ? '#62764b' : '#435d3c');
    }
    for (let i = 0; i < 43; i++) {
      const x = layout.turn[0] - 75 + random() * 154;
      const y = layout.turn[1] - 25 + random() * 76;
      flowers(x, y, ['#e0aa9f', '#d5bcb1', '#f1d181'][i % 3]);
    }
  }

  function landscape(id, layout) {
    if (!landscapes.has(id)) {
      background(id, layout);
      const layer = document.createElement('canvas');
      layer.width = width;
      layer.height = height;
      layer.getContext('2d').drawImage(canvas, 0, 0);
      landscapes.set(id, layer);
    }
    ctx.drawImage(landscapes.get(id), 0, 0);
  }

  function drawEpilogue(x, y, time) {
    const slide = Math.min(1, Math.max(0, Math.sin(time / 680)));
    wolf(x + slide * 63, y - 89 + slide * 89);
    figure(x - 69, y + 22, '#777060');
    red(x - 39, y + 34, 0, false, false);
    oval(x + 70, y + 12, 27, 11, '#a1977e');
    oval(x + 70, y + 10, 21, 7, '#8c6b48');
  }

  function drawEnding(trail, x, y, time) {
    const scene = trail.ending.illustration;
    if (scene === 'dark') {
      oval(x, y - 27, 76, 75, '#17232366');
      return;
    }
    if (scene === 'visit') figure(x - 30, y + 16, '#81755d');
    if (scene === 'help' || scene === 'rescue') {
      figure(x - 58, y + 23, '#7f7150');
      lantern(x - 77, y + 28);
    }
    if (scene === 'rescue') {
      for (let i = 0; i < 5; i++) oval(x + 35 + i * 9, y + 25 - i % 2 * 7, 6, 4, '#8c8571');
    }
    if (scene === 'retreat' || scene === 'expose') wolf(x + 56, y + 8, '#736d64');
    red(x + (scene === 'visit' ? 28 : -20), y + 32, time, false, false);
  }

  return function draw({ chapterId, mode, trail, player, walking, time }) {
    const layout = forestLayouts[chapterId];
    const house = layout.points.cottage;
    landscape(chapterId, layout);

    if (trail.route) {
      const route = trail.route === 'wander' ? forestDetour(layout) : pathPoints(layout).slice(3, 5);
      line(route, '#f6d59756', 4);
    }
    const showingEnding = mode === 'result' || (mode === 'response' && trail.ending);
    const inside = showingEnding && ['visit', 'rescue', 'expose', 'retreat'].includes(trail.ending.illustration)
      ? 'grandmother' : trail.cottage;
    cottage(house.x, house.y, ['epilogue', 'end'].includes(mode) ? 'grandmother' : inside, trail.door);
    if (chapterId === 'remix') {
      lantern(675, 325);
      lantern(431, 371);
      if (trail.clue === 'neighbor') figure(687, 343, '#7e755a');
      if (trail.clue === 'tracks') footprints(...layout.turn, house.x + 24, house.y - 36);
    }
    if (chapterId === 'perrault') {
      for (let i = 0; i < 4; i++) {
        const x = 574 + i * 25 + Math.sin(time / 350 + i) * 8;
        const y = 397 + i % 2 * 28 + Math.sin(time / 220 + i) * 8;
        oval(x, y, 3, 2, '#edb77f');
        oval(x + 4, y - 1, 3, 2, '#f4d497');
      }
    }
    const wolfPositions = {
      waiting: [layout.points.wolf.x + 15, layout.points.wolf.y - 14],
      shortcut: [646, 298], searching: [365, 239], hedge: [house.x - 122, house.y - 22],
      trailing: [417, 282], late: [463, 241]
    };
    const wolfPoint = trail.cottage === 'wolf' && trail.route ? undefined : wolfPositions[trail.wolf];
    if (mode === 'epilogue') drawEpilogue(house.x, house.y, time);
    else if (showingEnding) drawEnding(trail, house.x, house.y, time);
    else {
      if (wolfPoint && mode !== 'end') wolf(...wolfPoint);
      if (mode !== 'end' && trail.cottage === 'wolf' && trail.route) {
        rect(house.x + 25, house.y - 57, 3, 2, '#edba73');
        rect(house.x + 32, house.y - 57, 3, 2, '#edba73');
      }
      red(mode === 'end' ? 104 : player.x, mode === 'end' ? 410 : player.y, time, walking,
        chapterId === 'grimm' && trail.route === 'wander');
    }

    const shade = ctx.createRadialGradient(width * 0.54, height * 0.55, 110, width * 0.54, height * 0.55, 570);
    shade.addColorStop(0, '#11241c00');
    shade.addColorStop(1, '#0b211b80');
    rect(0, 0, width, height, shade);
    for (let i = 0; i < 21; i++) {
      const x = (i * 97 + time / 95) % width;
      const y = 89 + i * 71 % 420 + Math.sin(time / 720 + i) * 6;
      rect(x, y, i % 3 ? 2 : 3, 2, '#f2d39d7a');
    }
  };
}
