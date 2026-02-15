'use client';

import { Header } from '@/components/Header';
import { useUser } from '@/hooks/useUser';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';

const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      status
      totalAmount
      paymentType
      paymentDetails
      createdAt
      user {
        name
        country
      }
      restaurant {
        name
      }
      items {
        id
        menuItem {
          name
          price
        }
      }
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: ID!, $status: OrderStatus!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      id
      status
    }
  }
`;

const UPDATE_ORDER_PAYMENT = gql`
  mutation UpdateOrderPayment($orderId: ID!, $paymentType: String!, $paymentDetails: String) {
    updateOrderPayment(orderId: $orderId, paymentType: $paymentType, paymentDetails: $paymentDetails) {
      id
      paymentType
      paymentDetails
      status
    }
  }
`;

interface OrderItem {
  id: string;
  menuItem: {
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentType: string;
  paymentDetails: string;
  createdAt: string;
  user: {
    name: string;
    country: string;
  };
  restaurant: {
    name: string;
  };
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user } = useUser();
  const { data, loading, error } = useQuery<{ orders: Order[] }>(GET_ORDERS, {
    pollInterval: 5000, // Refresh every 5 seconds to see new orders
  });
  const [updateStatus] = useMutation(UPDATE_ORDER_STATUS);
  const [updatePayment] = useMutation(UPDATE_ORDER_PAYMENT);

  const [modifyingOrderId, setModifyingOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('CASH');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', name: '', cvv: '' });

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await updateStatus({
        variables: { orderId, status: 'CANCELLED' },
        refetchQueries: ['GetOrders'],
      });
      alert('Order cancelled successfully');
    } catch (err) {
      alert('Error cancelling order: ' + (err as Error).message);
    }
  };

  const handleModifyPayment = async () => {
    if (!modifyingOrderId) return;
    try {
      let paymentDetailsStr = '';
      if (paymentMethod === 'UPI') paymentDetailsStr = `UPI: ${upiId}`;
      if (paymentMethod === 'CARD') {
        const maskedCard = `XXXX-XXXX-XXXX-${cardDetails.number.slice(-4)}`;
        paymentDetailsStr = `CARD: ${maskedCard} (${cardDetails.name})`;
      }
      if (paymentMethod === 'CASH') paymentDetailsStr = 'CASH ON DELIVERY';

      await updatePayment({
        variables: { 
          orderId: modifyingOrderId, 
          paymentType: paymentMethod,
          paymentDetails: paymentDetailsStr
        },
        refetchQueries: ['GetOrders'],
      });
      
      setModifyingOrderId(null);
      alert('Payment method updated successfully!');
    } catch (err) {
      alert('Error updating payment: ' + (err as Error).message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            {`Orders in ${user.country}`}
          </h1>
          <p className="text-gray-500 font-medium">
            {user.role === 'ADMIN'
              ? `Admin overview of all orders in ${user.country}`
              : user.role === 'MANAGER'
                ? `Managing active orders for ${user.country}`
                : `Viewing order history and active orders in ${user.country}`}
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white h-40 rounded-3xl animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center text-red-600 font-bold">
            Failed to load orders: {error.message}
          </div>
        ) : !data?.orders.length ? (
          <div className="bg-white p-20 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-2">New orders will appear here once placed.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {data.orders.map((order: Order) => (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                <div className="p-8 flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Order #{order.id.slice(-6)} • {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{order.restaurant.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-6">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black text-gray-400">
                        {order.user.name.charAt(0)}
                      </div>
                      Ordered by {order.user.name} ({order.user.country})
                    </div>

                    <div className="space-y-2 mb-6">
                      {order.items.map((item: OrderItem) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">{item.menuItem.name}</span>
                          <span className="text-gray-900 font-bold">₹{item.menuItem.price}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-gray-50 flex justify-between items-end">
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                        <p className="text-sm font-bold text-gray-900">{order.paymentDetails || 'NOT SET'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-orange-600">₹{order.totalAmount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-64 flex flex-col gap-3 justify-center">
                    {/* Show modify/cancel for ADMIN and MANAGER (regardless of region), hide for MEMBER */}
                    {(user.role === 'ADMIN' || user.role === 'MANAGER') && order.status !== 'CANCELLED' && (
                      <>
                        {user.role === 'ADMIN' && (
                          <button 
                            onClick={() => setModifyingOrderId(order.id)}
                            className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-sm tracking-tight hover:bg-orange-50 hover:text-orange-600 transition-all border border-gray-100"
                          >
                            MODIFY PAYMENT
                          </button>
                        )}
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="w-full py-4 bg-white text-rose-600 rounded-2xl font-black text-sm tracking-tight hover:bg-rose-50 transition-all border border-rose-100"
                        >
                          CANCEL ORDER
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modify Payment Modal */}
        {modifyingOrderId && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-gray-900">Modify Payment</h3>
                  <button onClick={() => setModifyingOrderId(null)} className="text-gray-400 hover:text-gray-900">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">New Payment Method</label>
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
                    onClick={handleModifyPayment}
                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black tracking-tight hover:bg-orange-600 transition-all shadow-xl shadow-gray-200 hover:shadow-orange-200"
                  >
                    CONFIRM NEW PAYMENT METHOD
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
