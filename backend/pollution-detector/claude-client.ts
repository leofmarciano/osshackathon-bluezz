import { secret } from "encore.dev/config";
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeAnalysisResponse } from "./types";

// Encore secret for Claude API key
const claudeApiKey = secret("AnthropicAPIKey");

export async function analyzeImageWithClaude(
  imageBase64: string,
  target: 'oil' | 'plastic',
  bbox: { minLat: number; minLon: number; maxLat: number; maxLon: number }
): Promise<ClaudeAnalysisResponse> {
  const apiKey = claudeApiKey();
  
  if (!apiKey) {
    throw new Error("Claude API key not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const systemPrompt = `You are a highly specialized environmental analyst with expertise in satellite imagery analysis for ocean pollution detection.
You must be CONSERVATIVE and PRECISE in your analysis - only report pollution when there is strong evidence.

For ${target === 'oil' ? 'OIL SPILL' : 'PLASTIC DEBRIS'} detection:

${target === 'oil' ? `
Sentinel-1 SAR Imagery Analysis:
- TRUE oil spills show VERY dark, smooth patches with sharp contrast to surrounding water
- Must have coherent shape and extent (not random dark pixels)
- Natural phenomena (low wind, shadows) can create false positives - be skeptical
- Minimum area for detection: 0.5 km²
- Confidence thresholds: >0.8 for detection, >0.9 for high severity
` : `
Sentinel-2 FDI (Floating Debris Index) Analysis:
- TRUE plastic shows as bright cyan/green concentrated patches
- Must show accumulation patterns consistent with currents
- Algae blooms and sediment can create false positives - be careful
- Minimum area for detection: 1 km²
- Confidence thresholds: >0.7 for detection, >0.85 for high severity
`}

Detection criteria:
- LOW severity: Small isolated patches, <5 km²
- MEDIUM severity: Moderate coverage, 5-20 km²
- HIGH severity: Large coverage, 20-50 km²
- CRITICAL severity: Massive coverage, >50 km²

If uncertain or image quality is poor, report "pollution_detected": false.
BE CONSERVATIVE - it's better to miss minor pollution than create false alarms.

CRITICAL: Return ONLY valid JSON, no markdown, no explanations.`;

  const userPrompt = `Analyze this satellite image for ${target} pollution.
Location: Lat ${bbox.minLat.toFixed(4)} to ${bbox.maxLat.toFixed(4)}, Lon ${bbox.minLon.toFixed(4)} to ${bbox.maxLon.toFixed(4)}
Image type: ${target === 'oil' ? 'Sentinel-1 SAR (radar)' : 'Sentinel-2 FDI (optical)'}

Return ONLY this JSON structure:
{
  "analysis": {
    "pollution_detected": boolean,
    "pollution_type": "oil" or "plastic" or "none",
    "confidence_score": 0.0 to 1.0,
    "severity_level": "low" or "medium" or "high" or "critical",
    "estimated_area_km2": number,
    "description": "string",
    "affected_regions": [{"x": number, "y": number, "width": number, "height": number}],
    "recommendations": ["string"]
  }
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 1024,
      temperature: 0.05, // Even lower temp for more consistent analysis
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
        {
          role: 'assistant',
          content: '{"analysis":' // Prefill to ensure JSON response
        }
      ],
    });

    // Get the text content from Claude's response
    const responseText = '{"analysis":' + message.content[0].text;
    
    // Parse the JSON response
    try {
      const analysisResult = JSON.parse(responseText) as ClaudeAnalysisResponse;
      return analysisResult;
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText);
      throw new Error("Failed to parse Claude response as JSON");
    }
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw error;
  }
}