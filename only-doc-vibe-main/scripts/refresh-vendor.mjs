import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SCOPE = "@universe-forma";

export function collectPrivateDeps() {
  const tree = JSON.parse(
    execSync("npm ls --all --json", { encoding: "utf8", maxBuffer: 1e8 }),
  );
  const found = new Map();
  const walk = (deps = {}) => {
    for (const [name, node] of Object.entries(deps)) {
      if (name.startsWith(SCOPE + "/") && node.version)
        found.set(name, node.version);
      if (node.dependencies) walk(node.dependencies);
    }
  };
  walk(tree.dependencies);
  return found; // Map<name, version>
}

export function vendorPrivateDeps() {
  const priv = collectPrivateDeps();
  if (priv.size === 0)
    throw new Error("No @universe-forma deps found — is node_modules installed with a token?");
  mkdirSync("vendor", { recursive: true });
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  for (const [name, version] of priv) {
    execSync(`npm pack ${name}@${version} --pack-destination vendor`, { stdio: "inherit" });
    // npm pack names scoped tarballs deterministically: @scope/name@v -> scope-name-v.tgz
    const tgz = `${name.replace(SCOPE + "/", SCOPE.slice(1) + "-")}-${version}.tgz`;
    if (!existsSync(`vendor/${tgz}`)) throw new Error(`Packed tarball not found for ${name}: vendor/${tgz}`);
    const rel = `file:./vendor/${tgz}`;
    if (pkg.dependencies?.[name]) pkg.dependencies[name] = rel;
    if (pkg.devDependencies?.[name]) pkg.devDependencies[name] = rel;
  }
  writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  console.log(`Vendored ${priv.size} private package(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) vendorPrivateDeps();
