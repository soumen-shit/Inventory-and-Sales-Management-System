"use client";

import { fetchMe } from "@/lib/queries/auth";
import { Box, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryFn: fetchMe,
    queryKey: ["auth", "me"],
  });
  const router = useRouter();

  useEffect(() => {
    if (isError && typeof window !== "undefined") {
      router.push("/signin");
    }
  }, [isError, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
