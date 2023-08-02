import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

export const logger = {
  error(...args: unknown[]) {
    console.log(chalk.red(...args));
  },
  warn(...args: unknown[]) {
    console.log(chalk.yellow(...args));
  },
  info(...args: unknown[]) {
    console.log(chalk.cyan(...args));
  },
  success(...args: unknown[]) {
    console.log(chalk.green(...args));
  },
  write(filePath: string, ...args: unknown[]) {
    const formattedMessage = `[${chalk.green(
      new Date().toISOString()
    )}]: ${args}\n`;

    fs.appendFileSync(filePath, formattedMessage, { encoding: "utf-8" });

    console.log(chalk.green(...args), "log to file:", path.basename(filePath));
  },
};
