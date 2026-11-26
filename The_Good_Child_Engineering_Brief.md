# THE GOOD CHILD — Engineering Handoff / Build Specification

## 1. What this project is

**The Good Child** is a short, single-player, 2D browser game for a university course on German fairy tales (German / Lit Trans 280). It is an **interactive literary argument**, not merely a retelling of *Little Red Riding Hood*.

The research question is **exactly**:

> How do different versions of Little Red Riding Hood use obedience and disobedience to define what makes a child "good"?

The game must let a player experience how rules, consequences, and expectations change across versions of the same tale. The central idea is that "goodness" is not a universal game score: each storyteller judges the girl's behavior differently. The player explores, makes choices, and compares the narrative's judgment with the published source text.

**Audience:** classmates and instructor with no game-development experience. **Context:** asynchronous class presentation: people click a public URL and play independently, without any instructions from the developer. **Target session:** 5–8 minutes; hard ceiling about 10 minutes. **Deadline:** public game and accompanying course deliverables ready for upload by December 3, 2026, 4 p.m. local time.

## 2. What already exists

A functional proof of concept is available as `The_Good_Child_Source.zip` (separate files: `index.html`, `style.css`, `game.js`) or `The_Good_Child_Playable_MVP.html` (one-file runnable build). Review that code before replacing it. It currently has a top-down canvas forest, a Red character, three chapters, three decisions per chapter, dialogue overlays, keyboard/touch controls, a research-notes dialog, short choice-dependent feedback, and a comparison ending. **It is a starting point, not a finished product.**

The biggest shortcomings are that the forest layout is nearly identical in all three chapters, decisions change feedback more than visible events, and the path between choices can feel like walking from one fixed interaction marker to another. Prioritize improving **consequences, historical details, and pacing**, not adding lots of mechanics.

If the prototype is unavailable, the specifications below are enough to implement the experience from scratch.

## 3. Research and historical accuracy — non-negotiable

The player should encounter three distinct narrative lenses:

**Chapter 1 — Charles Perrault (1697): “The Stranger.”** Red carries **cakes and a little pot of butter**. She talks to the wolf and reveals where her grandmother lives; the wolf chooses the shorter route while Red follows the longer route, gathering nuts, chasing butterflies, and picking flowers. The wolf eats grandmother and Red, and **there is no rescuer**. The ending moral warns against apparently gentle, charming predators. **Important: Perrault's mother does not explicitly instruct Red to stay on the path** in the assigned text. Do not invent such a command. Research interpretation: judgment centers on misplaced trust and vulnerability rather than simple violation of an explicit path rule.

**Chapter 2 — Jacob and Wilhelm Grimm (1857): “The Lesson.”** Red carries **cake and wine**. Her mother explicitly says to **stay on the path, mind her manners, and say good morning**. The wolf tempts her with **flowers and birdsong**; Red leaves the path. A huntsman cuts open the wolf with **scissors**, frees Red and grandmother, and Red helps fill the wolf with **stones**. The text includes **a later encounter with a second wolf**: Red warns her grandmother, they shut the door, and a trough filled with **sausage-cooking water** is used to lure the wolf off the roof. Research interpretation: explicit obedience matters, but learning and acting together after a mistake also matter. This second encounter is a particularly valuable, non-obvious detail to mention or briefly dramatize.

**Chapter 3 — Original modern reinterpretation informed by James Thurber (1940) and Roald Dahl (1982): “A Different Red.”** Both published parodies reverse Red's helplessness and have her defeat the wolf herself. Our game should use an **original, preferably nonviolent** version of that reversal in which Red identifies the disguise, asks questions, and can get herself to safety. Label the chapter **“Original modern remix inspired by Thurber and Dahl”**, not a faithful adaptation of either. Research interpretation: some later versions reward perceptiveness and agency rather than simply obedience. Do **not** claim all modern retellings think alike.

