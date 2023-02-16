export const useNavigation = jest.fn().mockReturnValue({
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(),
  addListener: jest.fn(),
});
