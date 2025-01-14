import { tool } from "ai";
import { exec } from "node:child_process";
import { z } from "zod";

export const createCodeTools = ({ baseDir }: { baseDir: string }) => {
  return {
    buildCode: tool({
      description:
        "Executes the build command for the current code base and returns the output.",
      parameters: z.object({}),
      execute: async () => {
        const config = await readProjectConfig();
        const buildCommand = config.build || "npm run build";
        return asyncExec(buildCommand, baseDir);
      },
    }),
    lintCode: tool({
      description:
        "Lints the current code base and returns the results. This function helps identify and report potential issues, style violations, or errors in the code, improving code quality and consistency.",
      parameters: z.object({}),
      execute: async () => {
        const config = await readProjectConfig();
        const lintCommand = config.lint || "npm run lint";
        return asyncExec(lintCommand, baseDir);
      },
    }),
    formatCode: tool({
      description:
        "Executes the 'format' command on the current code base and returns the results.",
      parameters: z.object({}),
      execute: async () => {
        const config = await readProjectConfig();
        const formatCommand = config.format || "npm run format";
        return asyncExec(formatCommand, baseDir);
      },
    }),
  };
};

function readProjectConfig(): Promise<any> {
  return Promise.resolve({});
}

function asyncExec(command: string, cwd: string): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  exec(command, { cwd }, (error, stdout, stderr) => {
    if (error) {
      reject(`Command ${command} execution error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Command ${command} stderr: ${stderr}`);
    }
    resolve(stdout);
  });
  return promise;
}
