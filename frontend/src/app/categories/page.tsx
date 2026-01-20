/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useCategories,
  useCreateCategory,
  useToggleCategoryStatus,
  useUpdateCategory,
} from "@/lib/queries/categories";
import { Add, Cancel, CheckCircle, Edit } from "@mui/icons-material";
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
  InputLabel,
  MenuItem,
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

/* =========================
   Recursive Category Row
========================= */
const CategoryRow = ({ category, level = 0, onEdit, onToggleStatus }: any) => {
  const [open, setOpen] = useState(false);
  const hasChildren = category.children?.length > 0;

  return (
    <>
      <TableRow>
        <TableCell sx={{ pl: 2 + level * 3 }}>
          {hasChildren && (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? "▼" : "▶"}
            </IconButton>
          )}
          {category.name}
          {hasChildren && (
            <Chip
              label={`${category.children.length} sub`}
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </TableCell>

        <TableCell>{category.description || "-"}</TableCell>

        <TableCell>
          <Chip
            label={category.is_active ? "Active" : "Inactive"}
            color={category.is_active ? "success" : "default"}
            size="small"
          />
        </TableCell>

        <TableCell align="right">
          <IconButton size="small" onClick={() => onEdit(category)}>
            <Edit />
          </IconButton>

          <IconButton size="small" onClick={() => onToggleStatus(category.id)}>
            {category.is_active ? (
              <Cancel color="error" />
            ) : (
              <CheckCircle color="success" />
            )}
          </IconButton>
        </TableCell>
      </TableRow>

      {open &&
        category.children?.map((child: any) => (
          <CategoryRow
            key={child.id}
            category={child}
            level={level + 1}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
          />
        ))}
    </>
  );
};

/* =========================
   Main Page
========================= */
const CategoriesPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_id: "",
  });

  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const toggleStatus = useToggleCategoryStatus();

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        parent_id: category.parent?.id || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "", parent_id: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSubmit = () => {
    const submitData: any = { ...formData };
    if (!submitData.parent_id) delete submitData.parent_id;

    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, data: submitData },
        { onSuccess: handleCloseDialog },
      );
    } else {
      createCategory.mutate(submitData, {
        onSuccess: handleCloseDialog,
      });
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
              Product Categories
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Category
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : categories?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  categories?.map((category: any) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      onEdit={handleOpenDialog}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* =========================
              Add / Edit Dialog
          ========================= */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>

            <DialogContent>
              <TextField
                fullWidth
                label="Name"
                margin="normal"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Description"
                margin="normal"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />

              <FormControl fullWidth margin="normal">
                <InputLabel id="parent-category-label">
                  Parent Category (Optional)
                </InputLabel>
                <Select
                  labelId="parent-category-label"
                  label="Parent Category (Optional)"
                  value={formData.parent_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parent_id: e.target.value,
                    })
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {categories
                    ?.filter((c: any) => c.id !== editingCategory?.id)
                    .map((cat: any) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {editingCategory ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
};

export default CategoriesPage;
