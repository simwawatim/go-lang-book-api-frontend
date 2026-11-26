export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  published_year: number | null;
  description: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
};

export type BookList = {
  data: Book[];
  total: number;
  limit: number;
  offset: number;
};

export type BookInput = {
  title: string;
  author: string;
  isbn: string;
  published_year: number | null;
  description: string;
};

export type AuthResponse = {
  token: string;
  expires_at: string;
  user: User;
};

export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  status: number;
  fields?: FieldErrors;

  constructor(status: number, message: string, fields?: FieldErrors) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const TOKEN_KEY = "bookapi.token";
export const USER_KEY = "bookapi.user";
export const EXPIRED_EVENT = "bookapi:expired";

function storedToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  const token = storedToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`/api${path}`, { ...init, headers, cache: "no-store" });
  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event(EXPIRED_EVENT));
    throw new ApiError(res.status, body.error ?? `Request failed with status ${res.status}`, body.fields);
  }
  return body as T;
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  listBooks: (search: string, limit: number, offset: number) => {
    const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (search) q.set("search", search);
    return request<BookList>(`/books?${q}`);
  },
  getBook: (id: string) => request<Book>(`/books/${id}`),
  createBook: (input: BookInput) =>
    request<Book>("/books", { method: "POST", body: JSON.stringify(input) }),
  updateBook: (id: number, input: BookInput) =>
    request<Book>(`/books/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteBook: (id: number) => request<void>(`/books/${id}`, { method: "DELETE" }),
};
