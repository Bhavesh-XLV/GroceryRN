import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../../store';
import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from '../../store/cartSlice';

import { calculateCartSummary } from '../../utils/cartCalculations';
import { createOrder } from '../../store/orderSlice';

const CartScreen = () => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(
    undefined,
  );

  const dispatch = useDispatch<AppDispatch>();

  const cartItems = useSelector((state: RootState) => state.cart.items);

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptyText}>Add some products to your cart.</Text>
      </View>
    );
  }
  const summary = calculateCartSummary(cartItems, appliedCoupon);

  const handlePlaceOrder = async () => {
    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      items: cartItems,
      total: summary.total,
      status: 'processing' as const,
    };

    await dispatch(createOrder(order)).unwrap();

    dispatch(clearCart());
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.product.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.product.thumbnail }}
              style={styles.image}
            />

            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>
                {item.product.title}
              </Text>

              <Text style={styles.price}>${item.product.price}</Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => dispatch(decreaseQuantity(item.product.id))}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.quantity}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => dispatch(increaseQuantity(item.product.id))}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => dispatch(removeFromCart(item.product.id))}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.couponContainer}>
        <TextInput
          value={couponCode}
          onChangeText={setCouponCode}
          placeholder="Enter coupon code"
          autoCapitalize="characters"
          style={styles.couponInput}
        />

        <TouchableOpacity
          style={styles.couponButton}
          onPress={() => {
            if (couponCode.trim().toUpperCase() === 'SAVE10') {
              setAppliedCoupon('SAVE10');
            } else {
              setAppliedCoupon(undefined);
            }
          }}
        >
          <Text style={styles.couponButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>${summary.subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text>Discount</Text>
          <Text>-${summary.discount.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text>Tax</Text>
          <Text>${summary.tax.toFixed(2)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${summary.total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  summary: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },

  placeOrderButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#000',
  },

  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },

  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    padding: 16,
  },

  card: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },

  image: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
  },

  couponContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  couponInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
  },

  couponButton: {
    marginLeft: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },

  couponButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: '#000',
  },

  quantityButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  quantity: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },

  removeButton: {
    justifyContent: 'center',
    paddingLeft: 8,
  },

  removeText: {
    fontSize: 12,
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
  },
});

export default CartScreen;
