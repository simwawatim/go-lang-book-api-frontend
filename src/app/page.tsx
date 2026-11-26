"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Book } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { spineStyle } from "@/lib/spine";

const PAGE_SIZE = 24;

export default function ShelfPage() {
  const { user, ready } = useAuth();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api
      .listBooks(search, PAGE_SIZE, offset)
      .then((res) => {
        if (cancelled) return;
        setBooks(res.data ?? []);
        setTotal(res.total);
        setStatus("done");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [search, offset]);

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + PAGE_SIZE, total);

  return (
    <>
      <section className="shelf-head">
        <div>
          <h1>The shelf</h1>
          <p className="muted">Every book in the catalogue. Pick a spine to see its details.</p>
        </div>
        {ready && user && (
          <Link href="/books/new" className="button">
            Add a book
          </Link>
        )}
        {ready && !user && (
          <p className="muted small">
            <Link href="/login">Log in</Link> to add books.
          </p>
        )}
      </section>

      <form
        className="search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setOffset(0);
          setSearch(query.trim());
        }}
      >
        <label htmlFor="search" className="visually-hidden">
          Search by title or author
        </label>
        <input
          id="search"
          type="search"
          placeholder="Search by title or author"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="button button-quiet">
          Search
        </button>
      </form>

      {status === "error" && (
        <p className="notice" role="alert">
          The book service didn&apos;t respond. Check that the API is running, then reload the page.
        </p>
      )}

      {status === "done" && books.length === 0 && (
        <div className="empty">
          {search ? (
            <p>
              No books match &ldquo;{search}&rdquo;.{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setQuery("");
                  setSearch("");
                }}
              >
                Show all books
              </button>
            </p>
          ) : (
            <p>The shelf is empty. {user ? <Link href="/books/new">Add the first book.</Link> : <Link href="/register">Create an account to add the first book.</Link>}</p>
          )}
        </div>
      )}

      {books.length > 0 && (
        <div className={status === "loading" ? "shelf is-loading" : "shelf"} aria-busy={status === "loading"}>
          {books.map((b) => (
            <Link
              key={b.id}
              href={`/books/${b.id}`}
              className="spine"
              style={spineStyle(b.title, b.author)}
              title={`${b.title} by ${b.author}`}
            >
              <span className="spine-title">{b.title}</span>
              <span className="spine-author">{b.author.split(" ").slice(-1)[0]}</span>
            </Link>
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <nav className="pager" aria-label="Pages">
          <button
            type="button"
            className="button button-quiet"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            Previous
          </button>
          <span className="muted small">
            {from}–{to} of {total}
          </span>
          <button
            type="button"
            className="button button-quiet"
            disabled={to >= total}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next
          </button>
        </nav>
      )}
      {total > 0 && total <= PAGE_SIZE && (
        <p className="muted small shelf-count">
          {total} {total === 1 ? "book" : "books"}
        </p>
      )}
    </>
  );
}
