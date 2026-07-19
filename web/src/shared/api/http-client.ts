type QueryValue = string | number | boolean | null | undefined;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions<TBody = unknown> = {
  method?: HttpMethod;
  query?: Record<string, QueryValue>;
  body?: TBody;
  headers?: HeadersInit;
};

const API_PREFIX = '/api';

function buildApiPath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath.startsWith(API_PREFIX)) {
    return normalizedPath;
  }

  return `${API_PREFIX}${normalizedPath}`;
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(buildApiPath(path), window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function httpClient<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (
    options.body !== undefined &&
    !headers.has('Content-Type') &&
    !isFormData
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const body: BodyInit | undefined =
    options.body !== undefined
      ? isFormData
        ? (options.body as BodyInit)
        : JSON.stringify(options.body)
      : undefined;

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}