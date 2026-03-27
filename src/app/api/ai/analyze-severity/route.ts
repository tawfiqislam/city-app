import { NextRequest, NextResponse } from "next/server"

// Hugging Face Inference API
const HF_API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest"

// Free API - No key required for some models, or use HF_API_KEY
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || ""

// Emergency keywords for local fallback
const emergencyKeywords = {
  urgent: ["urgent", "emergency", "immediate", "critical", "asap", "hurry"],
  high: ["dangerous", "accident", "injured", "broken", "flooding", "fire", "collapsed"],
  medium: ["problem", "issue", "not working", "damaged", "leaking", "blocked"],
  low: ["minor", "small", "little", "slight", "cosmetic"],
}

// Local keyword-based analysis (fallback)
function analyzeLocalSeverity(text: string): string {
  const lowerText = text.toLowerCase()

  if (emergencyKeywords.urgent.some(kw => lowerText.includes(kw))) {
    return "urgent"
  }
  if (emergencyKeywords.high.some(kw => lowerText.includes(kw))) {
    return "high"
  }
  if (emergencyKeywords.low.some(kw => lowerText.includes(kw))) {
    return "low"
  }
  return "medium"
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Try Hugging Face API first
    try {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(HF_API_KEY && { Authorization: `Bearer ${HF_API_KEY}` }),
        },
        body: JSON.stringify({ inputs: text }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Parse sentiment result
        // The model returns sentiment labels like "positive", "negative", "neutral"
        if (Array.isArray(result) && result[0]) {
          const sentiments = result[0]
          const topSentiment = sentiments.reduce((a: any, b: any) => 
            a.score > b.score ? a : b
          )

          // Map sentiment to priority
          let priority = "medium"
          if (topSentiment.label === "negative" && topSentiment.score > 0.7) {
            priority = "high"
          } else if (topSentiment.label === "negative" && topSentiment.score > 0.9) {
            priority = "urgent"
          } else if (topSentiment.label === "positive") {
            priority = "low"
          }

          // Also check for emergency keywords
          const keywordPriority = analyzeLocalSeverity(text)
          if (keywordPriority === "urgent" || keywordPriority === "high") {
            priority = keywordPriority
          }

          return NextResponse.json({
            success: true,
            priority,
            sentiment: topSentiment,
            source: "huggingface",
          })
        }
      }
    } catch (apiError) {
      console.log("Hugging Face API unavailable, using local analysis")
    }

    // Fallback to local keyword analysis
    const priority = analyzeLocalSeverity(text)

    return NextResponse.json({
      success: true,
      priority,
      source: "local",
    })
  } catch (error) {
    console.error("Severity analysis error:", error)
    return NextResponse.json(
      { error: "Analysis failed", priority: "medium" },
      { status: 500 }
    )
  }
}