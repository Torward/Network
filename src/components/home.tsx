import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";
import FeedContainer from "./feed/FeedContainer";
import ARProfileView from "./profile/ARProfileView";
import AchievementNotification from "./achievements/AchievementNotification";
import ZodiacDisplay from "./profile/ZodiacDisplay";

interface HomeProps {
  userName?: string;
  userAvatar?: string;
  userZodiacSign?: string;
  notificationCount?: number;
  unreadMessages?: number;
  newAchievements?: number;
  showAchievementNotification?: boolean;
  showARView?: boolean;
}

const Home = ({
  userName = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  userZodiacSign = "Gemini",
  notificationCount = 3,
  unreadMessages = 2,
  newAchievements = 1,
  showAchievementNotification = false,
  showARView = true,
}: HomeProps) => {
  const [activeLink, setActiveLink] = useState("home");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [achievementVisible, setAchievementVisible] = useState(
    showAchievementNotification,
  );
  const [arViewVisible, setArViewVisible] = useState(showARView);

  // Mock data for the AR profile view
  const arProfileUser = {
    id: "1",
    name: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    bio: "Digital nomad, coffee enthusiast, and amateur photographer. Always looking for the next adventure!",
    zodiacSign: "Aquarius",
    achievements: [
      {
        id: "1",
        name: "Early Adopter",
        icon: "🚀",
        description: "Joined during the platform's beta phase",
      },
      {
        id: "2",
        name: "Content Creator",
        icon: "📸",
        description: "Posted 50+ pieces of content",
      },
      {
        id: "3",
        name: "Social Butterfly",
        icon: "🦋",
        description: "Connected with 100+ users",
      },
    ],
    photos: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        caption: "Hiking in the mountains last weekend",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a",
        caption: "Coffee shop vibes",
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1551632811-561732d1e306",
        caption: "Exploring the city",
      },
    ],
  };

  // Mock achievement data
  const achievement = {
    id: "first-post",
    title: "First Post!",
    description: "You created your first post on the platform.",
    icon: "🏆",
    badgeColor: "bg-yellow-500",
  };

  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    // In a real app, this would use router navigation
    console.log(`Navigating to: ${path}`);

    // For demo purposes, we'll just update the active link
    const linkMap: Record<string, string> = {
      "/": "home",
      "/profile": "profile",
      "/friends": "friends",
      "/groups": "groups",
      "/achievements": "achievements",
      "/messages": "messages",
      "/ar": "ar",
      "/settings": "settings",
      "/help": "help",
      "/logout": "logout",
      "/code-editor": "code-editor",
      "/text-editor": "text-editor",
      "/graphic-editor": "graphic-editor",
    };

    setActiveLink(linkMap[path] || "home");

    // Special handling for AR view
    if (path === "/ar") {
      setArViewVisible(true);
    }

    // Navigate to the path
    navigate(path);
  };

  const handleMenuToggle = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleSearchSubmit = (query: string) => {
    console.log(`Searching for: ${query}`);
    // In a real app, this would trigger a search API call
  };

  const handlePostCreate = (post: {
    type: string;
    content: string;
    attachments?: File[];
  }) => {
    console.log("New post created:", post);
    // In a real app, this would send the post to an API

    // Show achievement notification when user creates first post
    setAchievementVisible(true);
  };

  const handleAchievementClose = () => {
    setAchievementVisible(false);
  };

  const handleARViewClose = () => {
    setArViewVisible(false);
  };

  return (
    <>
      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex justify-center">
        <FeedContainer
          userAvatar={userAvatar}
          userName={userName}
          onPostCreate={handlePostCreate}
        />
      </div>

      {/* AR Profile View - conditionally shown */}
      {arViewVisible && (
        <div className="hidden lg:block p-4 absolute right-4 top-20">
          <ARProfileView user={arProfileUser} onClose={handleARViewClose} />
        </div>
      )}

      {/* Achievement notification */}
      <AchievementNotification
        achievement={achievement}
        isVisible={achievementVisible}
        onClose={handleAchievementClose}
      />

      {/* Zodiac display - shown in a fixed position for demo purposes */}
      <div className="hidden fixed bottom-4 left-4 md:flex">
        <ZodiacDisplay sign={userZodiacSign} size="lg" showLabel={true} />
      </div>
    </>
  );
};

export default Home;
