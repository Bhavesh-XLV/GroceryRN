import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import { useGetProductByIdQuery } from '../../api/apiSlice';
import { useAppTheme } from '../../hooks/useAppTheme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Product } from '../../types';
import { AppDispatch, RootState } from '../../store';
import {
  addToCart,
  decreaseQuantity,
  increaseQuantity,
} from '../../store/cartSlice';
import { toggleFavorite } from '../../store/favoriteSlice';
import { getCachedProduct } from '../../storage/productStorage';
import useNetworkStatus from '../../hooks/useNetworkStatus';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen = ({ route }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useAppTheme();
  const { isConnected } = useNetworkStatus();
  const [cachedProduct, setCachedProduct] = useState<Product | null>(null);
  const [isCacheLoading, setIsCacheLoading] = useState(false);

  const { productId } = route.params;

  const {
    data: apiProduct,
    isLoading,
    isError,
  } = useGetProductByIdQuery(productId, {
    skip: !isConnected,
  });

  const product = isConnected ? apiProduct : cachedProduct;

  useEffect(() => {
    if (isConnected) {
      return;
    }
    const loadCachedProduct = async () => {
      setIsCacheLoading(true);
      const product = await getCachedProduct(productId);
      setCachedProduct(product);
      setIsCacheLoading(false);
    };
    loadCachedProduct();
  }, [isConnected, productId]);

  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find(item => item.product.id === product?.id),
  );

  const isFavorite = useSelector((state: RootState) =>
    state.favorites.items.some(item => item.id === product?.id),
  );

  if (isCacheLoading || (isConnected && isLoading)) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator
          testID="product-detail-loader"
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  if (!product || (isConnected && isError)) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Unable to load product.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Image source={{ uri: product.thumbnail }} style={styles.image} />

      <Text style={[styles.title, { color: colors.text }]}>
        {product.title}
      </Text>

      <TouchableOpacity
        onPress={() => {
          dispatch(toggleFavorite(product));
        }}
        style={styles.favoriteButton}
      >
        <Text style={[styles.favoriteText, { color: colors.danger }]}>
          {isFavorite ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.price, { color: colors.text }]}>
        ${product.price}
      </Text>

      <Text style={[styles.discount, { color: colors.primary }]}>
        {product.discountPercentage}% OFF
      </Text>

      <Text style={[styles.rating, { color: colors.text }]}>
        ⭐ {product.rating}
      </Text>

      <Text style={[styles.description, { color: colors.secondaryText }]}>
        {product.description}
      </Text>

      {cartItem ? (
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => dispatch(decreaseQuantity(product.id))}
            style={[styles.quantityButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>

          <Text style={[styles.quantityText, { color: colors.text }]}>
            {cartItem.quantity}
          </Text>

          <TouchableOpacity
            onPress={() => dispatch(increaseQuantity(product.id))}
            style={[styles.quantityButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
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
    fontWeight: '600',
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
  },

  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProductDetailScreen;
