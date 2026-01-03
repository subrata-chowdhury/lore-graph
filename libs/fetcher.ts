import { toast } from "react-toastify";

class Fetcher {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(
    endpoint: string,
    headers: HeadersInit = {}
  ): Promise<{ body: T | null; status: number; error: string | null }> {
    // const token = getCookie('token') || '';
    // console.log('Token', token)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: {
        ...headers,
        // 'Authorization': token,
      },
    });
    return this.handleResponse(response);
  }

  async post<P, T>(
    endpoint: string,
    body: P,
    headers: HeadersInit = {}
  ): Promise<{ body: T | null; status: number; error: string | null }> {
    // const token = getCookie('token') || '';
    // console.log('Token', token)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
        // 'Authorization': token,
      },
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async put<P, T>(
    endpoint: string,
    body: P,
    headers: HeadersInit = {}
  ): Promise<{ body: T | null; status: number; error: string | null }> {
    // const token = getCookie('token') || '';
    // console.log('Token', token)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...headers,
        // 'Authorization': token,
      },
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async delete<P, T>(
    endpoint: string,
    body?: P,
    headers: HeadersInit = {}
  ): Promise<{ body: T | null; status: number; error: string | null }> {
    // const token = getCookie('token') || '';
    // console.log('Token', token)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: {
        ...headers,
        // 'Authorization': token,
      },
      body: body ? JSON.stringify(body) : "",
    });
    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(
    response: Response
  ): Promise<{ body: T | null; status: number; error: string | null }> {
    if (response.status === 401) {
      if (window.location.href.includes("/super-admin"))
        window.location.href = "/login/super-admin?redirect=" + window.location.pathname;
      else if (!window.location.href.includes("/login"))
        window.location.href = "/login?redirect=" + window.location.pathname;
    }
    if (response.status === 403) {
      window.location.href = "/verify";
    }
    if (!response.ok) {
      try {
        const errorData = await response.json();
        return {
          body: null,
          status: response.status,
          error: errorData?.message || errorData?.error || "An error occurred",
        };
      } catch (e) {
        return { body: null, status: response.status, error: "An error occurred" };
      }
    }
    return {
      body: await (async () => {
        try {
          return await response.json();
        } catch {
          return null;
        }
      })(),
      status: response.status,
      error: null,
    };
  }
}

const fetcher = new Fetcher("/api");

export default fetcher;
