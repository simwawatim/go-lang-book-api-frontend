"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BookForm from "@/components/BookForm";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function NewBookPage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/books/new");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return (
    <section className="narrow">
      <h1>Add a book</h1>
      <BookForm
        submitLabel="Add book"
        onSubmit={async (input) => {
          const book = await api.createBook(input);
          router.push(`/books/${book.id}`);
        }}
        onCancel={() => router.push("/")}
      />
    </section>
  );
}
