import { NextRequest, NextResponse } from "next/server"

// Hugging Face Free Inference API
// Model: text-classification for sentiment/severity
const HF_API_URL =
  "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english"

// Optional: Get a free API key from https://huggingface.co/settings/tokens
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || ""

// Emergency keywords — immediate high priority
const emergencyKeywords: Record<string, string[]> = {
  urgent: [
    "urgent",
    "emergency",
    "immediate",
    "critical",
    "asap",
    "life threatening",
    "death",
    "dying",
    "collapsed",
    "explosion",
  ],
  high: [
    "dangerous",
    "accident",
    "injured",
    "flooding",
    "fire",
    "broken",
    "burst",
    "electric shock",
    "gas leak",
    "sinkhole",
    "sewage overflow",
    "major",
    "severe",
    "blocked road",
    "no water",
    "no electricity",
    "power outage",
  ],
  medium: [
    "problem",
    "issue",
    "not working",
    "damaged",
    "leaking",
    "blocked",
    "pothole",
    "garbage",
    "smell",
    "dirty",
    "broken pipe",
    "streetlight",
    "drain",
  ],
  low: [
    "minor",
    "small",
    "little",
    "slight",
    "cosmetic",
    "suggestion",
    "request",
    "improvement",
    "paint",
    "crack",
  ],
}

// Severity words that increase priority
const severityBoostWords = [
  "children",
  "school",
  "hospital",
  "elderly",
  "disabled",
  "pregnant",
  "baby",
  "night",
  "dark",
  "unsafe",
  "risk",
  "health hazard",
  "contaminated",
  "toxic",
  "spreading",
]

// Local keyword-based analysis (fallback + supplement)
function analyzeByKeywords(text: string): {
  priority: string
  score: number
  matchedKeywords: string[]
} {
  const lowerText = text.toLowerCase()
  const matchedKeywords: string[] = []
  let baseScore = 0

  // Check urgent keywords
  for (const kw of emergencyKeywords.urgent) {
    if (lowerText.includes(kw)) {
      matchedKeywords.push(kw)
      baseScore = Math.max(baseScore, 4) // urgent
    }
  }

  // Check high keywords
  for (const kw of emergencyKeywords.high) {
    if (lowerText.includes(kw)) {
      matchedKeywords.push(kw)
      baseScore = Math.max(baseScore, 3) // high
    }
  }

  // Check medium keywords
  for (const kw of emergencyKeywords.medium) {
    if (lowerText.includes(kw)) {
      matchedKeywords.push(kw)
      baseScore = Math.max(baseScore, 2) // medium
    }
  }

  // Check low keywords
  if (baseScore === 0) {
    for (const kw of emergencyKeywords.low) {
      if (lowerText.includes(kw)) {
        matchedKeywords.push(kw)
        baseScore = 1 // low
      }
    }
  }

  // Boost for severity words
  let boost = 0
  for (const word of severityBoostWords) {
    if (lowerText.includes(word)) {
      boost += 0.5
      matchedKeywords.push(`[boost: ${word}]`)
    }
  }

  // Adjust score with boost
  const finalScore = Math.min(baseScore + boost, 4)

  // Map score to priority
  let priority = "medium"
  if (finalScore >= 3.5) priority = "urgent"
  else if (finalScore >= 2.5) priority = "high"
  else if (finalScore >= 1.5) priority = "medium"
  else if (finalScore >= 0.5) priority = "low"
  else priority = "medium" // default

  return { priority, score: finalScore, matchedKeywords }
}

