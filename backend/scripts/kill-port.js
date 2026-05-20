const { execSync } = require("child_process");

const port = process.argv[2] || "5500";

function run(command) {
  return execSync(command, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
}

try {
  const output = run(`lsof -ti tcp:${port}`);
  if (!output) {
    process.exit(0);
  }

  for (const pid of output.split("\n").filter(Boolean)) {
    try {
      run(`kill -9 ${pid}`);
      console.log(`Stopped process ${pid} on port ${port}`);
    } catch {
      // try Node fallback
      try {
        process.kill(Number(pid), "SIGKILL");
        console.log(`Stopped process ${pid} on port ${port}`);
      } catch {
        console.warn(`Could not stop PID ${pid} — run: kill -9 ${pid}`);
      }
    }
  }
} catch {
  // port already free
}
