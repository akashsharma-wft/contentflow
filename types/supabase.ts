export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          email: string | null
          bio: string | null
          website: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          email?: string | null
          bio?: string | null
          website?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro'
        }
        Update: {
          display_name?: string | null
          email?: string | null
          bio?: string | null
          website?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro'
          updated_at?: string
        }
      }
    }
  }
}