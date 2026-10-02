import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { getOrderStatus } from '../../utils/orderStatus';

const OrdersScreen = () => {
  const orders = useSelector((state: RootState) => state.orders.items);

  const ordersWithStatus = useMemo(
    () =>
      orders.map(order => ({
        ...order,
        status: getOrderStatus(order.date),
      })),
    [orders],
  );

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptyText}>
          Your placed orders will appear here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={ordersWithStatus}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.orderId}>{item.id}</Text>

            <Text
              style={[
                styles.status,
                item.status === 'completed'
                  ? styles.completed
                  : styles.processing,
              ]}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.date}>
            {new Date(item.date).toLocaleString()}
          </Text>

          <View style={styles.itemsContainer}>
            {item.items.map(cartItem => (
              <View key={cartItem.product.id} style={styles.itemRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {cartItem.product.title}
                </Text>

                <Text style={styles.quantity}>× {cartItem.quantity}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>${item?.total?.toFixed(2)}</Text>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },

  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  orderId: {
    fontSize: 16,
    fontWeight: '700',
  },

  status: {
    fontSize: 12,
    fontWeight: '700',
  },

  processing: {
    color: '#d97706',
  },

  completed: {
    color: '#16a34a',
  },

  date: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },

  itemsContainer: {
    marginTop: 14,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  itemTitle: {
    flex: 1,
    marginRight: 10,
  },

  quantity: {
    fontWeight: '600',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },

  totalLabel: {
    fontWeight: '700',
  },

  total: {
    fontSize: 16,
    fontWeight: '700',
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
    color: '#666',
    textAlign: 'center',
  },
});

export default OrdersScreen;
