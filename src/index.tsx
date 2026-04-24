import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import LoginScreen, { StudentProfile } from "./LoginScreen";
import ProfileScreen from "./ProfileScreen";
import reportWebVitals from "./reportWebVitals";
import AILogPage, { MERI_LOG_DATA, TURA_LOG_DATA } from "./AILogPage";

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
        onBack={() => { setProfile(null); setView("login"); }}
        lang={lang}
        setLang={setLang}
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

const pathname = window.location.pathname;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    {pathname === "/ai-log-meri" ? <AILogPage {...MERI_LOG_DATA} />
     : pathname === "/ai-log-tura" ? <AILogPage {...TURA_LOG_DATA} />
     : <Root />}
  </React.StrictMode>,
);

reportWebVitals();
