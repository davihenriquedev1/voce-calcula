import { createDefaultPreset, pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from './tsconfig';

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export const preset = 'ts-jest';
export const testEnvironment = "node";
export const transform = {
  ...tsJestTransformCfg,
};
export const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' });