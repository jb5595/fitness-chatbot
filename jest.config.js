const { defaults } = require('jest-config');
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testPathIgnorePatterns: ['test-utils.spec.ts'],
	moduleFileExtensions: [...defaults.moduleFileExtensions, '.d.ts'],
	testTimeout: 30000,
	roots: ['<rootDir>'],
	modulePaths: [compilerOptions.baseUrl], // <-- This will be set to 'baseUrl' value
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths /*, { prefix: '<rootDir>/' } */),
};