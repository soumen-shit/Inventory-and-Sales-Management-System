import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios";

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  parent?: Category;
  children?: Category[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parent_id?: string;
  is_active?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parent_id?: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Category[]>("/product-categories");
      return data;
    },
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: async () => {
      const { data } = await api.get<Category>(`/product-categories/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const quertClinet = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) =>
      api.post<Category>("/product-categories", data),
    onSuccess: () => {
      quertClinet.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      api.patch<Category>(`/product-categories/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories", variables.id] });
    },
  });
};

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/product-categories/${id}/status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
