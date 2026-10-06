import { Suspense, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Loader2 } from "lucide-react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";
import { AttendanceGateProvider } from "./context/AttendanceGateContext";
import AttendanceGate from "./components/attendanceGate/AttendanceGate";
import { FORBIDDEN_EVENT } from "./services/api";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// RBAC route guards
import RequireAuth from "./components/rbac/RequireAuth";
import RequirePermission from "./components/rbac/RequirePermission";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile/Profile";
import Forbidden from "./pages/Forbidden";
import ModulePlaceholder from "./pages/ModulePlaceholder";
import {
  BUILT_IN_PAGES,
  BUILT_IN_PATHS,
  getDynamicPage,
} from "./pages/ModuleRegistry";

// Auth Pages
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FirstTimeAccess from "./pages/Firsttimeaccess";
import Register from "./pages/Register";

const muiTheme = createTheme({
  typography: { fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  shape: { borderRadius: 10 },
  palette: {
    primary: { main: "#041D5F", light: "#0F265C", dark: "#031646" },
    secondary: { main: "#F97316", light: "#FB923C", dark: "#EA580C" },
    success: { main: "#22C55E", dark: "#16A34A" },
    warning: { main: "#F59E0B", dark: "#D97706" },
    error: { main: "#EF4444", dark: "#DC2626" },
    info: { main: "#3B82F6", dark: "#2563EB" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: "0 1px 2px 0 rgb(4 29 95 / 0.04), 0 1px 3px 0 rgb(4 29 95 / 0.06)" },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

// A page opens only when the user's role(s) hold "<slug>:view" in role_permissions.
// Without it the user sees the 403 page, even via a direct URL.
const guard = (moduleSlug, page, action = "view") => (
  <RequirePermission module={moduleSlug} action={action}>
    {page}
  </RequirePermission>
);

function ForbiddenNotice() {
  useEffect(() => {
    const onForbidden = () =>
      toast.error("You don't have permission to perform this action.", { toastId: "forbidden" });
    window.addEventListener(FORBIDDEN_EVENT, onForbidden);
    return () => window.removeEventListener(FORBIDDEN_EVENT, onForbidden);
  }, []);
  return null;
}

const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-primary-700">
    <Loader2 size={24} className="animate-spin" />
  </div>
);

// margin kept in sync with Sidebar.jsx: 288px expanded (lg:ml-72) / 80px collapsed (lg:ml-20)
function LayoutContent() {
  const { collapsed } = useSidebar();
  const { menu } = useAuth();

  // Pages for modules that were added in the DB later (e.g. Payroll): the route
  // comes from the module's own `path`, so no code change is needed.
  const dynamicRoutes = useMemo(
    () =>
      (menu || [])
        .filter((m) => m.navigable && m.path && !BUILT_IN_PATHS.has(m.path) && !["/dashboard", "/profile"].includes(m.path))
        .map((m) => {
          const Page = getDynamicPage(m.slug);
          return (
            <Route
              key={m.slug}
              path={m.path}
              element={guard(
                m.slug,
                <Suspense fallback={<PageLoader />}>
                  {Page ? <Page /> : <ModulePlaceholder name={m.name} slug={m.slug} />}
                </Suspense>,
              )}
            />
          );
        }),
    [menu],
  );

  const mainMarginClass = `
    ${collapsed ? "lg:ml-20" : "lg:ml-72"}
    pt-18 lg:pt-20
    px-4 sm:px-6 lg:px-8
    py-4 lg:py-5
  `;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main
          className={`
            flex-1
            min-w-0
            ${mainMarginClass}
            min-h-screen
            overflow-x-hidden
            transition-all
            duration-base
            ease-standard
          `}
        >
          <Routes>
            {/* Dashboard & Profile: every signed-in user */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Built-in pages — each one guarded by its module slug */}
            {BUILT_IN_PAGES.map(({ path, slug, Component }) => (
              <Route key={path} path={path} element={guard(slug, <Component />)} />
            ))}

            {/* Pages for modules added from the Modules screen */}
            {dynamicRoutes}

            {/* Anything else: no access / not found */}
            <Route path="*" element={<Forbidden />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Layout() {
  return (
    <RequireAuth>
      <AttendanceGateProvider>
        <AttendanceGate>
          <SidebarProvider>
            <LayoutContent />
          </SidebarProvider>
        </AttendanceGate>
      </AttendanceGateProvider>
    </RequireAuth>
  );
}

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <AuthProvider>
        <BrowserRouter>
          <ForbiddenNotice />

          <Routes>
            {/* Public Authentication Pages */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/first-time-access" element={<FirstTimeAccess />} />

            {/* Application */}
            <Route path="/*" element={<Layout />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="light"
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;