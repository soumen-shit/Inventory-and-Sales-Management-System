/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useCreateInvoice,
  useGenerateInvoicePDF,
  useInvoices,
  useUpdateInvoiceStatus,
} from "@/lib/queries/invoices";
import { useSalesOrders } from "@/lib/queries/orders";
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
import { format } from "date-fns";
import React, { useState } from "react";

const InvoicesPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState({
    sales_order_id: "",
    due_date: format(
      // eslint-disable-next-line react-hooks/purity
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd",
    ),
  });

  const { data, isLoading } = useInvoices({
    page,
    limit: 10,
    status: statusFilter || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const { data: salesOrders } = useSalesOrders({
    page: 1,
    limit: 1000,
    status: "CONFIRMED",
  });

  const createInvoice = useCreateInvoice();
  const generatePDF = useGenerateInvoicePDF();
  const updateStatus = useUpdateInvoiceStatus();

  const handleSubmit = () => {
    createInvoice.mutate(formData, {
      onSuccess: () => {
        setOpenDialog(false);
        setFormData({
          sales_order_id: "",
          due_date: format(
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            "yyyy-MM-dd",
          ),
        });
      },
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
  };

  const handleGeneratePDF = (id: string) => {
    generatePDF.mutate(id, {
      onSuccess: (res: any) => {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" }),
        );

        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      },
    });
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
              Invoices
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Create Invoice
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
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="OVERDUE">Overdue</MenuItem>
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
                  <TableCell>Invoice No</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Invoice Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="justify">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number}</TableCell>
                      <TableCell>
                        {invoice.salesOrder?.customer?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoice_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell align="right">
                        ₹{Number(invoice.total_amount).toFixed(2)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {invoice.status === "PENDING" ? (
                          <Select
                            size="small"
                            value="PENDING"
                            onChange={(e) =>
                              handleStatusChange(invoice.id, e.target.value)
                            }
                            displayEmpty
                          >
                            <MenuItem value="PENDING" disabled>
                              PENDING
                            </MenuItem>
                            <MenuItem value="PAID">PAID</MenuItem>
                            <MenuItem value="OVERDUE">OVERDUE</MenuItem>
                          </Select>
                        ) : (
                          <Chip
                            label={invoice.status}
                            color={
                              invoice.status === "PAID" ? "success" : "error"
                            }
                            size="small"
                          />
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => handleGeneratePDF(invoice.id)}
                        >
                          PDF
                        </Button>
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
              />
            </Box>
          )}

          {/* Create Invoice Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Create Invoice</DialogTitle>

            <DialogContent>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Sales Order</InputLabel>
                <Select
                  value={formData.sales_order_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sales_order_id: e.target.value,
                    })
                  }
                >
                  {salesOrders?.data?.map((order) => (
                    <MenuItem key={order.id} value={order.id}>
                      {order.id} – ₹{Number(order.total_amount).toFixed(2)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                margin="normal"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={createInvoice.isPending}
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

export default InvoicesPage;
