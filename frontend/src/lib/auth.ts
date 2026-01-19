import { api } from "./axios";
export const loginUser = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/signin", data);
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const registerUser = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

export const fetchMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const changePassword = async (data: {
  oldPassword: string;
  newPassword: string;
}) => {
  const res = await api.post("/auth/change-password", data);
  return res.data;
};
