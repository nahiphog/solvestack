# Solver Sanctuary

Solver Sanctuary is a collection of free tools for solving word games and logic puzzles. Enter words, guess feedback, or a puzzle grid to find possible answers, shortest word ladders, or completed boards. The project began as a four-letter word ladder solver and now includes 32 selectable puzzle modes.

**Live app:** [Solver Sanctuary](https://solversanctuary.com/) · [Lovable-hosted app](https://solvestack.lovable.app)

## Supported puzzles

The interface groups solvers into four categories:

| Category | Puzzles |
| --- | --- |
| Wordle | Original Wordle, Double Dabble, Flipping Letters, Jeff Goldblumle, Lies (Fibble), Reconstruction, Shuntle, Splitle, Worwordle, Wrdl |
| Word ladder | Original ladders with 4, 5, or 6 letters, Craft Words, Play Pivots, Weaver X, Word Splice |
| Math and logic | 15 Puzzle, Blunderwall, Dodeku, Rotato, Sheetdoku, Star Battle, Sudoku (original), Sudoku (variation), Sumplete, Tango |
| Other word puzzles | Mastermind, Spelling Bee, Threepeat, Word Peaks, Wordiply |

Sudoku variations include anti-king, anti-knight, diagonal, disjoint groups, irregular regions, non-consecutive (beta), Windoku, and anti-queen rules. Marbless also has an implementation in the source, but is currently hidden from navigation.

## Features

- Find all shortest word-ladder paths using bundled neighbor graphs, with optional excluded words.
- Narrow word-game candidates using previous guesses and their feedback.
- Enter grids and constraints for logic-puzzle solvers.
- Sort supported word results by frequency or alphabetically and browse paginated results.
- Copy results, including board images for supported puzzles.
- Switch between light and dark themes.
- Read the FAQ and changelog, or send feedback through the About page.

Solving runs primarily in the browser using local dictionaries, graph search, candidate filtering, and constraint-based search. Some word lists and the changelog are fetched over the network. Feedback is submitted through a server function.

## Tech stack

- **UI:** React 19, TypeScript, Tailwind CSS 4, Radix UI, and Lucide icons.
- **Application framework:** TanStack Start and TanStack Router, with TanStack Query available through the root provider.
- **Build tooling:** Vite 7 and the Lovable TanStack configuration package, which integrates Nitro for server builds.
- **Validation:** Zod, including server-side feedback validation.
- **Code quality:** ESLint and Prettier.
- **Data:** JSON dictionaries, word-frequency data, and precomputed neighbor graphs in `src/data/` and `public/`.

The core solvers do not require a database or API credentials.

## Local setup

Install Git and Node.js 22.12 or newer. Use Bun to install from the committed `bun.lock`, or use npm, which is included with Node.js.

```sh
git clone https://github.com/nahiphog/solvestack.git
cd solvestack
```

With Bun:

```sh
bun install --frozen-lockfile
bun run dev
```

Or with npm:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The repository tracks a Bun lockfile; npm resolves dependencies independently and creates a `package-lock.json`.

### Optional feedback configuration

The About page sends feedback to a Discord webhook. To enable it, set `DISCORD_FEEDBACK_WEBHOOK_URL` in the server environment before starting the app. For example, in PowerShell:

```powershell
$env:DISCORD_FEEDBACK_WEBHOOK_URL = "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"
npm run dev
```

Keep the webhook URL private and server-side; do not give it a `VITE_` prefix or commit it. Without this variable, the solvers still work, but feedback submission returns “Feedback channel not configured.”

### Available commands

Use `npm run <script>` or `bun run <script>`:

| Script | Purpose |
| --- | --- |
| `dev` | Start the local development server |
| `build` | Create a production build |
| `build:dev` | Build using development mode |
| `preview` | Preview a build locally |
| `lint` | Run ESLint |
| `format` | Format the repository with Prettier |

There is currently no automated test suite or `test` script.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/routes/index.tsx` | Main solver interface, input state, and result views |
| `src/lib/wordLadder.ts` | Algorithms for word ladders and the other supported puzzles |
| `src/data/` | Bundled dictionaries and puzzle graphs |
| `public/` | Public word lists, frequency data, and static assets |
| `src/components/` | Shared UI components and Sudoku image-copy controls |
| `src/lib/tango-image.ts` | Tango solution image export |
| `src/routes/about.tsx`, `src/routes/faq.tsx`, `src/routes/changelog.tsx` | Supporting pages |
| `src/lib/feedback.functions.ts` | Validated server-side Discord feedback submission |
| `src/server.ts` | Server entry with error handling |
| `vite.config.ts` | Lovable/TanStack build configuration |

## Development with Lovable

This project was built with [Lovable](https://lovable.dev). Continue editing it locally or open the [Lovable project editor](https://lovable.dev/projects/fecf7337-5c8a-42d4-8e26-68dcba69a5b6).
