import { createDefaultPreset, pathsToModuleNameMapper } from "ts-jest";
import tsconfig from './tsconfig.json' with { type: 'json' };

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export const preset = 'ts-jest';
export const testEnvironment = "node";
export const transform = {
  ...tsJestTransformCfg,
};
export const moduleNameMapper = pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' });