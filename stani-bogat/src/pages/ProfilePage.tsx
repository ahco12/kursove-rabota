import React, { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { getUserStats } from "../services/users";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<{ answeredCount: number; moneyEarned: number } | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) {
        setStats(null);
        setStatsLoading(false);
        return;
      }
      setStatsLoading(true);
      const s = await getUserStats(user.uid);
      if (s) setStats({ answeredCount: s.answeredCount, moneyEarned: s.moneyEarned });
      setStatsLoading(false);
    })();
  }, [user]);

  if (loading || statsLoading) return <div className="profile-container">Зареждане...</div>;

  if (!user) return <div className="profile-container">Моля, влезте за да видите профила си.</div>;

  const displayName = user.displayName || user.email?.split("@")[0] || "Потребител";
  const initials = (displayName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()) || "?";

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">{initials}</div>
          <div className="profile-info">
            <h2 className="profile-name">{displayName}</h2>
            <div className="profile-email">{user.email}</div>
          </div>
          <div className="profile-actions">
            <button className="action-btn" onClick={() => logout()}>
              Изход
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats?.answeredCount ?? 0}</div>
            <div className="stat-label">Правилни отговори</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats?.moneyEarned ?? 0} лв.</div>
            <div className="stat-label">Общо спечелено</div>
          </div>
        </div>

        <div className="profile-footer">
          <p className="muted">Последни игри и история ще се показват тук.</p>
        </div>
      </div>
    </div>
  );
}
