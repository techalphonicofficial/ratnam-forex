export const DEFAULT_API_BASE_URL = 'https://ratnamforex.yber.in/api/v1';

export const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_API_BASE_URL;

export const API_FETCH_TIMEOUT_MS = Number(
  process.env.API_FETCH_TIMEOUT_MS ||
  process.env.NEXT_PUBLIC_API_FETCH_TIMEOUT_MS ||
  3000
);

export const getBackendOrigin = () => API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export const buildBackendUrl = (path) => new URL(path, getBackendOrigin()).toString();

export const apiFetchOptions = (options = {}) => {
  const timeout = Number.isFinite(API_FETCH_TIMEOUT_MS) && API_FETCH_TIMEOUT_MS > 0
    ? API_FETCH_TIMEOUT_MS
    : 3000;

  return {
    ...options,
    signal: AbortSignal.timeout(timeout),
  };
};
