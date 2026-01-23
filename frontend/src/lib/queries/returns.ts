/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios";

export interface Return {
  id: string;
  return_number: string;
  sales_order_id: string;
  customer_id: string;
  customer?: {
    id: string;
    name: string;
  };
  reason: string;
  status: string;
  return_date: string;
  items?: any[];
}

export interface ReturnsResponse {
  data: Return[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateReturnDto {
  sales_order_id: string;
  reason: string;
  items: Array<{
    sales_order_item_id: string;
    quantity: number;
  }>;
}

export const useReturns = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  customer_id?: string;
  from_date?: string;
  to_date?: string;
}) => {
  return useQuery({
    queryKey: ["returns", params],
    queryFn: async () => {
      const { data } = await api.get<ReturnsResponse>("/returns", {
        params,
      });
      return data;
    },
  });
};

export const useReturn = (id: string) => {
  return useQuery({
    queryKey: ["returns", id],
    queryFn: async () => {
      const { data } = await api.get<Return>(`/returns/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReturnDto) => api.post<Return>("/returns", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
    },
  });
};

export const useUpdateReturnStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/returns/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
    },
  });
};
