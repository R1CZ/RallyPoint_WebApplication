/* ------------------------------------------------------------------
   RallyPoint API Client
   Production-ready API client - NO FALLBACKS, real backend only
   ------------------------------------------------------------------ */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('rp_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(err.error || 'Request failed', res.status);
  }

  return res.json();
}

export const api = {
  // Auth
  auth: {
    register: (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
      dob?: string;
      country?: string;
      role?: 'player' | 'club';
    }) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    login: (email: string, password: string) =>
      request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    verifyEmail: (code: string) =>
      request<any>('/auth/verify-email', { method: 'POST', body: JSON.stringify({ code }) }),

    verifyPhone: (code: string) =>
      request<any>('/auth/verify-phone', { method: 'POST', body: JSON.stringify({ code }) }),

    me: () => request<any>('/auth/me'),
  },

  // Users
  users: {
    getProfile: (id: string) => request<any>(`/users/${id}`),
    updateProfile: (data: any) => request<any>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
    getClubs: (id: string) => request<any[]>(`/users/${id}/clubs`),
    getNotifications: (id: string) => request<any[]>(`/users/${id}/notifications`),
    markNotificationRead: (id: string) => request<any>(`/users/notifications/${id}/read`, { method: 'PUT' }),
  },

  // Clubs
  clubs: {
    getAll: () => request<any[]>('/clubs'),
    get: (id: string) => request<any>(`/clubs/${id}`),
    create: (data: any) => request<any>('/clubs', { method: 'POST', body: JSON.stringify(data) }),
    join: (id: string) => request<any>(`/clubs/${id}/join`, { method: 'POST' }),
    getMembers: (id: string) => request<any[]>(`/clubs/${id}/members`),
  },

  // Events
  events: {
    getAll: (clubId?: string) => request<any[]>(`/events${clubId ? `?clubId=${clubId}` : ''}`),
    get: (id: string) => request<any>(`/events/${id}`),
    create: (data: any) => request<any>('/events', { method: 'POST', body: JSON.stringify(data) }),
    register: (id: string) => request<any>(`/events/${id}/register`, { method: 'POST' }),
    sendChat: (id: string, data: { text?: string; receipt?: { fileName: string } }) =>
      request<any>(`/events/${id}/chat`, { method: 'POST', body: JSON.stringify(data) }),
    markPaid: (eventId: string, userId: string) =>
      request<any>(`/events/${eventId}/paid/${userId}`, { method: 'POST' }),
    saveBracket: (id: string, data: any) =>
      request<any>(`/events/${id}/bracket`, { method: 'POST', body: JSON.stringify(data) }),
    closeChat: (id: string) => request<any>(`/events/${id}/close-chat`, { method: 'POST' }),
  },

  // Matches
  matches: {
    getHistory: (userId: string) => request<any[]>(`/matches/history/${userId}`),
    record: (data: any) => request<any>('/matches', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Verification
  verification: {
    start: (data: { docType?: string; docName?: string }) =>
      request<any>('/verification/start', { method: 'POST', body: JSON.stringify(data) }),
    complete: (ratio: number) =>
      request<any>('/verification/complete', { method: 'POST', body: JSON.stringify({ ratio }) }),
    status: () => request<any>('/verification/status'),
  },
};

// Token management
export function setToken(token: string) {
  localStorage.setItem('rp_token', token);
}

export function clearToken() {
  localStorage.removeItem('rp_token');
}

export function getToken(): string | null {
  return localStorage.getItem('rp_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
