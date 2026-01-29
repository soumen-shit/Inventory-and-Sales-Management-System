/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { loginUser } from "@/lib/queries/auth";
import { queryClient } from "@/lib/queryClient";
import { Button, Paper, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Signin = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };

  const backendMessage =
    (error as any)?.response?.data?.message || (error as any)?.message || null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Paper className="p-6 w-100">
        <h1 className="text-xl font-bold mb-4 text-center">Signin</h1>

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-4">
          {backendMessage && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                backgroundColor: "#fdecea",
                border: "1px solid #f5c6cb",
                borderRadius: 1,
                p: 1.5,
              }}
            >
              {Array.isArray(backendMessage)
                ? backendMessage.join(", ")
                : backendMessage}
            </Typography>
          )}

          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isPending}
          >
            {isPending ? "Signin..." : "Signin"}
          </Button>
        </form>

        <p className="mt-2">
          Do not have account?{" "}
          <Link className="text-blue-600 cursor-pointer" href={"/signup"}>
            SignUp
          </Link>
        </p>
      </Paper>
    </div>
  );
};

export default Signin;
