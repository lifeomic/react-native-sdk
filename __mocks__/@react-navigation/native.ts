export const useNavigation = jest.fn().mockReturnValue({
  navigate: jest.fn(),
  reset: jest.fn(),
  canGoBack: jest.fn().mockReturnValue(true),
  goBack: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(),
  addListener: jest.fn(),
});
