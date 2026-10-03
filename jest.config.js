module.exports = {
  preset: '@react-native/jest-preset',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  transformIgnorePatterns: [
    'node_modules/(?!((@)?react-native|@react-native|@reduxjs|immer)/)',
  ],

  moduleNameMapper: {
    '^react-native-config$': '<rootDir>/__mocks__/react-native-config.js',

    '^react-native-gesture-handler$':
      '<rootDir>/__mocks__/react-native-gesture-handler.js',
  },
};
