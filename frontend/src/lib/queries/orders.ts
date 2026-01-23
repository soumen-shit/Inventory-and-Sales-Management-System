import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier?: {
    id: string;
    name: string;
  };
  status: string;
  total_amount: number;
  order_date: string;
  orderItems?: PurchaseOrderItem[];
  created_by?: string;
}

export interface PurchaseOrderItem {
  id: string;
  product_variant_id: string;
  variant?: any;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SalesOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer?: {
    id: string;
    name: string;
  };
  status: string;
  total_amount: number;
  order_date: string;
  orderItems?: SalesOrderItem[];
  created_by?: string;
}

export interface SalesOrderItem {
  id: string;
  product_variant_id: string;
  variant?: any;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrdersResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Purchase Orders
export const usePurchaseOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  supplier_id?: string;
}) => {
  return useQuery({
    queryKey: ["purchase-orders", params],
    queryFn: async () => {
      const { data } = await api.get<OrdersResponse<PurchaseOrder>>(
        "/purchase-orders",
        { params },
      );
      return data;
    },
  });
};

export const usePurchaseOrder = (id: string) => {
  return useQuery({
    queryKey: ["purchase-orders", id],
    queryFn: async () => {
      const { data } = await api.get<PurchaseOrder>(`/purchase-orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { supplier_id: string }) =>
      api.post<PurchaseOrder>("/purchase-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

export const useAddPurchaseOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        product_variant_id: string;
        quantity: number;
        unit_price: number;
      };
    }) => api.post(`/purchase-orders/${id}/items`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["purchase-orders", variables.id],
      });
    },
  });
};

export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/purchase-orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

// Sales Orders
export const useSalesOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  customer_id?: string;
  from_date?: string;
  to_date?: string;
}) => {
  return useQuery({
    queryKey: ["sales-orders", params],
    queryFn: async () => {
      const { data } = await api.get<OrdersResponse<SalesOrder>>(
        "/sales-orders",
        { params },
      );
      return data;
    },
  });
};

export const useSalesOrder = (id: string) => {
  return useQuery({
    queryKey: ["sales-orders", id],
    queryFn: async () => {
      const { data } = await api.get<SalesOrder>(`/sales-orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { customer_id: string }) =>
      api.post<SalesOrder>("/sales-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
    },
  });
};

export const useAddSalesOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        product_variant_id: string;
        quantity: number;
        unit_price: number;
      };
    }) => api.post(`/sales-orders/${id}/items`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["sales-orders", variables.id],
      });
    },
  });
};

export const useUpdateSalesOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/sales-orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
