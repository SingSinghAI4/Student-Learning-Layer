import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import LoginScreen, { StudentProfile } from "./LoginScreen";
import reportWebVitals from "./reportWebVitals";

function Root() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isNew, setIsNew] = useState(false);

  if (!profile) {
    return (
      <LoginScreen
        onLogin={(p, newStudent) => {
          setProfile(p);
          setIsNew(newStudent);
        }}
      />
    );
  }

  return <App profile={profile} isNew={isNew} />;
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
