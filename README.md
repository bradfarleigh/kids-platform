# kids-platform

A small web platform for kids' spelling and reading games.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
ADMIN_PASSWORD=choose-something npm start
```

3. Open http://localhost:3000

`ADMIN_PASSWORD` is required for the admin page and video API. Without it,
admin endpoints stay disabled (the games work fine either way).

## Games

Phonics and reading:

- **Spelling** - staged spelling from letters to spelling-bee words, incl. the
  "R Sounds" stage (or / ar / ir / er / ur).
- **Word Gap** - find the missing grapheme; includes an R Sounds level.
- **Word Chain** - UFLI-style word chains: change one grapheme at a time
  (shin -> ship -> shop -> shot, corn -> born -> barn -> bark -> shark -> sharp).
- **Heart Words** - flash cards for tricky irregular words (said, was, they...),
  with the tricky part highlighted. Known words are remembered per player.
- **Story Time** - controlled-r sentences to read aloud, each with a retell
  question (fluency + retell practice).
- **Alien Words** - real word or nonsense word; includes an R Sounds level.
- **Word Sort** - sort spelling patterns; includes "ar or" and an easier
  er / ir / ur set.
- **Word Factory** - prefixes and suffixes.
- **Tracing** - letter and number tracing.

Just for fun: Colouring, Blocks, Block Blasters, Jazz Ball, Uno, Memory.

## Players and progress

The home screen supports multiple player profiles (name + age), stored on the
device in localStorage. Game cards are filtered to the active player's age and
show their best stars. Results are recorded per profile.

## Weekly focus

`public/settings.json` accepts a `weeklyFocus` array of graphemes, e.g.:

```json
{
  "audioEnabled": true,
  "videosEnabled": true,
  "disabledGames": [],
  "weeklyFocus": ["or", "ar", "ir", "er", "ur"]
}
```

Spelling and Word Gap then prefer words containing those graphemes, and the
games screen shows a "This week" chip. Update it as school focus changes.

## Development

- See `server.js` and the `public/` directory for the web app.
- Data files live in the `data/` directory.
- Word/curriculum data lives in `public/games/_lib/words-au.js`.
- Tests are in `test/`; run them with `npm test`.

## Contributing

Please open issues or pull requests if you want to suggest improvements.

## License

MIT
