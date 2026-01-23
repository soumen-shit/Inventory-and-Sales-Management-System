"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  useReturns,
  useUpdateReturnStatus,
  useCreateReturn,
} from "@/lib/queries/returns";
import { useSalesOrders } from "@/lib/queries/orders";
import { format } from "date-fns";

export default function ReturnsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* Dialog state */
  const [openDialog, setOpenDialog] = useState(false);
  const [salesOrderId, setSalesOrderId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState("");

  const { data, isLoading } = useReturns({
    page,
    limit: 10,
    status: statusFilter || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const { data: salesOrders } = useSalesOrders({
    page: 1,
    limit: 1000,
    status: "DELIVERED",
  });

  const selectedOrder = salesOrders?.data?.find((o) => o.id === salesOrderId);

  const updateStatus = useUpdateReturnStatus();
  const createReturn = useCreateReturn();

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
  };

  const handleCreateReturn = () => {
    createReturn.mutate(
      {
        sales_order_id: salesOrderId,
        product_variant_id: variantId,
        quantity,
        reason,
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          setSalesOrderId("");
          setVariantId("");
          setQuantity(1);
          setReason("");
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
              Returns
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Create Return
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
                <MenuItem value="REQUESTED">Requested</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
                <MenuItem value="PROCESSED">Processed</MenuItem>
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
                  <TableCell>Return ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Return Date</TableCell>
                  <TableCell>Reason</TableCell>
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
                      No returns found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((ret) => (
                    <TableRow key={ret.id}>
                      <TableCell>{ret.id}</TableCell>
                      <TableCell>
                        {ret.salesOrder?.customer?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(ret.return_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{ret.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={ret.status}
                          size="small"
                          color={
                            ret.status === "PROCESSED"
                              ? "success"
                              : ret.status === "REJECTED"
                                ? "error"
                                : ret.status === "APPROVED"
                                  ? "info"
                                  : "warning"
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        {ret.status === "REQUESTED" && (
                          <Select
                            size="small"
                            value={ret.status}
                            onChange={(e) =>
                              handleStatusChange(ret.id, e.target.value)
                            }
                          >
                            <MenuItem value="APPROVED">Approve</MenuItem>
                            <MenuItem value="REJECTED">Reject</MenuItem>
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
              />
            </Box>
          )}

          {/* Create Return Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Create Return</DialogTitle>

            <DialogContent>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Sales Order</InputLabel>
                <Select
                  value={salesOrderId}
                  onChange={(e) => {
                    setSalesOrderId(e.target.value);
                    setVariantId("");
                  }}
                >
                  {salesOrders?.data?.map((order) => (
                    <MenuItem key={order.id} value={order.id}>
                      {order.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                disabled={!selectedOrder}
                required
              >
                <InputLabel>Product Variant</InputLabel>
                <Select
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                >
                  {selectedOrder?.orderItems?.map((item: any) => (
                    <MenuItem key={item.variant.id} value={item.variant.id}>
                      {item.variant.variant_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                type="number"
                label="Quantity"
                inputProps={{ min: 1 }}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Reason"
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleCreateReturn}
                disabled={!salesOrderId || !variantId || !reason}
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
}