**Critical editorial rule:** always separate **“What happened in the published story”** from **“What happened because you chose differently.”** Alternative routes are hypothetical, not evidence that the original author wrote those endings. Do not say Red *deserved* harm; describe what the tale appears to teach and invite interpretation.

Primary source basis: Perrault, “Little Red Riding Hood,” trans. Maria Tatar, *The Classic Fairy Tales* (Norton, 1999), pp. 11–13; Grimm, “Rotkäppchen,” *Kinder- und Hausmärchen* (1857), vol. 1, pp. 140–44, trans. D. L. Ashliman; Thurber, “The Little Girl and the Wolf,” *Fables for Our Time* (1940), pp. 5–6; Dahl, “Little Red Riding Hood and the Wolf,” *Revolting Rhymes* (1982).

## 4. Player experience and game loop

1. **Title screen:** title, one-sentence premise, “Play (5–8 minutes),” controls, “Research notes.” No sign-in.
2. **Chapter intro (15–20 seconds):** show author/year, the rule or social expectation, and a quick scene-setting detail.
3. **Forest scene:** move a small red-cloaked character in a legible 2D, top-down environment. Approach three visually marked interactions in a directed order: **wolf -> forest temptation -> grandmother's cottage**.
4. **Decision dialogue:** at each encounter choose between two clear actions. Keyboard, mouse, and touch must all work. Choices must be reflected in an immediate change: dialogue, animation, object state, NPC behavior, sound cue, or the subsequent scene, not only in a final summary.
5. **Chapter result:** show the player's own alternate ending and the **actual source ending** in distinct panels; give one concise interpretation of what “good” meant in that telling. Include author/year citation.
6. **Next chapter:** reset into the next narrator's world, but keep enough visual continuity to make the differences obvious.
7. **Final comparison:** juxtapose three historical interpretations, summarize the player's choices in a compact way, and state the game's argument. Include replay and research bibliography links.

The same three interaction *types* recur across chapters so players notice changed expectations, but dialogue, environment, props, and consequences must be source-specific. Avoid unnecessary random encounters, long cutscenes, quests, or leveling.

## 5. Nine core decisions (minimum content)

| Encounter | Perrault 1697 | Grimm 1857 | Modern remix |
|---|---|---|---|
| Wolf | Reveal grandmother's location / keep it private | Respond with directions / keep walking | Answer politely / question his motive |
| Temptation | Take the longer route and explore / go straight there | Pick flowers off-path / obey mother's stay-on-path command | Explore cautiously / stick to familiar trail |
| Cottage | Believe the strange voice / investigate and seek help | Enter after saying good morning / pause and check | Trust the disguise / expose the disguise and retreat |

Each decision updates descriptive state such as `revealedLocation`, `leftPath`, `noticedDanger`, `actedIndependently`, and the current `chapterChoices`. **No universal obedience meter and no binary good/bad rating.** Generate **2–3 coherent outcomes per chapter** from combinations of choices; be explicit which ones are speculative. A choice must matter, but do not attempt 2^9 fully unique storylines. An optional 30–45-second Grimm second-wolf vignette can emphasize the often-overlooked epilogue if it does not exceed the time budget.

## 6. What the game needs to communicate

**Working thesis:** *Different tellings of Little Red Riding Hood define a “good” child differently: Perrault emphasizes the dangers of trusting deceptive strangers; the Grimms emphasize explicit rules while allowing Red to learn from mistakes; and selected later parodies give Red more agency. Making these judgments interactive lets players experience how the same behavior can mean something different depending on who tells the tale.*

