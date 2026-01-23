import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios";

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: number;
  };
}

export interface PaymentsResponse {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePaymentDto {
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
}

export interface UpdatePaymentStatusDto {
  status: string;
}

export const usePayments = (params?: {
  page?: number;
  limit?: number;
  invoice_id?: string;
  from_date?: string;
  to_date?: string;
}) => {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: async () => {
      const { data } = await api.get<PaymentsResponse>("/payments", {
        params,
      });
      return data;
    },
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: async () => {
      const { data } = await api.get<Payment>(`/payments/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentDto) =>
      api.post<Payment>("/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/payments/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

export const usePaymentsByInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ["payments", "invoice", invoiceId],
    queryFn: async () => {
      const { data } = await api.get<Payment[]>(
        `/invoices/${invoiceId}/payments`,
      );
      return data;
    },
    enabled: !!invoiceId,
  });
};
