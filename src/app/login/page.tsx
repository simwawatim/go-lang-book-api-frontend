"use client";

import AuthForm from "@/components/AuthForm";
import { api } from "@/lib/api";

export default function LoginPage() {
  return <AuthForm mode="login" submit={({ email, password }) => api.login(email, password)} />;
}
