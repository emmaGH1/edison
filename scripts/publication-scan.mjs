import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const files = [
  ...new Set(
    execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
      encoding: "utf8",
    })
      .split("\0")
      .filter(Boolean),
  ),
];
const forbiddenPath =
  /(^|\/)(\.edison-private|raw|private-data|artifacts|node_modules|\.next)\/|\.(csv|zip|mp[34]|wav|pem|key|p12|pfx)$|(^|\/)\.env(?!\.example$)/;
const secret = /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----|\bAKIA[A-Z0-9]{16}\b|\bsk_[a-f0-9]{32,}\b/;
const failures = [];
for (const file of files) {
  if (forbiddenPath.test(file)) failures.push(`${file}: private/generated path`);
  if (/\.(woff2?|ttf|ico)$/.test(file)) continue;
  const content = readFileSync(file, "utf8");
  if (secret.test(content)) failures.push(`${file}: credential pattern`);
  if (
    file.startsWith("src/") &&
    /from\s+["'].*(?:\.edison-private|raw\/)|NEXT_PUBLIC_(?:.*(?:KEY|SECRET|TOKEN))/.test(content)
  )
    failures.push(`${file}: unsafe client resource`);
}
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
if (existsSync(".next/server")) {
  for (const file of walk(".next/server").filter((path) => path.endsWith(".nft.json"))) {
    const trace = JSON.parse(readFileSync(file, "utf8"));
    if (
      trace.files.some((path) =>
        /(?:^|\/)(?:\.edison-private|private-data|raw)\/|(?:^|\/)\.env(?:$|[./])|evidence\.json(?:\.sha256)?$/.test(
          path,
        ),
      )
    )
      failures.push(`${file}: private resource included in build trace`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Publication scan passed: ${files.length} files; no forbidden paths or credential patterns.`,
  );
