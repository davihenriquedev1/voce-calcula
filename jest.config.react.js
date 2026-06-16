// jest.config.react.js
import nextJest from 'next/jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import tsconfig from './tsconfig.json' with { type: 'json' };

const createJestConfig = nextJest({
  dir: './', // caminho do app Next.js
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' }),
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // suporte TS
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};

export default createJestConfig(customJestConfig);
