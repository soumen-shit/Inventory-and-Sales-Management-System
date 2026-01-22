/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useCreateSupplierPayment,
  useSupplierPayments,
  useUpdateSupplierPaymentStatus,
} from "@/lib/queries/supplier-payments";
import { useSuppliers } from "@/lib/queries/suppliers";
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
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { format } from "date-fns";
import React, { useState } from "react";

const SupplierPaymentsPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const [supplierId, setSupplierId] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState("");

  const { data, isLoading } = useSupplierPayments({
    page,
    limit: 10,
    status: statusFilter || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const { data: suppliers } = useSuppliers();

  const createPayment = useCreateSupplierPayment();
  const updateStatus = useUpdateSupplierPaymentStatus();

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
  };

  const handleCreatePayment = () => {
    createPayment.mutate(
      {
        supplier_id: supplierId,
        purchase_order_id: purchaseOrderId || undefined,
        payment_date: paymentDate,
        amount: Number(amount),
      } as any,
      {
        onSuccess: () => {
          setOpenDialog(false);
          setSupplierId("");
          setPurchaseOrderId("");
          setPaymentDate("");
          setAmount("");
        },
      },
    );
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Box>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Supplier Payments
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Add Payment
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="date"
              label="From Date"
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
            />

            <TextField
              type="date"
              label="To Date"
              InputLabelProps={{ shrink: true }}
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
            />
          </Box>

          {/* Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Payment Date</TableCell>
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
                      No supplier payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>{payment.supplier?.name}</TableCell>
                      <TableCell align="right">
                        ₹{Number(payment.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.payment_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={
                            payment.status === "COMPLETED"
                              ? "success"
                              : payment.status === "PENDING"
                                ? "warning"
                                : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {payment.status === "PENDING" && (
                          <Select
                            size="small"
                            value={payment.status}
                            onChange={(e) =>
                              handleStatusChange(payment.id, e.target.value)
                            }
                          >
                            <MenuItem value="COMPLETED">Complete</MenuItem>
                            <MenuItem value="FAILED">Fail</MenuItem>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
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

          {/* ADD PAYMENT DIALOG */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Add Supplier Payment</DialogTitle>

            <DialogContent>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={supplierId}
                  label="Supplier"
                  onChange={(e) => {
                    setSupplierId(e.target.value);
                    setPurchaseOrderId("");
                  }}
                >
                  {suppliers?.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (Number(value) < 0) return;
                  setAmount(value);
                }}
                inputProps={{
                  min: 0,
                  step: "0.01",
                }}
                required
              />

              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Payment Date"
                InputLabelProps={{ shrink: true }}
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                disabled={!supplierId || !paymentDate}
                onClick={handleCreatePayment}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
};

export default SupplierPaymentsPage;
