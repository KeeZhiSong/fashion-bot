"use client"

import { useState, useEffect } from "react"

export interface TrendItem {
  title: string
  description: string
  image: string
  growth: number
  categories: string[]
  source: string
  link?: string
  pubDate?: string
}

export interface TrendCategory {
  name: string
  count: number
}

export interface ColorPalette {
  [name: string]: Array<{ color: string; name: string }>
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor: string
    borderColor: string
  }>
}

export interface SeasonalTrends {
  [season: string]: TrendItem[]
}

export interface TrendData {
  trendItems: TrendItem[]
  trendingCategories: TrendCategory[]
  colorPalettes: ColorPalette
  chartData: ChartData
  seasonalTrends: SeasonalTrends
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useTrendData(): TrendData {
  const [trendItems, setTrendItems] = useState<TrendItem[]>([])
  const [trendingCategories, setTrendingCategories] = useState<TrendCategory[]>([])
  const [colorPalettes, setColorPalettes] = useState<ColorPalette>({})
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] })
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalTrends>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTrendData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/trends", {
        // Add cache control to prevent stale data
        cache: "no-store",
        next: { revalidate: 3600 }, // Revalidate every hour
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch trend data: ${response.status}`)
      }

      const data = await response.json()

      setTrendItems(data.trendItems || [])
      setTrendingCategories(data.trendingCategories || [])
      setColorPalettes(data.colorPalettes || {})
      setChartData(data.chartData || { labels: [], datasets: [] })
      setSeasonalTrends(data.seasonalTrends || {})
    } catch (err) {
      console.error("Error fetching trend data:", err)
      setError(err instanceof Error ? err : new Error(String(err)))

      // Set default empty values to prevent UI errors
      setTrendItems([])
      setTrendingCategories([])
      setColorPalettes({})
      setChartData({ labels: [], datasets: [] })
      setSeasonalTrends({})
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrendData()
  }, [])

  return {
    trendItems,
    trendingCategories,
    colorPalettes,
    chartData,
    seasonalTrends,
    isLoading,
    error,
    refetch: fetchTrendData,
  }
}

