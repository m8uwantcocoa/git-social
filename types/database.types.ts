export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: Table<{
        id: string
        github_username: string | null
        full_name: string | null
        email: string | null
        avatar_url: string | null
        public_repos: number | null
        total_private_repos: number | null
        updated_at: string | null
      }>
      events: Table<{
        id: string
        github_event_id: string | null
        event_type: string | null
        github_username: string | null
        avatar_url: string | null
        created_at: string
        repo_name: string | null
        payload: Json | null
        message: string | null
      }>
      follows: Table<{
        id: string
        follower_id: string
        following_id: string
        created_at: string | null
      }>
      event_likes: Table<{
        id: string
        event_id: string
        github_username: string
        created_at: string | null
      }>
      comments: Table<{
        id: string
        event_id: string
        github_username: string
        text: string
        created_at: string | null
      }>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
