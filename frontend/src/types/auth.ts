export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  organization?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthState {
  user: import('./call').User | null;
  token: string | null;
  isAuthenticated: boolean;
}
