"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/practice", label: "Daily Practice", icon: "📝" },
  { href: "/mock-test", label: "Mock Test", icon: "📋" },
  { href: "/review", label: "Review Mistakes", icon: "🔄" },
  { href: "/progress", label: "Progress", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [examLevel, setExamLevel] = useState<string>("11+");
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.exam_level) {
          setExamLevel(data.settings.exam_level);
        }
      })
      .catch(() => {});
  }, []);

  const toggleLevel = async () => {
    const newLevel = examLevel === "7+" ? "11+" : "7+";
    setSwitching(true);
    try {
      // Fetch current settings first
      const res = await fetch("/api/settings");
      const data = await res.json();
      const current = data.settings || {};

      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_name: current.child_name || "",
          child_age: current.child_age || (newLevel === "7+" ? 6 : 10),
          target_exam: current.target_exam || "both",
          exam_level: newLevel,
          daily_goal_minutes: current.daily_goal_minutes || 15,
        }),
      });

      setExamLevel(newLevel);
      // Reload page so components pick up the new exam level
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch level:", error);
    }
    setSwitching(false);
  };

  const is7Plus = examLevel === "7+";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-indigo-600">{examLevel}</span>
              <span className="text-lg font-semibold text-gray-800">
                Practice Hub
              </span>
            </Link>

            {/* Toggle button */}
            <button
              onClick={toggleLevel}
              disabled={switching}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-xs font-medium text-gray-600 hover:text-indigo-700 disabled:opacity-50"
              title={`Switch to ${is7Plus ? "11+" : "7+"}`}
            >
              <div className="relative w-8 h-4 rounded-full bg-gray-200 transition-colors"
                style={{ backgroundColor: is7Plus ? "#818cf8" : "#6366f1" }}
              >
                <div
                  className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200"
                  style={{ left: is7Plus ? "2px" : "18px" }}
                />
              </div>
              <span>{is7Plus ? "7+" : "11+"}</span>
            </button>
          </div>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
