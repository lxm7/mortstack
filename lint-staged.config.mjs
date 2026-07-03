import path from "node:path";

// Monorepo lint-staged. ESLint v9 flat config resolves from the *current
// working directory*, and lint-staged runs at the repo root — so a plain
// `eslint --fix` lints apps/mobile/** with the ROOT config (no react-hooks
// plugin) and resolves imports from the root cwd (breaking `@/` aliases).
//
// Fix: group staged files by their workspace and run eslint from inside each
// one, so both flat-config lookup and the import/tsconfig resolvers use that
// package's cwd — matching how `turbo lint` already runs per package.

const repoRoot = process.cwd();

// Workspaces per package.json: apps/*, packages/*, services/*, infra.
function workspaceDir(absFile) {
  const [top, second] = path.relative(repoRoot, absFile).split(path.sep);
  if (top === "apps" || top === "packages" || top === "services") {
    return second ? `${top}/${second}` : top;
  }
  if (top === "infra") return "infra";
  return "."; // repo-root files (sst.config.ts, eslint.config.mjs, …)
}

export default {
  "*.{ts,tsx}": (files) => {
    const groups = new Map();
    for (const abs of files) {
      const ws = workspaceDir(abs);
      (groups.get(ws) ?? groups.set(ws, []).get(ws)).push(abs);
    }
    return [...groups].map(([ws, abs]) => {
      const cwd = path.join(repoRoot, ws);
      const rels = abs.map((f) => `"${path.relative(cwd, f)}"`).join(" ");
      return `sh -c 'cd ${ws} && eslint --fix ${rels}'`;
    });
  },
  "*.{ts,tsx,js,jsx,json,css,md}": "prettier --write",
};
