import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  User,
  Users,
  Award,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Camera,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  userName?: string;
  userAvatar?: string;
  userZodiacSign?: string;
  activeLink?: string;
  unreadMessages?: number;
  newAchievements?: number;
  onNavigate?: (path: string) => void;
}

const Sidebar = ({
  userName = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  userZodiacSign = "Gemini",
  activeLink = "home",
  unreadMessages = 3,
  newAchievements = 2,
  onNavigate = () => {},
}: SidebarProps) => {
  const navItems = [
    {
      id: "home",
      label: "Главная",
      icon: <Home className="h-5 w-5" />,
      path: "/",
    },
    {
      id: "profile",
      label: "Мой профиль",
      icon: <User className="h-5 w-5" />,
      path: "/profile",
    },
    {
      id: "friends",
      label: "Друзья",
      icon: <Users className="h-5 w-5" />,
      path: "/friends",
    },
    {
      id: "groups",
      label: "Группы",
      icon: <Users className="h-5 w-5" />,
      path: "/groups",
    },
    {
      id: "achievements",
      label: "Достижения",
      icon: <Award className="h-5 w-5" />,
      path: "/achievements",
      badge: newAchievements > 0 ? newAchievements : undefined,
    },
    {
      id: "messages",
      label: "Сообщения",
      icon: <MessageSquare className="h-5 w-5" />,
      path: "/messages",
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
      id: "ar",
      label: "AR Просмотр",
      icon: <Camera className="h-5 w-5" />,
      path: "/ar",
      highlight: true,
    },
  ];

  const secondaryNavItems = [
    {
      id: "settings",
      label: "Настройки",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
    },
    {
      id: "help",
      label: "Помощь и поддержка",
      icon: <HelpCircle className="h-5 w-5" />,
      path: "/help",
    },
    {
      id: "logout",
      label: "Выйти",
      icon: <LogOut className="h-5 w-5" />,
      path: "/logout",
    },
  ];

  return (
    <div className="w-[280px] h-full bg-background/80 backdrop-blur-md border-r border-border/50 flex flex-col shadow-md">
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <Avatar className="h-12 w-12">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm">{userName}</h3>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="block"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.path);
                }}
              >
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center justify-between px-3 py-2 rounded-md ${
                    activeLink === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${item.highlight ? "border border-blue-300 bg-blue-50" : ""}`}
                >
                  <div className="flex items-center">
                    <span
                      className={`mr-3 ${
                        activeLink === item.id
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="ml-auto text-xs h-5 min-w-5 flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </motion.div>
              </Link>
            ))}
          </nav>

          <Separator className="my-4" />

          <nav className="space-y-1">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="block"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.path);
                }}
              >
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center px-3 py-2 rounded-md ${
                    activeLink === item.id
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`mr-3 ${
                      activeLink === item.id ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
          onClick={() => onNavigate("/ar")}
        >
          <Camera className="mr-2 h-4 w-4" />
          Попробовать AR опыт
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
