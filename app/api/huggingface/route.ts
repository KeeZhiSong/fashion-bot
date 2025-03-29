import { NextResponse } from "next/server"

// Get the API key from environment variables
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY

// Cache for API responses to reduce redundant calls
const responseCache = new Map()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export async function POST(request: Request) {
  try {
    const { task, data } = await request.json()

    // Check if API key is available
    if (!HUGGING_FACE_API_KEY) {
      console.error("Hugging Face API key is not configured")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Different endpoints based on the task
    let endpoint = ""
    let payload = {}
    let cacheKey = ""

    switch (task) {
      case "classify-image":
        endpoint = "https://api-inference.huggingface.co/models/microsoft/resnet-50"
        payload = { inputs: data.image }
        cacheKey = `classify-${data.image.substring(0, 50)}`
        break

      case "generate-styling-tips":
        endpoint = "https://api-inference.huggingface.co/models/gpt2"
        payload = {
          inputs: `Generate styling tips for the following clothing items: ${data.items.join(", ")}. 
                 Consider the occasion: ${data.occasion}.`,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            top_p: 0.9,
          },
        }
        cacheKey = `styling-${data.items.join("-")}-${data.occasion}`
        break

      case "extract-colors":
        endpoint = "https://api-inference.huggingface.co/models/facebook/detr-resnet-50"
        payload = { inputs: data.image }
        cacheKey = `colors-${data.image.substring(0, 50)}`
        break

      case "analyze-trend-match":
        endpoint = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
        payload = {
          inputs: {
            premise: `Outfit containing: ${data.images.length} items.`,
            hypothesis: `This outfit matches these trends: ${data.trends.join(", ")}.`,
          },
        }
        cacheKey = `trend-match-${data.trends.join("-")}`
        break

      default:
        return NextResponse.json({ error: "Invalid task" }, { status: 400 })
    }

    // Check cache first
    const now = Date.now()
    if (responseCache.has(cacheKey)) {
      const { timestamp, result } = responseCache.get(cacheKey)
      if (now - timestamp < CACHE_DURATION) {
        return NextResponse.json({ result })
      }
    }

    // Make the API request
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Hugging Face API error:", error)
      return NextResponse.json({ error }, { status: response.status })
    }

    const result = await response.json()

    // Cache the result
    responseCache.set(cacheKey, {
      timestamp: now,
      result,
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error processing Hugging Face request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

