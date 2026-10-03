import { useSelector } from 'react-redux';

import { useAppTheme } from '../src/hooks/useAppTheme';
import { darkTheme, lightTheme } from '../src/constants/theme';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('useAppTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns light theme when Redux mode is light', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue('light');

    const result = useAppTheme();

    expect(result.mode).toBe('light');
    expect(result.colors).toEqual(lightTheme);
  });

  it('returns dark theme when Redux mode is dark', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue('dark');

    const result = useAppTheme();

    expect(result.mode).toBe('dark');
    expect(result.colors).toEqual(darkTheme);
  });

  it('uses useSelector to get the theme mode', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue('light');

    useAppTheme();

    expect(useSelector).toHaveBeenCalledTimes(1);
    expect(useSelector).toHaveBeenCalledWith(expect.any(Function));
  });
});
