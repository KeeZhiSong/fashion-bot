import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Define database schema types
export type Database = {
  public: {
    Tables: {
      wardrobe_items: {
        Row: {
          id: string
          user_id: string
          name: string
          image_url: string
          category: string
          color: string
          season: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          image_url: string
          category: string
          color: string
          season: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          image_url?: string
          category?: string
          color?: string
          season?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      styling_tips: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          occasion: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          occasion: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          occasion?: string
          created_at?: string
        }
      }
      outfit_items: {
        Row: {
          id: string
          styling_tip_id: string
          wardrobe_item_id: string
          position: number
        }
        Insert: {
          id?: string
          styling_tip_id: string
          wardrobe_item_id: string
          position: number
        }
        Update: {
          id?: string
          styling_tip_id?: string
          wardrobe_item_id?: string
          position?: number
        }
      }
    }
  }
}

// Types for our application
export type WardrobeItem = Database["public"]["Tables"]["wardrobe_items"]["Row"]
export type WardrobeItemInsert = Database["public"]["Tables"]["wardrobe_items"]["Insert"]
export type WardrobeItemUpdate = Database["public"]["Tables"]["wardrobe_items"]["Update"]

export type StylingTip = Database["public"]["Tables"]["styling_tips"]["Row"] & {
  items?: WardrobeItem[]
}
export type StylingTipInsert = Database["public"]["Tables"]["styling_tips"]["Insert"]
export type StylingTipUpdate = Database["public"]["Tables"]["styling_tips"]["Update"]

export type OutfitItem = Database["public"]["Tables"]["outfit_items"]["Row"]
export type OutfitItemInsert = Database["public"]["Tables"]["outfit_items"]["Insert"]

// Create a type for our Supabase client
type TypedSupabaseClient = SupabaseClient<Database>

// Create a single supabase client for the browser
const createBrowserClient = (): TypedSupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Singleton pattern to avoid multiple instances
let browserClient: TypedSupabaseClient | null = null

// Get the browser client
export const getBrowserClient = (): TypedSupabaseClient => {
  if (!browserClient) {
    browserClient = createBrowserClient()
  }
  return browserClient
}

// Create a server client (for server components and API routes)
export const createServerClient = (): TypedSupabaseClient => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

// Anonymous user ID for demo purposes
export const ANONYMOUS_USER_ID = "00000000-0000-0000-0000-000000000000"

// Wardrobe item functions
export async function getWardrobeItems(userId = ANONYMOUS_USER_ID): Promise<WardrobeItem[]> {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching wardrobe items:", error)
    return []
  }

  return data || []
}

export async function addWardrobeItem(
  item: Omit<WardrobeItemInsert, "id" | "created_at" | "updated_at">,
): Promise<WardrobeItem | null> {
  const supabase = getBrowserClient()
  const { data, error } = await supabase.from("wardrobe_items").insert([item]).select()

  if (error) {
    console.error("Error adding wardrobe item:", error)
    return null
  }

  return data && data.length > 0 ? data[0] : null
}

export async function updateWardrobeItem(id: string, updates: WardrobeItemUpdate): Promise<WardrobeItem | null> {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("wardrobe_items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating wardrobe item:", error)
    return null
  }

  return data && data.length > 0 ? data[0] : null
}

export async function deleteWardrobeItem(id: string): Promise<boolean> {
  const supabase = getBrowserClient()
  const { error } = await supabase.from("wardrobe_items").delete().eq("id", id)

  if (error) {
    console.error("Error deleting wardrobe item:", error)
    return false
  }

  return true
}

// Styling tips functions
export async function getStylingTips(userId = ANONYMOUS_USER_ID): Promise<StylingTip[]> {
  const supabase = getBrowserClient()

  // First get all styling tips
  const { data: tips, error: tipsError } = await supabase
    .from("styling_tips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (tipsError) {
    console.error("Error fetching styling tips:", tipsError)
    return []
  }

  if (!tips) return []

  // For each tip, get the associated wardrobe items
  const tipsWithItems = await Promise.all(
    tips.map(async (tip) => {
      const { data: outfitItems, error: outfitError } = await supabase
        .from("outfit_items")
        .select("*, wardrobe_items(*)")
        .eq("styling_tip_id", tip.id)
        .order("position", { ascending: true })

      if (outfitError || !outfitItems) {
        console.error("Error fetching outfit items:", outfitError)
        return { ...tip, items: [] }
      }

      // Extract the wardrobe items and map them to the expected format
      const items = outfitItems.map((outfitItem: any) => ({
        ...outfitItem.wardrobe_items,
      }))

      return { ...tip, items }
    }),
  )

  return tipsWithItems
}

export async function addStylingTip(
  tip: Omit<StylingTipInsert, "id" | "created_at">,
  itemIds: string[],
): Promise<StylingTip | null> {
  const supabase = getBrowserClient()

  // Start a transaction
  const { data: newTip, error: tipError } = await supabase.from("styling_tips").insert([tip]).select()

  if (tipError || !newTip || newTip.length === 0) {
    console.error("Error adding styling tip:", tipError)
    return null
  }

  // Add outfit items
  const outfitItems = itemIds.map((itemId, index) => ({
    styling_tip_id: newTip[0].id,
    wardrobe_item_id: itemId,
    position: index + 1,
  }))

  const { error: outfitError } = await supabase.from("outfit_items").insert(outfitItems)

  if (outfitError) {
    console.error("Error adding outfit items:", outfitError)
    // In a real app, you might want to delete the styling tip if this fails
    return null
  }

  // Get the complete styling tip with items
  const { data: completeTip, error: completeError } = await supabase
    .from("styling_tips")
    .select("*")
    .eq("id", newTip[0].id)
    .single()

  if (completeError || !completeTip) {
    console.error("Error fetching complete styling tip:", completeError)
    return null
  }

  // Get the wardrobe items for this tip
  const { data: outfitItemsWithItems, error: itemsError } = await supabase
    .from("outfit_items")
    .select("*, wardrobe_items(*)")
    .eq("styling_tip_id", completeTip.id)
    .order("position", { ascending: true })

  if (itemsError || !outfitItemsWithItems) {
    console.error("Error fetching outfit items with items:", itemsError)
    return { ...completeTip, items: [] }
  }

  // Extract the wardrobe items
  const items = outfitItemsWithItems.map((outfitItem: any) => ({
    ...outfitItem.wardrobe_items,
  }))

  return { ...completeTip, items }
}

export async function deleteStylingTip(id: string): Promise<boolean> {
  const supabase = getBrowserClient()

  // Delete the styling tip (outfit_items will be deleted via cascade)
  const { error } = await supabase.from("styling_tips").delete().eq("id", id)

  if (error) {
    console.error("Error deleting styling tip:", error)
    return false
  }

  return true
}

