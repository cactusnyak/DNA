type QueryValue = string | number | boolean | null | undefined;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiResponse<TData> = {
  success: boolean;
  data: TData;
  error: {
    code: string;
    message: string | string[];
    path: string;
  } | null;
};

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

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const payload = (await response.json()) as ApiResponse<TResponse>;

  if (!response.ok || !payload.success) {
    const message = Array.isArray(payload.error?.message)
      ? payload.error.message.join(', ')
      : payload.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload.data;
}