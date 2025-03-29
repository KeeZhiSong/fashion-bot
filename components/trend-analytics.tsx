"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from "@/components/ui/charts"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTrendData } from "@/hooks/use-trend-data"

export function TrendAnalytics() {
  const { trendItems, chartData, colorPalettes, isLoading, error, refetch } = useTrendData()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Trending Fashion Analysis</CardTitle>
            <CardDescription>
              Track the growth of fashion trends over time based on social media engagement
            </CardDescription>
          </div>
          {!isLoading && (
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load trend data. Please try again later.</AlertDescription>
            </Alert>
          )}

          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <LineChart data={chartData} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Trends by Category</CardTitle>
          <CardDescription>Most popular fashion items by category</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              {trendItems.slice(0, 6).map((trend, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{trend.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {trend.categories.slice(0, 2).map((category, j) => (
                        <Badge key={j} variant="outline">
                          {category}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground">{trend.source}</span>
                    </div>
                  </div>
                  <Badge className="bg-primary">{trend.growth}%</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trending Color Palettes</CardTitle>
          <CardDescription>Popular color combinations in current fashion trends</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-2">
                      {Array(4)
                        .fill(0)
                        .map((_, j) => (
                          <Skeleton key={j} className="w-8 h-8 rounded-full" />
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(colorPalettes).map(([paletteName, colors], i) => (
                <div key={i} className="space-y-2">
                  <div className="font-medium">{paletteName}</div>
                  <div className="flex gap-2">
                    {colors.map((color, j) => (
                      <div
                        key={j}
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

