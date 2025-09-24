

export async function handler(event) {
  try {
    const backendBase = "https://quiz-env.eba-ijxspiej.us-east-1.elasticbeanstalk.com";

    const cleanPath = event.path.replace("/.netlify/functions/proxy", "");
    const backendUrl = `${backendBase}${cleanPath}${event.rawQuery ? "?" + event.rawQuery : ""}`;

    console.log("Proxying request to:", backendUrl);

    // Native fetch is available on Netlify (Node 18+)
    const response = await fetch(backendUrl, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        host: null,
      },
      body: ["GET", "HEAD"].includes(event.httpMethod) ? undefined : event.body,
    });

    const contentType = response.headers.get("content-type") || "text/plain";
    const body =
      contentType.includes("application/json")
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
      body: JSON.stringify({ message: "Proxy failed", error: error.message }),
    };
  }
}
