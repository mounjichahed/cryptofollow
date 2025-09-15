export type RegisterBody = {
  email: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type AuthTokenResponse = {
  accessToken: string;
};

export interface AuthenticatedRequest {
  userId: string;
}

