"use client";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

const page = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex justify-center">
          <h1 className="text-3xl">This Page working under progress</h1>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default page;
