import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppTheme } from '../../hooks/useAppTheme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { AppDispatch, RootState } from '../../store';
import { removeFavorite } from '../../store/favoriteSlice';

import { useDispatch, useSelector } from 'react-redux';

const FavoritesScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const dispatch = useDispatch<AppDispatch>();
  const favorites = useSelector((state: RootState) => state.favorites.items);

  const { colors } = useAppTheme();

  if (favorites.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No Favorites Yet
        </Text>

        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
          Products you favorite will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                productId: item.id,
              })
            }
          >
            <Image source={{ uri: item.thumbnail }} style={styles.image} />

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => dispatch(removeFavorite(item.id))}
            >
              <Text style={[styles.removeText, { color: colors.danger }]}>
                ♥
              </Text>
            </TouchableOpacity>

            <View style={styles.info}>
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <Text style={[styles.price, { color: colors.text }]}>
                ${item.price}
              </Text>

              <Text style={[styles.rating, { color: colors.text }]}>
                ⭐ {item.rating}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  list: {
    padding: 16,
  },

  card: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
  },

  image: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },

  removeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },

  removeText: {
    fontSize: 24,
  },

  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
  },

  price: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
  },

  rating: {
    marginTop: 6,
    fontSize: 14,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  emptyText: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default FavoritesScreen;