The player should leave understanding **one distinction** between Perrault and Grimm (the explicit path command), **one non-obvious Grimm detail** (the second wolf / grandmother's involvement), and **one difference in later reinterpretations** (Red acts rather than merely awaits rescue). Academic content must be part of the experience, not an unrelated text dump at the end.

## 7. Presentation and aesthetics

Use a coherent, atmospheric, storybook / pixel-inspired aesthetic. The game should look like a polished miniature adventure, with dark forest greens, warmer parchment text panels, a distinctive red hood, readable high-contrast dialogue, and small visual changes across eras. **Prioritize clarity over art complexity.** A custom procedural canvas illustration is fine. Do not require premium fonts, paid sprites, audio licenses, or network-loaded assets.

Recommended screens: title, three chapter intros, forest gameplay, decision modal, chapter ending, final comparison, and research/credits panel. Keep scene transitions short. Show persistent chapter progress (e.g., 1 of 3). Interaction prompts should be immediately obvious. Make the entire story operable on desktop and mobile, with a visible touch control or a tap-to-interact mode. Include an obvious restart/replay control.

## 8. Technical plan

**Preferred stack:** HTML5 Canvas + vanilla JavaScript + CSS, no framework or backend. Static hosting via GitHub Pages or similar. Existing prototype is already built this way; extend it unless a rewrite is genuinely simpler. No authentication, database, paid APIs, online multiplayer, inventory, combat system, or account-specific persistence.

Organize content and behavior separately where practical. Suggested modules/concerns: `storyData` (chapters, choices, source facts, citations), `gameState` (chapter, scene, decisions), `renderer` (map, NPCs, indicators), `input` (keyboard, mouse, touch), `ui` (dialogue and transitions), and `endingResolver` (conditional endings with source-based/alternate labels). Data can remain JS objects; JSON is optional. Ensure no third-party network requests are required at runtime.

Do not write a complex movement engine: simple top-down movement and interactable hotspots are enough. Do not block the story behind precision collision, difficult navigation, or timing skill; this is a literary experience, not an action game. Smooth animations and a short ambient soundtrack are optional polish, not dependencies.

## 9. Acceptance criteria / definition of done

- A classmate can open a public HTTPS URL and finish without installing anything or receiving a live explanation.
- A complete run generally takes **5–8 minutes**; at most **10 minutes** for a normal reader.
- All **3 chapters**, **9 meaningful choices**, chapter results, final comparison, and replay function work.
- Every branch presents coherent consequences, and choice outcomes visibly differ (not only a hidden score).
- Historical details above are accurate, including the Perrault/Grimm difference about the path rule.
- Player-created branches are labeled as hypothetical; source endings are separately and correctly described.
- Research notes cite at least the four named primary works; the final artist's statement separately lists scholarly research.
- Keyboard and mouse work on desktop; touch works on a phone. Dialogue is readable and no chapter becomes unfinishable.
- Reloading and replaying do not create broken state; no console errors in a full playthrough.
- Static site is deployed and tested via its final link in a private/incognito session.

**Course deliverables beyond the game:** a 150–200-word artist's statement, a final thesis, and works cited including at least **three scholarly secondary sources**, alongside applicable primary sources. Previous research examined Zohar Shavit on childhood, Maria Tatar on fear/moral teaching, and Sandra L. Beckett on retellings. Verify final bibliographic details. The asynchronous presentation will be a Canvas link/post with explanatory context and comment replies, not a live demo.

## 10. Implementation order and exclusions

1. **Protect the existing playable flow.** Run the current prototype and identify reusable code.
2. **Strengthen consequences first.** Fix any decision that has no meaningful feedback; write coherent outcome logic.
3. **Add source-specific texture.** Perrault's butter and double road, Grimm's mother's exact rules and second wolf, modern remix's labeled invention.
4. **Polish navigation and presentation.** Better cues, short transitions, mobile layout, readable text, responsive controls.
5. **QA and ship.** Test all three chapters, ending variation, links, bibliography, and live deployment.

**Explicitly out of scope:** a combat game, large open forest, procedural level generation, inventory crafting, multiplayer, accounts, elaborate branching engine, full-length film-style cutscenes, or adding many more fairy tales. A concise, academically accurate, replayable 2D experience is the deliverable.

**Product principle:** *The best feature is not another level. It is a moment where a player realizes that the same choice is interpreted differently by different storytellers.*
