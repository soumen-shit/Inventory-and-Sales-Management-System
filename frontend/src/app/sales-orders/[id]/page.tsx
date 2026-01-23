"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useAddSalesOrderItem,
  usePurchaseOrder,
  useSalesOrder,
  useUpdateSalesOrderStatus,
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
import { useParams } from "next/navigation";
import { useState } from "react";

export default function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order } = useSalesOrder(id);
  const { data: variants } = useVariants();

  const addItem = useAddSalesOrderItem();
  const updateStatus = useUpdateSalesOrderStatus();

  const [item, setItem] = useState({
    product_variant_id: "",
    quantity: 1,
    unit_price: 0,
  });

  const handleAdd = () => {
    addItem.mutate({ id, data: item });
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Typography variant="h4" mb={2}>
          Sales Order {order?.order_number}
        </Typography>

        {/* Add Item */}
        {order?.status === "PENDING" && (
          <Box display="flex" gap={2} mb={3}>
            <FormControl fullWidth>
              <Select
                value={item.product_variant_id}
                onChange={(e) =>
                  setItem({ ...item, product_variant_id: e.target.value })
                }
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
            />

            <TextField
              type="number"
              label="Unit Price"
              value={item.unit_price}
              onChange={(e) =>
                setItem({ ...item, unit_price: Number(e.target.value) })
              }
            />

            <Button
              variant="contained"
              disabled={!item.product_variant_id}
              onClick={handleAdd}
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

        {/* Deliver */}
        {order?.status === "PENDING" && (
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            color="success"
            onClick={() =>
              updateStatus.mutate({ id: order.id, status: "DELIVERED" })
            }
          >
            Mark as Delivered
          </Button>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
