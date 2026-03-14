import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import supabase from "./supabaseClient";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's an active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fetch profile from users table
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser(profile);
        } else {
          // No profile found, sign out
          await supabase.auth.signOut();
        }
      }
      // Always stop loading regardless of result
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #1a3c1a 0%, #2d6a2d 100%)",
      color: "white", fontFamily: "Arial, sans-serif", gap: "16px"
    }}>
      <div style={{ fontSize: "3rem" }}>🏨</div>
      <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>Hotel Management System</div>
      <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>Loading...</div>
    </div>
  );

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <Login onLogin={setUser} />;
}

export default App;