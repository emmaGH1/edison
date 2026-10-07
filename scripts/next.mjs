import { spawn } from "node:child_process";

const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  },
);
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("error", () => {
  console.error("Could not start the local Next.js CLI.");
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal === "SIGINT" ? 130 : 1);
});
