import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import LoginScreen from '../src/screens/auth/LoginScreen';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(selector =>
    selector({
      auth: {
        loading: false,
        error: null,
      },
    }),
  ),
}));

jest.mock('../src/hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#111111',
      secondaryText: '#666666',
      border: '#DDDDDD',
      primary: '#007AFF',
      card: '#FFFFFF',
      danger: '#D32F2F',
    },
  }),
}));

jest.mock('../src/store/authSlice', () => ({
  loginUser: jest.fn(payload => ({
    type: 'auth/loginUser',
    payload,
  })),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form', async () => {
    await render(<LoginScreen />);

    expect(screen.getByText('Grocery App')).toBeTruthy();
    expect(screen.getByPlaceholderText('Username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Login')).toBeTruthy();
  });

  it('shows validation errors when fields are empty', async () => {
    await render(<LoginScreen />);

    await fireEvent.press(screen.getByText('Login'));

    expect(screen.getByText('Username is required')).toBeTruthy();
    expect(screen.getByText('Password is required')).toBeTruthy();

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('dispatches login with valid credentials', async () => {
    await render(<LoginScreen />);

    await fireEvent.changeText(
      screen.getByPlaceholderText('Username'),
      'emilys',
    );

    await fireEvent.changeText(
      screen.getByPlaceholderText('Password'),
      'emilyspass',
    );

    await fireEvent.press(screen.getByText('Login'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'auth/loginUser',
      payload: {
        username: 'emilys',
        password: 'emilyspass',
        expiresInMins: 1,
      },
    });
  });
});
