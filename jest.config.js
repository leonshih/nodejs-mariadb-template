module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/setupTest.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
};
