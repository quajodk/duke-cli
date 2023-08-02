import { Command } from "commander";
import { APP_NAME, APP_VERSION, DEFAULT_APP_NAME } from "../constants";
import { getUserPkgManager, getVersion } from "../utils/helpers";
import chalk from "chalk";
import inquirer from "inquirer";
import { logger } from "../utils/logger";
import { AvailablePackages, availablePackages } from "../utils/types";

interface CliFlags {
  noGit: boolean;
  noInstall: boolean;
  default: boolean;
}

interface iCliResult {
  appName: string;
  packages: [];
  flags: CliFlags;
}

const defaultOptions: iCliResult = {
  appName: DEFAULT_APP_NAME,
  packages: [],
  flags: {
    noGit: false,
    noInstall: false,
    default: false,
  },
};

export const run = async () => {
  const cliResults = defaultOptions;
  const program = new Command();
  program
    .name(APP_NAME)
    .description(
      "A CLI tool to quickly scalffold ts project with you own structure or default setups"
    )
    .version(getVersion(), "-v, --version", "Display the version number");

  program
    .argument(
      "[dir]",
      "The name of the application, as well as the name of the directory to create"
    )
    .option(
      "--noGit",
      "Explicitly tell the CLI to not initialize a new git repo in the project",
      false
    )
    .option(
      "--noInstall",
      "Explicitly tell the CLI to not run the package manager's install command",
      false
    )
    .option(
      "-y, --default",
      "Bypass the CLI and use all default options to bootstrap a new t3-app",
      false
    )
    .addHelpText(
      "afterAll",
      `\n The duke cli was inspired by ${chalk
        .hex("#E8DCFF")
        .bold(
          "easiness and simplicity"
        )} and has been used to build awesome appslike \n`
    )
    .parse(process.argv);

  const cliProvidedName = program.args[0];
  if (cliProvidedName) {
    cliResults.appName = cliProvidedName;
  }

  cliResults.flags = program.opts();
};

const promptProjectType = async () => {
  const { projectType } = await inquirer.prompt<{ projectType: string }>({
    name: "projectType",
    type: "list",
    message: "What project do you want to build",
    choices: [
      {
        name: "React SPA Project",
        value: "react-spa",
        short: "React - SPA Project",
      },
      {
        name: "React & Firebase Project",
        value: "react-fb-spa",
        short: "React Firebase Project",
      },
      {
        name: "React native Project",
        value: "react-native",
        short: "React Native",
      },
      { name: "NextJs Project", value: "next", short: "NextJs" },
      { name: "Nodejs Project", value: "nodejs", short: "Nodejs" },
      {
        name: "Nodejs Microservice Project",
        value: "nodejs-mcs",
        short: "Nodejs Microservices",
      },
    ],
  });

  logger.success(`Great! Initializing a ${projectType} project`);

  return projectType;
};

const promptLanguage = async (): Promise<void> => {
  const { language } = await inquirer.prompt<{ language: string }>({
    name: "language",
    type: "list",
    message: "Will you be using JavaScript or TypeScript?",
    choices: [
      { name: "TypeScript", value: "typescript", short: "TypeScript" },
      { name: "JavaScript", value: "javascript", short: "JavaScript" },
    ],
    default: "typescript",
  });

  if (language === "javascript") {
    logger.error("Wrong answer, using TypeScript instead...");
  } else {
    logger.success("Good choice! Using TypeScript!");
  }
};

const promptGit = async (): Promise<boolean> => {
  const { git } = await inquirer.prompt<{ git: boolean }>({
    name: "git",
    type: "confirm",
    message: "Initialize a new git repository?",
    default: true,
  });

  if (git) {
    logger.success("Nice one! Initializing repository!");
  } else {
    logger.info("Sounds good! You can come back and run git init later.");
  }

  return git;
};

const promptInstall = async (): Promise<boolean> => {
  const packageManager = getUserPkgManager() ?? "yarn";

  const { install } = await inquirer.prompt<{ install: boolean }>({
    name: "install",
    type: "confirm",
    message: `Would you like us to run '${packageManager} install'?`,
    default: true,
  });

  if (install) {
    logger.success("Alright. We'll install the dependencies for you!");
  } else {
    logger.info(
      `No worries. You can run '${packageManager} install' later to install the dependencies.`
    );
  }

  return install;
};

const promptPackages = async (): Promise<AvailablePackages[]> => {
  const { packages } = await inquirer.prompt<Pick<iCliResult, "packages">>({
    name: "packages",
    type: "checkbox",
    message: "Which packages would you like to enable?",
    choices: availablePackages
      .filter((pkg) => pkg !== "envVariables") // dont prompt for env-vars
      .map((pkgName) => ({
        name: pkgName,
        checked: false,
        disabled: false,
      })),
  });

  return packages;
};

const promptAppName = async (): Promise<string> => {
  const { appName } = await inquirer.prompt<Pick<iCliResult, "appName">>({
    name: "appName",
    type: "input",
    message: "What will your project be called?",
    default: defaultOptions.appName,
    transformer: (input: string) => {
      return input.trim();
    },
  });

  return appName;
};
