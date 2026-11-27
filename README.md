# The Good Child

A short, interactive comparison of *Little Red Riding Hood* for German / Lit Trans 280.

> How do different versions of Little Red Riding Hood use obedience and disobedience to define what makes a child "good"?

Play through Perrault (1697), the Grimms (1857), and an original modern remix inspired by Thurber and Dahl. Each chapter asks you to respond to a stranger, choose a route, and decide what to do at Grandmother’s door. The endings compare your route with the published story.

## Play locally

Open [index.html](index.html) in a modern browser. The game runs directly from the file with no install or network access. A complete playthrough is designed for 5–8 minutes.

Use WASD or arrow keys to move and E or Space beside an encounter to interact. You can also click or tap the glowing marker. Choices work with the on-screen buttons or keys 1 and 2.

The [research page](research.html) includes the thesis, artist’s statement, and works cited.

## Development

- `story.js` contains the chapter text, choice responses, and ending rules.
- `game.js` handles player input, chapter flow, and the comparison.
- `forest.js` draws the maps, characters, and visual consequences in Canvas.
- `tests/story.test.js` checks all 24 chapter routes and the differences between the adaptations.

Run the unit tests with Node.js.

```sh
node --test tests/story.test.js
```

To preview the same static entry point served over HTTP, run `python3 -m http.server 8000` in this folder and open [localhost:8000](http://localhost:8000/).
