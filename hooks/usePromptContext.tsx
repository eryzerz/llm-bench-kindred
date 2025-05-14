"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import {
  regularSystemPrompt,
  regularUserPrompt,
  tutorialSystemPrompt,
  tutorialUserPrompt,
  maxSystemPrompt,
  maxUserPrompt,
} from "@/app/prompts";

type PromptType = "regular" | "tutorial" | "max" | "custom";

interface PromptState {
  promptOption: PromptType;
  systemPrompt: string;
  userPrompt: string;
  customSystemPrompt: string;
  customUserPrompt: string;
  regularSystemPrompt: string;
  regularUserPrompt: string;
  tutorialSystemPrompt: string;
  tutorialUserPrompt: string;
  maxSystemPrompt: string;
  maxUserPrompt: string;
  setPromptOption: (option: PromptType) => void;
  setSystemPrompt: (prompt: string) => void;
  setUserPrompt: (prompt: string) => void;
}

const PromptContext = createContext<PromptState | undefined>(undefined);

export function PromptProvider({ children }: { children: ReactNode }) {
  const [promptOption, setPromptOptionState] = useState<PromptType>("custom");
  const [customSystemPrompt, setCustomSystemPrompt] = useState("");
  const [customUserPrompt, setCustomUserPrompt] = useState("");
  const [regularSystemPromptState, setRegularSystemPrompt] =
    useState(regularSystemPrompt);
  const [regularUserPromptState, setRegularUserPrompt] =
    useState(regularUserPrompt);
  const [tutorialSystemPromptState, setTutorialSystemPrompt] =
    useState(tutorialSystemPrompt);
  const [tutorialUserPromptState, setTutorialUserPrompt] =
    useState(tutorialUserPrompt);
  const [maxSystemPromptState, setMaxSystemPrompt] = useState(maxSystemPrompt);
  const [maxUserPromptState, setMaxUserPrompt] = useState(maxUserPrompt);

  // Determine which prompts to show based on the selected option
  const getActivePrompts = () => {
    switch (promptOption) {
      case "regular":
        return {
          system: regularSystemPromptState,
          user: regularUserPromptState,
        };
      case "tutorial":
        return {
          system: tutorialSystemPromptState,
          user: tutorialUserPromptState,
        };
      case "max":
        return { system: maxSystemPromptState, user: maxUserPromptState };
      case "custom":
      default:
        return { system: customSystemPrompt, user: customUserPrompt };
    }
  };

  const activePrompts = getActivePrompts();

  const setPromptOption = (option: PromptType) => {
    setPromptOptionState(option);
  };

  const setSystemPrompt = (prompt: string) => {
    switch (promptOption) {
      case "regular":
        setRegularSystemPrompt(prompt);
        break;
      case "tutorial":
        setTutorialSystemPrompt(prompt);
        break;
      case "max":
        setMaxSystemPrompt(prompt);
        break;
      case "custom":
      default:
        setCustomSystemPrompt(prompt);
    }
  };

  const setUserPrompt = (prompt: string) => {
    switch (promptOption) {
      case "regular":
        setRegularUserPrompt(prompt);
        break;
      case "tutorial":
        setTutorialUserPrompt(prompt);
        break;
      case "max":
        setMaxUserPrompt(prompt);
        break;
      case "custom":
      default:
        setCustomUserPrompt(prompt);
    }
  };

  return (
    <PromptContext.Provider
      value={{
        promptOption,
        systemPrompt: activePrompts.system,
        userPrompt: activePrompts.user,
        customSystemPrompt,
        customUserPrompt,
        regularSystemPrompt: regularSystemPromptState,
        regularUserPrompt: regularUserPromptState,
        tutorialSystemPrompt: tutorialSystemPromptState,
        tutorialUserPrompt: tutorialUserPromptState,
        maxSystemPrompt: maxSystemPromptState,
        maxUserPrompt: maxUserPromptState,
        setPromptOption,
        setSystemPrompt,
        setUserPrompt,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
}

export function usePromptContext() {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error("usePromptContext must be used within a PromptProvider");
  }
  return context;
}
