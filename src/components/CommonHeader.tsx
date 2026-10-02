import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';

interface CommonHeaderProps {
  title: string;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
}

const CommonHeader = ({
  title,
  showBack = false,
  rightComponent,
}: CommonHeaderProps) => {
  const navigation = useNavigation();
  const { colors } = useAppTheme();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.text }]}>‹</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
  },

  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },

  rightContainer: {
    marginLeft: 12,
  },
});

export default CommonHeader;
