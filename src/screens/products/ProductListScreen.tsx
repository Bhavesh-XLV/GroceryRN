import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useGetCategoriesQuery,
  useGetProductsByCategoryQuery,
  useGetProductsQuery,
  useSearchProductsQuery,
} from '../../api/apiSlice';

import useDebounce from '../../hooks/useDebounce';

import { Product, ProductSortBy, SortOrder } from '../../types';

const PAGE_SIZE = 10;

const SORT_OPTIONS: {
  label: string;
  sortBy: ProductSortBy;
  order: SortOrder;
}[] = [
  {
    label: 'Price Low → High',
    sortBy: 'price',
    order: 'asc',
  },
  {
    label: 'Price High → Low',
    sortBy: 'price',
    order: 'desc',
  },
  {
    label: 'Rating High → Low',
    sortBy: 'rating',
    order: 'desc',
  },
  {
    label: 'Rating Low → High',
    sortBy: 'rating',
    order: 'asc',
  },
  {
    label: 'Title A → Z',
    sortBy: 'title',
    order: 'asc',
  },
  {
    label: 'Title Z → A',
    sortBy: 'title',
    order: 'desc',
  },
];

const ProductListScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [skip, setSkip] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [sortBy, setSortBy] = useState<ProductSortBy | undefined>('price');
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>('asc');

  const debouncedSearch = useDebounce(searchText, 500);

  const isSearching = debouncedSearch.trim().length > 0;

  const isCategorySelected = selectedCategory.length > 0;

  /*
   * Search has priority over category.
   */
  const isFiltered = isSearching || isCategorySelected;

  /*
   * Whenever any filter changes, start again from page 1.
   */
  useEffect(() => {
    setSkip(0);
    setProducts([]);
  }, [debouncedSearch, selectedCategory, sortBy, sortOrder]);

  /*
   * Categories
   */
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  /*
   * Normal products
   */
  const {
    data: productData,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useGetProductsQuery(
    {
      limit: PAGE_SIZE,
      skip,
      sortBy,
      order: sortOrder,
    },
    {
      skip: isFiltered,
    },
  );

  /*
   * Search
   */
  const {
    data: searchData,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    isError: isSearchError,
  } = useSearchProductsQuery(
    {
      query: debouncedSearch,
      limit: PAGE_SIZE,
      skip,
      sortBy,
      order: sortOrder,
    },
    {
      skip: !isSearching,
    },
  );

  /*
   * Category
   */
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    isFetching: isCategoryFetching,
    isError: isCategoryError,
  } = useGetProductsByCategoryQuery(
    {
      category: selectedCategory,
      limit: PAGE_SIZE,
      skip,
      sortBy,
      order: sortOrder,
    },
    {
      skip: !isCategorySelected || isSearching,
    },
  );

  /*
   * Determine which API response is currently active.
   */
  const activeData = useMemo(() => {
    if (isSearching) {
      return searchData;
    }

    if (isCategorySelected) {
      return categoryData;
    }

    return productData;
  }, [isSearching, isCategorySelected, searchData, categoryData, productData]);

  /*
   * Determine active loading state.
   */
  const isActiveFetching = isSearching
    ? isSearchFetching
    : isCategorySelected
    ? isCategoryFetching
    : isProductsFetching;

  /*
   * Determine active initial loading state.
   */
  const isActiveLoading = isSearching
    ? isSearchLoading
    : isCategorySelected
    ? isCategoryLoading
    : isProductsLoading;

  /*
   * Determine active error state.
   */
  const isActiveError = isSearching
    ? isSearchError
    : isCategorySelected
    ? isCategoryError
    : isProductsError;

  /*
   * Add new API page to our local list.
   */
  useEffect(() => {
    if (!activeData) {
      return;
    }

    setProducts(previousProducts => {
      /*
       * First page replaces the current list.
       */
      if (skip === 0) {
        return activeData.products;
      }

      /*
       * Later pages are appended.
       *
       * Set prevents duplicate products.
       */
      const existingIds = new Set(previousProducts.map(product => product.id));

      const newProducts = activeData.products.filter(
        product => !existingIds.has(product.id),
      );

      return [...previousProducts, ...newProducts];
    });
  }, [activeData, skip]);

  /*
   * Pagination.
   */
  const hasMore = activeData ? products.length < activeData.total : false;

  const loadMore = useCallback(() => {
    if (isActiveFetching || !hasMore) {
      return;
    }

    setSkip(previousSkip => previousSkip + PAGE_SIZE);
  }, [isActiveFetching, hasMore]);

  /*
   * Pull to refresh.
   */
  const handleRefresh = useCallback(() => {
    setSkip(0);
    setProducts([]);

    if (isSearching || isCategorySelected) {
      return;
    }

    refetchProducts();
  }, [isSearching, isCategorySelected, refetchProducts]);

  /*
   * Category selection.
   */

  const categoryOptions = useMemo(
    () => [
      {
        slug: '',

        name: 'All',
      },

      ...categories,
    ],

    [categories],
  );

  const handleCategoryPress = useCallback(
    (category: string) => {
      if (selectedCategory === category) {
        setSelectedCategory('');
      } else {
        setSelectedCategory(category);
      }

      setSkip(0);
      setProducts([]);
    },
    [selectedCategory],
  );

  /*
   * Sorting.
   */
  const handleSortPress = useCallback(
    (newSortBy: ProductSortBy, newSortOrder: SortOrder) => {
      const isSameSort = sortBy === newSortBy && sortOrder === newSortOrder;

      if (isSameSort) {
        // Reset sorting
        setSortBy(undefined);
        setSortOrder(undefined);
      } else {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
      }

      setSkip(0);
      setProducts([]);
    },
    [sortBy, sortOrder],
  );

  /*
   * Product renderer.
   */
  const renderProduct = ({ item }: { item: Product }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ProductDetail', {
            productId: item.id,
          })
        }
      >
        <Image source={{ uri: item.thumbnail }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.price}>${item.price}</Text>

          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /*
   * Initial loading.
   */
  if (isActiveLoading && skip === 0 && products.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /*
   * Error.
   */
  if (isActiveError && products.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Something went wrong. Please try again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search products..."
        style={styles.searchInput}
        returnKeyType="search"
      />
      <View>
        {/* Categories */}
        {!isCategoriesLoading && (
          <FlatList
            horizontal
            data={categoryOptions}
            keyExtractor={item => item.slug}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => {
              const selected = selectedCategory === item.slug;

              return (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selected && styles.selectedCategoryChip,
                  ]}
                  onPress={() => handleCategoryPress(item.slug)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selected && styles.selectedCategoryText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Sorting */}
        <FlatList
          horizontal
          data={SORT_OPTIONS}
          keyExtractor={item => item.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => {
            const selected = sortBy === item.sortBy && sortOrder === item.order;

            return (
              <TouchableOpacity
                style={[styles.sortChip, selected && styles.selectedSortChip]}
                onPress={() => handleSortPress(item.sortBy, item.order)}
              >
                <Text
                  style={[styles.sortText, selected && styles.selectedSortText]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Search loading */}
      {isSearching && isSearchFetching && products.length === 0 && (
        <ActivityIndicator style={styles.searchLoader} />
      )}

      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProduct}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isActiveFetching && skip === 0 && products.length > 0}
            onRefresh={handleRefresh}
          />
        }
        ListFooterComponent={() => {
          return isActiveFetching && skip > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" />
            </View>
          ) : null;
        }}
        ListEmptyComponent={() => {
          return !isActiveFetching ? (
            <View style={styles.emptyContainer}>
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

  searchInput: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },

  horizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 40,
    marginBottom: 14,
  },

  selectedCategoryChip: {
    backgroundColor: '#222',
    borderColor: '#222',
  },

  categoryText: {
    fontSize: 13,
  },

  selectedCategoryText: {
    color: '#fff',
  },

  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 40,
  },

  selectedSortChip: {
    backgroundColor: '#222',
    borderColor: '#222',
  },

  sortText: {
    fontSize: 13,
  },

  selectedSortText: {
    color: '#fff',
  },

  searchLoader: {
    marginVertical: 8,
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

  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  footerLoader: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductListScreen;
