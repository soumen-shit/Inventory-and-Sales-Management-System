import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../axios';

export interface SupplierPayment {
  id: string;
  payment_number: string;
  purchase_order_id: string;
  supplier_id: string;
  supplier?: {
    id: string;
    name: string;
  };
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  purchase_order?: {
    id: string;
    order_number: string;
  };
}

export interface SupplierPaymentsResponse {
  data: SupplierPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateSupplierPaymentDto {
  purchase_order_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
}

export const useSupplierPayments = (params?: {
  page?: number;
  limit?: number;
  supplier_id?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
}) => {
  return useQuery({
    queryKey: ['supplier-payments', params],
    queryFn: async () => {
      const { data } = await api.get<SupplierPaymentsResponse>(
        '/supplier-payments',
        { params }
      );
      return data;
    },
  });
};

export const useSupplierPayment = (id: string) => {
  return useQuery({
    queryKey: ['supplier-payments', id],
    queryFn: async () => {
      const { data } = await api.get<SupplierPayment>(
        `/supplier-payments/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateSupplierPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierPaymentDto) =>
      api.post<SupplierPayment>('/supplier-payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] });
    },
  });
};

export const useUpdateSupplierPaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/supplier-payments/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] });
    },
  });
};

export const useSupplierPaymentsBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: ['supplier-payments', 'supplier', supplierId],
    queryFn: async () => {
      const { data } = await api.get<SupplierPayment[]>(
        `/suppliers/${supplierId}/payments`
      );
      return data;
    },
    enabled: !!supplierId,
  });
};

export const useSupplierPaymentsByPurchaseOrder = (poId: string) => {
  return useQuery({
    queryKey: ['supplier-payments', 'purchase-order', poId],
    queryFn: async () => {
      const { data } = await api.get<SupplierPayment[]>(
        `/purchase-orders/${poId}/payments`
      );
      return data;
    },
    enabled: !!poId,
  });
};
