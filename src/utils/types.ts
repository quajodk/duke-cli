export type PackageManager = "npm" | "pnpm" | "yarn";
export const availablePackages = ["envVariables"] as const;
export type AvailablePackages = (typeof availablePackages)[number];
/*
 * This maps the necessary packages to a version.
 * This improves performance significantly over fetching it from the npm registry.
 */
export const dependencyVersionMap = {} as const;
export type AvailableDependencies = keyof typeof dependencyVersionMap;
export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages?: PkgInstallerMap;
  projectName?: string;
}

export type Installer = (opts: InstallerOptions) => void;

export type PkgInstallerMap = {
  [pkg in AvailablePackages]: {
    inUse: boolean;
    installer: Installer;
  };
};

// export const buildPkgInstallerMap = (
//   packages: AvailablePackages[]
// ): PkgInstallerMap => ({});
