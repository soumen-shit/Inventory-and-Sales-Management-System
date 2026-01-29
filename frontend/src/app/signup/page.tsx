/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { registerUser } from "@/lib/queries/auth";
import { Button, Paper, TextField, Typography } from "@mui/material";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ name, email, password, phone });
  };

  // 👇 Backend error message extract (same as Signin)
  const backendMessage =
    (error as any)?.response?.data?.message || (error as any)?.message || null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Paper className="p-6 w-100">
        <h1 className="text-xl font-bold mb-4 text-center">Admin Register</h1>

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-4">
          {/* 🔴 BACKEND ERROR MESSAGE */}
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
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <TextField
            label="Phone no."
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isPending}
          >
            {isPending ? "Signup..." : "Signup"}
          </Button>
        </form>

        <p className="mt-2">
          Already have account?{" "}
          <Link className="text-blue-600 cursor-pointer" href={"/signin"}>
            LogIn
          </Link>
        </p>
      </Paper>
    </div>
  );
};

export default Signup;
