import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import LoginScreen, { StudentProfile } from "./LoginScreen";
import ProfileScreen from "./ProfileScreen";
import reportWebVitals from "./reportWebVitals";

type RootView = "login" | "profile" | "app";

function Root() {
  const [view, setView] = useState<RootView>("login");
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [lang, setLang] = useState<"tok" | "en">("tok");

  function handleLogin(p: StudentProfile, newStudent: boolean) {
    setProfile(p);
    setIsNew(newStudent);
    setView("profile");
  }

  function handleProfileContinue() {
    setView("app");
  }

  // Called when session ends — return to login for next student
  function handleSessionEnd() {
    setProfile(null);
    setIsNew(false);
    setView("login");
  }

  if (view === "login" || !profile) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (view === "profile") {
    return (
      <ProfileScreen
        profile={profile}
        onContinue={handleProfileContinue}
        lang={lang}
      />
    );
  }

  return (
    <App
      profile={profile}
      isNew={isNew}
      onSessionEnd={handleSessionEnd}
    />
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);

reportWebVitals();
