import type {
	ESBuildOnResolveArgs,
	ESBuildPlugin,
	ESBuildPluginSetup,
} from "../agent-loader.types";
import { parseTsConfigPaths } from "./tsconfig";
import { existsSync, statSync } from "node:fs";
import { isAbsolute, normalize, resolve } from "node:path";
import type { Logger } from "@nestjs/common";
import { normalizePathForEsbuild } from "./utils";

export function createPathMappingPlugin(
	projectRoot: string,
	opts: { logger?: Logger; quiet?: boolean } = {},
): ESBuildPlugin {
	const { baseUrl, paths } = parseTsConfigPaths(projectRoot, opts.logger);
	const resolvedBaseUrl = baseUrl ? resolve(projectRoot, baseUrl) : projectRoot;
	const logger = opts.logger;
	const quiet = !!opts.quiet;

	// Also resolve @adk/* aliases from the adk package
	const adkPackagePath = resolve(projectRoot, "packages/adk");
	const adkTsconfigPath = resolve(adkPackagePath, "tsconfig.json");
	let adkPaths: Record<string, string[]> = {};
	if (existsSync(adkTsconfigPath)) {
		const adkConfig = parseTsConfigPaths(adkPackagePath, opts.logger);
		adkPaths = adkConfig.paths || {};
	}

	// Merge paths, prioritizing project root paths
	const mergedPaths = { ...adkPaths, ...paths };

	return {
		name: "typescript-path-mapping",
		setup(build: ESBuildPluginSetup) {
			build.onResolve({ filter: /.*/ }, (args: ESBuildOnResolveArgs) => {
				if (!quiet) {
					logger?.debug(
						`Resolving import: "${args.path}" from "${args.importer || "unknown"}"`,
					);
				}

				// Resolve @adk/* aliases using adk package paths
				if (args.path.startsWith("@adk/")) {
					// Extract the module path after @adk/
					const modulePath = args.path.replace("@adk/", "");
					const adkSrcPath = resolve(adkPackagePath, "src");

					// Try direct resolution first
					const directPath = resolve(adkSrcPath, modulePath);
					const extensions = [".ts", ".js", ".tsx", ".jsx", ""];

					for (const ext of extensions) {
						const pathWithExt = ext ? directPath + ext : directPath;
						if (existsSync(pathWithExt)) {
							try {
								const stat = statSync(pathWithExt);
								// If it's a directory, try index files
								if (stat.isDirectory()) {
									const indexExtensions = [
										"/index.ts",
										"/index.js",
										"/index.tsx",
										"/index.jsx",
									];
									for (const indexExt of indexExtensions) {
										const indexPath = pathWithExt + indexExt;
										if (existsSync(indexPath)) {
											logger?.debug(
												`ADK path mapping resolved (via index): ${args.path} -> ${indexPath}`,
											);
											return {
												path: normalizePathForEsbuild(indexPath),
											};
										}
									}
								} else {
									logger?.debug(
										`ADK path mapping resolved: ${args.path} -> ${pathWithExt}`,
									);
									return { path: normalizePathForEsbuild(pathWithExt) };
								}
							} catch (err) {
								// If stat fails, try as file
								logger?.debug(
									`ADK path mapping resolved (stat failed): ${args.path} -> ${pathWithExt}`,
								);
								return { path: normalizePathForEsbuild(pathWithExt) };
							}
						}
					}

					// Fallback: try with tsconfig paths if direct resolution fails
					if (adkPaths) {
						for (const [alias, mappings] of Object.entries(adkPaths)) {
							const aliasPattern = alias.replace("*", "(.*)");
							const aliasRegex = new RegExp(`^${aliasPattern}$`);
							const match = args.path.match(aliasRegex);

							if (match) {
								for (const mapping of mappings) {
									let resolvedPath = mapping;
									if (match[1] && mapping.includes("*")) {
										resolvedPath = mapping.replace("*", match[1]);
									}
									const fullPath = normalize(
										resolve(adkPackagePath, resolvedPath),
									);
									for (const ext of extensions) {
										const pathWithExt = ext ? fullPath + ext : fullPath;
										if (existsSync(pathWithExt)) {
											try {
												const stat = statSync(pathWithExt);
												if (stat.isDirectory()) {
													const indexExtensions = [
														"/index.ts",
														"/index.js",
														"/index.tsx",
														"/index.jsx",
													];
													for (const indexExt of indexExtensions) {
														const indexPath = pathWithExt + indexExt;
														if (existsSync(indexPath)) {
															logger?.debug(
																`ADK path mapping resolved (via tsconfig + index): ${args.path} -> ${indexPath}`,
															);
															return {
																path: normalizePathForEsbuild(indexPath),
															};
														}
													}
												} else {
													logger?.debug(
														`ADK path mapping resolved (via tsconfig): ${args.path} -> ${pathWithExt}`,
													);
													return { path: normalizePathForEsbuild(pathWithExt) };
												}
											} catch {
												logger?.debug(
													`ADK path mapping resolved (via tsconfig, stat failed): ${args.path} -> ${pathWithExt}`,
												);
												return { path: normalizePathForEsbuild(pathWithExt) };
											}
										}
									}
								}
							}
						}
					}

					// If we get here, log a warning but don't fail - let esbuild handle it
					logger?.warn(
						`Failed to resolve @adk path: ${args.path} (tried ${directPath} and tsconfig paths)`,
					);
				}

				if (
					mergedPaths &&
					!args.path.startsWith(".") &&
					!isAbsolute(args.path)
				) {
					for (const [alias, mappings] of Object.entries(mergedPaths)) {
						const aliasPattern = alias.replace("*", "(.*)");
						const aliasRegex = new RegExp(`^${aliasPattern}$`);
						const match = args.path.match(aliasRegex);

						if (match) {
							for (const mapping of mappings) {
								let resolvedPath = mapping;
								if (match[1] && mapping.includes("*")) {
									resolvedPath = mapping.replace("*", match[1]);
								}
								const fullPath = normalize(
									resolve(resolvedBaseUrl, resolvedPath),
								);
								const extensions = [".ts", ".js", ".tsx", ".jsx", ""];
								for (const ext of extensions) {
									const pathWithExt = ext ? fullPath + ext : fullPath;
									if (existsSync(pathWithExt)) {
										try {
											const stat = statSync(pathWithExt);
											// If it's a directory, try index files
											if (stat.isDirectory()) {
												const indexExtensions = [
													"/index.ts",
													"/index.js",
													"/index.tsx",
													"/index.jsx",
												];
												for (const indexExt of indexExtensions) {
													const indexPath = pathWithExt + indexExt;
													if (existsSync(indexPath)) {
														logger?.debug(
															`Path mapping resolved (via index): ${args.path} -> ${indexPath}`,
														);
														return {
															path: normalizePathForEsbuild(indexPath),
														};
													}
												}
											} else {
												logger?.debug(
													`Path mapping resolved: ${args.path} -> ${pathWithExt}`,
												);
												return { path: normalizePathForEsbuild(pathWithExt) };
											}
										} catch {
											// If stat fails, try as file
											logger?.debug(
												`Path mapping resolved: ${args.path} -> ${pathWithExt}`,
											);
											return { path: normalizePathForEsbuild(pathWithExt) };
										}
									}
								}
							}
						}
					}
				}

				if (args.path === "env" && baseUrl) {
					const envPath = resolve(resolvedBaseUrl, "env");
					const extensions = [".ts", ".js"];
					for (const ext of extensions) {
						const pathWithExt = normalize(envPath + ext);
						if (existsSync(pathWithExt)) {
							logger?.debug(
								`Direct env import resolved: ${args.path} -> ${pathWithExt}`,
							);
							return { path: normalizePathForEsbuild(pathWithExt) };
						}
					}
				}

				if (baseUrl && args.path.startsWith("../")) {
					const relativePath = args.path.replace("../", "");
					const fullPath = resolve(resolvedBaseUrl, relativePath);
					const extensions = [".ts", ".js", ".tsx", ".jsx", ""];
					for (const ext of extensions) {
						const pathWithExt = normalize(ext ? fullPath + ext : fullPath);
						if (existsSync(pathWithExt)) {
							logger?.debug(
								`Relative import resolved via baseUrl: ${args.path} -> ${pathWithExt}`,
							);
							return { path: normalizePathForEsbuild(pathWithExt) };
						}
					}
				}
				return;
			});
		},
	};
}
