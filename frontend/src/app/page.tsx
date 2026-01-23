/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCustomers } from "@/lib/queries/customers";
import { useInventory } from "@/lib/queries/inventory";
import { useSalesOrders } from "@/lib/queries/orders";
import {
  AttachMoney,
  Inventory,
  People,
  ShoppingCart,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
} from "@mui/material";

export default function Home() {
  const { data: customersData } = useCustomers({ page: 1, limit: 100 });
  const { data: inventoryData } = useInventory();
  const { data: salesOrdersData } = useSalesOrders({ page: 1, limit: 100 });

  const salesOrders = salesOrdersData?.data || [];

  const totalRevenue = salesOrders.reduce(
    (sum: number, order: any) => sum + Number(order.total_amount || 0),
    0,
  );

  const stats = [
    {
      title: "Registered Customers",
      value: customersData?.total || 0,
      subtitle: "Active customer accounts",
      icon: <People fontSize="large" />,
      color: "#6366f1",
    },
    {
      title: "Inventory Items",
      value: inventoryData?.length || 0,
      subtitle: "Products currently tracked",
      icon: <Inventory fontSize="large" />,
      color: "#8b5cf6",
    },
    {
      title: "Sales Orders",
      value: salesOrdersData?.total || 0,
      subtitle: "Total orders processed",
      icon: <ShoppingCart fontSize="large" />,
      color: "#10b981",
    },
    {
      title: "Total Revenue",
      value: `₹ ${totalRevenue.toLocaleString()}`,
      subtitle: "Gross sales value",
      icon: <AttachMoney fontSize="large" />,
      color: "#f59e0b",
    },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <Box>
          {/* ================= HERO ================= */}
          <Box
            sx={{
              mb: 5,
              p: 5,
              borderRadius: 3,
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              color: "#fff",
              boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
            }}
          >
            <Typography variant="h3" fontWeight="bold">
              Inventory & Sales Dashboard
            </Typography>
            <Typography sx={{ mt: 1, opacity: 0.9, maxWidth: 800 }}>
              Centralized control panel to monitor inventory, customers, orders,
              and financial performance in real time.
            </Typography>
            <Typography sx={{ mt: 2, fontWeight: 500 }}>
              Data-driven • Reliable • Scalable
            </Typography>
          </Box>

          {/* ================= KPI CARDS ================= */}
          <Grid container spacing={4}>
            {stats.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    boxShadow: "0 18px 45px rgba(0,0,0,0.1)",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-8px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="h3"
                          fontWeight="bold"
                          sx={{ color: stat.color }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {stat.subtitle}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          background: `${stat.color}22`,
                          color: stat.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* ================= BUSINESS SUMMARY ================= */}
          <Grid container spacing={4} sx={{ mt: 5 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Operational Overview
                  </Typography>
                  <Typography color="text.secondary">
                    This system provides real-time visibility into inventory
                    availability, customer activity, and order processing. All
                    modules are tightly integrated to ensure accuracy and
                    consistency across operations.
                  </Typography>
                  <Typography sx={{ mt: 2 }} color="text.secondary">
                    Designed to scale with growing business needs while
                    maintaining data integrity and performance.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Financial Snapshot
                  </Typography>
                  <Typography color="text.secondary">
                    Revenue figures are calculated directly from confirmed sales
                    orders. This ensures transparent and auditable financial
                    reporting.
                  </Typography>
                  <Typography sx={{ mt: 2 }} color="text.secondary">
                    Payment tracking, purchase expenses, and profit analysis can
                    be extended seamlessly through integrated modules.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ================= FOOTER ================= */}
          <Divider sx={{ my: 5 }} />
          <Box textAlign="center">
            <Typography fontWeight={600}>
              Built for operational excellence and decision-making clarity
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Secure • Auditable • Enterprise-ready
            </Typography>
          </Box>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
}
