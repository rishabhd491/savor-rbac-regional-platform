'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';

const LOGIN_MUTATION = gql`
  mutation Login($name: String!, $role: Role!, $country: Country!) {
    login(name: $name, role: $role, country: $country) {
      id
      name
      role
      country
      email
    }
  }
`;

export default function LoginPage() {
  const { setUser } = useUser();
  const [login, { loading }] = useMutation(LOGIN_MUTATION);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'MEMBER'>('MEMBER');
  const [country, setCountry] = useState<'INDIA' | 'AMERICA'>('INDIA');

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Redirect only after successful login
  // We remove the auto-redirect on mount to allow users to switch accounts
  
  if (!mounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    try {
      const { data } = await login({
        variables: { name, role, country }
      });
      
      if (data?.login) {
        setUser(data.login);
        router.push('/restaurants');
      }
    } catch (err) {
      alert('Login failed: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-orange-100/50 border border-gray-100 p-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-50 rounded-full -ml-12 -mb-12 opacity-50"></div>

        <div className="relative">
          <div className="text-center mb-10">
            <div className="inline-block p-5 bg-orange-600 rounded-3xl mb-6 shadow-xl shadow-orange-200 rotate-3 group-hover:rotate-6 transition-transform">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.268 0 2.39.63 3.06 1.594M9 11l.5-2m-.5 2l.5 2m0 0L9 11m3 1v9m-3-9H6" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Welcome Back</h1>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Sign in to Savor</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <input 
                type="text"
                autoFocus
                placeholder="Enter your name"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-600/20 focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold text-gray-700 placeholder:text-gray-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Position / Role</label>
              <div className="grid grid-cols-3 gap-3">
                {(['ADMIN', 'MANAGER', 'MEMBER'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 rounded-xl border-2 font-black text-[10px] tracking-tighter transition-all ${
                      role === r 
                        ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200 hover:text-orange-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Operating Region</label>
              <div className="grid grid-cols-2 gap-3">
                {(['INDIA', 'AMERICA'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCountry(c)}
                    className={`py-3 rounded-xl border-2 font-black text-[10px] tracking-widest transition-all ${
                      country === c 
                        ? 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-200' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-900 hover:text-gray-900'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-2xl shadow-orange-200 hover:bg-orange-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Initialize Session</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            Enterprise Grade Food Delivery Management
          </p>
        </div>
      </div>
    </div>
  );
}
