# The Good Child — playable MVP

A self-contained 2D browser game interpreting the question:

> How do different versions of Little Red Riding Hood use obedience and disobedience to define what makes a child "good"?

## Play

Open `index.html` in a current web browser. No server, npm install, internet connection, or paid assets are necessary (optional web fonts fall back to local fonts offline).

**Controls:** WASD / arrows to move, E or Space to interact, click the glowing destination to jump to it, or use mobile touch controls.

**Scope:** 3 chapters × 3 decisions, about 5–8 minutes. Perrault, Grimm, and a *clearly labeled original modern remix*. Each result explicitly distinguishes the documented source ending from player-created alternate branches. Source notes are accessible from the header.

## Files

- `index.html`: game page and source notes
- `style.css`: all visual styles
- `game.js`: game flow, map drawing, dialogue and outcomes

## Project thesis

Different versions of *Little Red Riding Hood* define a "good" child differently: Perrault warns against deceptive strangers, the Grimms emphasize obeying rules while allowing a second chance to learn, and later parodies give Red more autonomy. Interactive choices allow players to experience how different narrative assumptions shape judgments about the same actions.

## For your final assessment

1. Play the game fully on a laptop and on a phone.
2. Check that the 3 source panels and end screens are accurate to your course research.
3. Publish the static files to GitHub Pages or Netlify and submit the **public URL**, your artist's statement (150–200 words), thesis, and works cited.
4. Include **at least three scholarly secondary sources** in your final artist's statement bibliography; the in-game note currently shows primary works for story accuracy only.
5. Optional stretch: replace the original modern remix with one tightly documented nonviolent version (e.g. one of the other published retellings) if you want all three chapters to map to precise primary-source events.

## Sources (primary tales)

- Charles Perrault, "Little Red Riding Hood," trans. Maria Tatar, *The Classic Fairy Tales*, W. W. Norton, 1999, pp. 11–13 (original 1697).
- Jacob and Wilhelm Grimm, "Rotkäppchen," *Kinder- und Hausmärchen*, vol. 1, 1857, pp. 140–44; trans. D. L. Ashliman, https://sites.pitt.edu/~dash/grimm026.html.
- James Thurber, "The Little Girl and the Wolf," *Fables for Our Time and Famous Poems Illustrated*, Harper & Brothers, 1940, pp. 5–6.
- Roald Dahl, "Little Red Riding Hood and the Wolf," *Revolting Rhymes*, Jonathan Cape, 1982.

## What is intentionally not in the MVP

No account system, no inventory, no combats, no external sprites, no backend, no save files. The educational difference between sources is the core mechanic.
