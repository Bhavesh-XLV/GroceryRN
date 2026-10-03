import React, { useCallback, useEffect, useMemo, useState } from 'react';

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

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useNavigation } from '@react-navigation/native';

import {
  useGetCategoriesQuery,
  useGetProductsByCategoryQuery,
  useGetProductsQuery,
  useSearchProductsQuery,
} from '../../api/apiSlice';

import useDebounce from '../../hooks/useDebounce';
import { useAppTheme } from '../../hooks/useAppTheme';

import { RootStackParamList } from '../../navigation/AppNavigator';

import { AppDispatch, RootState } from '../../store';

import {
  addToCart,
  decreaseQuantity,
  increaseQuantity,
} from '../../store/cartSlice';

import { toggleFavorite } from '../../store/favoriteSlice';

import { Product, ProductSortBy, SortOrder } from '../../types';

import { useDispatch, useSelector } from 'react-redux';
import {
  getProductsCache,
  mergeProductsCache,
} from '../../storage/productStorage';
import useNetworkStatus from '../../hooks/useNetworkStatus';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

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
  const { isConnected } = useNetworkStatus();
  const dispatch = useDispatch<AppDispatch>();

  const { colors } = useAppTheme();

  const [skip, setSkip] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [sortBy, setSortBy] = useState<ProductSortBy | undefined>('price');

  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>('asc');
  const [isFilterChanging, setIsFilterChanging] = useState(false);
  const [cachedProducts, setCachedProducts] = useState<Product[]>([]);
  const [isCacheLoading, setIsCacheLoading] = useState(false);

  const debouncedSearch = useDebounce(searchText, 500);

  const isSearching = debouncedSearch.trim().length > 0;

  const isCategorySelected = selectedCategory.length > 0;

  const isFiltered = isSearching || isCategorySelected;

  const favorites = useSelector((state: RootState) => state.favorites.items);

  const cartItems = useSelector((state: RootState) => state.cart.items);

  /*
   * Whenever any filter changes,
   * start again from page 1.
   */
  useEffect(() => {
    setIsFilterChanging(true);
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
   * Determine which API response
   * is currently active.
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
   * Determine active fetching state.
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

    const updateProducts = async () => {
      setProducts(previousProducts => {
        if (skip === 0) {
          return activeData.products;
        }

        const existingIds = new Set(
          previousProducts.map(product => product.id),
        );

        const newProducts = activeData.products.filter(
          product => !existingIds.has(product.id),
        );

        return [...previousProducts, ...newProducts];
      });
      setIsFilterChanging(false);

      await mergeProductsCache(activeData.products);
    };

    updateProducts();
  }, [activeData, skip]);

  useEffect(() => {
    if (isConnected) {
      return;
    }

    const loadCachedProducts = async () => {
      setIsCacheLoading(true);

      const cache = await getProductsCache();

      if (cache) {
        setCachedProducts(cache.products);
      } else {
        setCachedProducts([]);
      }

      setIsCacheLoading(false);
    };

    loadCachedProducts();
  }, [isConnected]);

  const offlineProducts = useMemo(() => {
    if (isConnected) {
      return [];
    }

    let result = [...cachedProducts];

    if (debouncedSearch.trim()) {
      const searchQuery = debouncedSearch.trim().toLowerCase();

      result = result.filter(product =>
        product.title.toLowerCase().includes(searchQuery),
      );
    }

    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }

    if (sortBy && sortOrder) {
      result.sort((first, second) => {
        if (sortBy === 'price') {
          return sortOrder === 'asc'
            ? first.price - second.price
            : second.price - first.price;
        }

        if (sortBy === 'rating') {
          return sortOrder === 'asc'
            ? first.rating - second.rating
            : second.rating - first.rating;
        }

        return sortOrder === 'asc'
          ? first.title.localeCompare(second.title)
          : second.title.localeCompare(first.title);
      });
    }

    return result;
  }, [
    isConnected,
    cachedProducts,
    debouncedSearch,
    selectedCategory,
    sortBy,
    sortOrder,
  ]);

  /*
   * Pagination.
   */
  const hasMore = activeData ? products.length < activeData.total : false;

  const loadMore = useCallback(() => {
    if (!isConnected || isActiveFetching || !hasMore) {
      return;
    }

    setSkip(previousSkip => previousSkip + PAGE_SIZE);
  }, [isConnected, isActiveFetching, hasMore]);

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

  const displayedProducts = isConnected ? products : offlineProducts;

  const renderProduct = ({ item }: { item: Product }) => {
    const cartItem = cartItems.find(
      cartItem => cartItem.product.id === item.id,
    );

    const isFavorite = favorites.some(favorite => favorite.id === item.id);

    return (
      <View style={styles.productWrapper}>
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
            },
          ]}
          onPress={() =>
            navigation.navigate('ProductDetail', {
              productId: item.id,
            })
          }
        >
          <Image
            source={{
              uri: item.thumbnail,
            }}
            style={styles.image}
          />

          <View style={styles.info}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                },
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <Text
              style={[
                styles.price,
                {
                  color: colors.text,
                },
              ]}
            >
              ${item.price}
            </Text>

            <Text
              style={[
                styles.rating,
                {
                  color: colors.text,
                },
              ]}
            >
              ⭐ {item.rating}
            </Text>

            {cartItem ? (
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => dispatch(decreaseQuantity(item.id))}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>

                <Text
                  style={[
                    styles.quantityText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {cartItem.quantity}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => dispatch(increaseQuantity(item.id))}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => dispatch(addToCart(item))}
              >
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => dispatch(toggleFavorite(item))}
          style={styles.favoriteButton}
        >
          <Text
            style={[
              styles.favoriteText,
              {
                color: colors.danger,
              },
            ]}
          >
            {isFavorite ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /*
   * Initial loading.
   */
  if (isConnected && isActiveLoading && skip === 0 && products.length === 0) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  /*
   * Error.
   */
  if (isConnected && isActiveError && products.length === 0) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text
          style={{
            color: colors.text,
          }}
        >
          Something went wrong. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Search */}
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search products..."
        placeholderTextColor={colors.secondaryText}
        style={[
          styles.searchInput,
          {
            color: colors.text,
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
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
                    {
                      borderColor: colors.border,
                    },
                    selected && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => handleCategoryPress(item.slug)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: colors.text,
                      },
                      selected && {
                        color: '#fff',
                      },
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
                style={[
                  styles.sortChip,
                  {
                    borderColor: colors.border,
                  },
                  selected && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSortPress(item.sortBy, item.order)}
              >
                <Text
                  style={[
                    styles.sortText,
                    {
                      color: colors.text,
                    },
                    selected && {
                      color: '#fff',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Search loading */}
      {/* {isConnected &&
        isSearching &&
        isSearchFetching &&
        products.length === 0 && (
          <ActivityIndicator
            style={styles.searchLoader}
            color={colors.primary}
          />
        )} */}

      <FlatList
        data={displayedProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProduct}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isActiveFetching && skip === 0 && products.length > 0}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={() => {
          return isActiveFetching && skip > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null;
        }}
        ListEmptyComponent={() => {
          if (isCacheLoading || isFilterChanging || isActiveFetching) {
            return (
              <View style={styles.emptyContainer}>
                <ActivityIndicator color={colors.primary} />
              </View>
            );
          }

          if (!isConnected) {
            return (
              <View style={styles.emptyContainer}>
                <Text
                  style={[styles.emptyText, { color: colors.secondaryText }]}
                >
                  No cached products available.
                </Text>

                <Text
                  style={[styles.emptySubText, { color: colors.secondaryText }]}
                >
                  Connect to the internet to load products.
                </Text>
              </View>
            );
          }

          return (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No products found.
              </Text>
            </View>
          );
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
    height: 40,
    marginBottom: 14,
  },

  categoryText: {
    fontSize: 13,
  },

  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
  },

  sortText: {
    fontSize: 13,
  },

  searchLoader: {
    marginVertical: 8,
  },

  productWrapper: {
    position: 'relative',
  },

  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 10,
  },

  favoriteButton: {
    position: 'absolute',
    right: 30,
    top: 12,
  },

  favoriteText: {
    fontSize: 24,
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

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  quantityText: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },

  addToCartButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },

  emptySubText: {
    marginTop: 6,
    fontSize: 13,
  },
});

export default ProductListScreen;
