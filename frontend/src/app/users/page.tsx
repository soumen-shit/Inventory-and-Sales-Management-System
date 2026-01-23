"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchMe } from "@/lib/queries/auth";
import {
  useCreateUser,
  useRoles,
  useUpdateUser,
  useUsers,
} from "@/lib/queries/users";
import { Add, Edit } from "@mui/icons-material";
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
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

const UsersPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { data: users, isLoading } = useUsers();
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const { data: currUser } = useQuery({
    queryFn: fetchMe,
    queryKey: ["currUser"],
  });

  const itSelf = editingUser?.id === currUser?.userId;

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const newErrors: any = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z ]{3,}$/.test(formData.name)) {
      newErrors.name = "Name must be at least 3 letters";
    }

    // Email
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Phone
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    // Password (only when creating)
    if (!editingUser) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(formData.password)
      ) {
        newErrors.password =
          "Password must contain uppercase, lowercase and a number (min 6 chars)";
      }
    }

    // Role
    if (!itSelf && !formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      const roleName =
        typeof user.role === "object" ? user.role?.name : user.role;

      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        phone: user.phone,
        role: roleName || "",
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "",
        is_active: true,
      });
    }

    setErrors({});
    setFormError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setErrors({});
    setFormError(null);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const submitData: any = { ...formData };
    if (editingUser && !submitData.password) {
      delete submitData.password;
    }

    const onError = (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      if (Array.isArray(message)) {
        setFormError(message.join(", "));
      } else {
        setFormError(message);
      }
    };

    if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, data: submitData },
        {
          onSuccess: handleCloseDialog,
          onError,
        },
      );
    } else {
      createUser.mutate(submitData, {
        onSuccess: handleCloseDialog,
        onError,
      });
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <ProtectedRoute>
      <Layout>
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Users
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add User
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
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
                ) : (
                  users
                    ?.filter((u) => u.id !== currUser?.userId)
                    .map((user) => {
                      const roleName =
                        typeof user.role === "object"
                          ? user.role?.name
                          : user.role;

                      return (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>
                            <Chip
                              label={roleName}
                              size="small"
                              color={
                                roleName === "ADMIN"
                                  ? "error"
                                  : roleName === "MANAGER"
                                    ? "warning"
                                    : "default"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              size="small"
                              checked={user.is_active}
                              onChange={(e) =>
                                updateUser.mutate({
                                  id: user.id,
                                  data: { is_active: e.target.checked },
                                })
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(user)}
                            >
                              <Edit />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ---------------- DIALOG ---------------- */}
          <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>

            <DialogContent>
              {/* 🔴 BACKEND ERROR MESSAGE */}
              {formError && (
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: "#fdecea",
                    color: "#b71c1c",
                    border: "1px solid #f5c6cb",
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {formError}
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                error={!!errors.name}
                helperText={errors.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                margin="normal"
              />

              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                error={!!errors.email}
                helperText={errors.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                margin="normal"
              />

              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                error={!!errors.phone}
                helperText={errors.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                margin="normal"
              />

              {!editingUser && (
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  error={!!errors.password}
                  helperText={
                    errors.password ||
                    "Min 6 chars, uppercase, lowercase & number"
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  margin="normal"
                />
              )}

              {!itSelf && (
                <FormControl fullWidth margin="normal" error={!!errors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    {roles
                      ?.filter((r) => r.name !== "ADMIN")
                      .map((role) => (
                        <MenuItem key={role.id} value={role.name}>
                          {role.name}
                        </MenuItem>
                      ))}
                  </Select>
                  <Typography variant="caption" color="error">
                    {errors.role}
                  </Typography>
                </FormControl>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={createUser.isPending || updateUser.isPending}
              >
                {editingUser ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
};

export default UsersPage;
