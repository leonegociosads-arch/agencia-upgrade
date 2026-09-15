import { BuilderProvider } from "@/features/builder/state/BuilderContext";
import BuilderShell from "@/features/builder/components/BuilderShell";

export default function BuilderPage() {
  return (
    <BuilderProvider>
      <BuilderShell />
    </BuilderProvider>
  );
}
