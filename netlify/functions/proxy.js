import fetch from "node-fetch";

export async function handler(event) {
  try {
    // Your backend base URL (Spring Boot on AWS)
    const backendBase =
      "http://quiz-env.eba-ijxspiej.us-east-1.elasticbeanstalk.com";
    const backendUrl = `${backendBase}${event.path.replace(
      "/.netlify/functions/proxy",
      ""
    )}`;

    const response = await fetch(backendUrl, {
      method: event.httpMethod,
      headers: { ...event.headers, host: null }, // prevent host mismatch
      body: ["GET", "HEAD"].includes(event.httpMethod) ? undefined : event.body,
    });

    const contentType =
      response.headers.get("content-type") || "application/json";
    const body = contentType.includes("application/json")
      ? JSON.stringify(await response.json())
      : await response.text();

    return {
      statusCode: response.status,
      headers: { "Content-Type": contentType },
      body,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Proxy error", error: error.toString() }),
    };
  }
}
