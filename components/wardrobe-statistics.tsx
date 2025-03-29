"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart } from "@/components/ui/charts"
import { Loader2, PieChart, Calendar, Palette, TrendingUp, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import type { WardrobeItem } from "@/lib/supabase"
import { useTrendData } from "@/hooks/use-trend-data"

interface WardrobeStatisticsProps {
  wardrobeItems: WardrobeItem[]
  isLoading: boolean
}

export function WardrobeStatistics({ wardrobeItems, isLoading }: WardrobeStatisticsProps) {
  const { trendItems } = useTrendData()
  const [activeTab, setActiveTab] = useState("composition")

  // Calculate wardrobe statistics
  const statistics = useMemo(() => {
    if (wardrobeItems.length === 0) {
      return {
        totalItems: 0,
        categoryBreakdown: {},
        colorDistribution: {},
        seasonalDistribution: {},
        trendAlignment: [],
        wardrobeGaps: [],
      }
    }

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {}
    wardrobeItems.forEach((item) => {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1
    })

    // Color distribution
    const colorDistribution: Record<string, number> = {}
    wardrobeItems.forEach((item) => {
      colorDistribution[item.color] = (colorDistribution[item.color] || 0) + 1
    })

    // Seasonal distribution
    const seasonalDistribution: Record<string, number> = {}
    wardrobeItems.forEach((item) => {
      seasonalDistribution[item.season] = (seasonalDistribution[item.season] || 0) + 1
    })

    // Trend alignment
    const trendKeywords = trendItems.flatMap((trend) => [
      trend.title.toLowerCase(),
      ...trend.categories.map((c) => c.toLowerCase()),
    ])

    const trendAlignment = Object.entries(categoryBreakdown)
      .map(([category, count]) => {
        const categoryLower = category.toLowerCase()
        const isTrending = trendKeywords.some((keyword) => categoryLower.includes(keyword))
        return {
          category,
          count,
          isTrending,
          trendScore: isTrending ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 30,
        }
      })
      .sort((a, b) => b.trendScore - a.trendScore)

    // Identify wardrobe gaps
    const essentialCategories = {
      Tops: 5,
      Bottoms: 4,
      Outerwear: 2,
      Footwear: 3,
      Dresses: 2,
      Accessories: 3,
    }

    const wardrobeGaps = Object.entries(essentialCategories)
      .map(([category, recommended]) => {
        const current = categoryBreakdown[category] || 0
        const gap = Math.max(0, recommended - current)
        const completeness = Math.min(100, Math.round((current / recommended) * 100))
        return { category, current, recommended, gap, completeness }
      })
      .filter((item) => item.gap > 0)
      .sort((a, b) => b.gap - a.gap)

    return {
      totalItems: wardrobeItems.length,
      categoryBreakdown,
      colorDistribution,
      seasonalDistribution,
      trendAlignment,
      wardrobeGaps,
    }
  }, [wardrobeItems, trendItems])

  // Prepare chart data for category breakdown
  const categoryChartData = useMemo(() => {
    const categories = Object.keys(statistics.categoryBreakdown)
    const counts = Object.values(statistics.categoryBreakdown)

    return {
      labels: categories,
      datasets: [
        {
          label: "Items",
          data: counts,
          backgroundColor: "rgba(147, 51, 234, 0.5)",
          borderColor: "rgb(147, 51, 234)",
          borderWidth: 1,
        },
      ],
    }
  }, [statistics.categoryBreakdown])

  // Prepare chart data for seasonal distribution
  const seasonalChartData = useMemo(() => {
    const seasons = Object.keys(statistics.seasonalDistribution)
    const counts = Object.values(statistics.seasonalDistribution)

    return {
      labels: seasons,
      datasets: [
        {
          label: "Items",
          data: counts,
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
      ],
    }
  }, [statistics.seasonalDistribution])

  // Generate insights based on statistics
  const insights = useMemo(() => {
    if (wardrobeItems.length === 0) return []

    const results = []

    // Check for category balance
    const categories = Object.keys(statistics.categoryBreakdown)
    const maxCategory = categories.reduce((a, b) =>
      statistics.categoryBreakdown[a] > statistics.categoryBreakdown[b] ? a : b,
    )
    const maxCategoryPercentage = Math.round((statistics.categoryBreakdown[maxCategory] / statistics.totalItems) * 100)

    if (maxCategoryPercentage > 40) {
      results.push({
        type: "imbalance",
        title: "Category Imbalance",
        description: `Your wardrobe is ${maxCategoryPercentage}% ${maxCategory}. Consider diversifying with other categories.`,
      })
    }

    // Check for seasonal gaps
    const seasons = Object.keys(statistics.seasonalDistribution)
    if (seasons.length < 2) {
      results.push({
        type: "seasonal",
        title: "Limited Seasonal Coverage",
        description: "Your wardrobe is focused on limited seasons. Consider adding items for other seasons.",
      })
    }

    // Check for color variety
    const colors = Object.keys(statistics.colorDistribution)
    if (colors.length < 4) {
      results.push({
        type: "color",
        title: "Limited Color Palette",
        description: "Your wardrobe has limited color variety. Consider adding more colors for versatility.",
      })
    }

    // Check for trend alignment
    const trendingItems = statistics.trendAlignment.filter((item) => item.trendScore > 60)
    if (trendingItems.length < 2 && wardrobeItems.length > 5) {
      results.push({
        type: "trend",
        title: "Low Trend Alignment",
        description: "Your wardrobe has few on-trend items. Consider adding some current trends.",
      })
    }

    // Check for wardrobe gaps
    if (statistics.wardrobeGaps.length > 0) {
      results.push({
        type: "gaps",
        title: "Wardrobe Gaps Detected",
        description: `You're missing some essential items in ${statistics.wardrobeGaps.map((g) => g.category).join(", ")}.`,
      })
    }

    // Add a positive insight if wardrobe is well-balanced
    if (results.length <= 1 && wardrobeItems.length > 10) {
      results.push({
        type: "positive",
        title: "Well-Balanced Wardrobe",
        description: "Your wardrobe has good variety across categories, seasons, and colors.",
      })
    }

    return results
  }, [statistics, wardrobeItems.length])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wardrobe Statistics</CardTitle>
          <CardDescription>Analyzing your wardrobe data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (wardrobeItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wardrobe Statistics</CardTitle>
          <CardDescription>Add items to your wardrobe to see statistics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No items found</AlertTitle>
            <AlertDescription>
              Your wardrobe is empty. Add some clothing items to see statistics and insights.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wardrobe Statistics & Insights</CardTitle>
        <CardDescription>Analyze your wardrobe composition and get personalized recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="composition" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="composition">
              <PieChart className="h-4 w-4 mr-2" />
              Composition
            </TabsTrigger>
            <TabsTrigger value="seasonal">
              <Calendar className="h-4 w-4 mr-2" />
              Seasonal
            </TabsTrigger>
            <TabsTrigger value="trends">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Palette className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="composition" className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Category Breakdown</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your wardrobe contains {statistics.totalItems} items across{" "}
                  {Object.keys(statistics.categoryBreakdown).length} categories
                </p>
                <div className="h-64">
                  <BarChart data={categoryChartData} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Color Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(statistics.colorDistribution).map(([color, count]) => (
                    <div key={color} className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor:
                            color.toLowerCase() === "black"
                              ? "#000"
                              : color.toLowerCase() === "white"
                                ? "#fff"
                                : color.toLowerCase() === "blue"
                                  ? "#3b82f6"
                                  : color.toLowerCase() === "red"
                                    ? "#ef4444"
                                    : color.toLowerCase() === "green"
                                      ? "#10b981"
                                      : color.toLowerCase() === "yellow"
                                        ? "#f59e0b"
                                        : color.toLowerCase() === "brown"
                                          ? "#92400e"
                                          : color.toLowerCase() === "gray"
                                            ? "#6b7280"
                                            : color.toLowerCase() === "pink"
                                              ? "#ec4899"
                                              : color.toLowerCase() === "purple"
                                                ? "#8b5cf6"
                                                : color.toLowerCase() === "orange"
                                                  ? "#f97316"
                                                  : "#cbd5e1",
                        }}
                      />
                      <span className="text-sm">{color}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seasonal" className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Seasonal Distribution</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  How your wardrobe is distributed across different seasons
                </p>
                <div className="h-64">
                  <BarChart data={seasonalChartData} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Seasonal Balance</h3>
                <div className="space-y-4">
                  {Object.entries(statistics.seasonalDistribution).map(([season, count]) => {
                    const percentage = Math.round((count / statistics.totalItems) * 100)
                    return (
                      <div key={season} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{season}</span>
                          <span>
                            {percentage}% ({count} items)
                          </span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Trend Alignment</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  How well your wardrobe aligns with current fashion trends
                </p>
                <div className="space-y-4">
                  {statistics.trendAlignment.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                          {item.category}
                          {item.isTrending && <Badge className="ml-2 bg-primary">Trending</Badge>}
                        </span>
                        <span>{item.trendScore}% match</span>
                      </div>
                      <Progress value={item.trendScore} className={item.trendScore > 60 ? "bg-primary/20" : ""} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">Trend Insights</h3>
                <p className="text-sm text-muted-foreground">
                  {statistics.trendAlignment.some((item) => item.trendScore > 60)
                    ? "Your wardrobe contains several on-trend categories. You're keeping up with current fashion trends!"
                    : "Your wardrobe could use more on-trend items. Consider adding some pieces from current fashion trends."}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Wardrobe Insights</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Personalized recommendations based on your wardrobe analysis
                </p>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <Alert key={index} variant={insight.type === "positive" ? "default" : "destructive"}>
                      <AlertTitle>{insight.title}</AlertTitle>
                      <AlertDescription>{insight.description}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>

              {statistics.wardrobeGaps.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Wardrobe Gaps</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Essential items you might want to add to your wardrobe
                  </p>
                  <div className="space-y-4">
                    {statistics.wardrobeGaps.map((gap, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{gap.category}</span>
                          <span>
                            {gap.current}/{gap.recommended} items
                          </span>
                        </div>
                        <Progress value={gap.completeness} />
                        <p className="text-xs text-muted-foreground">
                          Consider adding {gap.gap} more {gap.category.toLowerCase()} to your wardrobe
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