// Call Hugging Face API for AI-based analysis
async function analyzeByAI(
  text: string
): Promise<{ label: string; score: number } | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (HF_API_KEY) {
      headers["Authorization"] = `Bearer ${HF_API_KEY}`
    }

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ inputs: text }),
    })

    if (!response.ok) {
      console.log("Hugging Face API returned status:", response.status)
      return null
    }

    const result = await response.json()

    // Model returns array of arrays: [[{label, score}, ...]]
    if (Array.isArray(result) && Array.isArray(result[0])) {
      const predictions = result[0]
      // Find the prediction with highest score
      const top = predictions.reduce((a: any, b: any) =>
        a.score > b.score ? a : b
      )
      return { label: top.label, score: top.score }
    }

    // Some models return differently
    if (Array.isArray(result) && result[0]?.label) {
      return { label: result[0].label, score: result[0].score }
    }

    return null
  } catch (error) {
    console.error("Hugging Face API error:", error)
    return null
  }
}

// Combine AI + Keywords for best result
function combinedPriority(
  aiResult: { label: string; score: number } | null,
  keywordResult: { priority: string; score: number; matchedKeywords: string[] }
): string {
  // If AI analysis is available
  if (aiResult) {
    const aiLabel = aiResult.label.toUpperCase()
    const aiScore = aiResult.score

    // NEGATIVE sentiment = potentially higher priority
    if (aiLabel === "NEGATIVE" && aiScore > 0.9) {
      // Very negative — at least high
      if (keywordResult.score >= 3) return "urgent"
      return "high"
    }

    if (aiLabel === "NEGATIVE" && aiScore > 0.7) {
      // Moderately negative
      if (keywordResult.score >= 3) return "urgent"
      if (keywordResult.score >= 2) return "high"
      return "medium"
    }

    if (aiLabel === "POSITIVE") {
      // Positive sentiment — likely low priority unless keywords say otherwise
      if (keywordResult.score >= 3) return "high" // keywords override
      if (keywordResult.score >= 2) return "medium"
      return "low"
    }
  }

  // Fallback to keyword-only analysis
  return keywordResult.priority
}

export async function POST(request: NextRequest) {
  try {
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { text } = body

    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return NextResponse.json(
        { error: "Text must be at least 5 characters" },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Step 1: Keyword analysis (always works, instant)
    const keywordResult = analyzeByKeywords(text)

    // Step 2: AI analysis (may fail, has latency)
    const aiResult = await analyzeByAI(text)

    // Step 3: Combine both for final priority
    const finalPriority = combinedPriority(aiResult, keywordResult)

    // Step 4: Determine if it should be flagged as emergency
    const isEmergency =
      finalPriority === "urgent" ||
      (finalPriority === "high" && keywordResult.matchedKeywords.length >= 3)

    const timeTaken = Date.now() - startTime

    // Build detailed response
    const response: any = {
      success: true,
      priority: finalPriority,
      isEmergency,
      confidence: aiResult ? "high" : "medium",
      analysis: {
        method: aiResult ? "AI + Keywords" : "Keywords Only",
        timeTaken: `${timeTaken}ms`,
        keywordMatches: keywordResult.matchedKeywords,
        keywordScore: keywordResult.score,
      },
    }

    // Include AI details if available
    if (aiResult) {
      response.analysis.ai = {
        model: "distilbert-base-uncased-finetuned-sst-2-english",
        sentiment: aiResult.label,
        sentimentScore: aiResult.score.toFixed(4),
        source: "Hugging Face Inference API",
      }
    } else {
      response.analysis.ai = {
        status: "unavailable",
        note: "Using keyword-based analysis as fallback",
      }
    }

    // Explanation
    const explanations: Record<string, string> = {
      urgent:
        "This report describes a critical situation requiring immediate attention.",
      high: "This report indicates a significant issue that should be addressed soon.",
      medium:
        "This report describes a standard issue that should be handled in normal priority.",
      low: "This report describes a minor issue that can be scheduled for routine maintenance.",
    }
    response.explanation = explanations[finalPriority]

    console.log(
      `AI Severity: "${text.substring(0, 50)}..." → ${finalPriority} (${response.analysis.method}, ${timeTaken}ms)`
    )

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Severity analysis error:", error)
    return NextResponse.json(
      { error: "Analysis failed", priority: "medium", success: false },
      { status: 500 }
    )
  }
}