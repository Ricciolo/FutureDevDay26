import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, "dist", "server.js");

const child = spawn("node", [serverPath, ...process.argv.slice(2)], {
  stdio: "inherit",
  windowsHide: true,
});

child.on("error", (err) => {
  const code = /** @type {any} */ (err).code;
  if (code === "ENOENT") {
    process.stderr.write(
      "Error: 'node' executable not found. Make sure Node.js is installed and in PATH.\n"
    );
  } else {
    process.stderr.write(`Error spawning MCP server: ${err.message}\n`);
  }
  process.exit(1);
});

child.on("exit", (code) => {
  if (code !== null && code !== 0) {
    process.stderr.write(`MCP server exited with code ${code}\n`);
    process.exit(code);
  }
});
