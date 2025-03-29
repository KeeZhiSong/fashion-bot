"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Calendar, Tag, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTrendData } from "@/hooks/use-trend-data"

export function TrendExplorer() {
  const [searchQuery, setSearchQuery] = useState("")
  const { trendItems, trendingCategories, seasonalTrends, isLoading, refetch } = useTrendData()

  // Filter trend items based on search query
  const filteredTrendItems = searchQuery
    ? trendItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.categories.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : trendItems

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Explore Fashion Trends</CardTitle>
            <CardDescription>Search for specific trends or browse by category</CardDescription>
          </div>
          {!isLoading && (
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search trends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="trending">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trending">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="seasonal">
                  <Calendar className="h-4 w-4 mr-2" />
                  Seasonal
                </TabsTrigger>
                <TabsTrigger value="categories">
                  <Tag className="h-4 w-4 mr-2" />
                  Categories
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="pt-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                          <Skeleton className="w-full h-48" />
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <Skeleton className="h-5 w-32 mb-2" />
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <Skeleton className="h-4 w-16" />
                                  <Skeleton className="h-4 w-16" />
                                </div>
                              </div>
                              <Skeleton className="h-6 w-12" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredTrendItems.map((item, i) => (
                      <Card key={i} className="overflow-hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{item.title}</h3>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.categories.slice(0, 3).map((tag, j) => (
                                  <Badge key={j} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Badge className="bg-primary">+{item.growth}%</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="seasonal" className="pt-6">
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                          <div className="relative">
                            <Skeleton className="w-full h-40" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                              <Skeleton className="h-6 w-40 m-4" />
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(seasonalTrends).map(([season, items], i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={items[0]?.image || "/placeholder.svg?height=200&width=400"}
                            alt={season}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                            <h3 className="text-white font-medium p-4">{season}</h3>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="categories" className="pt-6">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array(8)
                      .fill(0)
                      .map((_, i) => (
                        <Card key={i} className="flex flex-col items-center justify-center p-6">
                          <Skeleton className="h-5 w-24" />
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {trendingCategories.map((category, i) => (
                      <Card
                        key={i}
                        className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer"
                      >
                        <h3 className="font-medium">{category.name}</h3>
                        <span className="text-xs text-muted-foreground mt-1">
                          {category.count} {category.count === 1 ? "item" : "items"}
                        </span>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

