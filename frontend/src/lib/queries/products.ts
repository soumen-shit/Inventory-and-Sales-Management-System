import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
  reorder_level: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  category_id: string;
  reorder_level: number;
  is_active?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  category_id?: string;
  reorder_level?: number;
  is_active?: boolean;
}

export const useProducts = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await api.get<ProductsResponse>("/products", { params });
      return data;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductDto) =>
      api.post<Product>("/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      api.patch<Product>(`/products/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
    },
  });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/products/${id}/status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
