// Runs before each test file. Reanimated and Worklets have no native modules under Jest, so use
// the mock Worklets ships (its recommended testing approach) and Reanimated's test setup.
const { jest } = require('@jest/globals');

jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));

require('react-native-reanimated').setUpTests();

// AsyncStorage has no native module under Jest: use the in-memory mock the package ships.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
