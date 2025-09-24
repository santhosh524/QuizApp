export async function handler(event) {
  try {
    const backendBase =
      "http://quiz-env.eba-ijxspiej.us-east-1.elasticbeanstalk.com";

    const cleanPath = event.path.replace("/.netlify/functions/proxy", "");
    const backendUrl = `${backendBase}${cleanPath}${
      event.rawQuery ? "?" + event.rawQuery : ""
    }`;

    console.log("Proxying:", event.httpMethod, backendUrl);

    // Forward all headers except 'host'
    const headers = { ...event.headers };
    delete headers.host;

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
