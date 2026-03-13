"use client";

import { useEffect, useState } from "react";

interface Settings {
  child_name: string;
  child_age: number;
  target_exam: string;
  daily_goal_minutes: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    child_name: "",
    child_age: 10,
    target_exam: "both",
    daily_goal_minutes: 15,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            child_name: data.settings.child_name || "",
            child_age: data.settings.child_age || 10,
            target_exam: data.settings.target_exam || "both",
            daily_goal_minutes: data.settings.daily_goal_minutes || 15,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">
          Personalise the practice experience for your child
        </p>
      </div>

      <div className="max-w-lg">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Child name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child&apos;s Name
            </label>
            <input
              type="text"
              value={settings.child_name}
              onChange={(e) =>
                setSettings({ ...settings, child_name: e.target.value })
              }
              placeholder="e.g. Sophie"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              The AI tutor will use this name when chatting
            </p>
          </div>

          {/* Child age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child&apos;s Age
            </label>
            <select
              value={settings.child_age}
              onChange={(e) =>
                setSettings({ ...settings, child_age: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {[7, 8, 9, 10, 11, 12].map((age) => (
                <option key={age} value={age}>
                  {age} years old {age === 9 ? "(Year 5)" : age === 10 ? "(Year 6)" : age === 11 ? "(Year 7)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              The AI tutor adjusts its language and explanations based on your child&apos;s age
            </p>
          </div>

          {/* Target exam */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Exam Board
            </label>
            <select
              value={settings.target_exam}
              onChange={(e) =>
                setSettings({ ...settings, target_exam: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="both">Both GL and CEM</option>
              <option value="gl">GL Assessment only</option>
              <option value="cem">CEM (Durham) only</option>
            </select>
          </div>

          {/* Daily goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Practice Goal
            </label>
            <select
              value={settings.daily_goal_minutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  daily_goal_minutes: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes (recommended)</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {saved && (
              <span className="text-green-600 text-sm font-medium">
                Settings saved!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
