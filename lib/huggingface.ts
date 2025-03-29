/**
 * Client-side utility functions for interacting with Hugging Face API
 */

// Classify an image to identify clothing items
export async function classifyClothingItem(imageBase64: string) {
  try {
    const response = await fetch("/api/huggingface", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: "classify-image",
        data: {
          image: imageBase64,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to classify image")
    }

    const data = await response.json()
    return data.result
  } catch (error) {
    console.error("Error classifying clothing item:", error)
    return null
  }
}

// Extract dominant colors from an image
export async function extractColors(imageBase64: string) {
  try {
    const response = await fetch("/api/huggingface", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: "extract-colors",
        data: {
          image: imageBase64,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to extract colors")
    }

    const data = await response.json()
    return data.result
  } catch (error) {
    console.error("Error extracting colors:", error)
    return null
  }
}

// Generate styling tips based on wardrobe items
export async function generateStylingTips(items: string[], occasion: string) {
  try {
    const response = await fetch("/api/huggingface", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: "generate-styling-tips",
        data: {
          items,
          occasion,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate styling tips")
    }

    const data = await response.json()
    return data.result
  } catch (error) {
    console.error("Error generating styling tips:", error)
    return null
  }
}

// Process image for AI analysis
export function processImageForAI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result as string
      // Return only the base64 data part (remove the data:image/jpeg;base64, prefix)
      resolve(base64.split(",")[1])
    }
    reader.onerror = (error) => reject(error)
  })
}

// New function to analyze an outfit for trend matching
export async function analyzeTrendMatch(itemImages: string[], currentTrends: string[]) {
  try {
    const response = await fetch("/api/huggingface", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: "analyze-trend-match",
        data: {
          images: itemImages,
          trends: currentTrends,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to analyze trend match")
    }

    const data = await response.json()
    return data.result
  } catch (error) {
    console.error("Error analyzing trend match:", error)
    return null
  }
}

