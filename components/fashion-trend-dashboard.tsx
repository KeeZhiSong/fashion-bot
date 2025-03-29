"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendAnalytics } from "@/components/trend-analytics"
import { VirtualWardrobe } from "@/components/virtual-wardrobe"
import { TrendExplorer } from "@/components/trend-explorer"
import { TrendMatch } from "@/components/trend-match"
import { WardrobeStatistics } from "@/components/wardrobe-statistics"
import { OutfitVisualizer } from "@/components/outfit-visualizer"
import { getWardrobeItems, ANONYMOUS_USER_ID, type WardrobeItem } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function FashionTrendDashboard() {
  const [activeTab, setActiveTab] = useState("trends")
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadWardrobeItems() {
      try {
        const items = await getWardrobeItems(ANONYMOUS_USER_ID)
        setWardrobeItems(items)
      } catch (error) {
        console.error("Error loading wardrobe items:", error)
        toast({
          title: "Error loading wardrobe",
          description: "There was a problem loading your wardrobe items. Please try again later.",
          variant: "destructive",
        })
        setWardrobeItems([])
      } finally {
        setIsLoading(false)
      }
    }

    loadWardrobeItems()

    // Listen for wardrobe data changes from other components
    const handleWardrobeDataChanged = (event: CustomEvent) => {
      if (event.detail && event.detail.items) {
        setWardrobeItems(event.detail.items)
      }
    }

    window.addEventListener("wardrobeDataChanged", handleWardrobeDataChanged as EventListener)

    return () => {
      window.removeEventListener("wardrobeDataChanged", handleWardrobeDataChanged as EventListener)
    }
  }, [toast])

  return (
    <div className="space-y-8">
      <Tabs defaultValue="trends" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 max-w-3xl mx-auto">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
          <TabsTrigger value="outfits">Outfits</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="explorer">Explorer</TabsTrigger>
          <TabsTrigger value="match">Trend Match</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="trends">
            <TrendAnalytics />
          </TabsContent>
          <TabsContent value="wardrobe">
            <VirtualWardrobe />
          </TabsContent>
          <TabsContent value="outfits">
            <OutfitVisualizer />
          </TabsContent>
          <TabsContent value="stats">
            <WardrobeStatistics wardrobeItems={wardrobeItems} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="explorer">
            <TrendExplorer />
          </TabsContent>
          <TabsContent value="match">
            <TrendMatch wardrobeItems={wardrobeItems} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

