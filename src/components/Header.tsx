"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Header() {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="site-header">
      <Link href="/" className="wordmark">
        Bookshelf
      </Link>
      <nav className="site-nav" aria-label="Account">
        {ready && user && (
          <>
            <span className="muted">Signed in as {user.name}</span>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                signOut();
                router.push("/");
              }}
            >
              Log out
            </button>
          </>
        )}
        {ready && !user && (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/register" className="button button-small">
              Create account
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
