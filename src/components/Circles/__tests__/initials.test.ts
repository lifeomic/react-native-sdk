import { initials } from '../initials';

describe('initials', () => {
  it('should calculate the correct initials', () => {
    expect(initials()).toEqual('');
    expect(initials('')).toEqual('');
    expect(initials('tom')).toEqual('T');
    expect(initials('    tom')).toEqual('T');
    expect(initials('Bruce wayne')).toEqual('BW');
    expect(initials('Bruce wayne     ')).toEqual('BW');
    expect(initials('Dwayne "The Rock" Johnson')).toEqual('DJ');
  });
});
