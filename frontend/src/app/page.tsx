"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

/* ---------------- DEMO DATA ---------------- */

const monthlySalesData = [
  { month: "Jan", sales: 120000 },
  { month: "Feb", sales: 95000 },
  { month: "Mar", sales: 140000 },
  { month: "Apr", sales: 160000 },
  { month: "May", sales: 130000 },
  { month: "Jun", sales: 180000 },
];

const purchaseVsPaymentData = [
  { month: "Jan", purchase: 90000, payment: 85000 },
  { month: "Feb", purchase: 70000, payment: 65000 },
  { month: "Mar", purchase: 110000, payment: 100000 },
  { month: "Apr", purchase: 120000, payment: 115000 },
  { month: "May", purchase: 95000, payment: 90000 },
  { month: "Jun", purchase: 140000, payment: 135000 },
];

/* ---------------- DASHBOARD ---------------- */

export default function Home() {
  const stats = [
    {
      title: "Registered Customers",
      value: 248,
      icon: <People />,
      color: "#6366f1",
    },
    {
      title: "Inventory Items",
      value: 1240,
      icon: <Inventory />,
      color: "#8b5cf6",
    },
    {
      title: "Sales Orders",
      value: 342,
      icon: <ShoppingCart />,
      color: "#10b981",
    },
    {
      title: "Total Payments",
      value: "₹ 8.4L",
      icon: <AttachMoney />,
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
              mb: 4,
              p: 4,
              borderRadius: 3,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              boxShadow: "0 14px 35px rgba(0,0,0,0.2)",
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Inventory Management System
            </Typography>
            <Typography sx={{ mt: 1, opacity: 0.95 }}>
              Centralized dashboard to manage inventory, suppliers, sales,
              purchases, and payments with real-time insights.
            </Typography>
            <Typography sx={{ mt: 2, fontWeight: 500 }}>
              Monitor • Manage • Optimize
            </Typography>
          </Box>

          {/* ================= STATS ================= */}
          <Grid container spacing={3}>
            {stats.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          sx={{ color: stat.color }}
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          background: `${stat.color}20`,
                          color: stat.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 30,
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

          {/* ================= CHARTS ================= */}
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {/* Sales Trend */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography fontWeight="bold" mb={2}>
                    Monthly Sales Trend
                  </Typography>

                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlySalesData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#6366f1"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Purchase vs Payment */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography fontWeight="bold" mb={2}>
                    Purchases vs Payments
                  </Typography>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={purchaseVsPaymentData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="purchase" fill="#8b5cf6" />
                      <Bar dataKey="payment" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ================= FOOTER ================= */}
          <Divider sx={{ my: 4 }} />
          <Box textAlign="center">
            <Typography fontWeight={500}>
              Built for accuracy, scalability, and operational efficiency
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time analytics • Inventory intelligence • Financial control
            </Typography>
          </Box>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
}
