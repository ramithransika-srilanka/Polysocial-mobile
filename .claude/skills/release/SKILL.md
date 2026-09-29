---
name: release
description: Release the Polysocial website (polysocial.cc) - commit pending work to develop, cut the next release-<version>(<build>) branch, align main and develop with it, push, then watch the Netlify deploy and check the live site. Use when the user types /release (optionally with a version, e.g. /release 1.1.0) or asks to release, ship or deploy the website to Netlify / production.
---

# /release

Ships `develop` to polysocial.cc. Typing `/release` means the user has
authorized the commit, the push to `develop`/`main`/the new release branch,
and the production deploy that push triggers. Don't ask for confirmation again
unless something below says to stop.

Arguments: `$ARGUMENTS`. Empty means the next build of the latest version, e.g.
`release-1.0.0(2)` after `release-1.0.0(1)`. A version like `1.1.0` releases
that version starting at build 1.

## Branch model

- `main` and `develop` always point at the same commit.
- Each release is its own branch, `release-<version>(<build>)`, cut from
  `develop`. Old release branches are kept, so you can roll back by re-running the
  deploy on one of them.
- Only a push to a `release-*` branch deploys, via
  `.github/workflows/deploy-netlify.yml`. Netlify's own git builds are disabled by
  `ignore = "exit 0"` in `netlify.toml`.

## Steps

1. **Go to the repo root.** Run everything from `git rev-parse --show-toplevel`
   of this repo, the one whose `origin` is `ramithransika-srilanka/Polysocial-mobile`.

2. **Commit pending work to `develop`.** If `git status --short` shows changes:
   - If the current branch is not `develop`, stop and ask the user whether to
     bring those changes onto `develop`. Never release from another branch.
   - Otherwise, show the user the file list. Commit everything with a
     descriptive message that summarizes the diff: what changed, not "update files".
     Skip anything that looks like a secret or a local artifact (`.env`,
     `*.pem`, `resources/`, `node_modules/`) and mention it.

3. **Sanity-check the site.** Every local `href`/`src`/`srcset`/`poster`/`url()`
   in `site/**/*.html` must resolve to a file under `site/`. A relative ref
   resolves against the page's folder; a leading `/` means the `site/` root;
   extensionless refs map to `<path>.html` or `<path>/index.html`. If
   something is broken, stop and report it instead of shipping a broken page.

4. **Preview.** Run `scripts/release.sh --dry-run $ARGUMENTS`. If it exits
   non-zero, report its message and stop. It refuses when main has commits
   develop lacks, when develop has diverged from origin, or when there's
   nothing new since the last release.

5. **Release.** Run `scripts/release.sh $ARGUMENTS`. It atomically pushes the
   same commit to `develop`, `main` and the new release branch.

6. **Watch the deploy.** Find the `Deploy to Netlify (release)` run for the
   release branch and wait until it finishes, using an until-loop, not a sleep chain:
   - With an authenticated `gh`: `gh run list --workflow deploy-netlify.yml
     --branch '<release>' --limit 1`, then `gh run watch <id> --exit-status`.
   - Without `gh`: poll
     `https://api.github.com/repos/ramithransika-srilanka/Polysocial-mobile/actions/runs?branch=<release>`
     with the token from `git credential fill`, then read the run's jobs and steps.

   If it fails at **Check Netlify secrets**, the repo is missing
   `NETLIFY_AUTH_TOKEN` / `NETLIFY_SITE_ID`. Only a repo admin can add these,
   under Settings → Secrets and variables → Actions → Repository secrets.
   Tell the user that, and tell them to re-run the job once the secrets exist.

7. **Verify live.** After a successful run:
   - `https://polysocial.cc/` returns 200.
   - Every page changed in this release returns 200 at its extensionless URL.
     Use `git diff --name-only <previous release>..<release> -- site/`.
   - `https://polysocial.cc/package.json` returns 404, which confirms only
     `site/` is published.

8. **Report.** Give the release branch name, commit, number of new commits,
   Actions run URL, deploy result and live-check results.
