import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGetProductsQuery } from '../../api/apiSlice';
import { Product } from '../../types';

const PAGE_SIZE = 10;

const ProductListScreen = () => {
  const [skip, setSkip] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(
    {
      limit: PAGE_SIZE,
      skip,
    },
  );

  React.useEffect(() => {
    if (!data) {
      return;
    }

    setProducts(previousProducts => {
      if (skip === 0) {
        return data.products;
      }

      const existingIds = new Set(previousProducts.map(product => product.id));

      const newProducts = data.products.filter(
        product => !existingIds.has(product.id),
      );

      return [...previousProducts, ...newProducts];
    });
  }, [data, skip]);

  const hasMore = data ? products.length < data.total : true;

  const loadMore = useCallback(() => {
    if (isFetching || !hasMore) {
      return;
    }

    setSkip(previousSkip => previousSkip + PAGE_SIZE);
  }, [isFetching, hasMore]);

  const handleRefresh = useCallback(() => {
    setSkip(0);
    setProducts([]);
    refetch();
  }, [refetch]);

  const renderProduct = ({ item }: { item: Product }) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.thumbnail }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.price}>${item.price}</Text>

          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
      </View>
    );
  };

  if (isLoading && skip === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError && products.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Something went wrong.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProduct}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && skip === 0}
            onRefresh={handleRefresh}
          />
        }
        ListFooterComponent={() => {
          return isFetching && skip > 0 ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null;
        }}
        ListEmptyComponent={() => {
          return !isFetching ? (
            <View style={styles.center}>
              <Text>No products found.</Text>
            </View>
          ) : null;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },

  info: {
    flex: 1,
    marginLeft: 12,
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
    marginTop: 4,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerLoader: {
    marginVertical: 20,
  },
});

export default ProductListScreen;
