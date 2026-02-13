'use client';

import { Header } from '@/components/Header';
import { useUser } from '@/hooks/useUser';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import Link from 'next/link';

const GET_RESTAURANTS = gql`
  query GetRestaurants {
    restaurants {
      id
      name
      country
      menuItems {
        id
        name
        price
      }
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($restaurantId: ID!, $itemIds: [ID!]!, $paymentType: String, $paymentDetails: String) {
    createOrder(restaurantId: $restaurantId, itemIds: $itemIds, paymentType: $paymentType, paymentDetails: $paymentDetails) {
      id
      status
    }
  }
`;

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface Restaurant {
  id: string;
  name: string;
  country: string;
  menuItems: MenuItem[];
}

export default function RestaurantsPage() {
  const { user, cartItems, addToCart, removeFromCart, clearCart } = useUser();
  const { data, loading, error } = useQuery<{ restaurants: Restaurant[] }>(GET_RESTAURANTS);
  const [createOrder] = useMutation(CREATE_ORDER);
  
  const [checkoutRestaurantId, setCheckoutRestaurantId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('CASH');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', name: '', cvv: '' });

  const handleToggleItem = async (restaurantId: string, itemId: string) => {
    const existingItem = cartItems.find(item => item.menuItemId === itemId && item.restaurantId === restaurantId);
    if (existingItem) {
      await removeFromCart(existingItem.id);
    } else {
      await addToCart(itemId, restaurantId);
    }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutRestaurantId) return;
    const items = cartItems.filter(item => item.restaurantId === checkoutRestaurantId);
    if (items.length === 0) return;

    // Enhanced Validation
    if (paymentMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        alert('Please enter a valid UPI ID (e.g. username@bank)');
        return;
      }
    } else if (paymentMethod === 'CARD') {
      if (!cardDetails.number || cardDetails.number.length < 16) {
        alert('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardDetails.expiry || !cardDetails.expiry.includes('/')) {
        alert('Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        alert('Please enter a valid CVV');
        return;
      }
      if (!cardDetails.name) {
        alert('Please enter cardholder name');
        return;
      }
    }

    try {
      let paymentDetailsStr = '';
      if (paymentMethod === 'UPI') paymentDetailsStr = `UPI: ${upiId}`;
      if (paymentMethod === 'CARD') {
        const maskedCard = `XXXX-XXXX-XXXX-${cardDetails.number.slice(-4)}`;
        paymentDetailsStr = `CARD: ${maskedCard} (${cardDetails.name})`;
      }
      if (paymentMethod === 'CASH') paymentDetailsStr = 'CASH ON DELIVERY';

      await createOrder({
        variables: { 
          restaurantId: checkoutRestaurantId, 
          itemIds: items.map(i => i.menuItemId),
          paymentType: paymentMethod,
          paymentDetails: paymentDetailsStr
        },
        refetchQueries: ['GetOrders'],
      });
      
      await clearCart(checkoutRestaurantId);
      setCheckoutRestaurantId(null);
      alert('Order placed successfully! Check the Orders page for status.');
    } catch (err) {
      alert('Error placing order: ' + (err as Error).message);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Local Favorites</h1>
            <p className="text-gray-500 font-medium">
              Showing top-rated restaurants available in <span className="text-orange-600 uppercase text-sm font-black tracking-widest">{user.country}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {data?.restaurants?.length || 0} RESTAURANTS OPEN
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl h-96 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-8 rounded-3xl text-center text-red-600 font-bold border border-red-100">
            Error loading restaurants: {error.message}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.restaurants.map((restaurant: Restaurant) => {
              const restaurantCartItems = cartItems.filter(item => item.restaurantId === restaurant.id);
              return (
                <div key={restaurant.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-orange-100/20 transition-all duration-500">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">{restaurant.name}</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-1">{restaurant.country} • PREMIUM DINING</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      {restaurant.menuItems.map((item: MenuItem) => {
                        const isInCart = cartItems.some(ci => ci.menuItemId === item.id && ci.restaurantId === restaurant.id);
                        return (
                          <button 
                            key={item.id}
                            onClick={() => handleToggleItem(restaurant.id, item.id)}
                            className={`w-full flex justify-between items-center p-4 rounded-2xl border transition-all ${
                              isInCart
                                ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200'
                                : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-orange-200 hover:bg-white'
                            }`}
                          >
                            <span className="font-bold">{item.name}</span>
                            <span className="font-black opacity-80">₹{item.price}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* In America: Admin/Manager see Checkout, Member sees View in Cart */}
                    {user.country !== 'INDIA' && (user.role === 'ADMIN' || user.role === 'MANAGER') && restaurantCartItems.length > 0 && (
                      <button
                        onClick={() => setCheckoutRestaurantId(restaurant.id)}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black tracking-tight hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 transition-all"
                      >
                        CHECKOUT ({restaurantCartItems.length} ITEMS)
                      </button>
                    )}
                    {/* In India: EVERYONE sees View in Cart. In America: MEMBER sees View in Cart */}
                    {(user.country === 'INDIA' || user.role === 'MEMBER') && restaurantCartItems.length > 0 && (
                      <Link
                        href="/cart"
                        className="w-full block py-4 bg-orange-50 text-orange-600 text-center rounded-2xl font-black tracking-tight hover:bg-orange-100 transition-all"
                      >
                        VIEW IN CART ({restaurantCartItems.length} ITEMS)
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Checkout Modal */}
        {checkoutRestaurantId && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-gray-900">Finalize Order</h3>
                  <button onClick={() => setCheckoutRestaurantId(null)} className="text-gray-400 hover:text-gray-900">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['UPI', 'CARD', 'CASH'] as const).map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`py-3 rounded-xl border-2 font-black text-xs transition-all ${
                            paymentMethod === method ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 bg-gray-50 text-gray-400'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">UPI ID</label>
                      <input
                        type="text"
                        placeholder="username@bank"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-600 font-medium"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                  )}

                  {paymentMethod === 'CARD' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="XXXX XXXX XXXX XXXX"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-600 font-medium"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Expiry</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-600 font-medium"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">CVV</label>
                          <input
                            type="password"
                            placeholder="***"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-600 font-medium"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-600 font-medium"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black tracking-tight hover:bg-orange-600 transition-all shadow-xl shadow-gray-200 hover:shadow-orange-200"
                  >
                    PROCEED & PLACE ORDER
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
