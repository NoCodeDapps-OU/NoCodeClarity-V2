import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@supabase/auth-helpers-nextjs';
import { getUserProfile } from '@/lib/db';

interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  // Add wallet connections
  walletConnections?: {
    stacks?: {
      address: string;
      isConnected: boolean;
    };
    rootstock?: {
      address: string;
      isConnected: boolean;
    };
  };
  // Add profile section data
  profileData?: {
    lastUpdated: number;
    settings?: {
      notifications: boolean;
      theme: string;
    };
  };
}

interface UserMenuState {
  userEmail: string | null;
  username: string | null;
  loading: boolean;
  walletConnections: {
    stacks?: {
      address: string;
      isConnected: boolean;
    };
    rootstock?: {
      address: string;
      isConnected: boolean;
    };
  };
}

interface UserState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  lastFetched: number | null;
  userMenu: UserMenuState;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateProfileSection: (sectionData: Partial<UserProfile>) => void;
  setUserMenu: (menuState: UserMenuState) => void;
  updateUserMenu: (updates: Partial<UserMenuState>) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: false,
      lastFetched: null,
      userMenu: {
        userEmail: null,
        username: null,
        loading: true,
        walletConnections: {}
      },
      setUser: (user) => {
        set({ user, isLoading: false });
        const currentLastFetched = get().lastFetched;
        if (user?.id && (!currentLastFetched || Date.now() - currentLastFetched > CACHE_DURATION)) {
          void getUserProfile(user.id).then(profile => {
            set({ 
              profile: {
                ...profile,
                profileData: {
                  ...profile?.profileData,
                  lastUpdated: Date.now()
                }
              },
              isLoading: false,
              lastFetched: Date.now()
            });
          });
        }
      },
      setProfile: (profile) => set({ 
        profile: profile ? {
          ...profile,
          profileData: {
            ...profile.profileData,
            lastUpdated: Date.now()
          }
        } : null,
        isLoading: false,
        lastFetched: Date.now() 
      }),
      setLoading: (loading) => set({ isLoading: loading }),
      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({ 
            profile: { ...currentProfile, ...updates },
            lastFetched: Date.now()
          });
        }
      },
      updateProfileSection: (sectionData) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              ...sectionData,
              profileData: {
                ...currentProfile.profileData,
                lastUpdated: Date.now()
              }
            },
            lastFetched: Date.now()
          });
        }
      },
      reset: () => set({ 
        user: null, 
        profile: null, 
        isLoading: false,
        lastFetched: null 
      }),
      setUserMenu: (menuState) => set({ userMenu: menuState }),
      updateUserMenu: (updates) => set((state) => ({
        userMenu: {
          ...state.userMenu,
          ...updates,
          walletConnections: {
            ...state.userMenu.walletConnections,
            ...(updates.walletConnections || {})
          }
        }
      })),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        user: state.user,
        lastFetched: state.lastFetched,
        userMenu: {
          ...state.userMenu,
          walletConnections: state.userMenu.walletConnections
        }
      }),
    }
  )
); 