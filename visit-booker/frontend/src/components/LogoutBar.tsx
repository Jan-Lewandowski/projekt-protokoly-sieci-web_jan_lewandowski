"use client";

import "../styles/logout.css";

type LogoutBarProps = {
  onLogout: () => void;
};

export default function LogoutBar({ onLogout }: LogoutBarProps) {
  return (
    <header className="logout-bar">
      <div className="logout-bar-inner">
        <span className="logout-brand">VisitBooker</span>
        <button type="button" onClick={onLogout} className="logout-button">
          Wyloguj
        </button>
      </div>
    </header>
  );
}
