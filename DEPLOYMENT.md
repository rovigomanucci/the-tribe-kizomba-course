# Deployment

## Production target

- Repository: `rovigomanucci/the-tribe-kizomba-course`
- Production branch: `main`
- Vercel project: `the-tribe-kizomba-course`
- Production URL: `https://the-tribe-kizomba-course.vercel.app/`

GitHub `main` is the production source. Do not deploy a local-only or stale version.

## Release checklist

1. Fetch the remote repository.
2. Confirm the checkout matches the latest `origin/main` and has no unrelated changes.
3. Update canonical Markdown before generated files.
4. Run:

   ```bash
   node scripts/build-site.mjs
   node scripts/patch-open-night.mjs
   node scripts/validate-site.mjs
   node scripts/build-site.mjs
   node scripts/patch-open-night.mjs
   git diff --exit-code -- index.html
   ```

5. Review the complete diff. Confirm `index.html` reflects the Markdown changes.
6. When working locally, commit all related source and generated files together and push to `main`.
7. When source changes are committed through the GitHub connector, `.github/workflows/rebuild-site.yml` regenerates and validates `index.html`, then commits the generated file to `main` when needed.
8. Confirm the final `main` commit contains the generated `index.html` and Vercel publishes that state.

## Manual Vercel fallback

Use the connected Vercel project only when the GitHub push does not start a production deployment.

1. Deploy the repository state from the verified GitHub `main` commit.
2. Target the existing `the-tribe-kizomba-course` project and production environment.
3. Do not deploy from a checkout with local differences from GitHub `main`.
4. Record the manual deployment in `CHANGELOG.md` only when the release process itself changed or failed in a way future agents need to know.

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

Do not report success until the production domain serves the verified content.

## Rollback

If production fails:

1. Repoint production to the last known good Vercel deployment when available.
2. Revert the faulty GitHub commit with a new commit. Do not rewrite shared history.
3. Rebuild, patch, and validate again.
4. Deploy the corrected `main` commit and repeat the production checklist.
