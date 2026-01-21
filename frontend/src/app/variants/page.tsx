/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useProducts } from "@/lib/queries/products";
import {
  useCreateVariant,
  useToggleVariantStatus,
  useUpdateVariant,
  useVariants,
} from "@/lib/queries/variants";
import { Add, Cancel, CheckCircle, Edit, Search } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
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
import React, { useState } from "react";

type VariantFormData = {
  variant_name: string;
  sku: string;
  price: number | "";
  product_id: string;
};

const VariantsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);

  const [formData, setFormData] = useState<VariantFormData>({
    variant_name: "",
    sku: "",
    price: "",
    product_id: "",
  });

  const { data, isLoading } = useVariants({
    page,
    limit: 10,
    search: search || undefined,
  });

  const { data: products } = useProducts();
  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const toggleStatus = useToggleVariantStatus();

  const handleOpenDialog = (variant?: any) => {
    if (variant) {
      setEditingVariant(variant);
      setFormData({
        variant_name: variant.variant_name,
        sku: variant.sku,
        price: variant.price ?? "",
        product_id: variant.product?.id || "",
      });
    } else {
      setEditingVariant(null);
      setFormData({
        variant_name: "",
        sku: "",
        price: "",
        product_id: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVariant(null);
  };

  const handleSubmit = () => {
    if (formData.price === "" || formData.price < 0) {
      alert("Price must be 0 or greater");
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
    };

    if (editingVariant) {
      updateVariant.mutate(
        { id: editingVariant.id, data: payload },
        { onSuccess: handleCloseDialog },
      );
    } else {
      createVariant.mutate(payload, { onSuccess: handleCloseDialog });
    }
  };

  const handleToggleStatus = (id: string, is_active: boolean) => {
    toggleStatus.mutate({ id, is_active: !is_active });
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">
              Product Variants
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Variant
            </Button>
          </Box>

          <TextField
            fullWidth
            placeholder="Search variants..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Variant Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
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
                      No variants found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell>{variant.variant_name}</TableCell>
                      <TableCell>{variant.sku}</TableCell>
                      <TableCell>{variant.product?.name || "-"}</TableCell>
                      <TableCell align="right">
                        ₹{Number(variant.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={variant.is_active ? "Active" : "Inactive"}
                          color={variant.is_active ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(variant)}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleToggleStatus(variant.id, variant.is_active)
                          }
                        >
                          {variant.is_active ? (
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

          {data && data.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={data.totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
              />
            </Box>
          )}

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>
              {editingVariant ? "Edit Variant" : "Add Variant"}
            </DialogTitle>

            <DialogContent>
              <TextField
                fullWidth
                label="Variant Name"
                margin="normal"
                value={formData.variant_name}
                onChange={(e) =>
                  setFormData({ ...formData, variant_name: e.target.value })
                }
                required
              />

              <TextField
                fullWidth
                label="SKU"
                margin="normal"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                required
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel id="product-label">Product</InputLabel>
                <Select
                  disabled={!!editingVariant}
                  labelId="product-label"
                  label="Product"
                  value={formData.product_id}
                  onChange={(e) =>
                    setFormData({ ...formData, product_id: e.target.value })
                  }
                >
                  {products?.data?.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Price"
                type="number"
                inputProps={{ min: 0 }}
                margin="normal"
                value={formData.price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setFormData({ ...formData, price: "" });
                    return;
                  }
                  const num = Number(value);
                  if (num >= 0) {
                    setFormData({ ...formData, price: num });
                  }
                }}
                required
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={createVariant.isPending || updateVariant.isPending}
              >
                {editingVariant ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
};

export default VariantsPage;
