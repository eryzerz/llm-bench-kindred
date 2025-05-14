import { ReactNode } from "react";
import { PromptProvider } from "@/hooks/usePromptContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <PromptProvider>{children}</PromptProvider>;
}
