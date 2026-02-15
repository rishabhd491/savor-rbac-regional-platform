'use client';

import { Header } from '@/components/Header';
import { useUser, type CartItem } from '@/hooks/useUser';
import { useMutation, gql } from '@apollo/client';
import { useState } from 'react';

const CREATE_ORDER = gql`
  mutation CreateOrder($restaurantId: ID!, $itemIds: [ID!]!, $paymentType: String, $paymentDetails: String) {
    createOrder(restaurantId: $restaurantId, itemIds: $itemIds, paymentType: $paymentType, paymentDetails: $paymentDetails) {
      id
      status
    }
  }
`;

export default function CartPage() {
  const { user, cartItems, removeFromCart, clearCart } = useUser();
  const [createOrder] = useMutation(CREATE_ORDER);
  
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('CASH');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', name: '', cvv: '' });

  if (!user) return null;

  // Group cart items by restaurant
  const groupedCart = cartItems.reduce((acc, item) => {
    const rid = item.restaurantId;
    if (!acc[rid]) {
      acc[rid] = {
        name: item.restaurant.name,
        items: []
      };
    }
    acc[rid].items.push(item);
    return acc;
  }, {} as Record<string, { name: string; items: CartItem[] }>);

  const handlePlaceOrder = async (restaurantId: string) => {
    const items = groupedCart[restaurantId].items;
    
    // Payment validation (only for non-members if we allow them to checkout)
    if (user.role !== 'MEMBER') {
      if (paymentMethod === 'UPI') {
        if (!upiId || !upiId.includes('@')) {
          alert('Please enter a valid UPI ID');
          return;
        }
      } else if (paymentMethod === 'CARD') {
        if (!cardDetails.number || cardDetails.number.length < 16) {
          alert('Please enter a valid 16-digit card number');
          return;
        }
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
          restaurantId, 
          itemIds: items.map(i => i.menuItemId),
          paymentType: user.role === 'MEMBER' ? null : paymentMethod,
          paymentDetails: user.role === 'MEMBER' ? 'PENDING MANAGER APPROVAL' : paymentDetailsStr
        },
        refetchQueries: ['GetOrders'],
      });
      
      await clearCart(restaurantId);
      alert('Order placed successfully!');
    } catch (err) {
      alert('Error placing order: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Your Cart</h1>
          <p className="text-gray-500 font-medium">
            {cartItems.length === 0 
              ? 'Your cart is empty. Start adding some delicious food!' 
              : `You have ${cartItems.length} items from ${Object.keys(groupedCart).length} restaurants.`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Cart is empty</h3>
            <p className="text-gray-500 mt-2">Browse restaurants to add items.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedCart).map(([rid, restaurant]) => (
              <div key={rid} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                  <h2 className="text-2xl font-black text-gray-900">{restaurant.name}</h2>
                </div>
                
                <div className="divide-y divide-gray-50">
                  {restaurant.items.map((item) => (
                    <div key={item.id} className="p-6 flex justify-between items-center group hover:bg-gray-50/50 transition-all">
                      <div>
                        <p className="font-bold text-gray-900">{item.menuItem.name}</p>
                        <p className="text-orange-600 font-black">₹{item.menuItem.price}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-3 rounded-xl bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Show checkout for ADMIN and MANAGER (even in INDIA), hide for MEMBER */}
                {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                  <div className="p-8 bg-gray-50/50">
                    <div className="mb-6">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Select Payment Method</label>
                      <div className="grid grid-cols-3 gap-4">
                        {(['CASH', 'UPI', 'CARD'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setPaymentMethod(m)}
                            className={`py-3 rounded-2xl font-bold border transition-all ${
                              paymentMethod === m 
                                ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100' 
                                : 'bg-white border-gray-100 text-gray-600 hover:border-orange-200'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {paymentMethod === 'UPI' && (
                      <div className="mb-6">
                        <input
                          type="text"
                          placeholder="Enter UPI ID (e.g. user@bank)"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-orange-100 focus:border-orange-600 outline-none font-medium"
                        />
                      </div>
                    )}

                    {paymentMethod === 'CARD' && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <input
                          type="text"
                          placeholder="Card Number"
                          className="col-span-2 w-full px-4 py-3 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-orange-100 focus:border-orange-600 outline-none font-medium"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-orange-100 focus:border-orange-600 outline-none font-medium"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-orange-100 focus:border-orange-600 outline-none font-medium"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handlePlaceOrder(rid)}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl shadow-gray-200 hover:bg-orange-600 transition-all"
                    >
                      PLACE ORDER (₹{restaurant.items.reduce((sum, i) => sum + i.menuItem.price, 0)})
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
