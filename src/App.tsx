import { Suspense, lazy, useState, useEffect } from "react";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { AuthProvider } from "./components/auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./components/auth/LoginPage";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

// Lazy load components for better performance
const ProfilePage = lazy(() => import("./components/profile/ProfilePage"));
const FriendsPage = lazy(() => import("./components/friends/FriendsPage"));
const GroupsPage = lazy(() => import("./components/groups/GroupsPage"));
const GroupDetailPage = lazy(
  () => import("./components/groups/GroupDetailPage"),
);
const AchievementsPage = lazy(
  () => import("./components/achievements/AchievementsPage"),
);
const MessagesPage = lazy(() => import("./components/messages/MessagesPage"));
const ARProfileView = lazy(() => import("./components/profile/ARProfileView"));
const ARView = lazy(() => import("./components/ar/ARView"));
const SettingsPage = lazy(() => import("./components/settings/SettingsPage"));

// Editor components
const CodeEditor = lazy(() => import("./components/editor/CodeEditor"));
const TextEditor = lazy(() => import("./components/editor/TextEditor"));
const GraphicEditor = lazy(() => import("./components/editor/GraphicEditor"));

// Layout component that conditionally includes sidebar
const Layout = ({ children }) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("home");
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Check if current route is an editor route
  const isEditorRoute = [
    "/code-editor",
    "/text-editor",
    "/graphic-editor",
  ].includes(location.pathname);

  // Update active link based on current path
  useEffect(() => {
    const pathToLinkMap = {
      "/": "home",
      "/profile": "profile",
      "/friends": "friends",
      "/groups": "groups",
      "/achievements": "achievements",
      "/messages": "messages",
      "/ar": "ar",
      "/settings": "settings",
      "/code-editor": "code-editor",
      "/text-editor": "text-editor",
      "/graphic-editor": "graphic-editor",
    };

    const link = pathToLinkMap[location.pathname] || "home";
    setActiveLink(link);
  }, [location.pathname]);

  const handleMenuToggle = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // If it's an editor route, don't show the sidebar
  if (isEditorRoute || location.pathname === "/login") {
    return children;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        onMenuToggle={handleMenuToggle}
        userName="John Doe"
        userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
        notificationCount={3}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - conditionally shown on mobile */}
        <div className={`${sidebarVisible ? "block" : "hidden"} md:block`}>
          <Sidebar
            activeLink={activeLink}
            unreadMessages={2}
            newAchievements={1}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen w-screen bg-background">
            <div className="animate-pulse text-primary font-bold text-xl">
              Загрузка...
            </div>
          </div>
        }
      >
        <>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FriendsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GroupsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GroupDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AchievementsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MessagesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ar"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ARView />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Editor routes - without sidebar */}
            <Route
              path="/code-editor"
              element={
                <ProtectedRoute>
                  <CodeEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/text-editor"
              element={
                <ProtectedRoute>
                  <TextEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/graphic-editor"
              element={
                <ProtectedRoute>
                  <GraphicEditor />
                </ProtectedRoute>
              }
            />
            <Route path="/logout" element={<Navigate to="/login" replace />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
