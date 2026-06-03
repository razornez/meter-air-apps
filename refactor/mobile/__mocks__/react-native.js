// Mock react-native untuk unit test pure (tidak butuh runtime native).
module.exports = {
  Platform: { OS: 'ios', select: (obj) => obj.ios ?? obj.default },
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },
  StyleSheet: { create: (s) => s },
  Alert: { alert: jest.fn() },
};
