'use client';

import { Header } from '@/components/Header';
import { useUser } from '@/hooks/useUser';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';

const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods {
    paymentMethods {
      id
      details
      type
    }
  }
`;

const ADD_PAYMENT_METHOD = gql`
  mutation CreatePaymentMethod($details: String!, $type: String!) {
    createPaymentMethod(details: $details, type: $type) {
      id
      details
    }
  }
`;

interface PaymentMethod {
  id: string;
  details: string;
  type: 'CARD' | 'UPI' | 'CASH';
}

export default function AdminPage() {
  const { user } = useUser();
  const { data, loading } = useQuery<{ paymentMethods: PaymentMethod[] }>(GET_PAYMENT_METHODS);
  const [addPaymentMethod] = useMutation(ADD_PAYMENT_METHOD);
  
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('CARD');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPaymentMethod({
        variables: { details: newName, type: newType },
        refetchQueries: ['GetPaymentMethods'],
      });
      setNewName('');
    } catch (err) {
      alert('Error adding payment method: ' + (err as Error).message);
    }
  };

  if (!user || user.role !== 'ADMIN') return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restricted Access</h2>
          <p className="text-gray-500 mb-0">Only administrators can access the system configuration panel.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Admin Control Panel</h1>
          <p className="text-gray-500 font-medium">Manage global system settings and payment configurations.</p>
        </div>

        <div className="grid gap-8">
          {/* Add New Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Payment Method
              </h3>
              
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Method Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Visa Corporate"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-600 transition-all outline-none font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-600 transition-all outline-none font-bold"
                  >
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="UPI">UPI / Digital Wallet</option>
                    <option value="CASH">Cash on Delivery</option>
                  </select>
                </div>
                <div className="md:col-span-3 mt-2">
                  <button
                    type="submit"
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg shadow-gray-200 hover:bg-black transition-all hover:-translate-y-1"
                  >
                    Create Method
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Active Payment Methods
              </h3>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-2xl"></div>)}
                </div>
              ) : (
                <div className="grid gap-4">
                  {data?.paymentMethods.map((method: PaymentMethod) => (
                    <div key={method.id} className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                           {method.type === 'CARD' ? (
                             <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                             </svg>
                           ) : (
                             <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                           )}
                        </div>
                        <div>
                          <p className="font-black text-gray-900">{method.details}</p>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{method.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
