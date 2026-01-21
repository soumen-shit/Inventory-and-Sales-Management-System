"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCategories } from "@/lib/queries/categories";
import {
  useCreateProduct,
  useProducts,
  useToggleProductStatus,
  useUpdateProduct,
} from "@/lib/queries/products";
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

const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    reorder_level: 0,
  });

  const { data, isLoading } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
  });

  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const toggleStatus = useToggleProductStatus();

  const getLeafCategories = (categories: any[] = []) => {
    const leaves: any[] = [];

    const traverse = (cats: any[]) => {
      cats.forEach((cat) => {
        if (!cat.children || cat.children.length === 0) {
          leaves.push(cat);
        } else {
          traverse(cat.children);
        }
      });
    };

    traverse(categories);
    return leaves;
  };

  const leafCategories = React.useMemo(
    () => getLeafCategories(categories || []),
    [categories],
  );

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        category_id: product.category_id,
        reorder_level: product.reorder_level,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", sku: "", category_id: "", reorder_level: 0 });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleSubmit = () => {
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data: formData },
        { onSuccess: handleCloseDialog },
      );
    } else {
      createProduct.mutate(formData, { onSuccess: handleCloseDialog });
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleStatus.mutate(id);
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
              Products
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Product
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search products..."
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
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Reorder Level</TableCell>
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
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.category?.name || "-"}</TableCell>
                      <TableCell align="right">
                        {product.reorder_level}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.is_active ? "Active" : "Inactive"}
                          color={product.is_active ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(product.id)}
                        >
                          {product.is_active ? (
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
                color="primary"
              />
            </Box>
          )}

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
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
                label="SKU"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                margin="normal"
                required
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  label="Category"
                >
                  {leafCategories?.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Reorder Level"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.reorder_level}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setFormData({
                    ...formData,
                    reorder_level: value >= 0 ? value : 0,
                  });
                }}
                margin="normal"
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {editingProduct ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
};

export default ProductsPage;
