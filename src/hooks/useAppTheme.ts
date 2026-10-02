import { useSelector } from 'react-redux';

import { RootState } from '../store';
import { darkTheme, lightTheme } from '../constants/theme';

export const useAppTheme = () => {
  const mode = useSelector((state: RootState) => state.theme.mode);

  return {
    mode,
    colors: mode === 'dark' ? darkTheme : lightTheme,
  };
};
