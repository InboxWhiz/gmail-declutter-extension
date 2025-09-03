import "./header.css";
import { useEffect, useState } from "react";
import { useApp } from "../../../providers/app_provider";

export function DeclutterHeader() {
  const { getEmailAccount } = useApp();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getEmailAccount().then(setEmail);
  }, [getEmailAccount]);

  // Extract initials from email
  const getInitials = (email: string) => {
    if (!email) return "U";
    const name = email.split("@")[0];
    return name
      .split(/[._-]/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Extract display name from email
  const getDisplayName = (email: string) => {
    if (!email) return "User";
    const localPart = email.split("@")[0];
    return localPart
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <div className="declutter-header">
      {/* Brand Section */}
      <div className="brand-section">
        <div className="brand-logo">
          <span className="logo-text">IW</span>
        </div>
        <h1 className="brand-name">InboxWhiz</h1>
        <p className="brand-tagline">Smart Email Management</p>
      </div>

      {/* Divider */}
      <div className="header-divider"></div>

      {/* User Section */}
      <div className="user-section">
        <div className="user-avatar">
          <span className="avatar-initials">
            {email ? getInitials(email) : "U"}
          </span>
        </div>
        <div className="user-info">
          <span className="user-name">
            {email ? getDisplayName(email) : "User"}
          </span>
          <span className="user-email">{email || "Loading..."}</span>
        </div>
      </div>
    </div>
  );
}
