import { api } from "../axios";

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface User {
  userId: string;
  role: string;
  email: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export const loginUser = async (data: SigninData) => {
  const res = await api.post("/auth/signin", data);
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const registerUser = async (data: SignupData) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

export const fetchMe = async () => {
  const res = await api.get("/auth/me");
  console.log(res);
  return res.data;
};

export const changePassword = async (data: ChangePasswordData) => {
  const res = await api.post("/auth/change-password", data);
  return res.data;
};
