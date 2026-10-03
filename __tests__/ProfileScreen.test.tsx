import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import { getProfile } from '../src/api/profileApi';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { useDispatch } from 'react-redux';
import ProfileScreen from '../src/screens/profile/ProfileScreen';

jest.mock('../src/api/profileApi', () => ({
  getProfile: jest.fn(),
}));

jest.mock('../src/hooks/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../src/components/CommonHeader', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return ({ title }: { title: string }) => <Text>{title}</Text>;
});

jest.mock('../src/store/authSlice', () => ({
  logoutUser: jest.fn(() => ({
    type: 'auth/logoutUser',
  })),
}));

jest.mock('../src/store/themeSlice', () => ({
  setTheme: jest.fn((mode: string) => ({
    type: 'theme/setTheme',
    payload: mode,
  })),
  saveTheme: jest.fn((mode: string) => ({
    type: 'theme/saveTheme',
    payload: mode,
  })),
}));

const mockedGetProfile = getProfile as jest.Mock;
const mockedUseAppTheme = useAppTheme as jest.Mock;
const mockedUseDispatch = useDispatch as unknown as jest.Mock;

describe('ProfileScreen', () => {
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseDispatch.mockReturnValue(dispatchMock);

    mockedUseAppTheme.mockReturnValue({
      mode: 'light',
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
    });
  });

  it('shows loading state initially', async () => {
    mockedGetProfile.mockReturnValue(new Promise(() => {}));

    const { getByText } = await render(<ProfileScreen />);

    expect(getByText('Loading profile...')).toBeTruthy();
  });

  it('renders profile data after successful API response', async () => {
    mockedGetProfile.mockResolvedValue({
      id: 1,
      username: 'emilys',
      email: 'emily@example.com',
      firstName: 'Emily',
      lastName: 'Johnson',
      image: 'https://example.com/image.jpg',
    });

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Emily Johnson')).toBeTruthy();
    });

    expect(screen.getByText('emilys')).toBeTruthy();
    expect(screen.getByText('emily@example.com')).toBeTruthy();
    expect(screen.getByText('OFF')).toBeTruthy();
  });

  it('shows error state when profile API fails', async () => {
    mockedGetProfile.mockRejectedValue(new Error('Network error'));

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load profile.')).toBeTruthy();
    });

    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('retries loading profile when Retry is pressed', async () => {
    mockedGetProfile
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        id: 1,
        username: 'emilys',
        email: 'emily@example.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        image: 'https://example.com/image.jpg',
      });

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Retry'));

    await waitFor(() => {
      expect(screen.getByText('Emily Johnson')).toBeTruthy();
    });

    expect(mockedGetProfile).toHaveBeenCalledTimes(2);
  });

  it('toggles theme from light to dark', async () => {
    mockedGetProfile.mockResolvedValue({
      id: 1,
      username: 'emilys',
      email: 'emily@example.com',
      firstName: 'Emily',
      lastName: 'Johnson',
      image: 'https://example.com/image.jpg',
    });

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('OFF')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('OFF'));

    expect(dispatchMock).toHaveBeenCalledTimes(2);
  });

  it('dispatches logout when Logout is pressed', async () => {
    mockedGetProfile.mockResolvedValue({
      id: 1,
      username: 'emilys',
      email: 'emily@example.com',
      firstName: 'Emily',
      lastName: 'Johnson',
      image: 'https://example.com/image.jpg',
    });

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Logout'));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });
});
