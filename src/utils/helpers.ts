import { APP_VERSION } from "../constants";
import { PackageManager } from "./types";
import pathModule from "path";

export const getVersion = () => {
  return APP_VERSION ?? "0.0.1";
};

export const getUserPkgManager: () => PackageManager = () => {
  // This environment variable is set by npm and yarn but pnpm seems less consistent
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    if (userAgent.startsWith("yarn")) {
      return "yarn";
    } else if (userAgent.startsWith("pnpm")) {
      return "pnpm";
    } else {
      return "npm";
    }
  } else {
    // If no user agent is set, assume npm
    return "npm";
  }
};

/**
 *  Parses the appName and its path from the user input.
 * Returns an array of [appName, path] where appName is the name put in the package.json and
 *   path is the path to the directory where the app will be created.
 * If the appName is '.', the name of the directory will be used instead.
 * Handles the case where the input includes a scoped package name
 * in which case that is being parsed as the name, but not included as the path
 * e.g. dir/@mono/app => ["@mono/app", "dir/app"]
 * e.g. dir/app => ["app", "dir/app"]
 **/
export const parseNameAndPath = (input: string) => {
  const paths = input.split("/");

  let appName = paths[paths.length - 1];

  // If the user ran `npx create-duke-app .` or similar, the appName should be the current directory
  if (appName === ".") {
    const parsedCwd = pathModule.resolve(process.cwd());
    appName = pathModule.basename(parsedCwd);
  }

  // If the first part is a @, it's a scoped package
  const indexOfDelimiter = paths.findIndex((p) => p.startsWith("@"));
  if (paths.findIndex((p) => p.startsWith("@")) !== -1) {
    appName = paths.slice(indexOfDelimiter).join("/");
  }

  const path = paths.filter((p) => !p.startsWith("@")).join("/");

  return [appName, path] as const;
};
