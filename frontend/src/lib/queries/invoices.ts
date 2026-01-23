/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios";

export interface Invoice {
  id: string;
  invoice_number: string;
  sales_order_id: string;
  customer_id: string;
  customer?: {
    id: string;
    name: string;
  };
  total_amount: number;
  status: string;
  invoice_date: string;
  due_date?: string;
  orderItem?: any[];
  salesOrder?: any;
}

export interface InvoicesResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateInvoiceDto {
  sales_order_id: string;
  due_date?: string;
}

export const useInvoices = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  from_date?: string;
  to_date?: string;
}) => {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: async () => {
      const { data } = await api.get<InvoicesResponse>("/invoices", {
        params,
      });
      return data;
    },
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const { data } = await api.get<Invoice>(`/invoices/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvoiceDto) =>
      api.post<Invoice>("/invoices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
    },
  });
};

export const useGenerateInvoicePDF = () => {
  return useMutation({
    mutationFn: (id: string) =>
      api.get(`/invoices/${id}/pdf`, { responseType: "blob" }),
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/invoices/${id}/status`, { status }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};
