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

import { useAppTheme } from '../../hooks/useAppTheme';
import { AppDispatch, RootState } from '../../store';
import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from '../../store/cartSlice';
import { createOrder } from '../../store/orderSlice';
import { calculateCartSummary } from '../../utils/cartCalculations';

const CartScreen = () => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(
    undefined,
  );

  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useAppTheme();

  const cartItems = useSelector((state: RootState) => state.cart.items);

  if (cartItems.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Your Cart is Empty
        </Text>

        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
          Add some products to your cart.
        </Text>
      </View>
    );
  }
  const summary = calculateCartSummary(cartItems, appliedCoupon);

  const handlePlaceOrder = async () => {
    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      items: cartItems,
      subtotal: summary.subtotal,
      discountPercentage: appliedCoupon === 'SAVE10' ? 10 : 0,
      discount: summary.discount,
      tax: summary.tax,
      total: summary.total,
      status: 'processing' as const,
    };

    await dispatch(createOrder(order)).unwrap();

    dispatch(clearCart());
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'SAVE10') {
      setAppliedCoupon('SAVE10');
    } else {
      setAppliedCoupon(undefined);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.product.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Image
              source={{ uri: item.product.thumbnail }}
              style={styles.image}
            />

            <View style={styles.info}>
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.product.title}
              </Text>

              <Text style={[styles.price, { color: colors.text }]}>
                ${item.product.price}
              </Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => dispatch(decreaseQuantity(item.product.id))}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>

                <Text style={[styles.quantity, { color: colors.text }]}>
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    { backgroundColor: colors.primary },
                  ]}
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
              <Text style={[styles.removeText, { color: colors.danger }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.couponContainer}>
        <TextInput
          value={couponCode}
          onChangeText={setCouponCode}
          placeholder="Enter coupon code"
          placeholderTextColor={colors.secondaryText}
          autoCapitalize="characters"
          style={[
            styles.couponInput,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
        />

        <TouchableOpacity
          style={[styles.couponButton, { backgroundColor: colors.primary }]}
          onPress={handleApplyCoupon}
        >
          <Text style={styles.couponButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.summary, { borderTopColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <Text style={{ color: colors.secondaryText }}>Subtotal</Text>

          <Text style={{ color: colors.text }}>
            ${summary.subtotal.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={{ color: colors.secondaryText }}>Discount</Text>

          <Text style={styles.discount}>-${summary.discount.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={{ color: colors.secondaryText }}>Tax</Text>

          <Text style={{ color: colors.text }}>${summary.tax.toFixed(2)}</Text>
        </View>

        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>

          <Text style={[styles.totalValue, { color: colors.text }]}>
            ${summary.total.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, { backgroundColor: colors.primary }]}
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

  info: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
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

  couponContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },

  couponInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },

  couponButton: {
    marginLeft: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  couponButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  summary: {
    padding: 16,
    borderTopWidth: 1,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  discount: {
    color: '#16a34a',
    fontWeight: '600',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },

  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  placeOrderButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  placeOrderText: {
    color: '#fff',
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
  },
});

export default CartScreen;
