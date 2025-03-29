"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Trash2, Plus, Check, X, Camera, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type WardrobeItem, ANONYMOUS_USER_ID, getWardrobeItems, addStylingTip } from "@/lib/supabase"
import { useTrendData } from "@/hooks/use-trend-data"

// Define outfit positions
type OutfitPosition = "top" | "bottom" | "outerwear" | "footwear" | "accessory"

// Map categories to positions
const categoryToPosition: Record<string, OutfitPosition> = {
  Tops: "top",
  Bottoms: "bottom",
  Outerwear: "outerwear",
  Dresses: "top", // Dresses can be considered as both top and bottom
  Footwear: "footwear",
  Accessories: "accessory",
}

interface OutfitItem {
  item: WardrobeItem
  position: OutfitPosition
}

export function OutfitVisualizer() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<OutfitItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [outfitName, setOutfitName] = useState<string>("")
  const [outfitOccasion, setOutfitOccasion] = useState<string>("Casual")
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const { toast } = useToast()
  const { trendItems } = useTrendData()

  // Load wardrobe items
  useEffect(() => {
    async function loadWardrobeItems() {
      setIsLoading(true)
      try {
        const items = await getWardrobeItems()
        setWardrobeItems(items)
      } catch (error) {
        console.error("Error loading wardrobe items:", error)
        toast({
          title: "Error loading wardrobe",
          description: "There was a problem loading your wardrobe items.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadWardrobeItems()

    // Listen for wardrobe data changes
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

  // Filter items by category
  const filteredItems =
    selectedCategory === "All" ? wardrobeItems : wardrobeItems.filter((item) => item.category === selectedCategory)

  // Add item to outfit
  const addItemToOutfit = (item: WardrobeItem) => {
    const position = categoryToPosition[item.category] || "accessory"

    // Check if we already have an item in this position (except accessories)
    if (position !== "accessory") {
      const existingItemIndex = selectedItems.findIndex((outfitItem) => outfitItem.position === position)

      if (existingItemIndex !== -1) {
        // Replace the existing item
        const newItems = [...selectedItems]
        newItems[existingItemIndex] = { item, position }
        setSelectedItems(newItems)
        return
      }
    }

    // Add the new item
    setSelectedItems([...selectedItems, { item, position }])
  }

  // Remove item from outfit
  const removeItemFromOutfit = (itemId: string) => {
    setSelectedItems(selectedItems.filter((outfitItem) => outfitItem.item.id !== itemId))
  }

  // Clear the outfit
  const clearOutfit = () => {
    setSelectedItems([])
  }

  // Save the outfit
  const saveOutfit = async () => {
    if (selectedItems.length < 2) {
      toast({
        title: "Not enough items",
        description: "Please add at least 2 items to your outfit.",
        variant: "destructive",
      })
      return
    }

    if (!outfitName.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your outfit.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Save as a styling tip
      const newOutfit = await addStylingTip(
        {
          user_id: ANONYMOUS_USER_ID,
          title: outfitName,
          description: `Custom outfit for ${outfitOccasion}`,
          occasion: outfitOccasion,
        },
        selectedItems.map((outfitItem) => outfitItem.item.id),
      )

      if (newOutfit) {
        toast({
          title: "Outfit saved",
          description: "Your outfit has been saved successfully.",
        })

        // Reset the form
        setSelectedItems([])
        setOutfitName("")
        setShowSaveDialog(false)

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent("stylingTipsChanged"))
      }
    } catch (error) {
      console.error("Error saving outfit:", error)
      toast({
        title: "Error saving outfit",
        description: "There was a problem saving your outfit.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate outfit style score
  const calculateStyleScore = () => {
    if (selectedItems.length < 2) return 0

    // Basic scoring: more items = better score, up to 5 items
    const itemCountScore = Math.min(selectedItems.length / 5, 1) * 50

    // Check if we have essential items (top, bottom, footwear)
    const hasTop = selectedItems.some((item) => item.position === "top")
    const hasBottom = selectedItems.some((item) => item.position === "bottom")
    const hasFootwear = selectedItems.some((item) => item.position === "footwear")

    const essentialsScore = (((hasTop ? 1 : 0) + (hasBottom ? 1 : 0) + (hasFootwear ? 1 : 0)) / 3) * 30

    // Check color coordination (simplified)
    const colors = selectedItems.map((item) => item.item.color)
    const uniqueColors = new Set(colors).size
    const colorScore = (1 - Math.min(uniqueColors - 1, 3) / 3) * 20

    return Math.round(itemCountScore + essentialsScore + colorScore)
  }

  // Get outfit feedback
  const getOutfitFeedback = () => {
    const score = calculateStyleScore()

    if (score >= 80) {
      return "Great outfit! Well-balanced and coordinated."
    } else if (score >= 60) {
      return "Good outfit. Consider adding accessories for more style."
    } else if (score >= 40) {
      return "Basic outfit. Try adding more coordinated pieces."
    } else {
      return "Incomplete outfit. Add more essential items."
    }
  }

  // Check if outfit matches current trends
  const getTrendMatch = () => {
    if (selectedItems.length === 0) return []

    const outfitCategories = selectedItems.map((item) => item.item.category.toLowerCase())
    const outfitColors = selectedItems.map((item) => item.item.color.toLowerCase())

    return trendItems
      .filter((trend) => {
        const trendKeywords = [trend.title.toLowerCase(), ...trend.categories.map((c) => c.toLowerCase())]

        // Check if any trend keywords match our outfit categories or colors
        return trendKeywords.some(
          (keyword) =>
            outfitCategories.some((category) => category.includes(keyword) || keyword.includes(category)) ||
            outfitColors.some((color) => keyword.includes(color)),
        )
      })
      .slice(0, 2) // Just show top 2 matching trends
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Outfit Visualizer</CardTitle>
          <CardDescription>Create and visualize outfits with your wardrobe items</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your wardrobe...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative bg-muted/30 rounded-lg p-4 min-h-[400px] flex flex-col items-center">
                {selectedItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <p className="mb-2">Select items from your wardrobe to create an outfit</p>
                    <Button variant="outline" size="sm" onClick={() => setSelectedCategory("All")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Items
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Outfit visualization */}
                    <div className="relative w-full max-w-[300px] h-[350px] mx-auto">
                      {/* Mannequin silhouette */}
                      <div className="absolute inset-0 flex flex-col items-center opacity-10">
                        <div className="w-16 h-16 rounded-full bg-gray-400 mt-4"></div>
                        <div className="w-1 h-24 bg-gray-400"></div>
                        <div className="w-32 h-48 bg-gray-400 rounded-t-3xl"></div>
                        <div className="flex w-32 justify-between mt-2">
                          <div className="w-3 h-24 bg-gray-400"></div>
                          <div className="w-3 h-24 bg-gray-400"></div>
                        </div>
                      </div>

                      {/* Outfit items */}
                      {selectedItems.map((outfitItem, index) => {
                        const { item, position } = outfitItem

                        // Position styles
                        const positionStyles: Record<OutfitPosition, string> = {
                          top: "top-[60px] left-1/2 transform -translate-x-1/2 w-40 h-40 z-20",
                          bottom: "top-[180px] left-1/2 transform -translate-x-1/2 w-40 h-40 z-10",
                          outerwear: "top-[40px] left-1/2 transform -translate-x-1/2 w-48 h-48 z-30",
                          footwear: "bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-32 z-10",
                          accessory: `${index % 2 === 0 ? "left-0" : "right-0"} top-[${50 + index * 30}px] w-20 h-20 z-40`,
                        }

                        return (
                          <div key={item.id} className={`absolute ${positionStyles[position]} group`}>
                            <img
                              src={item.image_url || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeItemFromOutfit(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Badge className="absolute bottom-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.name}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>

                    {/* Outfit actions */}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={clearOutfit}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Capture
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button size="sm" onClick={() => setShowSaveDialog(true)} disabled={selectedItems.length < 2}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {selectedItems.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Outfit Analysis</h3>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>Style Score</span>
                        <Badge variant={calculateStyleScore() >= 70 ? "default" : "outline"}>
                          {calculateStyleScore()}/100
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{getOutfitFeedback()}</p>

                      {getTrendMatch().length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Matching Trends</h4>
                          <div className="flex flex-wrap gap-2">
                            {getTrendMatch().map((trend, i) => (
                              <Badge key={i} className="bg-primary">
                                {trend.title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Wardrobe</CardTitle>
          <CardDescription>Select items to add to your outfit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Label htmlFor="category-filter" className="whitespace-nowrap">
              Filter by:
            </Label>
            <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="Tops">Tops</TabsTrigger>
                <TabsTrigger value="Bottoms">Bottoms</TabsTrigger>
              </TabsList>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="Outerwear">Outerwear</TabsTrigger>
                <TabsTrigger value="Footwear">Footwear</TabsTrigger>
                <TabsTrigger value="Accessories">Accessories</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto p-1">
              {filteredItems.map((item) => {
                const isSelected = selectedItems.some((outfitItem) => outfitItem.item.id === item.id)

                return (
                  <Card
                    key={item.id}
                    className={`overflow-hidden cursor-pointer transition-all ${
                      isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
                    }`}
                    onClick={() => (isSelected ? removeItemFromOutfit(item.id) : addItemToOutfit(item))}
                  >
                    <div className="relative">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-24 object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {item.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="mb-2">No items found in this category</p>
              <Button variant="outline" size="sm" onClick={() => setSelectedCategory("All")}>
                Show All Items
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Outfit Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Outfit</DialogTitle>
            <DialogDescription>Give your outfit a name and occasion to save it to your collection</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="outfit-name">Outfit Name</Label>
              <Input
                id="outfit-name"
                placeholder="e.g., Summer Casual"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outfit-occasion">Occasion</Label>
              <Tabs defaultValue="Casual" value={outfitOccasion} onValueChange={setOutfitOccasion} className="w-full">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="Casual">Casual</TabsTrigger>
                  <TabsTrigger value="Work">Work</TabsTrigger>
                  <TabsTrigger value="Evening">Evening</TabsTrigger>
                  <TabsTrigger value="Special">Special</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {selectedItems.map((outfitItem) => (
                <div key={outfitItem.item.id} className="relative w-16 h-16">
                  <img
                    src={outfitItem.item.image_url || "/placeholder.svg"}
                    alt={outfitItem.item.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveOutfit} disabled={isSaving || !outfitName.trim() || selectedItems.length < 2}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Outfit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

