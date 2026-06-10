type RequestOptions = {
  query?: Record<string, string | undefined>;
};

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(path, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

export async function httpClient<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(buildUrl(path, options.query));

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}