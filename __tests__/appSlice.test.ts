import appReducer from '../src/store/appSlice';

describe('appSlice', () => {
  it('returns the initial state', () => {
    const state = appReducer(undefined, { type: 'unknown' });

    expect(state).toEqual({
      initialized: false,
    });
  });
});
