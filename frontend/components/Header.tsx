"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuth } from "../lib/api";

const PRIMARY = "#1a4731";

const navItems = [
  { label: "Home", href: "/" },
  {
    label: "Elections",
    dropdown: [
      {
        label: "Vote Now",
        href: "/vote",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        ),
        badge: "Live",
      },
      {
        label: "Election Schedule",
        href: "/schedule",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        label: "Candidates",
        href: "/candidates",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },

    ],
  },
  {
    label: "My Account",
    authRequired: true, // Only shown when logged in
    dropdown: [
      {
        label: "My Profile",
        href: "/profile",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        label: "My Voting History",
        href: "/voting-history",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      },
      {
        label: "Verify My Vote",
        href: "/verify-vote",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Support",
    dropdown: [
      {
        label: "Help & FAQs",
        href: "/help",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: "Contact / Support",
        href: "/contact",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
      },
    ],
  },
];

function DropdownMenu({ items }: { items: NonNullable<typeof navItems[0]["dropdown"]> }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
      <div className="p-1.5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-[#1a4731]/8 hover:text-[#1a4731] transition-all group"
          >
            <span className="text-gray-400 group-hover:text-[#1a4731] transition-colors">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {"badge" in item && item.badge && (
              <span className="ml-auto text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [voterName, setVoterName] = useState("");
  const user = isLoggedIn ? { name: voterName, verified: true } : null;

  // Read real auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name  = localStorage.getItem("voter_name");
    if (token) {
      setIsLoggedIn(true);
      setVoterName(name ?? "Voter");
    }
  }, []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setVoterName("");
    setMobileOpen(false);
    router.push("/");
  };

  const notifications = [
    { id: 1, text: "General Election 2025 voting opens in 2 days", time: "2h ago", unread: true },
    { id: 2, text: "Your vote has been successfully recorded", time: "1d ago", unread: true },
    { id: 3, text: "New candidate profiles added for NA-120", time: "3d ago", unread: false },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Filter out auth-gated nav items when not logged in
  const visibleNavItems = navItems.filter(
    (item) => !("authRequired" in item && item.authRequired && !isLoggedIn)
  );

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-white/97 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-[#1a4731] flex items-center justify-center ring-2 ring-[#1a4731]/20 group-hover:ring-[#1a4731]/40 transition-all">
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Pak<span className="text-[#1a4731]">Vote</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-8">
            {visibleNavItems.map((item) => (
              <div key={item.label} className="relative">
                {item.dropdown ? (
                  <button
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                    onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#1a4731] hover:bg-[#1a4731]/5 transition-all"
                  >
                    {item.label}
                    <svg
                      width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                      className={`transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={item.href!}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#1a4731] hover:bg-[#1a4731]/5 transition-all block"
                  >
                    {item.label}
                  </Link>
                )}

                {item.dropdown && activeDropdown === item.label && (
                  <div
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <DropdownMenu items={item.dropdown} />
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* ── Desktop Right Side ── */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn && user ? (
              /* AUTHENTICATED */
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <svg width="20" height="20" fill="none" stroke="#374151" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">Notifications</span>
                        <span className="text-xs text-[#1a4731] font-medium cursor-pointer hover:underline">Mark all read</span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {notifications.map((n) => (
                          <div key={n.id} className={`px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${n.unread ? "bg-[#1a4731]/3" : ""}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-[#1a4731]" : "bg-gray-200"}`} />
                            <div>
                              <p className="text-sm text-gray-700 leading-snug">{n.text}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                        <Link href="/notifications" className="text-xs font-medium text-[#1a4731] hover:underline">
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User chip */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#1a4731]/30 transition-all cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-[#1a4731]/10 flex items-center justify-center">
                    <svg width="14" height="14" fill="none" stroke={PRIMARY} strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="leading-none">
                    <p className="text-xs font-semibold text-gray-800">{user.name}</p>
                    {user.verified && (
                      <p className="text-[10px] text-[#1a4731] font-medium flex items-center gap-0.5 mt-0.5">
                        <svg width="9" height="9" fill={PRIMARY} viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified Voter
                      </p>
                    )}
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              /* UNAUTHENTICATED */
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-[#1a4731] px-4 py-2 rounded-lg hover:bg-[#1a4731]/5 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold bg-[#1a4731] text-white px-5 py-2.5 rounded-lg hover:bg-[#15392a] transition-all shadow-sm hover:shadow-md"
                >
                  Register to Vote
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">

            {/* User badge — only when logged in */}
            {isLoggedIn && user && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-[#1a4731]/5 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-[#1a4731]/15 flex items-center justify-center">
                  <svg width="16" height="16" fill="none" stroke={PRIMARY} strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  {user.verified && <p className="text-xs text-[#1a4731] font-medium">✓ Verified Voter</p>}
                </div>
                <div className="ml-auto relative">
                  <svg width="20" height="20" fill="none" stroke="#374151" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Nav items (auth-filtered) */}
            {visibleNavItems.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-gray-700 hover:text-[#1a4731] hover:bg-[#1a4731]/5 rounded-lg transition-colors"
                    >
                      {item.label}
                      <svg
                        width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                        className={`transition-transform duration-200 ${mobileExpanded === item.label ? "rotate-180" : ""}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {mobileExpanded === item.label && (
                      <div className="ml-3 mt-1 border-l-2 border-[#1a4731]/20 pl-3 space-y-1">
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-600 hover:text-[#1a4731] hover:bg-[#1a4731]/5 transition-colors"
                          >
                            <span className="text-gray-400">{sub.icon}</span>
                            {sub.label}
                            {"badge" in sub && sub.badge && (
                              <span className="ml-auto text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-semibold text-gray-700 hover:text-[#1a4731] hover:bg-[#1a4731]/5 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile CTA */}
            <div className="pt-3 border-t border-gray-100 mt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                /* AUTHENTICATED mobile */
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-sm font-medium text-red-500 border border-red-200 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-all"
                >
                  Logout
                </button>
              ) : (
                /* UNAUTHENTICATED mobile */
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-center text-sm font-medium text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="text-center text-sm font-semibold bg-[#1a4731] text-white px-4 py-2.5 rounded-lg hover:bg-[#15392a] transition-all"
                  >
                    Register to Vote
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}