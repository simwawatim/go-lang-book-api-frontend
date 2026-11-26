"use client";

import AuthForm from "@/components/AuthForm";
import { api } from "@/lib/api";

export default function RegisterPage() {
  return <AuthForm mode="register" submit={({ name, email, password }) => api.register(name, email, password)} />;
}
