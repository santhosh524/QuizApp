export async function handler(event) {
  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: "",
    };
  }

  try {
    // Base URL of your Spring Boot backend on AWS
    const backendBase =
      "https://quiz-env.eba-ijxspiej.us-east-1.elasticbeanstalk.com";

    // Remove Netlify function prefix from path
    const cleanPath = event.path.replace("/.netlify/functions/proxy", "");
    const backendUrl = `${backendBase}${cleanPath}${
      event.rawQuery ? "?" + event.rawQuery : ""
    }`;

    console.log("Proxying request to:", backendUrl);

    // Forward headers except 'host'
    const headers = { ...event.headers };
    delete headers.host;

    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: event.httpMethod,
      headers,
      body: ["GET", "HEAD"].includes(event.httpMethod) ? undefined : event.body,
    });

    // Get response content type
    const contentType = response.headers.get("content-type") || "text/plain";

    // Convert response
    const body = contentType.includes("application/json")
      ? JSON.stringify(await response.json())
      : await response.text();

    // Return backend response with CORS headers
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body,
    };
  } catch (error) {
    console.error("Proxy error:", error);

    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Proxy failed", error: error.message }),
    };
  }
}
