import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGetProductByIdQuery } from '../../api/apiSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen = ({ route }: Props) => {
  const { productId } = route.params;

  const {
    data: product,
    isLoading,
    isError,
  } = useGetProductByIdQuery(productId);

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

      <Text style={styles.price}>${product.price}</Text>

      <Text style={styles.discount}>{product.discountPercentage}% OFF</Text>

      <Text style={styles.rating}>⭐ {product.rating}</Text>

      <Text style={styles.description}>{product.description}</Text>
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
});

export default ProductDetailScreen;
