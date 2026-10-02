import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

import { useGetProductByIdQuery } from '../../api/apiSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { toggleFavorite } from '../../store/favoriteSlice';

import {
  addToCart,
  decreaseQuantity,
  increaseQuantity,
} from '../../store/cartSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen = ({ route }: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const { productId } = route.params;

  const {
    data: product,
    isLoading,
    isError,
  } = useGetProductByIdQuery(productId);

  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find(item => item.product.id === product?.id),
  );

  const isFavorite = useSelector((state: RootState) =>
    state.favorites.items.some(item => item.id === product?.id),
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={styles.center}>
        <Text>Unable to load product.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: product.thumbnail }} style={styles.image} />

      <Text style={styles.title}>{product.title}</Text>

      <TouchableOpacity
        onPress={() => {
          if (product) {
            console.log('product', product);
            dispatch(toggleFavorite(product));
          }
        }}
        style={styles.favoriteButton}
      >
        <Text style={styles.favoriteText}>{isFavorite ? '♥' : '♡'}</Text>
      </TouchableOpacity>

      <Text style={styles.price}>${product.price}</Text>

      <Text style={styles.discount}>{product.discountPercentage}% OFF</Text>

      <Text style={styles.rating}>⭐ {product.rating}</Text>

      <Text style={styles.description}>{product.description}</Text>

      {cartItem ? (
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => dispatch(decreaseQuantity(product.id))}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.quantityText}>{cartItem.quantity}</Text>

          <TouchableOpacity
            onPress={() => dispatch(increaseQuantity(product.id))}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => dispatch(addToCart(product))}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },

  price: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },

  discount: {
    marginTop: 8,
    fontSize: 16,
  },

  rating: {
    marginTop: 8,
    fontSize: 16,
  },

  description: {
    marginTop: 20,
    fontSize: 16,
    lineHeight: 24,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },

  favoriteText: {
    fontSize: 30,
  },
  quantityContainer: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButton: {
    width: 45,
    height: 45,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },

  quantityButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },

  quantityText: {
    minWidth: 50,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },

  addToCartButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#000',
  },

  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProductDetailScreen;
