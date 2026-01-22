import arcjet, { detectBot, shield, tokenBucket } from '@arcjet/next';

// Main Arcjet instance with shield and bot detection
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({
      mode: 'LIVE'
    }),
    detectBot({
      mode: 'LIVE',
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"]
    })
  ]
});

// Arcjet instance for rate limiting (e.g., collection creation)
const ajRateLimit = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"], // Track based on Clerk userId
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 10, // 10 collections
      interval: 3600, // per hour
      capacity: 10, // maximum burst capacity
    }),
  ],
});

// Helper to protect API routes with shield + bot detection
export async function protectRoute(request) {
  const decision = await aj.protect(request);
  
  if (decision.isDenied()) {
    return new Response("Forbidden", { status: 403 });
  }
  
  return null;
}

// Helper to protect routes with rate limiting
export async function protectWithRateLimit(request, userId) {
  const decision = await ajRateLimit.protect(request, { userId });
  
  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return new Response("Too many requests. Please try again later.", { 
        status: 429 
      });
    }
    return new Response("Forbidden", { status: 403 });
  }
  
  return null;
}

// Export both as named exports AND default export
export { aj, ajRateLimit };
export default aj;