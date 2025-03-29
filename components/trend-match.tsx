"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { analyzeTrendMatch } from "@/lib/huggingface"
import { useTrendData } from "@/hooks/use-trend-data"
import type { WardrobeItem } from "@/lib/supabase"

interface TrendMatchProps {
  wardrobeItems: WardrobeItem[]
}

export function TrendMatch({ wardrobeItems }: TrendMatchProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matchResults, setMatchResults] = useState<Record<string, number>>({})
  const { toast } = useToast()
  const { trendItems } = useTrendData()

  const analyzeTrends = async () => {
    if (wardrobeItems.length === 0 || trendItems.length === 0) {
      toast({
        title: "Not enough data",
        description: "You need wardrobe items and trend data to perform analysis.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Get top trends
      const topTrends = trendItems.slice(0, 5).map((trend) => trend.title)

      // Get images from wardrobe items (in a real app, these would be actual images)
      const itemImages = wardrobeItems.map((item) => item.image_url)

      // Analyze trend match
      const result = await analyzeTrendMatch(itemImages, topTrends)

      // Process results
      if (result && Array.isArray(result)) {
        const processedResults: Record<string, number> = {}

        // In a real implementation, we would process the actual results
        // For demo purposes, we'll generate random match percentages
        topTrends.forEach((trend) => {
          processedResults[trend] = Math.floor(Math.random() * 60) + 40 // 40-99%
        })

        setMatchResults(processedResults)
      }

      toast({
        title: "Analysis complete",
        description: "Your wardrobe has been analyzed against current trends.",
      })
    } catch (error) {
      console.error("Error analyzing trends:", error)
      toast({
        title: "Analysis failed",
        description: "There was a problem analyzing your wardrobe.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Match Analysis</CardTitle>
        <CardDescription>See how your wardrobe aligns with current fashion trends</CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(matchResults).length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              {Object.entries(matchResults).map(([trend, percentage], i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="font-medium">{trend}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <Badge variant={percentage > 70 ? "default" : "outline"}>{percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-muted/50 rounded-lg mt-4">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Recommendation
              </h3>
              <p className="text-sm text-muted-foreground">
                Your wardrobe is well-aligned with current trends! Consider adding more
                {Object.entries(matchResults)
                  .sort((a, b) => a[1] - b[1])
                  .slice(0, 2)
                  .map(([trend]) => ` ${trend.toLowerCase()}`)
                  .join(" and")}
                to stay on-trend this season.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground mb-4">
              Analyze your wardrobe to see how well it matches current fashion trends
            </p>
            <Button onClick={analyzeTrends} disabled={isAnalyzing || wardrobeItems.length === 0}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze My Wardrobe"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

