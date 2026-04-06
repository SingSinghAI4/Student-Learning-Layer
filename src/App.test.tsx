import React from "react";
import { render } from "@testing-library/react";
import App from "./App";
import { StudentProfile } from "./LoginScreen";

const mockProfile: StudentProfile = {
  id: "test-001",
  name: "Test",
  avatarIdx: 0,
  grade: 2,
  lessonProgress: 0,
  streak: 0,
  bilumItems: [],
  lastSeen: "Today",
  placement: "",
};

test("renders without crashing", () => {
  render(<App profile={mockProfile} isNew={true} />);
});
