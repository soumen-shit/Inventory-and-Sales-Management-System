"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  AttachMoney,
  Inventory,
  People,
  ShoppingCart,
} from "@mui/icons-material";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

export default function Home() {
  const starts = [
    {
      title: "Total Customers",
      value: 0,
      icon: <People sx={{ fontSize: 40 }} />,
      color: "#6366f1",
    },
    {
      title: "Inventory Items",
      value: 0,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: "#8b5cf6",
    },
    {
      title: "Sales Orders",
      value: 0,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: "#10b981",
    },
    {
      title: "Payments",
      value: 0,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: "#f59e0b",
    },
  ];
  return (
    <ProtectedRoute>
      <Layout>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Dashboard
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {starts.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <Card
                  sx={{
                    height: "100%",
                    background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                    border: `1px solid ${stat.color}30`,
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          color="textSecondary"
                          gutterBottom
                          variant="body2"
                        >
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
                      <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
}
