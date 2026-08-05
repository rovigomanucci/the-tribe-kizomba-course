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
   node scripts/validate-site.mjs
   node scripts/build-site.mjs
   git diff --exit-code -- index.html
   ```

5. Review the complete diff. Confirm `index.html` reflects the Markdown changes.
6. Commit all related source and generated files together.
7. Push the verified commit to GitHub `main`.
8. Confirm Vercel created a production deployment from the same commit.

## Manual Vercel fallback

Use the connected Vercel project only when the GitHub push does not start a production deployment.

1. Deploy the repository state from the verified GitHub `main` commit.
2. Target the existing `the-tribe-kizomba-course` project and production environment.
3. Do not deploy from a checkout with local differences from GitHub `main`.
4. Record the manual deployment in `CHANGELOG.md` only when the release process itself changed or failed in a way future agents need to know.

## Production verification

After Vercel reports the deployment ready:

1. Open the production root and confirm Open Night loads first.
2. Confirm light theme is the default for a new browser profile.
3. Open `#open-night` and confirm its reference-video panel appears below `Teaching sequence`.
4. Confirm the Open Night iframe uses the expected YouTube video ID.
5. Check Level 1 Weeks 1, 6, and 8 to cover one-video and two-video layouts.
6. Test the light and dark theme toggle.
7. Test lesson navigation, search, teaching notes, and mobile layout.
8. Compare the deployed HTML with the committed `index.html`, or verify a unique release marker such as the Open Night video ID.
9. Check Vercel runtime and build logs for errors.

Do not report success until the production domain serves the verified content.

## Rollback

If production fails:

1. Repoint production to the last known good Vercel deployment.
2. Revert the faulty GitHub commit with a new commit. Do not rewrite shared history.
3. Rebuild and validate again.
4. Deploy the corrected `main` commit and repeat the production checklist.
