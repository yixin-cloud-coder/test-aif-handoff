// Shared debug logger.
//
// Verbose diagnostics are gated by the `DEBUG=1` environment variable and are
// always written to `stderr`, never `stdout`. `stdout` is reserved exclusively
// for the calculator result so the CLI remains safe to use in scripts and
// pipelines.
const enabled = process.env.DEBUG === '1';

/**
 * Write a tagged debug line to stderr when `DEBUG=1` is set.
 *
 * @param {string} tag - the originating module (e.g. `tokenizer`).
 * @param {string} message - the pre-formatted diagnostic message.
 */
export function debug(tag, message) {
  if (enabled) {
    process.stderr.write(`[${tag}] ${message}\n`);
  }
}
