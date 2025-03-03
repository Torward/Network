import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import DeepseekChat from "../chat/DeepseekChat";
import { useAuth } from "../auth/AuthProvider";
import { getUISettings } from "@/lib/ui-settings";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showDeepseekChat, setShowDeepseekChat] = useState(false);
  const [activeLink, setActiveLink] = useState("home");

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
      "/location": "location",
    };

    const link = pathToLinkMap[location.pathname] || "home";
    setActiveLink(link);
  }, [location.pathname]);

  // Load UI settings
  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        // Check if DeepseekChat should be visible
        const chatSettings = await getUISettings("deepseek-chat");
        if (chatSettings) {
          setShowDeepseekChat(chatSettings.is_visible);
        }
      }
    };

    loadSettings();
  }, [user]);

  const handleMenuToggle = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        onMenuToggle={handleMenuToggle}
        userName="John Doe"
        userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
        notificationCount={3}
        onToggleDeepseekChat={() => setShowDeepseekChat(!showDeepseekChat)}
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

      {/* Deepseek Chat */}
      {showDeepseekChat && <DeepseekChat />}
    </div>
  );
};

export default AppLayout;
