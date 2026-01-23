/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Link,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  useSalesOrders,
  useCreateSalesOrder,
  useUpdateSalesOrderStatus,
} from "@/lib/queries/orders";
import { useCustomers } from "@/lib/queries/customers";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function SalesOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ customer_id: "" });
  const router = useRouter();

  const { data, isLoading } = useSalesOrders({
    page,
    limit: 10,
    status: statusFilter || undefined,
    customer_id: customerFilter || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const { data: customers } = useCustomers({ page: 1, limit: 1000 });
  const createOrder = useCreateSalesOrder();
  const updateStatus = useUpdateSalesOrderStatus();

  const handleSubmit = () => {
    createOrder.mutate(formData, {
      onSuccess: (data: any) => {
        setOpenDialog(false);
        router.push(`/sales-orders/${data.data.id}`);
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
              Sales Orders
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Create Order
            </Button>
          </Box>

          <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
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
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="SHIPPED">Shipped</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Customer</InputLabel>
              <Select
                value={customerFilter}
                onChange={(e) => {
                  setCustomerFilter(e.target.value);
                  setPage(1);
                }}
                label="Customer"
              >
                <MenuItem value="">All</MenuItem>
                {customers?.data?.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="date"
              label="From Date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="To Date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Customer</TableCell>
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
                      No sales orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/sales-orders/${order.id}`}
                          sx={{ cursor: "pointer", textDecoration: "none" }}
                        >
                          {order.id}
                        </Link>
                      </TableCell>
                      <TableCell>{order.customer?.name || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(order.order_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell align="right">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={
                            order.status === "DELIVERED"
                              ? "success"
                              : order.status === "SHIPPED"
                                ? "info"
                                : order.status === "CONFIRMED"
                                  ? "primary"
                                  : order.status === "PENDING"
                                    ? "warning"
                                    : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {order.status === "PENDING" ||
                          (order.status === "CONFIRMED" && (
                            <Select
                              size="small"
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value)
                              }
                              sx={{ minWidth: 120 }}
                            >
                              <MenuItem value="CONFIRMED">Confirm</MenuItem>
                              <MenuItem value="CANCELLED">Cancel</MenuItem>
                              <MenuItem value="DELIVERED">Delivered</MenuItem>
                            </Select>
                          ))}
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
            <DialogTitle>Create Sales Order</DialogTitle>
            <DialogContent>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={formData.customer_id}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_id: e.target.value })
                  }
                  label="Customer"
                >
                  {customers?.data?.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
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
}
