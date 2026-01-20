"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role:
    | string
    | {
        id: string;
        name: string;
        description?: string;
        created_at?: string;
        updated_at?: string;
      };
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  is_active?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<User[]>("/users");
      return data;
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data } = await api.get<User>(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["users", "roles"],
    queryFn: async () => {
      const { data } = await api.get<Role[]>("/users/roles");
      return data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => api.post<User>("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      api.patch<User>(`/users/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
};
