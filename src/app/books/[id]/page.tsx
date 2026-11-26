"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError, Book } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { spineStyle } from "@/lib/spine";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .getBook(id)
      .then(setBook)
      .catch((err) =>
        setError(err instanceof ApiError && err.status === 404 ? "This book isn't on the shelf." : "Could not load this book."),
      );
  }, [id]);

  async function remove() {
    if (!book || !window.confirm(`Delete “${book.title}”? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await api.deleteBook(book.id);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete this book.");
      setDeleting(false);
    }
  }

  if (error && !book) {
    return (
      <div className="empty">
        <p>{error}</p>
        <Link href="/">Back to the shelf</Link>
      </div>
    );
  }
  if (!book) return <p className="muted">Loading…</p>;

  const isOwner = user?.id === book.owner_id;

  return (
    <article className="book">
      <div className="book-spine" style={spineStyle(book.title, book.author)} aria-hidden="true" />
      <div className="book-body">
        <Link href="/" className="small">
          Back to the shelf
        </Link>
        <h1 className="book-title">{book.title}</h1>
        <p className="book-author">{book.author}</p>

        <dl className="book-facts">
          {book.published_year !== null && (
            <div>
              <dt>Published</dt>
              <dd>{book.published_year}</dd>
            </div>
          )}
          {book.isbn && (
            <div>
              <dt>ISBN</dt>
              <dd>{book.isbn}</dd>
            </div>
          )}
          <div>
            <dt>Added</dt>
            <dd>{new Date(book.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</dd>
          </div>
        </dl>

        {book.description ? (
          <p className="book-description">{book.description}</p>
        ) : (
          <p className="muted">No description yet.</p>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {isOwner && (
          <div className="form-actions">
            <Link href={`/books/${book.id}/edit`} className="button">
              Edit book
            </Link>
            <button type="button" className="button button-danger" onClick={remove} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete book"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
