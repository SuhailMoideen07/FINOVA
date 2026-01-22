import { NextResponse } from "next/server";

// Create this file at: app/api/test-groq/route.js

export async function GET() {
  try {
    console.log("🚀 Testing Groq API connection...");

    // Check if API key exists
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY not found in environment variables");
      return NextResponse.json(
        {
          success: false,
          error: "GROQ_API_KEY is not set in environment variables",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    console.log("✅ GROQ_API_KEY found");

    // Test 1: Simple text generation
    console.log("📝 Test 1: Testing text generation...");
    const textResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: "Say 'Hello from Groq!' and nothing else.",
            },
          ],
          temperature: 0.1,
          max_tokens: 50,
        }),
      }
    );

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error("❌ Text generation failed:", errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Groq API Error: ${textResponse.status} - ${textResponse.statusText}`,
          details: errorText,
          timestamp: new Date().toISOString(),
        },
        { status: textResponse.status }
      );
    }

    const textResult = await textResponse.json();
    const textOutput = textResult.choices[0].message.content;
    console.log("✅ Text generation successful:", textOutput);

    // Test 2: JSON mode generation
    console.log("📊 Test 2: Testing JSON mode...");
    const jsonResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: `Return a JSON object with these fields:
{
  "status": "working",
  "message": "Groq API is functioning correctly",
  "timestamp": "${new Date().toISOString()}"
}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 200,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!jsonResponse.ok) {
      const errorText = await jsonResponse.text();
      console.error("❌ JSON mode failed:", errorText);
      return NextResponse.json(
        {
          success: false,
          error: `JSON mode test failed: ${jsonResponse.status}`,
          details: errorText,
          timestamp: new Date().toISOString(),
        },
        { status: jsonResponse.status }
      );
    }

    const jsonResult = await jsonResponse.json();
    const jsonOutput = JSON.parse(jsonResult.choices[0].message.content);
    console.log("✅ JSON mode successful:", jsonOutput);

    // Test 3: Check rate limits from headers
    const rateLimitInfo = {
      requestsRemaining: jsonResponse.headers.get("x-ratelimit-remaining-requests"),
      tokensRemaining: jsonResponse.headers.get("x-ratelimit-remaining-tokens"),
      requestsLimit: jsonResponse.headers.get("x-ratelimit-limit-requests"),
      tokensLimit: jsonResponse.headers.get("x-ratelimit-limit-tokens"),
    };
    console.log("📊 Rate limit info:", rateLimitInfo);

    // All tests passed!
    console.log("🎉 All Groq API tests passed successfully!");

    return NextResponse.json({
      success: true,
      message: "All Groq API tests passed!",
      tests: {
        textGeneration: {
          passed: true,
          model: "llama-3.3-70b-versatile",
          response: textOutput,
        },
        jsonMode: {
          passed: true,
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          response: jsonOutput,
        },
      },
      rateLimits: rateLimitInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint for testing with custom prompts
export async function POST(request) {
  try {
    const { prompt, model = "llama-3.3-70b-versatile" } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing custom prompt with model: ${model}`);

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `Groq API Error: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    const output = result.choices[0].message.content;

    return NextResponse.json({
      success: true,
      model,
      prompt,
      response: output,
      usage: result.usage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Custom prompt test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}