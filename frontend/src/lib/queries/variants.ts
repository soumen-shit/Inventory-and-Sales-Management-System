/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios";

export interface ProductVariant {
  id: string;
  variant_name: string;
  sku: string;
  price: number;
  product_id: string;
  product?: {
    id: string;
    name: string;
  };
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VariantsResponse {
  data: ProductVariant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateVariantDto {
  variant_name: string;
  sku: string;
  price: number;
  product_id: string;
  is_active?: boolean;
}

export interface UpdateVariantDto {
  variant_name?: string;
  sku?: string;
  price?: number;
  is_active?: boolean;
}

export const useVariants = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["variants", params],
    queryFn: async () => {
      const { data } = await api.get<VariantsResponse>("/product-variants", {
        params,
      });
      return data;
    },
  });
};

export const useProductVariants = (productId: string) => {
  return useQuery({
    queryKey: ["variants", "product", productId],
    queryFn: async () => {
      const { data } = await api.get<{
        product: any;
        variants: ProductVariant[];
      }>(`/product-variants/${productId}/variants`);
      return data;
    },
    enabled: !!productId,
  });
};

export const useCreateVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVariantDto) =>
      api.post<ProductVariant>("/product-variants", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] });
    },
  });
};

export const useUpdateVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVariantDto }) =>
      api.patch<ProductVariant>(`/product-variants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] });
    },
  });
};

export const useToggleVariantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch(`/product-variants/${id}/status`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] });
    },
  });
};
