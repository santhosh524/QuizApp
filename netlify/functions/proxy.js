import fetch from "node-fetch";

export async function handler(event) {
  try {
    // Your backend base URL (Spring Boot on AWS Elastic Beanstalk)
    const backendBase =
      "https://quiz-env.eba-ijxspiej.us-east-1.elasticbeanstalk.com";

    // Remove Netlify's prefix from path
    const cleanPath = event.path.replace("/.netlify/functions/proxy", "");

    // Full backend URL with query string
    const backendUrl = `${backendBase}${cleanPath}${
      event.rawQuery ? "?" + event.rawQuery : ""
    }`;

    console.log("Proxying request to:", backendUrl);

    // Forward the request
    const response = await fetch(backendUrl, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        host: null, // remove Netlify host header to avoid conflicts
      },
      body: ["GET", "HEAD"].includes(event.httpMethod) ? undefined : event.body,
    });

    // Capture backend response
    const contentType = response.headers.get("content-type") || "text/plain";
    const body = contentType.includes("application/json")
      ? JSON.stringify(await response.json())
      : await response.text();

    return {
      statusCode: response.status,
      headers: { "Content-Type": contentType },
      body,
    };
  } catch (error) {
    console.error("Proxy error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Proxy failed",
        error: error.message,
      }),
    };
  }
}
