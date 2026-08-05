# AGENTS.md

## Project

You are supporting the creation of The Tribe's Kizomba curriculum.

## Course identity

The course combines strong Kizomba foundations with a Kizomba Fusion direction.

Name Traditional Kizomba, Semba, Urban Kiz, Tarraxinha, and Fusion techniques accurately. Do not group every technique under the label Kizomba.

## Current course structure

- Kizomba Open Night before each cycle
- Level 1: Kizomba Foundations and Social Flow
- Level 2: Kizomba Fusion Techniques and Musicality
- Eight weekly classes per level
- Thursday teaching cycle

## Required class components

Every class file must contain:

1. Student-facing promise
2. Headline move or movement family
3. Technical foundation
4. Prerequisites
5. Core version
6. Progressing version
7. Challenge version
8. Entry options
9. Exit options
10. Social-dance task
11. Common errors
12. Safety notes
13. Link to previous and next week
14. Open questions or test points

## Teaching principles

- Teach foundations through visible moves.
- Avoid long choreography as the primary learning model.
- Teach reusable entries, exits, timings, directions, and recoveries.
- Faster students receive harder constraints, not unrelated figures.
- Musicality starts in Level 1.
- Walking and weight transfer appear throughout both levels.
- Advanced techniques must preserve consent, individual balance, and safe range of motion.
- Leg lifts, leg crosses, hooks, suspensions, and counterbalances require explicit preparation and safe exits.

## Source-of-truth rules

- This GitHub repository is the sole canonical source for the curriculum knowledge base.
- Treat `DECISIONS.md` and files marked Approved as authoritative.
- Do not overwrite approved decisions silently.
- Log significant changes in `CHANGELOG.md`.
- Flag contradictions before modifying several files.
- Keep historical notes in the changelog rather than duplicating obsolete content.
- Do not invent video timestamps, lineage claims, or safety standards.
- Google Drive may be retained temporarily as an archive, but it must not be edited as a parallel source.

## Writing style

- Use clear headings and short paragraphs.
- Prefer tables only when they improve comparison.
- Use direct, practical language.
- Separate approved content from open questions.
- Keep terminology consistent across all files.

## Artifact rules

- Markdown files in this GitHub repository are the canonical knowledge base.
- Word, PDF, slide, spreadsheet, and web files are generated outputs.
- Vercel hosts the published web artifact.
- Do not treat generated outputs as more authoritative than the Markdown source files.

## Mandatory agent workflow

Before editing:

1. Work from a clean checkout of the latest `origin/main`.
2. Stop if the checkout is behind, detached, or contains unrelated local changes.
3. Read this file, `README.md`, `DECISIONS.md`, and `DEPLOYMENT.md`.
4. Identify every canonical Markdown file affected by the request before touching `index.html`.

When editing:

1. Change canonical Markdown first.
2. Update `DECISIONS.md` only when an approved decision changes.
3. Add a concise entry to `CHANGELOG.md` for significant changes.
4. Never edit `index.html` by hand. Run `node scripts/build-site.mjs`.
5. Run `node scripts/validate-site.mjs`.
6. Run the build again and confirm `git diff --exit-code -- index.html` returns no difference.
7. Commit the Markdown, generator, documentation, and generated `index.html` together.

## Video rules

- The class file is the canonical source for videos shown on that class page.
- Store embedded videos under `Instructor preparation references` as a numbered Markdown list.
- Use a standard YouTube watch URL in each numbered item.
- Put instructor notes in indented bullets below the link.
- Keep `library/video-reference-library.md` as the cross-course index. It must match the class files.
- Do not hardcode lesson video mappings inside `scripts/build-site.mjs` or `index.html`.
- Open Night and every Level 1 class must include at least one video. Level 2 remains optional until references are approved.

## Deployment rules

- GitHub `main` is the production source.
- Vercel production must deploy the same verified `main` commit.
- Follow `DEPLOYMENT.md` for preview, production, verification, and rollback.
- Never deploy from a stale, detached, or modified checkout.
