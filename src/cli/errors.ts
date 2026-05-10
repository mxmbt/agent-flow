export class CliCommandError extends Error {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;

  constructor(message: string, options: { exitCode?: number; stdout?: string; stderr?: string } = {}) {
    super(message);
    this.name = "CliCommandError";
    this.exitCode = options.exitCode ?? 1;
    this.stdout = options.stdout ?? "";
    this.stderr = options.stderr ?? message;
  }
}
