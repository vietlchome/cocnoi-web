import { create } from 'zustand';

interface AdminLayoutState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useAdminLayoutStore = create<AdminLayoutState>((set) => ({
  isSidebarOpen: true, // Default to open
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));
