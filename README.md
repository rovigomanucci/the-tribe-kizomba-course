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

After changing a class file, run:

```bash
node scripts/build-site.mjs
```

Commit the updated Markdown and generated `index.html` together. Vercel publishes `index.html` from the GitHub repository.
