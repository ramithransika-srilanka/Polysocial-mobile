#!/usr/bin/env bash
# Cut the next release and ship it to polysocial.cc.
#
#   1. Checks develop is safe to release (clean tree, main has nothing develop lacks).
#   2. Picks the next branch name: release-<version>(<build>).
#   3. Pushes develop's commit to develop, main and the new release branch in
#      one atomic push, so main and develop stay identical.
#   4. The release-branch push triggers .github/workflows/deploy-netlify.yml,
#      which publishes site/ to Netlify production.
#
# Usage:
#   scripts/release.sh              next build of the latest version, e.g. release-1.0.0(1) -> release-1.0.0(2)
#   scripts/release.sh 1.1.0        release version 1.1.0 (build 1, or the next free build)
#   scripts/release.sh --dry-run    print the plan, push nothing
set -euo pipefail

die() { echo "release: $*" >&2; exit 1; }

REMOTE=origin
DRY_RUN=false
VERSION=""
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    -h|--help) sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    [0-9]*.[0-9]*.[0-9]*)
      [[ "$arg" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "version must look like 1.2.3 (got $arg)"
      VERSION="$arg" ;;
    *) die "unknown argument: $arg (see --help)" ;;
  esac
done

cd "$(git rev-parse --show-toplevel)"

[ -z "$(git status --porcelain)" ] \
  || die "uncommitted changes - commit them to develop first:
$(git status --short)"

git fetch --prune --quiet "$REMOTE"

# main must never have commits develop lacks; otherwise aligning main would drop them.
git merge-base --is-ancestor "$REMOTE/main" "$REMOTE/develop" \
  || die "$REMOTE/main has commits that are not on $REMOTE/develop - merge them into develop first"

# Release the newer of local develop / origin develop; refuse if they diverged.
if git merge-base --is-ancestor "$REMOTE/develop" develop; then
  TARGET=$(git rev-parse develop)            # includes unpushed local develop commits
elif git merge-base --is-ancestor develop "$REMOTE/develop"; then
  TARGET=$(git rev-parse "$REMOTE/develop")  # local develop is just behind
else
  die "local develop and $REMOTE/develop have diverged - reconcile them first"
fi

# Existing releases as "major minor patch build", newest last.
releases=$(git for-each-ref --format='%(refname:lstrip=3)' "refs/remotes/$REMOTE/release-*" \
  | sed -nE 's/^release-([0-9]+)\.([0-9]+)\.([0-9]+)\(([0-9]+)\)$/\1 \2 \3 \4/p' \
  | sort -n -k1,1 -k2,2 -k3,3 -k4,4)
latest=$(tail -1 <<<"$releases")

if [ -z "$VERSION" ]; then
  if [ -n "$latest" ]; then
    read -r ma mi pa _ <<<"$latest"
    VERSION="$ma.$mi.$pa"
  else
    VERSION="1.0.0"
  fi
fi
IFS=. read -r ma mi pa <<<"$VERSION"
last_build=$(awk -v a="$ma" -v b="$mi" -v c="$pa" '$1==a && $2==b && $3==c {n=$4} END {print n+0}' <<<"$releases")
NAME="release-$VERSION($((last_build + 1)))"
git check-ref-format --branch "$NAME" >/dev/null || die "invalid branch name: $NAME"

if [ -n "$latest" ]; then
  read -r a b c d <<<"$latest"
  LATEST_NAME="release-$a.$b.$c($d)"
  [ "$(git rev-parse "$REMOTE/$LATEST_NAME")" != "$TARGET" ] \
    || die "nothing new since $LATEST_NAME (same commit). To redeploy it, re-run the Netlify workflow on that branch."
fi

echo "Release     : $NAME"
echo "Commit      : $(git log -1 --format='%h %s' "$TARGET")"
echo "Previous    : ${LATEST_NAME:-none}"
echo "New commits : $(git rev-list --count "$REMOTE/main..$TARGET") on top of $REMOTE/main"
echo "Pushes      : develop, main, $NAME -> $(git rev-parse --short "$TARGET")"

if $DRY_RUN; then
  echo "(dry run - nothing pushed)"
  exit 0
fi

# Atomic + non-force: all three refs move together or none do.
git push --atomic "$REMOTE" \
  "$TARGET:refs/heads/develop" \
  "$TARGET:refs/heads/main" \
  "$TARGET:refs/heads/$NAME"

git fetch --quiet "$REMOTE"
if [ "$(git branch --show-current)" = "develop" ]; then
  git merge --ff-only --quiet "$REMOTE/develop"
fi

url=$(git remote get-url "$REMOTE" | sed -E 's#^git@github.com:#https://github.com/#; s#\.git$##')
echo ""
echo "Pushed. Netlify deploy: $url/actions/workflows/deploy-netlify.yml"
