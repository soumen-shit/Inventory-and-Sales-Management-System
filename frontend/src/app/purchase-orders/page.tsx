/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useCreatePurchaseOrder,
  usePurchaseOrders,
  useUpdatePurchaseOrderStatus,
} from "@/lib/queries/orders";
import { useSuppliers } from "@/lib/queries/suppliers";
import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const PurchaseOrdersPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ supplier_id: "" });
  const router = useRouter();

  const { data, isLoading } = usePurchaseOrders({
    page,
    limit: 10,
    status: statusFilter || undefined,
    supplier_id: supplierFilter || undefined,
  });

  console.log(data);

  const { data: suppliers } = useSuppliers();
  const createOrder = useCreatePurchaseOrder();
  const updateStatus = useUpdatePurchaseOrderStatus();

  const handleSubmit = () => {
    createOrder.mutate(formData, {
      onSuccess: (data: any) => {
        setOpenDialog(false);
        router.push(`/purchase-orders/${data.data.id}`);
      },
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
  };
  return (
    <ProtectedRoute>
      <Layout>
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Purchase Orders
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Create Order
            </Button>
          </Box>

          <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="RECEIVED">Received</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Supplier</InputLabel>
              <Select
                value={supplierFilter}
                onChange={(e) => {
                  setSupplierFilter(e.target.value);
                  setPage(1);
                }}
                label="Supplier"
              >
                <MenuItem value="">All</MenuItem>
                {suppliers?.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No purchase orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/purchase-orders/${order.id}`}
                          sx={{ cursor: "pointer", textDecoration: "none" }}
                        >
                          {order.id}
                        </Link>
                      </TableCell>
                      <TableCell>{order.supplier?.name || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(order.order_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell align="right">
                        ${Number(order.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={
                            order.status === "RECEIVED"
                              ? "success"
                              : order.status === "PENDING"
                                ? "warning"
                                : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {order.status === "PENDING" && (
                          <Select
                            size="small"
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="RECEIVED">Mark Received</MenuItem>
                            <MenuItem value="CANCELLED">Cancel</MenuItem>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {data && data.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={data.totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}

          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogContent>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={formData.supplier_id}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier_id: e.target.value })
                  }
                  label="Supplier"
                >
                  {suppliers?.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={createOrder.isPending}
              >
                Create
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
};

export default PurchaseOrdersPage;
