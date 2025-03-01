import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, User, Image, Info, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ARCamera from "./ARCamera";
import ZodiacDisplay from "../profile/ZodiacDisplay";
import { recordARInteraction } from "@/lib/ar-utils";

interface ARViewProps {
  user?: {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
    zodiacSign?: string;
    achievements?: Array<{
      id: string;
      name: string;
      icon: string;
      description: string;
    }>;
    photos?: Array<{
      id: string;
      url: string;
      caption?: string;
    }>;
  };
  onClose?: () => void;
}

const ARView = ({
  user = {
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
  },
  onClose = () => {},
}: ARViewProps) => {
  const [activeTab, setActiveTab] = useState("avatar");
  const [showARMode, setShowARMode] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Record the interaction for achievement tracking
    if (value === "photos") {
      recordARInteraction(user.id, "photo_view");
    }
  };

  const handleARToggle = () => {
    setShowARMode(!showARMode);
  };

  // AR content based on active tab
  const renderARContent = () => {
    switch (activeTab) {
      case "avatar":
        return (
          <div className="relative bg-white/20 backdrop-blur-md rounded-xl p-4 shadow-lg">
            <div className="relative">
              <Avatar className="h-40 w-40 border-4 border-white shadow-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-4xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {user.zodiacSign && (
                <div className="absolute -bottom-2 -right-2 z-10">
                  <ZodiacDisplay
                    sign={user.zodiacSign}
                    size="md"
                    showLabel={false}
                  />
                </div>
              )}
            </div>

            <div className="text-center mt-4">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              {user.bio && (
                <p className="text-sm text-white/80 mt-2 max-w-[250px]">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        );

      case "photos":
        return user.photos && user.photos.length > 0 ? (
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 shadow-lg max-w-[300px]">
            <img
              src={user.photos[0].url}
              alt={user.photos[0].caption || "User photo"}
              className="w-full h-auto rounded-lg shadow-md"
            />
            {user.photos[0].caption && (
              <p className="text-sm text-white mt-2 text-center">
                {user.photos[0].caption}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 shadow-lg">
            <p className="text-white text-center">Нет фотографий</p>
          </div>
        );

      case "info":
        return (
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 shadow-lg max-w-[300px]">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Достижения
            </h3>
            {user.achievements && user.achievements.length > 0 ? (
              <div className="space-y-2">
                {user.achievements.slice(0, 2).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-white/30 rounded-lg p-2 flex items-center space-x-2"
                  >
                    <div className="text-xl">{achievement.icon}</div>
                    <div>
                      <h4 className="font-medium text-white">
                        {achievement.name}
                      </h4>
                      <p className="text-xs text-white/80">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white text-center">Нет достижений</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-900/90 to-indigo-900/90 flex flex-col">
      {showARMode ? (
        <ARCamera userId={user.id} onClose={handleARToggle}>
          {renderARContent()}
        </ARCamera>
      ) : (
        <>
          <div className="p-4 flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-white" />
            </Button>
            <h2 className="text-xl font-bold text-white">AR Просмотр</h2>
            <Button
              variant="outline"
              size="icon"
              onClick={handleARToggle}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Camera className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <Card className="border-none shadow-xl bg-white/10 backdrop-blur-md text-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{user.name}</span>
                    {user.zodiacSign && (
                      <ZodiacDisplay
                        sign={user.zodiacSign}
                        size="sm"
                        showLabel={false}
                      />
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 mb-6 w-full bg-white/20">
                      <TabsTrigger
                        value="avatar"
                        className="data-[state=active]:bg-white/30 text-white"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Аватар
                      </TabsTrigger>
                      <TabsTrigger
