export interface LoginParams {
  loginID: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}
export interface RegisterResponse {
  message: string;
  user: {
    user_name: string;
    email: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}
