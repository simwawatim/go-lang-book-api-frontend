"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BookForm from "@/components/BookForm";
import { api, Book } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=/books/${id}/edit`);
  }, [ready, user, router, id]);

  useEffect(() => {
    api.getBook(id).then(setBook).catch(() => setFailed(true));
  }, [id]);

  if (!ready || !user) return null;
  if (failed) {
    return (
      <div className="empty">
        <p>This book isn&apos;t on the shelf.</p>
        <Link href="/">Back to the shelf</Link>
      </div>
    );
  }
  if (!book) return <p className="muted">Loading…</p>;
  if (book.owner_id !== user.id) {
    return (
      <div className="empty">
        <p>Only the person who added this book can edit it.</p>
        <Link href={`/books/${book.id}`}>Back to the book</Link>
      </div>
    );
  }

  return (
    <section className="narrow">
      <h1>Edit book</h1>
      <BookForm
        initial={book}
        submitLabel="Save changes"
        onSubmit={async (input) => {
          await api.updateBook(book.id, input);
          router.push(`/books/${book.id}`);
        }}
        onCancel={() => router.push(`/books/${book.id}`)}
      />
    </section>
  );
}
