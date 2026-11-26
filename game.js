/* THE GOOD CHILD — dependency-free browser-game proof of concept.
   All actual source facts are labeled separately from interactive 'what if' paths. */
(() => {
  'use strict';
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('sceneOverlay');
  const interactPrompt = document.getElementById('interactPrompt');
  const researchDialog = document.getElementById('researchDialog');
  const chapterLabel = document.getElementById('chapterLabel');
  const chapterFooter = document.getElementById('chapterFooter');
  const hudHint = document.getElementById('hudHint');
  const dots = Array.from(document.querySelectorAll('#progressDots span'));
  const W=960,H=520;
  const scenes = [
    {
      year:'1697', name:'Perrault', title:'The Stranger', subtitle:'A warning about trust', color:'#b98f61',
      intro:'Your mother gives you cakes and a little pot of butter to take to Grandmother. No one has forbidden you from leaving the path. But the forest holds a courteous stranger.',
      facts:['Perrault’s Red carries cakes and a pot of butter. Her mother does not give a “stay on the path” command.','The wolf takes the shorter route while Red gathers nuts, chases butterflies, and picks flowers.','No rescuer arrives. A final written moral warns that gentle, charming wolves can be especially dangerous.'],
      source:'Perrault, “Little Red Riding Hood” (1697), trans. Maria Tatar, pp. 11–13.',
      steps:[
        {target:'wolf', speaker:'THE WOLF', question:'“Where does your grandmother live, little one?” He sounds perfectly polite.', choices:[['Tell him where Grandmother lives','share'],['Keep the address to yourself','private']]},
        {target:'flowers', speaker:'THE FOREST', question:'The wolf points toward another road. Nuts, butterflies, and flowers fill the longer walk.', choices:[['Stop to explore the longer way','wander'],['Continue directly to the cottage','direct']]},
        {target:'house', speaker:'AT THE DOOR', question:'A deep voice tells you to lift the latch. The room looks strange.', choices:[['Go inside and trust the voice','trust'],['Ask a question and look for help','question']]},
      ],
      feedback(c){const vulnerable=c.includes('share')||c.includes('trust');return vulnerable?
        'The wolf gains your trust. In this imagined playthrough, his polite words become the danger. A friendly manner was not evidence of safety.':
        'You withheld information or questioned the voice. This is a player-created escape, not Perrault’s ending: the original does not give Red this second chance.'},
      judgement:'“Good” is framed as cautious and wary of deceptive strangers—not merely someone who obeys a rule about a path.',
      sourceEnding:'In Perrault’s actual story, Red tells the wolf her destination, takes the longer route, and is eaten. There is no rescue.'
    },
    {
      year:'1857', name:'Brothers Grimm', title:'The Lesson', subtitle:'A rule, a rescue, and a second chance', color:'#8b9e71',
      intro:'Your mother gives you cake and wine. This time, she is very clear: keep to the path, mind your manners, and say good morning at Grandmother’s house.',
      facts:['The Grimm mother explicitly forbids leaving the path and asks Red to say “Good morning.”','A wolf lures Red with birdsong and flowers; a huntsman rescues her and Grandmother using scissors.','In a second wolf encounter, Red and Grandmother work together to defeat the animal with sausage water and a trough.'],
      source:'Grimm, “Rotkäppchen” (1857), trans. D. L. Ashliman, pp. 140–44.',
      steps:[
        {target:'wolf',speaker:'THE WOLF',question:'He asks where Grandmother lives—under three great oaks, behind a hazel hedge.',choices:[['Tell the friendly wolf the directions','share'],['Keep walking without giving directions','private']]},
        {target:'flowers',speaker:'THE FLOWERS',question:'He praises the birdsong and flowers. Your mother said not to leave the path.',choices:[['Pick flowers for Grandmother','wander'],['Stay on the path as instructed','direct']]},
        {target:'house',speaker:'AT THE DOOR',question:'You hear a strange voice. Your mother also told you to say good morning.',choices:[['Say good morning and enter','trust'],['Pause, greet her, and check the voice','question']]},
      ],
      feedback(c){return c.includes('wander')?
        'You left the path after being told not to. In the Grimms’ story, Red is rescued and learns from that mistake; the second wolf meets a wiser Red.':
        'You kept to your mother’s instruction. This alternate safe route lets you ask whether obedience alone—or learning from experience—is the real ideal.'},
      judgement:'“Good” increasingly means obedient and teachable. Crucially, Red’s second encounter shows that learning—not permanent punishment—is possible.',
      sourceEnding:'In the actual Grimms’ story a huntsman frees Red and Grandmother. Later, Red and Grandmother outwit a different wolf together.'
    },
    {
      year:'1940 → 1982', name:'Modern parodies', title:'A Different Red', subtitle:'Who gets to be the hero?', color:'#c08a79',
      intro:'This third chapter is a new interpretation inspired by James Thurber and Roald Dahl, not a direct scene from either story. Here, being “good” might mean asking the right question.',
      facts:['Thurber (1940) and Dahl (1982) both reverse Red’s expected helplessness and have her defeat the wolf.','These modern comic retellings do not simply measure Red by whether she follows a mother’s instruction.','The choices and nonviolent ending shown here are original gameplay interpretations, not events copied from those texts.'],
      source:'Thurber, “The Little Girl and the Wolf” (1940); Dahl, “Little Red Riding Hood and the Wolf” (1982).',
      steps:[
        {target:'wolf',speaker:'THE STRANGER',question:'He asks where you’re headed and smiles as though he already knows.',choices:[['Answer politely to avoid seeming rude','share'],['Question why he needs to know','private']]},
        {target:'flowers',speaker:'THE FOREST',question:'The wildflowers and familiar trail are both open to you. No rule says curiosity is wrong.',choices:[['Explore carefully, keeping watch','wander'],['Stay on the direct road','direct']]},
        {target:'house',speaker:'AT THE DOOR',question:'The voice inside sounds wrong. You spot unusually large ears beneath the cap.',choices:[['Ignore your doubts and go in','trust'],['Expose the disguise and step away','question']]},
      ],
      feedback(c){return c.includes('question')?
        'You noticed the disguise and chose to act. Our original ending gives Red the chance to save herself without violence.':
        'You were polite, but gave the stranger the benefit of the doubt. This invented ending asks whether politeness should count as “good” when danger is nearby.'},
      judgement:'“Good” may now mean perceptive, skeptical, and self-directed. This chapter challenges the idea that obedience must define virtue.',
      sourceEnding:'Thurber’s and Dahl’s original parodies both make Red much more dangerous to the wolf. Our peaceful ending is intentionally different.'
    }
  ];

  let mode='start', chapter=0, step=0, selections=[], histories=[], tick=0;
  let player={x:160,y:350}, keys=new Set(), touchDirs=new Set();
  const targets={wolf:{x:341,y:335},flowers:{x:580,y:215},house:{x:802,y:322}};
  const scenery=Array.from({length:53},(_,i)=>{const v=(i*151+37)%977;return {x:(v*13+i*59)%960,y:18+((i*113+42)%470),size:15+((i*23)%29),seed:i}}).filter(t=>!(t.y>250&&t.y<410&&t.x>45&&t.x<905));

  function chapterUI(){chapterLabel.textContent=`CHAPTER ${chapter+1} / 3 — ${scenes[chapter].year} · ${scenes[chapter].name.toUpperCase()}`;chapterFooter.textContent=scenes[chapter].subtitle.toUpperCase();hudHint.textContent=`SCENE ${Math.min(step+1,3)} / 3`;dots.forEach((d,i)=>d.className=i<chapter?'done':i===chapter?'active':'');}
  function windowHTML(markup){overlay.innerHTML=`<div class="shade"></div><article class="window">${markup}</article>`;document.querySelectorAll('.overlay button[data-action]').forEach(btn=>btn.addEventListener('click',()=>handleAction(btn.dataset.action,btn.dataset.value)));}
  function hideWindow(){overlay.innerHTML='';}
  function screenStart(){mode='start';chapterLabel.textContent='A story told three ways';chapterFooter.textContent='A GOOD CHILD DOES WHAT?';hudHint.textContent='5–8 MIN · 3 TELLINGS';dots.forEach(d=>d.className='');windowHTML(`<div class="eyebrow">A LITTLE RED RIDING HOOD STUDY</div><h1>The Good Child<span style="color:#aa5549">.</span></h1><p class="lead">The story is familiar. The rules aren't.<br>Walk through <b>three tellings</b> of Little Red Riding Hood, make choices, and see how each era decides what a “good” child should do.</p><div class="rule"></div><div class="stack"><div class="stack-card"><b>1697 · PERRAULT</b><span>Should a child trust polite strangers?</span></div><div class="stack-card"><b>1857 · GRIMM</b><span>What happens when a child breaks a rule?</span></div><div class="stack-card"><b>MODERN · REMIX</b><span>Can independence be a virtue?</span></div></div><div class="action-row"><button data-action="start" class="action-button">ENTER THE FOREST →</button></div><p class="note">~5–8 minutes · WASD / arrow keys to move · E / Space to interact · click a glowing destination to travel there</p>`);}
  function screenIntro(){mode='intro';chapterUI();player.x=135;player.y=346;step=0;selections=[];const s=scenes[chapter];windowHTML(`<div class="eyebrow">TELLING ${chapter+1} OF 3 · ${s.year}</div><h2>${s.title}</h2><p class="lead">${s.intro}</p><div class="rule"></div><p><b>THIS CHAPTER ASKS:</b> ${chapter===0?'Is a child “bad” for trusting someone who sounds kind?':chapter===1?'Does a mistake make a child bad—or give her a chance to learn?':'Can acting on your own make you a good child?'}</p><div class="action-row"><button data-action="play" class="action-button">BEGIN CHAPTER →</button></div><p class="note">The written stories and your alternative choices are clearly separated at the end.</p>`);}
  function screenQuestion(){mode='question';const s=scenes[chapter],q=s.steps[step];windowHTML(`<div class="eyebrow">${s.year} · DECISION ${step+1} / 3</div><h2>${q.speaker}</h2><p class="lead">${q.question}</p><div class="choice-list">${q.choices.map((c,i)=>`<button class="choice-btn" data-action="choice" data-value="${i}"><span>0${i+1}</span>${c[0]}</button>`).join('')}</div><p class="note">There is no universal “correct” choice. The storyteller decides how to judge you.</p>`);}
  function screenResult(){mode='result';const s=scenes[chapter];const chips=selections.map((v,i)=>{const choice=s.steps[i].choices.find(x=>x[1]===v);return `<span>${['WOLF','FOREST','COTTAGE'][i]}: ${choice?.[0]||v}</span>`}).join('');windowHTML(`<div class="eyebrow">${s.year} · WHAT MAKES A GOOD CHILD?</div><h2>${s.title} — The Verdict</h2><div class="choice-history">${chips}</div><div class="verdict"><b>YOUR “WHAT IF?” ENDING</b><p>${s.feedback(selections)}</p></div><div class="story-fact"><b>WHAT REALLY HAPPENS IN THE SOURCE</b><p>${s.sourceEnding}</p><p><b>${s.judgement}</b></p></div><p class="note">Research reference: ${s.source}</p><div class="action-row"><button data-action="advance" class="action-button">${chapter<2?'TURN THE PAGE →':'COMPARE ALL THREE →'}</button><button data-action="replay" class="action-button light">REPLAY CHAPTER</button></div>`);}
  function screenEnd(){mode='end';chapterLabel.textContent='THE COMPARISON';chapterFooter.textContent='THE SAME FOREST. DIFFERENT MORAL WORLDS.';hudHint.textContent='3 / 3 COMPLETE';dots.forEach(d=>d.className='done');windowHTML(`<div class="eyebrow">YOU'VE REACHED THE END</div><h2>Who gets called<br>a “good” child?</h2><p>Three storytellers. Three different answers.</p><div class="stack"><div class="stack-card"><b>1697 · PERRAULT</b><span>Above all: be wary of convincing strangers. No rescue, no second chance.</span></div><div class="stack-card"><b>1857 · GRIMM</b><span>Mind the rules—but learn after mistakes. Red gets another encounter.</span></div><div class="stack-card"><b>MODERN PARODIES</b><span>Recognize danger and act for yourself. The heroine gains agency.</span></div></div><div class="verdict"><b>THE GAME'S ARGUMENT</b><p>“Goodness” in Little Red Riding Hood isn't fixed. Perrault warns against trusting predatory strangers, the Grimms add explicit obedience and learning, and modern parodies celebrate a girl who acts for herself. The same choice takes on a different meaning depending on who tells the story.</p></div><div class="action-row"><button data-action="restart" class="action-button">PLAY AGAIN ↻</button><button data-action="research" class="action-button light">READ THE SOURCES ↗</button></div><p class="note">Designed as a creative comparison for German / Lit Trans 280. Interpretive outcomes are not direct quotations from the tales.</p>`);}
  function handleAction(action,value){if(action==='start'){chapter=0;histories=[];screenIntro();}else if(action==='play'){mode='explore';hideWindow();}else if(action==='choice'){const q=scenes[chapter].steps[step],choice=q.choices[Number(value)];if(!choice)return;selections.push(choice[1]);step++;hudHint.textContent=`SCENE ${Math.min(step+1,3)} / 3`;if(step===3){histories[chapter]=[...selections];screenResult();}else{mode='explore';hideWindow();}}else if(action==='advance'){if(chapter===2)screenEnd();else{chapter++;screenIntro();}}else if(action==='replay'){screenIntro();}else if(action==='restart'){screenStart();}else if(action==='research'){researchDialog.showModal();}}
  function targetNow(){return scenes[chapter].steps[step]?.target;}
  function actionAvailable(){if(mode!=='explore')return false;const t=targets[targetNow()];return t&&Math.hypot(player.x-t.x,player.y-t.y)<74;}
  function interact(){if(actionAvailable())screenQuestion();}
  function colorRect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(x,y,w,h)}
  function ellipse(x,y,rx,ry,col){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=col;ctx.fill()}
  function line(x1,y1,x2,y2,w,col){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
  function drawTree(t){const {x,y,size,seed}=t;ellipse(x,y+size*.6,size*.65,size*.26,'#101d18a3');colorRect(x-size*.08,y-1,size*.16,size*.9,'#374032');ellipse(x,y-size*.45,size*.65,size*.72,'#203e30');ellipse(x-size*.25,y-size*.48,size*.46,size*.55,'#31543c');ellipse(x+size*.17,y-size*.77,size*.54,size*.49,'#426548');ellipse(x-size*.14,y-size*.8,size*.24,size*.25,'#63825c');if(seed%4===0)ellipse(x+size*.37,y-size*.3,2,2,'#a6a578');}
  function drawFlower(x,y,scale=1){line(x,y,x,y-9*scale,2,'#496c42');const petals=['#c68d71','#efc49a','#dbb8ae','#eee4b7'];for(let a=0;a<5;a++){const ang=a*Math.PI*2/5;ellipse(x+Math.sin(ang)*4*scale,y-10*scale+Math.cos(ang)*4*scale,3*scale,3*scale,petals[(a+Math.floor(x))%4])}ellipse(x,y-10*scale,2*scale,2*scale,'#d4a846');}
  function drawWolf(x,y){const bop=Math.sin(tick*.002)*2;ellipse(x,y+12,26,8,'#1018137d');ctx.save();ctx.translate(x,y+bop);ellipse(0,-9,22,22,'#414944');ctx.fillStyle='#3b443e';ctx.beginPath();ctx.moveTo(-17,-21);ctx.lineTo(-21,-45);ctx.lineTo(-7,-28);ctx.lineTo(4,-27);ctx.lineTo(14,-46);ctx.lineTo(18,-19);ctx.closePath();ctx.fill();ellipse(-7,-12,3,3,'#e5c489');ellipse(9,-12,3,3,'#e5c489');ellipse(1,-3,6,4,'#2b2829');line(1,-1,1,1,2,'#181b19');ctx.restore();}
  function drawHouse(x,y){ellipse(x,y+65,85,20,'#10191691');colorRect(x-64,y-23,130,85,'#c4a783');colorRect(x-53,y-15,108,75,'#d9bd8f');ctx.beginPath();ctx.moveTo(x-79,y-24);ctx.lineTo(x,y-86);ctx.lineTo(x+84,y-23);ctx.closePath();ctx.fillStyle='#773f36';ctx.fill();line(x-79,y-23,x,y-85,5,'#9a6551');line(x,y-85,x+84,y-23,5,'#9a6551');colorRect(x-16,y+6,34,55,'#584638');colorRect(x-49,y-2,22,24,'#b2ab79');colorRect(x+30,y-2,22,24,'#b2ab79');line(x-38,y-2,x-38,y+22,2,'#746b49');line(x+40,y-2,x+40,y+22,2,'#746b49');ellipse(x+10,y+34,2.5,2.5,'#c9aa67');for(let n=0;n<9;n++)ellipse(x-77+n*19,y+58,13,7,n%2?'#32553b':'#3c6141');}
  function drawPlayer(){const x=player.x,y=player.y;ellipse(x,y+19,15,5,'#0b140f93');const sway=Math.sin(tick*.011)*1.8;line(x-5,y+6,x-8,y+19,5,'#422f2e');line(x+6,y+6,x+8,y+19,5,'#422f2e');ctx.fillStyle='#9a3235';ctx.beginPath();ctx.moveTo(x,y-24);ctx.lineTo(x-15,y+11+sway);ctx.lineTo(x+15,y+11-sway);ctx.closePath();ctx.fill();ellipse(x,y-24,14,16,'#b74344');ellipse(x,y-24,7,10,'#d9b99a');colorRect(x+14,y-2,12,8,'#d6b173');line(x+15,y+5,x+24,y+5,3,'#71543b');ellipse(x-2,y-24,2,2,'#4f3536');ellipse(x+4,y-24,2,2,'#4f3536');}
  function drawTargetMarker(t){const bob=Math.sin(tick*.004)*5;ellipse(t.x,t.y-58+bob,17,17,'#e3cb81');ellipse(t.x,t.y-58+bob,11,11,'#835248');ctx.font='bold 19px Georgia';ctx.textAlign='center';ctx.fillStyle='#fff4d6';ctx.fillText('!',t.x,t.y-51+bob);line(t.x,t.y-40+bob,t.x,t.y-18,2,'#dfc58b80');}
  function drawMap(){ctx.fillStyle=chapter===0?'#354b38':chapter===1?'#314736':'#385047';ctx.fillRect(0,0,W,H);for(let i=0;i<40;i++){let x=(i*211+56)%W,y=(i*89+29)%H;ellipse(x,y,20+(i%4)*11,6+(i%3)*4,i%3===0?'#465f4052':'#223a3049');}
   // A walkable S-shaped forest trail. Trees are decoration; movement is intentionally forgiving.
   ctx.strokeStyle='#6c634a';ctx.lineWidth=100;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(60,370);ctx.bezierCurveTo(160,315,285,340,365,353);ctx.bezierCurveTo(520,395,660,320,895,345);ctx.stroke();ctx.strokeStyle='#947d5b';ctx.lineWidth=74;ctx.stroke();ctx.strokeStyle='#b09a71';ctx.lineWidth=1;ctx.setLineDash([3,17]);ctx.stroke();ctx.setLineDash([]);
   scenery.forEach(drawTree);
   for(let i=0;i<18;i++){const x=440+(i*53)%275,y=153+(i*31)%119;drawFlower(x,y,.75+(i%3)*.25)}
   drawHouse(808,267);drawWolf(341,311);
   // Later chapters remain visually distinct without changing the controls.
   if(chapter===1){ellipse(820,203,25,18,'#263c31');for(let i=0;i<3;i++)line(796+i*16,208,793+i*16,224,4,'#755d45');}
   const target=targets[targetNow()];if(mode==='explore'&&target)drawTargetMarker(target);
   drawPlayer();
   // Vignette
   const grad=ctx.createRadialGradient(W/2,H/2,120,W/2,H/2,610);grad.addColorStop(0,'#0d1b1600');grad.addColorStop(1,'#0a120d8c');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
   // Dust motes
   for(let i=0;i<21;i++){let x=(i*73+tick*(i%2?0.012:-.01)+2000)%W,y=50+(i*83%400)+Math.sin(tick*.001+i)*7;ellipse(x,y,1.4,1.4,'#d0ce9488');}
  }
  let last=0;
  function frame(now){const dt=Math.min((now-last)/1000||0,.045);last=now;tick=now;
    if(mode==='explore'){let dx=0,dy=0;const has=k=>keys.has(k)||touchDirs.has(k);if(has('arrowleft')||has('a')||has('left'))dx--;if(has('arrowright')||has('d')||has('right'))dx++;if(has('arrowup')||has('w')||has('up'))dy--;if(has('arrowdown')||has('s')||has('down'))dy++;if(dx||dy){const inv=1/Math.hypot(dx,dy);player.x=Math.max(32,Math.min(W-32,player.x+dx*inv*225*dt));player.y=Math.max(95,Math.min(H-34,player.y+dy*inv*225*dt));}
      const t=targets[targetNow()];const prompt=actionAvailable();interactPrompt.classList.toggle('hidden',!prompt);if(prompt){const txt={wolf:'TALK TO THE WOLF',flowers:'EXPLORE THE FLOWERS',house:'KNOCK AT THE COTTAGE'}[targetNow()];interactPrompt.innerHTML=`PRESS <kbd>E</kbd> · ${txt}`;}else if(t){interactPrompt.classList.add('hidden');}
    }else{interactPrompt.classList.add('hidden');}
    drawMap();requestAnimationFrame(frame);
  }
  document.addEventListener('keydown',(e)=>{if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();const k=e.key.toLowerCase();keys.add(k);if(researchDialog.open)return;if(mode==='explore'&&['e',' ','enter'].includes(k))interact();if(mode==='question'&&['1','2'].includes(k)){const b=overlay.querySelectorAll('[data-action="choice"]')[Number(k)-1];b?.click();}});
  document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();touchDirs.clear();});
  canvas.addEventListener('click',e=>{if(mode!=='explore')return;const box=canvas.getBoundingClientRect();const x=(e.clientX-box.left)/box.width*W,y=(e.clientY-box.top)/box.height*H;const t=targets[targetNow()];if(Math.hypot(x-t.x,y-t.y)<110){player.x=t.x;player.y=t.y+40;interact();}});
  document.getElementById('researchBtn').addEventListener('click',()=>researchDialog.showModal());document.getElementById('closeResearch').addEventListener('click',()=>researchDialog.close());researchDialog.addEventListener('click',e=>{if(e.target===researchDialog)researchDialog.close()});
  document.querySelectorAll('[data-dir]').forEach(b=>{const dir=b.dataset.dir;b.addEventListener('pointerdown',e=>{e.preventDefault();touchDirs.add(dir);b.setPointerCapture(e.pointerId);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>touchDirs.delete(dir));});document.getElementById('touchAction').addEventListener('click',interact);
  screenStart();requestAnimationFrame(frame);
})();
