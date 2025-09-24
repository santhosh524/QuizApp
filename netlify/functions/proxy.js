export async function handler(event) {
  // Handle CORS preflight
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
    const backendBase = "http://quiz-env.eba-ijxspiej.us-east-1.elasticbeanstalk.com";
    const cleanPath = event.path.replace("/.netlify/functions/proxy", "");
    const backendUrl = `${backendBase}${cleanPath}${event.rawQuery ? "?" + event.rawQuery : ""}`;

    console.log("Proxying request to:", backendUrl);

    // Forward headers from client request
    const headers = { "Content-Type": "application/json" }; // always set JSON

    // Forward Authorization header if present
    if (event.headers.authorization) {
      headers["Authorization"] = event.headers.authorization;
    }

    console.log(headers);

    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: event.httpMethod,
      headers,
      body: ["GET", "HEAD"].includes(event.httpMethod) ? undefined : event.body,
    });

    const contentType = response.headers.get("content-type") || "text/plain";

    const body = contentType.includes("application/json")
      ? JSON.stringify(await response.json())
      : await response.text();

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
