"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useInventory, useLowStock } from "@/lib/queries/inventory";
import {
  Alert,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
];

const InventoryPage = () => {
  const { data: inventory, isLoading } = useInventory();
  const { data: lowStock } = useLowStock();

  const chartData =
    inventory?.slice(0, 7).map((item) => ({
      name: item.variant.variant_name,
      value: item.quantity,
    })) || [];

  const totalQuantity =
    inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  return (
    <ProtectedRoute>
      <Layout>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Inventory Management
          </Typography>

          {lowStock && lowStock.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {lowStock.length} item(s) are low in stock
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Inventory Distribution
              </Typography>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography>No inventory data available</Typography>
              )}
            </Paper>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Variant Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : inventory?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory?.map((item) => {
                    const isLowStock = lowStock?.some(
                      (low) => low.id === item.id,
                    );

                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.variant.variant_name}</TableCell>

                        <TableCell>{item.variant.sku}</TableCell>

                        <TableCell>
                          {item.variant.product?.name || "-"}
                        </TableCell>

                        <TableCell align="right">{item.quantity}</TableCell>

                        <TableCell align="right">
                          ₹{Number(item.variant.price || 0).toFixed(2)}
                        </TableCell>

                        <TableCell>
                          {isLowStock ? (
                            <Chip
                              label="Low Stock"
                              color="warning"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="In Stock"
                              color="success"
                              size="small"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Total Items: {inventory?.length || 0} | Total Quantity:{" "}
              {totalQuantity}
            </Typography>
          </Box>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
};

export default InventoryPage;
