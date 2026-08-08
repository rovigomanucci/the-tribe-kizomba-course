# Deployment

## Production target

- Repository: `rovigomanucci/the-tribe-kizomba-course`
- Production branch: `main`
- Vercel project: `the-tribe-kizomba-course`
- Production URL: `https://the-tribe-kizomba-course.vercel.app/`

GitHub `main` is the production source. Do not deploy a local-only or stale version.

## Connection gate

Before changing release files, confirm the production project in the Vercel dashboard has:

- Git repository: `rovigomanucci/the-tribe-kizomba-course`
- Production branch: `main`
- Production domain: `the-tribe-kizomba-course.vercel.app`

The Vercel dashboard Git connection and an AI agent's Vercel connector are separate. An agent connector showing zero projects does not prove the dashboard Git connection is broken. Use the dashboard project settings and the production deployment list as the authority.

If the repository was connected after the latest GitHub commit, Vercel needs a new push to start its first Git deployment. Prefer the next real verified release commit. Use an empty trigger commit only when no content change remains to push.

## Release checklist

1. Fetch the remote repository.
2. Confirm the checkout matches the latest `origin/main` and has no unrelated changes.
3. Update canonical Markdown before generated files.
4. Run the complete local check:

   ```bash
   node scripts/check-site.mjs
   ```

5. Review the complete diff. Confirm `index.html` reflects the Markdown changes.
6. Commit all related source files and generated `index.html` together.
7. Push the verified commit to `main`. Vercel's Git integration starts the production deployment.
8. Confirm the GitHub `Validate teaching guide` check passes. This workflow validates only. It does not change files or deploy.
9. Confirm the Vercel deployment references the final GitHub commit.
10. From a clean checkout of that commit, run `node scripts/verify-production.mjs`.

## GitHub authentication fallback

Use one publishing route for the full release:

1. Prefer authenticated local Git when `git push` works.
2. If local Git or GitHub CLI lacks credentials, use the connected GitHub app.
3. Through the app, publish the exact locally verified source files and `index.html` as one commit on top of the latest `main` SHA.
4. Recheck the remote head before writing. Stop if `main` advanced after validation.
5. Never mix a partial local push with a second connector commit.
6. Never expect GitHub Actions to generate or commit a missing `index.html`.

## Manual Vercel fallback

Use a direct Vercel deployment only when the GitHub push does not start a production deployment and the correct project is accessible.

1. Confirm GitHub `main` contains the verified commit and the committed `index.html`.
2. Use a clean checkout where `HEAD` equals `origin/main` and `git status --porcelain` is empty.
3. Link the checkout to the existing `the-tribe-kizomba-course` project in the correct Vercel team. Never create a replacement project.
4. Obtain the team and project IDs through `vercel link` or the Vercel project settings. The local `.vercel/project.json` stores them and must remain uncommitted.
5. Deploy with `vercel deploy --prod`, or use the connected Vercel app against the same existing project.
6. Confirm the deployment's Git SHA or source matches the verified GitHub commit.
7. Run `node scripts/verify-production.mjs` and complete the visual checks below.
8. If the Vercel app shows zero projects, stop using that app for deployment. This indicates connector access to a different team, not permission to create a new project.

## Production verification

After Vercel reports the deployment ready:

1. Open the production root and confirm Open Night loads first.
2. Confirm Open Night displays `45 minutes` and `45-minute class flow`.
3. Confirm the Open Night timeline begins with `0–2 min, Welcome and setup` and ends with `38–45 min, Final slow song and partner changes`.
4. Confirm the Open Night movement summary includes Basic 2, Basic 3, balança, slow marca, Basic 1, and controlled rotation.
5. Confirm the Open Night reference-video panel appears below `Teaching sequence` and uses the approved YouTube reference.
6. Check Level 1 Weeks 1, 6, and 8 to confirm their 60-minute labels and video layouts remain unchanged.
7. Test the light and dark theme toggle.
8. Test lesson navigation, search, teaching notes, and mobile layout.
9. Compare the deployed content with the final committed `index.html` using the unique Open Night 45-minute text and timeline phases.
10. Check deployment or workflow logs for errors.
11. Run `node scripts/verify-production.mjs` to compare the deployed file with local `index.html` byte for byte.

Do not report success until the production domain serves the verified content.

## Rollback

If production fails:

1. Repoint production to the last known good Vercel deployment when available.
2. Revert the faulty GitHub commit with a new commit. Do not rewrite shared history.
3. Run `node scripts/check-site.mjs` again.
4. Deploy the corrected `main` commit and repeat the production checklist.
