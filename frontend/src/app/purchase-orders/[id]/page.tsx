"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useAddPurchaseOrderItem,
  usePurchaseOrder,
  useUpdatePurchaseOrderStatus,
} from "@/lib/queries/orders";
import { useVariants } from "@/lib/queries/variants";
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order } = usePurchaseOrder(id);
  const { data: variants } = useVariants();
  const addItem = useAddPurchaseOrderItem();
  const updateStatus = useUpdatePurchaseOrderStatus();
  const router = useRouter();

  const [item, setItem] = useState({
    product_variant_id: "",
    quantity: 1,
    unit_price: 1,
  });

  const handleAddItem = () => {
    addItem.mutate(
      { id, data: item },
      {
        onSuccess: () => {
          router.push("/purchase-orders");
        },
      },
    );
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Typography variant="h4" mb={2}>
          Purchase Order {order?.order_number}
        </Typography>

        {/* Add Item */}
        {order?.status === "PENDING" && (
          <Box display="flex" gap={2} mb={3}>
            <FormControl fullWidth>
              <Select
                labelId="variant-label"
                label="Variant"
                value={item.product_variant_id}
                onChange={(e) =>
                  setItem({ ...item, product_variant_id: e.target.value })
                }
                fullWidth
              >
                {variants?.data?.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.variant_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="number"
              label="Qty"
              value={item.quantity}
              onChange={(e) =>
                setItem({ ...item, quantity: Number(e.target.value) })
              }
              sx={{ width: 100 }}
              inputProps={{
                min: 0,
              }}
            />

            <TextField
              type="number"
              label="Unit Price"
              value={item.unit_price}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value < 0) return;
                setItem({ ...item, unit_price: value });
              }}
              sx={{ width: 140 }}
              inputProps={{
                min: 0,
              }}
            />

            <Button
              variant="contained"
              onClick={handleAddItem}
              disabled={!item.product_variant_id}
            >
              Add
            </Button>
          </Box>
        )}

        {/* Items Table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Variant</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order?.orderItems?.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.variant?.variant_name}</TableCell>
                <TableCell>{i.quantity}</TableCell>
                <TableCell>₹{i.unit_price}</TableCell>
                <TableCell>₹{i.total_price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Status */}
        {order?.status === "PENDING" && (
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            color="success"
            onClick={() =>
              updateStatus.mutate({ id: order.id, status: "RECEIVED" })
            }
          >
            Mark as Received
          </Button>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
