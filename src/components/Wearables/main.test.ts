import { SwitchRow, WearableRow, WearablesView } from '../src/main';

describe('the index file', () => {
  test('has the correct exports', () => {
    expect(SwitchRow).toBeDefined();
    expect(WearableRow).toBeDefined();
    expect(WearablesView).toBeDefined();
  });
});
