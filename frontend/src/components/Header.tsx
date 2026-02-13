'use client';

import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const { user, setUser, cartItems } = useUser();
  const pathname = usePathname();

  const navLinks = [
    { href: '/restaurants', label: 'Restaurants' },
    { href: '/cart', label: 'Cart', count: cartItems.length },
    { href: '/orders', label: 'Orders' },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ href: '/admin', label: 'Admin Panel' });
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Nav */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-orange-600 p-1.5 rounded-lg group-hover:bg-orange-500 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors">
                SAVOR<span className="text-orange-600">.</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    pathname === link.href
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50/50'
                  }`}
                >
                  {link.label}
                  {link.count !== undefined && link.count > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 text-[10px] font-black bg-orange-600 text-white rounded-full">
                      {link.count}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Profile and Logout */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Region:</span>
                  <span className="text-sm font-bold text-gray-700">{user.country}</span>
                </div>

                  <button 
                    onClick={() => {
                      setUser(null);
                      window.location.href = '/login';
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-all border border-rose-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    LOGOUT
                  </button>

                  <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900 leading-none mb-1">{user.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'ADMIN' ? 'bg-red-500' : user.role === 'MANAGER' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-100 to-orange-200 border-2 border-white shadow-sm flex items-center justify-center text-orange-600 font-bold">
                    <span>{user.name.charAt(0)}</span>
                  </div>
                </div>
              </>
            ) : (
              <Link 
                href="/login"
                className="bg-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
