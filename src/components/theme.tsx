import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
export type Theme = "light" | "dark" | "system";
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "system",
  setTheme: () => {},
});
export const themeBootScript = `(function(){var t='system';try{t=localStorage.getItem('syllabus-theme')||'system'}catch(e){}var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'})()`;
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, update] = useState<Theme>("system");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("syllabus-theme");
      if (saved === "dark" || saved === "light") update(saved);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme, ready]);
  function setTheme(t: Theme) {
    try {
      localStorage.setItem("syllabus-theme", t);
    } catch {}
    update(t);
  }
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      title="Toggle light and dark theme"
      aria-label="Toggle light and dark theme"
      onClick={() => {
        const dark = document.documentElement.classList.contains("dark");
        setTheme(dark ? "light" : "dark");
      }}
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
      <span className="sr-only">{theme}</span>
    </Button>
  );
}
export function ThemeChoices() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="grid grid-cols-3 gap-3">
      {(
        [
          { id: "light", label: "Light", icon: Sun },
          { id: "dark", label: "Dark", icon: Moon },
          { id: "system", label: "System", icon: Monitor },
        ] as const
      ).map((t) => (
        <Button
          key={t.id}
          variant={theme === t.id ? "default" : "outline"}
          className="h-20 flex-col"
          aria-pressed={theme === t.id}
          onClick={() => setTheme(t.id)}
        >
          <t.icon />
          {t.label}
        </Button>
      ))}
    </div>
  );
}