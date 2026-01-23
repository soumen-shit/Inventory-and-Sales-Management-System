import { fetchMe, logoutUser } from "@/lib/queries/auth";
import { queryClient } from "@/lib/queryClient";
import {
  AccountBalance,
  AccountCircle,
  Assignment,
  Category,
  Dashboard,
  Inventory,
  LocalShipping,
  Logout,
  Menu as MenuIcon,
  People,
  Person,
  ProductionQuantityLimits,
  Receipt,
  Refresh,
  ShoppingCart,
  Store,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode, useState } from "react";

const DRAWER_WIDTH = 280;

interface MenuItem {
  text: string;
  icon: ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: "Dashboard", icon: <Dashboard />, path: "/" },
  { text: "Users", icon: <Person />, path: "/users" },
  { text: "Customers", icon: <People />, path: "/customers" },
  { text: "Categories", icon: <Category />, path: "/categories" },
  { text: "Products", icon: <ProductionQuantityLimits />, path: "/products" },
  { text: "Variants", icon: <Store />, path: "/variants" },
  { text: "Inventory", icon: <Inventory />, path: "/inventory" },
  { text: "Suppliers", icon: <LocalShipping />, path: "/suppliers" },
  {
    text: "Supplier Payments",
    icon: <AccountBalance />,
    path: "/supplier-payments",
  },
  { text: "Purchase Orders", icon: <ShoppingCart />, path: "/purchase-orders" },
  { text: "Sales Orders", icon: <Receipt />, path: "/sales-orders" },
  { text: "Invoices", icon: <Assignment />, path: "/invoices" },

  { text: "Returns", icon: <Refresh />, path: "/returns" },
  // { text: "Refunds", icon: <AccountBalance />, path: "/refunds" },
];

const Layout = ({ children }: { children: ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  //   const theme = useTheme();
  const pathname = usePathname();
  //   const router = useRouter();

  const { data: user } = useQuery({
    queryFn: fetchMe,
    queryKey: ["auth", "me"],
  });

  const { mutate } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      if (typeof window != "undefined") {
        window.location.href = "/signin";
      }
    },
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    mutate();
  };

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          ERP System
        </Typography>
      </Toolbar>
      <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "white" : "inherit",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => item.path === pathname)?.text ||
              "Dashboard"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccountCircle />
              <Typography variant="body2">
                {user?.email} (
                {typeof user?.role === "object" ? user?.role?.name : user?.role}
                )
              </Typography>
            </Box>
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
