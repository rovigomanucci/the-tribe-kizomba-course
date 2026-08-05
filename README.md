# The Tribe Kizomba Curriculum

## Purpose

This GitHub repository is the sole source of truth for designing, teaching, reviewing, and improving The Tribe's Kizomba courses.

The current scope contains:

- Kizomba Open Night: a 60-minute introductory class before each cycle
- Level 1: Kizomba Foundations and Social Flow
- Level 2: Kizomba Fusion Techniques and Musicality

## Storage and publishing model

- GitHub stores the canonical Markdown knowledge base.
- Vercel hosts the published interactive web artifact.
- Google Drive may be retained temporarily as a read-only archive during migration, but it is not a parallel source of truth.
- Word, PDF, slide, spreadsheet, and web files are generated outputs and must be reproducible from the Markdown source.

## How to use this repository

1. Use `DECISIONS.md` for approved decisions.
2. Use `CHANGELOG.md` for significant updates.
3. Use `curriculum/` for the official course architecture.
4. Use `classes/` for Open Night, Level 1, and Level 2 teaching specifications.
5. Use `library/` for movement definitions, terminology, videos, and safety.
6. Use `research/` for evidence, references, and unresolved questions.
7. Use `templates/` when producing new lesson plans or reviews.
8. Save final documents, slide decks, PDFs, spreadsheets, and generated web files in `outputs/` or the appropriate deployment source.

## Status language

- Approved: ready to teach unless later revised.
- Draft: structured but still open for refinement.
- Research needed: requires evidence or expert review.
- Test in class: requires observation during a live cycle.

## Current design principle

Every class gives students a recognisable move or movement family. The move acts as the vehicle for technique, connection, musicality, and social-dance decision making.

## Project map

- `AGENTS.md`: instructions for AI agents working in this repository
- `DECISIONS.md`: approved decisions and open questions
- `CHANGELOG.md`: significant project changes
- `strategy/`: course identity and teaching model
- `curriculum/`: level overviews and progression logic
- `classes/open-night/`: introductory class plan and live-session reviews
- `classes/level-1/`: eight Level 1 class specifications
- `classes/level-2/`: eight Level 2 class specifications
- `library/`: movements, terminology, video references, and safety
- `research/`: sources and research backlog
- `templates/`: reusable planning and review templates
- `outputs/`: final human-facing artifacts
- `index.html`: deployed interactive curriculum artifact
- `scripts/build-site.mjs`: rebuilds the web artifact from the canonical Markdown class files

## Rebuild the web artifact

The Markdown class files are canonical. `scripts/build-site.mjs` reads them and generates `index.html`. Do not edit `index.html` directly.

After changing curriculum content, videos, or the site generator, run:

```bash
node scripts/build-site.mjs
node scripts/validate-site.mjs
node scripts/build-site.mjs
git diff --exit-code -- index.html
```

The last command proves the generated artifact is reproducible. Commit the updated Markdown, generator, documentation, and `index.html` together.

## Video update map

| Change | Canonical files | Generated file |
|---|---|---|
| Add or replace a class video | Relevant file in `classes/` and `library/video-reference-library.md` | `index.html` |
| Change curriculum content | Relevant file in `classes/`, plus a curriculum overview when course structure changes | `index.html` |
| Change teaching-guide layout or behaviour | `scripts/build-site.mjs` | `index.html` |
| Change an approved programme decision | `DECISIONS.md`, affected curriculum and class files | `index.html` when visible content changes |

Each embedded video belongs under `Instructor preparation references` in its class file. The generator reads this section. There is no separate video map in the generator.

## Publishing

GitHub `main` is the production source. Vercel publishes the generated root `index.html` at [the production teaching guide](https://the-tribe-kizomba-course.vercel.app/).

Follow `DEPLOYMENT.md` for the complete release, verification, fallback, and rollback process.
