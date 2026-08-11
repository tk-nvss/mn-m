import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserDetails {
  name: string;
  email: string;
  phone: string;
  userId: string;
  userType: string;
  avatar: string;
  referralUsed: boolean;
  referralCount: number;
  membershipExpiry?: string;
}

interface AuthState {
  token: string | null;
  user: UserDetails | null;
  walletBalance: number;
  _hasHydrated: boolean;
  
  // Actions
  setHasHydrated: (state: boolean) => void;
  login: (token: string, user: Partial<UserDetails>) => void;
  logout: () => void;
  setWalletBalance: (balance: number) => void;
  updateUser: (user: Partial<UserDetails>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      walletBalance: 0,
      _hasHydrated: false,
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      login: (token, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('userType', user.userType || "user");
        }
        set({ 
          token, 
          user: {
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            userId: user.userId || "",
            userType: user.userType || "user",
            avatar: user.avatar || "",
            referralUsed: user.referralUsed || false,
            referralCount: user.referralCount || 0,
            membershipExpiry: user.membershipExpiry,
          }
        });
      },
      
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
        }
        set({ token: null, user: null, walletBalance: 0 });
      },
      
      setWalletBalance: (balance) => set({ walletBalance: balance }),
      
      updateUser: (updatedData) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedData } : null
      }))
    }),
    {
      name: "auth-storage", // key in localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
