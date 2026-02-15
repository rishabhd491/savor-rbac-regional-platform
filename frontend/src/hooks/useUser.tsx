'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_CART = gql`
  query GetCartItems {
    cartItems {
      id
      menuItemId
      restaurantId
      quantity
      menuItem {
        name
        price
      }
      restaurant {
        name
      }
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($menuItemId: ID!, $restaurantId: ID!, $quantity: Int) {
    addToCart(menuItemId: $menuItemId, restaurantId: $restaurantId, quantity: $quantity) {
      id
      menuItemId
      restaurantId
      quantity
    }
  }
`;

const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const CLEAR_CART = gql`
  mutation ClearCart($restaurantId: ID) {
    clearCart(restaurantId: $restaurantId)
  }
`;

type User = {
  id: string;
  name: string;
  role: string;
  country: string;
};

export type CartItem = {
  id: string;
  menuItemId: string;
  restaurantId: string;
  quantity: number;
  menuItem: {
    name: string;
    price: number;
  };
  restaurant: {
    name: string;
  };
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  cartItems: CartItem[];
  addToCart: (menuItemId: string, restaurantId: string) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: (restaurantId?: string) => Promise<void>;
  loadingCart: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  
  const { data: cartData, loading: loadingCart, refetch: refetchCart } = useQuery(GET_CART, {
    skip: !user,
    pollInterval: 3000, // Update every 3 seconds for shared experience
  });

  const [addMutation] = useMutation(ADD_TO_CART);
  const [removeMutation] = useMutation(REMOVE_FROM_CART);
  const [clearMutation] = useMutation(CLEAR_CART);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id) {
          const timer = setTimeout(() => {
            setUserState(parsed);
          }, 0);
          return () => clearTimeout(timer);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
        }
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
      }
    }
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('userId', newUser.id);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('cart');
    }
  };

  const addToCart = async (menuItemId: string, restaurantId: string) => {
    await addMutation({
      variables: { menuItemId, restaurantId, quantity: 1 },
    });
    await refetchCart();
  };

  const removeFromCart = async (id: string) => {
    await removeMutation({
      variables: { id },
    });
    await refetchCart();
  };

  const clearCart = async (restaurantId?: string) => {
    await clearMutation({
      variables: { restaurantId },
    });
    await refetchCart();
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      cartItems: cartData?.cartItems || [], 
      addToCart, 
      removeFromCart, 
      clearCart,
      loadingCart 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
