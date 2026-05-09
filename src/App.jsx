import AppRouter from "@/router/AppRouter";
import ThemeProvider from "@/components/common/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}
