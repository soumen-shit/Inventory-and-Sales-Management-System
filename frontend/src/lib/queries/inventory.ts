import { useQuery } from "@tanstack/react-query";
import { api } from "../axios";

export interface Inventory {
  id: string;
  quantity: number;
  variant: {
    id: string;
    variant_name: string;
    sku: string;
    price: number;
    product?: {
      id: string;
      name: string;
    };
  };
}

export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data } = await api.get<Inventory[]>("/inventory");
      return data;
    },
  });
};

export const useLowStock = () => {
  return useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: async () => {
      const { data } = await api.get<Inventory[]>("/inventory/low-stock");
      return data;
    },
  });
};

export const useInventoryByVariant = (variantId: string) => {
  return useQuery({
    queryKey: ["inventory", "variant", variantId],
    queryFn: async () => {
      const { data } = await api.get<Inventory>(
        `/inventory/${variantId}/variant`,
      );
      return data;
    },
    enabled: !!variantId,
  });
};
