"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Camera, Shirt, Trash2, Plus, Wand2, Loader2, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { classifyClothingItem, extractColors, processImageForAI } from "@/lib/huggingface"
import { useToast } from "@/hooks/use-toast"
import {
  ANONYMOUS_USER_ID,
  type WardrobeItem,
  type StylingTip,
  getWardrobeItems,
  getStylingTips,
  addWardrobeItem,
  deleteWardrobeItem,
  addStylingTip,
  deleteStylingTip,
} from "@/lib/supabase"

export function VirtualWardrobe() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [stylingTips, setStylingTips] = useState<StylingTip[]>([])
  const [newItemImage, setNewItemImage] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isGeneratingTips, setIsGeneratingTips] = useState(false)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newItemName, setNewItemName] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("Tops")
  const [newItemColor, setNewItemColor] = useState("Blue")
  const [newItemSeason, setNewItemSeason] = useState("All Seasons")
  const [dialogOpen, setDialogOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load wardrobe items and styling tips from Supabase on component mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const items = await getWardrobeItems()
        const tips = await getStylingTips()

        setWardrobeItems(items)
        setStylingTips(tips)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error loading data",
          description: "There was a problem loading your wardrobe data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Listen for styling tips changes
    const handleStylingTipsChanged = () => {
      getStylingTips()
        .then((tips) => {
          setStylingTips(tips)
        })
        .catch((error) => {
          console.error("Error refreshing styling tips:", error)
        })
    }

    window.addEventListener("stylingTipsChanged", handleStylingTipsChanged)

    return () => {
      window.removeEventListener("stylingTipsChanged", handleStylingTipsChanged)
    }
  }, [toast])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Show a temporary placeholder immediately
      setNewItemImage("/placeholder.svg?height=300&width=300")
      setIsAnalyzingImage(true)

      // Process the image for AI analysis
      const base64Image = await processImageForAI(file)

      // Classify the clothing item using Hugging Face
      const classificationResult = await classifyClothingItem(base64Image)

      // Extract colors from the image
      const colorResult = await extractColors(base64Image)

      // Use the AI results to pre-fill the form
      if (classificationResult && Array.isArray(classificationResult)) {
        // Find the most likely clothing category
        const clothingCategories = {
          shirt: "Tops",
          "t-shirt": "Tops",
          blouse: "Tops",
          sweater: "Tops",
          jacket: "Outerwear",
          coat: "Outerwear",
          blazer: "Outerwear",
          pants: "Bottoms",
          jeans: "Bottoms",
          skirt: "Bottoms",
          shorts: "Bottoms",
          dress: "Dresses",
          shoes: "Footwear",
          boots: "Footwear",
          sneakers: "Footwear",
          hat: "Accessories",
          scarf: "Accessories",
          bag: "Accessories",
          jewelry: "Accessories",
        }

        // Find the first clothing item in the results
        for (const prediction of classificationResult) {
          const label = prediction.label.toLowerCase()
          for (const [keyword, category] of Object.entries(clothingCategories)) {
            if (label.includes(keyword)) {
              setNewItemCategory(category)
              // Also set a default name based on the label
              setNewItemName(prediction.label)
              break
            }
          }
        }
      }

      // Extract color information if available
      if (colorResult && Array.isArray(colorResult)) {
        const colorMap = {
          black: "Black",
          white: "White",
          blue: "Blue",
          red: "Red",
          green: "Green",
          yellow: "Yellow",
          brown: "Brown",
          gray: "Gray",
          pink: "Pink",
          purple: "Purple",
          orange: "Orange",
        }

        // Look for color information in the results
        for (const detection of colorResult) {
          if (detection.label && typeof detection.label === "string") {
            const label = detection.label.toLowerCase()
            for (const [colorKeyword, colorName] of Object.entries(colorMap)) {
              if (label.includes(colorKeyword)) {
                setNewItemColor(colorName)
                break
              }
            }
          }
        }
      }

      toast({
        title: "Image analyzed successfully",
        description: "We've detected clothing details using Hugging Face AI.",
      })

      // In a real app, you would use the actual image URL
      setNewItemImage("/placeholder.svg?height=300&width=300")
    } catch (error) {
      console.error("Error processing image:", error)
      toast({
        title: "Error analyzing image",
        description: "There was a problem processing your image.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzingImage(false)
    }
  }

  const addItemToWardrobe = async () => {
    if (!newItemName.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your item.",
        variant: "destructive",
      })
      return
    }

    setIsAddingItem(true)

    try {
      const newItem = await addWardrobeItem({
        user_id: ANONYMOUS_USER_ID,
        name: newItemName,
        image_url: newItemImage || "/placeholder.svg?height=300&width=300",
        category: newItemCategory,
        color: newItemColor,
        season: newItemSeason,
      })

      if (newItem) {
        setWardrobeItems([newItem, ...wardrobeItems])
        // Dispatch event to notify other components
        window.dispatchEvent(
          new CustomEvent("wardrobeDataChanged", {
            detail: { items: [newItem, ...wardrobeItems] },
          }),
        )
        toast({
          title: "Item added",
          description: "Your item has been added to your wardrobe.",
        })

        // Reset form
        setNewItemImage("")
        setNewItemName("")
        setNewItemCategory("Tops")
        setNewItemColor("Blue")
        setNewItemSeason("All Seasons")
        setDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding item:", error)
      toast({
        title: "Error adding item",
        description: "There was a problem adding your item to the wardrobe.",
        variant: "destructive",
      })
    } finally {
      setIsAddingItem(false)
    }
  }

  const removeItem = async (id: string) => {
    try {
      const success = await deleteWardrobeItem(id)

      if (success) {
        const updatedItems = wardrobeItems.filter((item) => item.id !== id)
        setWardrobeItems(updatedItems)
        // Dispatch event to notify other components
        window.dispatchEvent(
          new CustomEvent("wardrobeDataChanged", {
            detail: { items: updatedItems },
          }),
        )
        toast({
          title: "Item removed",
          description: "The item has been removed from your wardrobe.",
        })
      }
    } catch (error) {
      console.error("Error removing item:", error)
      toast({
        title: "Error removing item",
        description: "There was a problem removing the item from your wardrobe.",
        variant: "destructive",
      })
    }
  }

  const generateStylingTips = async () => {
    if (wardrobeItems.length < 3) {
      toast({
        title: "Not enough items",
        description: "You need at least 3 items in your wardrobe to generate styling tips.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingTips(true)

    try {
      // Get random items from the wardrobe (up to 4)
      const selectedItems = [...wardrobeItems]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(4, wardrobeItems.length))

      const occasions = ["Work", "Casual", "Evening Out", "Date Night"]
      const randomOccasion = occasions[Math.floor(Math.random() * occasions.length)]

      // Call Hugging Face API to generate styling tips (simulated)
      const itemNames = selectedItems.map((item) => item.name)
      await generateStylingTips(itemNames, randomOccasion)

      // Add the styling tip to the database
      const newTip = await addStylingTip(
        {
          user_id: ANONYMOUS_USER_ID,
          title: `AI-Generated ${randomOccasion} Look`,
          description: "This outfit was created using Hugging Face's AI models to analyze your wardrobe items.",
          occasion: randomOccasion,
        },
        selectedItems.map((item) => item.id),
      )

      if (newTip) {
        setStylingTips([newTip, ...stylingTips])
        toast({
          title: "Styling Tips Generated",
          description: "New outfit suggestions created with Hugging Face AI.",
        })
        // Dispatch event to notify other components
        window.dispatchEvent(
          new CustomEvent("stylingTipsChanged", {
            detail: { tips: [newTip, ...stylingTips] },
          }),
        )
      }
    } catch (error) {
      console.error("Error generating styling tips:", error)
      toast({
        title: "Error generating tips",
        description: "There was a problem connecting to the AI service.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingTips(false)
    }
  }

  const removeStylingTip = async (id: string) => {
    try {
      const success = await deleteStylingTip(id)

      if (success) {
        setStylingTips(stylingTips.filter((tip) => tip.id !== id))
        toast({
          title: "Styling tip removed",
          description: "The styling tip has been removed.",
        })
      }
    } catch (error) {
      console.error("Error removing styling tip:", error)
      toast({
        title: "Error removing styling tip",
        description: "There was a problem removing the styling tip.",
        variant: "destructive",
      })
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const items = await getWardrobeItems()
      const tips = await getStylingTips()

      setWardrobeItems(items)
      setStylingTips(tips)

      // Dispatch a custom event to notify other components that wardrobe data has changed
      window.dispatchEvent(new CustomEvent("wardrobeDataChanged", { detail: { items } }))

      toast({
        title: "Data refreshed",
        description: "Your wardrobe data has been refreshed.",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error refreshing data",
        description: "There was a problem refreshing your wardrobe data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems =
    selectedCategory === "All" ? wardrobeItems : wardrobeItems.filter((item) => item.category === selectedCategory)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Virtual Wardrobe</CardTitle>
              <CardDescription>Scan and organize your clothing items</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={refreshData} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Your Wardrobe</DialogTitle>
                    <DialogDescription>
                      Upload a photo of your clothing item to add it to your virtual wardrobe.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center">
                      {newItemImage ? (
                        <div className="relative w-full max-w-[200px]">
                          <img
                            src={newItemImage || "/placeholder.svg"}
                            alt="New item"
                            className="rounded-md mx-auto"
                            width={200}
                            height={200}
                          />
                          {isAnalyzingImage && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <span className="ml-2 text-sm font-medium">Analyzing with AI...</span>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setNewItemImage("")}
                          >
                            Change
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="upload">Upload</TabsTrigger>
                              <TabsTrigger value="camera">Camera</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="pt-4">
                              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                              <h3 className="font-medium text-lg mb-1">Upload image</h3>
                              <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to browse</p>
                              <Input
                                id="item-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                ref={fileInputRef}
                              />
                              <Label htmlFor="item-upload" asChild>
                                <Button>Select Image</Button>
                              </Label>
                            </TabsContent>
                            <TabsContent value="camera" className="pt-4">
                              <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                              <h3 className="font-medium text-lg mb-1">Take a photo</h3>
                              <p className="text-sm text-muted-foreground mb-4">Capture your item with your camera</p>
                              <Button>Open Camera</Button>
                            </TabsContent>
                          </Tabs>
                        </>
                      )}
                    </div>

                    {newItemImage && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="item-name">Item Name</Label>
                          <Input
                            id="item-name"
                            placeholder="e.g., Blue Denim Jacket"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="item-category">Category</Label>
                            <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                              <SelectTrigger id="item-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tops">Tops</SelectItem>
                                <SelectItem value="Bottoms">Bottoms</SelectItem>
                                <SelectItem value="Outerwear">Outerwear</SelectItem>
                                <SelectItem value="Dresses">Dresses</SelectItem>
                                <SelectItem value="Footwear">Footwear</SelectItem>
                                <SelectItem value="Accessories">Accessories</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="item-color">Color</Label>
                            <Select value={newItemColor} onValueChange={setNewItemColor}>
                              <SelectTrigger id="item-color">
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Black">Black</SelectItem>
                                <SelectItem value="White">White</SelectItem>
                                <SelectItem value="Blue">Blue</SelectItem>
                                <SelectItem value="Red">Red</SelectItem>
                                <SelectItem value="Green">Green</SelectItem>
                                <SelectItem value="Yellow">Yellow</SelectItem>
                                <SelectItem value="Brown">Brown</SelectItem>
                                <SelectItem value="Gray">Gray</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="item-season">Season</Label>
                          <Select value={newItemSeason} onValueChange={setNewItemSeason}>
                            <SelectTrigger id="item-season">
                              <SelectValue placeholder="Select season" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All Seasons">All Seasons</SelectItem>
                              <SelectItem value="Spring/Summer">Spring/Summer</SelectItem>
                              <SelectItem value="Fall/Winter">Fall/Winter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewItemImage("")
                        setNewItemName("")
                        setDialogOpen(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button disabled={!newItemImage || isAddingItem || !newItemName.trim()} onClick={addItemToWardrobe}>
                      {isAddingItem ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add to Wardrobe"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Label htmlFor="category-filter" className="whitespace-nowrap">
              Filter by:
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-filter" className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Items</SelectItem>
                <SelectItem value="Tops">Tops</SelectItem>
                <SelectItem value="Bottoms">Bottoms</SelectItem>
                <SelectItem value="Outerwear">Outerwear</SelectItem>
                <SelectItem value="Footwear">Footwear</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your wardrobe...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="relative group">
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-32 object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.color}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Shirt className="h-10 w-10 mb-2" />
              <h3 className="font-medium text-lg mb-1">Your wardrobe is empty</h3>
              <p className="text-sm max-w-xs mb-4">Add clothing items to your virtual wardrobe to get started</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </DialogTrigger>
                <DialogContent>{/* Dialog content same as above */}</DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            variant="outline"
            disabled={wardrobeItems.length < 3 || isGeneratingTips || isLoading}
            onClick={generateStylingTips}
          >
            {isGeneratingTips ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating with Hugging Face AI...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate AI Styling Tips
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Styling Tips</CardTitle>
          <CardDescription>Personalized outfit recommendations based on your wardrobe</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your styling tips...</p>
            </div>
          ) : stylingTips.length > 0 ? (
            <div className="space-y-6">
              {stylingTips.map((tip) => (
                <Card key={tip.id} className="relative group">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={() => removeStylingTip(tip.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                      <Badge>{tip.occasion}</Badge>
                    </div>
                    <CardDescription>{tip.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {tip.items &&
                        tip.items.map((item, index) => (
                          <div key={index} className="flex-shrink-0">
                            <img
                              src={item.image_url || "/placeholder.svg"}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                            <p className="text-xs text-center mt-1 truncate max-w-[80px]">{item.name}</p>
                          </div>
                        ))}
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Styling Notes:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Tuck in the shirt for a more polished look</li>
                        <li>• Roll up sleeves slightly for a casual touch</li>
                        <li>• Add a simple necklace to elevate the outfit</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Wand2 className="h-10 w-10 mb-2" />
              <h3 className="font-medium text-lg mb-1">No styling tips yet</h3>
              <p className="text-sm max-w-xs mb-4">Add at least 3 items to your wardrobe and generate styling tips</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

