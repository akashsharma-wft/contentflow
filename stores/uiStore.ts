import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  // Posts page: shared search query between PostsSearchSection and PostsTableSection
  postsSearchQuery: string
  setPostsSearchQuery: (q: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  postsSearchQuery: '',
  setPostsSearchQuery: (q) => set({ postsSearchQuery: q }),
}))