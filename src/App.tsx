import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";

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

function App() {
  return (
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
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/ar" element={<ARProfileView />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
