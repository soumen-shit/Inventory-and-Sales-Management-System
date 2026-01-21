import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios";

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  gst_number?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSupplierDto {
  name: string;
  email: string;
  phone: string;
  address?: string;
  gst_number?: string;
  is_active?: boolean;
}

export interface UpdateSupplierDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gst_number?: string;
}

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data } = await api.get<Supplier[]>("/suppliers");
      return data;
    },
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: async () => {
      const { data } = await api.get<Supplier>(`/suppliers/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierDto) =>
      api.post<Supplier>("/suppliers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierDto }) =>
      api.patch<Supplier>(`/suppliers/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", variables.id] });
    },
  });
};

export const useToggleSupplierStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch(`/suppliers/${id}/status`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};
