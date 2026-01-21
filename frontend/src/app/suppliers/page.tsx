/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useCreateSupplier,
  useSuppliers,
  useToggleSupplierStatus,
  useUpdateSupplier,
} from "@/lib/queries/suppliers";
import { Add, Cancel, CheckCircle, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

const SuppliersPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gst_number: "",
  });

  const { data: suppliers, isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const toggleStatus = useToggleSupplierStatus();

  const handleOpenDialog = (supplier?: any) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address || "",
        gst_number: supplier.gst_number || "",
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        gst_number: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSupplier(null);
  };

  const handleSubmit = () => {
    if (editingSupplier) {
      updateSupplier.mutate(
        { id: editingSupplier.id, data: formData },
        { onSuccess: handleCloseDialog },
      );
    } else {
      createSupplier.mutate(formData, { onSuccess: handleCloseDialog });
    }
  };

  const handleToggleStatus = (id: string, is_active: boolean) => {
    toggleStatus.mutate({ id, is_active: !is_active });
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
              Suppliers
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Supplier
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>GST Number</TableCell>
                  <TableCell>Status</TableCell>
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
                ) : suppliers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers?.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{supplier.address || "-"}</TableCell>
                      <TableCell>{supplier.gst_number || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={supplier.is_active ? "Active" : "Inactive"}
                          color={supplier.is_active ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(supplier)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleToggleStatus(supplier.id, supplier.is_active)
                          }
                        >
                          {supplier.is_active ? (
                            <Cancel color="error" />
                          ) : (
                            <CheckCircle color="success" />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {editingSupplier ? "Edit Supplier" : "Add Supplier"}
            </DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="GST Number"
                value={formData.gst_number}
                onChange={(e) =>
                  setFormData({ ...formData, gst_number: e.target.value })
                }
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={createSupplier.isPending || updateSupplier.isPending}
              >
                {editingSupplier ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
};

export default SuppliersPage;
