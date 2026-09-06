const API_ORIGIN = "https://fundedwealth-api-production.up.railway.app";

export default async function handler(request, response) {
  const slug = typeof request.query?.slug === "string" ? request.query.slug : "";
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    response.status(404).send("Not Found");
    return;
  }

  try {
    const articleResponse = await fetch(
      `${API_ORIGIN}/api/blog/${encodeURIComponent(slug)}`,
      { headers: { accept: "application/json" } },
    );

    if (articleResponse.status === 404) {
      response.status(404).send("Not Found");
      return;
    }

    if (!articleResponse.ok) {
      response.status(502).send("Blog validation unavailable");
      return;
    }

    const indexResponse = await fetch("https://www.fundedwealth.com/index.html");
    if (!indexResponse.ok) {
      response.status(502).send("Frontend unavailable");
      return;
    }

    response.setHeader("content-type", "text/html; charset=utf-8");
    response.status(200).send(await indexResponse.text());
  } catch {
    response.status(502).send("Blog validation unavailable");
  }
}