# Release Checklist

Use this checklist for the first public Agent Flow release and future patch releases.

## Before Publish

1. Confirm `package.json` has the intended version.
2. Confirm `CHANGELOG.md` has release notes for that version.
3. Run the full local verification suite:

```bash
npm test
npm run smoke:package
git diff --check
```

## Publish

Publish through the GitHub Actions `Publish` workflow. It requires:

- a repository secret named `NPM_TOKEN`;
- workflow input `version` matching `package.json`.

The workflow runs `npm test`, `npm run smoke:package`, `npm pack --dry-run --json`, then publishes with npm provenance.

Manual fallback:

```bash
npm publish --access public
```

If publishing only a GitHub release, attach the package tarball from `npm pack` and keep the npm install instructions out of the release notes.

## After Publish

Run the clean-project smoke path against the published package:

```bash
tmpdir="$(mktemp -d)"
cd "$tmpdir"
npm init -y >/dev/null
npm install @mxmbt/agent-flow
npx agent-flow init
npx agent-flow validate --strict
npx agent-flow doctor
```

The release is complete only after the published artifact passes the after-publish smoke path.
