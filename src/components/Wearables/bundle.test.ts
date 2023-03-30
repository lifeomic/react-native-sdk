import { NativeWeb } from './bundle';

describe('the index file', () => {
  test('that it has the correct exports', () => {
    expect(NativeWeb).toBeDefined();
  });
});
