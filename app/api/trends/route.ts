import { NextResponse } from "next/server"

// Cache the trend data to avoid excessive requests
let trendCache: any = null
let lastFetchTime = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export async function GET() {
  try {
    const currentTime = Date.now()

    // Return cached data if it's still valid
    if (trendCache && currentTime - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json(trendCache)
    }

    // For now, let's use fallback data instead of trying to fetch from RSS feeds
    // This will ensure the application works while we resolve the RSS parsing issue
    const trendData = getFallbackTrendData()

    // Update cache
    trendCache = trendData
    lastFetchTime = currentTime

    return NextResponse.json(trendData)
  } catch (error) {
    console.error("Error in trends API route:", error)

    // Return fallback data if fetch fails
    return NextResponse.json(getFallbackTrendData())
  }
}

// This function would normally fetch from RSS feeds, but we'll skip it for now
async function fetchTrendData() {
  // We'll just return the fallback data for now
  return getFallbackTrendData()
}

function getFallbackTrendData() {
  // Static fallback data in case API requests fail
  return {
    trendItems: [
      {
        title: "Oversized Blazers",
        description: "Oversized blazers continue to dominate both street style and office wear.",
        image: "/placeholder.svg?height=200&width=200",
        growth: 78,
        categories: ["Outerwear", "Office", "Fall"],
        source: "Fashion Trend Data",
      },
      {
        title: "Wide-Leg Pants",
        description: "Wide-leg pants offer comfort and style for all occasions.",
        image: "/placeholder.svg?height=200&width=200",
        growth: 65,
        categories: ["Bottoms", "Casual", "Year-round"],
        source: "Fashion Trend Data",
      },
      {
        title: "Chunky Loafers",
        description: "Chunky loafers add an edgy touch to any outfit.",
        image: "/placeholder.svg?height=200&width=200",
        growth: 52,
        categories: ["Footwear", "Office", "Fall"],
        source: "Fashion Trend Data",
      },
      {
        title: "Crochet Tops",
        description: "Crochet tops bring texture and a handmade feel to summer looks.",
        image: "/placeholder.svg?height=200&width=200",
        growth: 45,
        categories: ["Tops", "Summer", "Casual"],
        source: "Fashion Trend Data",
      },
      {
        title: "Leather Bomber Jackets",
        description: "Leather bomber jackets make a comeback for edgy winter style.",
        image: "/placeholder.svg?height=200&width=200",
        growth: 42,
        categories: ["Outerwear", "Winter", "Casual"],
        source: "Fashion Trend Data",
      },
      {
        title: "Cargo Pants",
        description: "Utility-inspired cargo pants blend function and fashion.",
        image: "/placeholder.svg?height=200&width=200",
        growth: 38,
        categories: ["Bottoms", "Spring", "Casual"],
        source: "Fashion Trend Data",
      },
      {
        title: "Statement Collars",
        description: "Bold, decorative collars add personality to simple outfits.",
        image: "/placeholder.svg?height=200&width=200",
        growth: 35,
        categories: ["Accessories", "Feminine", "Spring"],
        source: "Fashion Trend Data",
      },
      {
        title: "Platform Boots",
        description: "Platform boots add height and edge to any ensemble.",
        image: "/placeholder.svg?height=200&width=200",
        growth: 32,
        categories: ["Footwear", "Edgy", "Fall"],
        source: "Fashion Trend Data",
      },
    ],
    trendingCategories: [
      { name: "Outerwear", count: 15 },
      { name: "Bottoms", count: 12 },
      { name: "Footwear", count: 10 },
      { name: "Tops", count: 8 },
      { name: "Dresses", count: 7 },
      { name: "Accessories", count: 6 },
      { name: "Activewear", count: 5 },
      { name: "Formal", count: 4 },
    ],
    colorPalettes: {
      "Earth Tones": [
        { color: "#A0522D", name: "Sienna" },
        { color: "#8B4513", name: "SaddleBrown" },
        { color: "#CD853F", name: "Peru" },
        { color: "#DEB887", name: "BurlyWood" },
      ],
      Pastels: [
        { color: "#FFB6C1", name: "LightPink" },
        { color: "#ADD8E6", name: "LightBlue" },
        { color: "#FAFAD2", name: "LightGoldenrodYellow" },
        { color: "#D8BFD8", name: "Thistle" },
      ],
      "Bold Brights": [
        { color: "#FF4500", name: "OrangeRed" },
        { color: "#9932CC", name: "DarkOrchid" },
        { color: "#1E90FF", name: "DodgerBlue" },
        { color: "#32CD32", name: "LimeGreen" },
      ],
      Neutrals: [
        { color: "#000000", name: "Black" },
        { color: "#FFFFFF", name: "White" },
        { color: "#808080", name: "Gray" },
        { color: "#A9A9A9", name: "DarkGray" },
      ],
    },
    chartData: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
      datasets: [
        {
          label: "Oversized Blazers",
          data: [10, 15, 25, 32, 38, 45, 58, 70, 78],
          backgroundColor: "rgba(147, 51, 234, 0.5)",
          borderColor: "rgb(147, 51, 234)",
        },
        {
          label: "Wide-Leg Pants",
          data: [12, 18, 22, 28, 35, 42, 50, 58, 65],
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
        },
        {
          label: "Chunky Loafers",
          data: [8, 12, 18, 25, 30, 35, 42, 48, 52],
          backgroundColor: "rgba(236, 72, 153, 0.5)",
          borderColor: "rgb(236, 72, 153)",
        },
        {
          label: "Crochet Tops",
          data: [5, 8, 12, 18, 22, 28, 35, 40, 45],
          backgroundColor: "rgba(16, 185, 129, 0.5)",
          borderColor: "rgb(16, 185, 129)",
        },
        {
          label: "Leather Bomber Jackets",
          data: [7, 10, 15, 20, 25, 30, 35, 38, 42],
          backgroundColor: "rgba(245, 158, 11, 0.5)",
          borderColor: "rgb(245, 158, 11)",
        },
      ],
    },
    seasonalTrends: {
      "Spring/Summer 2023": [
        {
          title: "Crochet Tops",
          description: "Crochet tops bring texture and a handmade feel to summer looks.",
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Linen Sets",
          description: "Matching linen sets offer effortless summer style.",
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Pastel Blazers",
          description: "Soft-colored blazers for a fresh spring look.",
          image: "/placeholder.svg?height=200&width=200",
        },
      ],
      "Fall/Winter 2023": [
        {
          title: "Leather Bomber Jackets",
          description: "Leather bomber jackets make a comeback for edgy winter style.",
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Chunky Knits",
          description: "Oversized sweaters and cardigans for cozy winter days.",
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Plaid Everything",
          description: "Classic plaid patterns return for fall in various forms.",
          image: "/placeholder.svg?height=200&width=200",
        },
      ],
      "Resort 2024": [
        {
          title: "Linen Sets",
          description: "Matching linen sets offer effortless resort style.",
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Tropical Prints",
          description: "Bold tropical patterns for vacation vibes.",
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Crochet Dresses",
          description: "Lightweight crochet dresses for beach days.",
          image: "/placeholder.svg?height=200&width=200",
        },
      ],
      "Spring/Summer 2024 Preview": [
        {
          title: "Sheer Layers",
          description: "Transparent layers create dimension for next season.",
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Utility Details",
          description: "Functional pockets and straps on everyday pieces.",
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Saturated Colors",
          description: "Vibrant, bold colors dominate the upcoming season.",
          image: "/placeholder.svg?height=200&width=200",
        },
      ],
    },
  }
}

