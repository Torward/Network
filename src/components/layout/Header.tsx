import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  User,
  Menu,
  MessageSquare,
  LogOut,
  Settings,
  MapPin,
  Code,
  PenTool,
  Palette,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "@/lib/supabase";

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
  onMenuToggle?: () => void;
  onSearchSubmit?: (query: string) => void;
  onToggleDeepseekChat?: () => void;
}

const Header = ({
  userName,
  userAvatar,
  notificationCount,
  onMenuToggle = () => {},
  onSearchSubmit = () => {},
  onToggleDeepseekChat = () => {},
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [userData, setUserData] = useState<any>(null);

  // Fetch user data, notifications and messages from Supabase
  useEffect(() => {
    if (user) {
      // Fetch user profile data
      const fetchUserData = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          setUserData(data);
        }
      };

      // Fetch notifications
      const fetchNotifications = async () => {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data && !error) {
          setNotifications(data);
        }
      };

      // Fetch unread messages count
      const fetchUnreadMessages = async () => {
        const { count, error } = await supabase
          .from("messages")
          .select("*", { count: "exact" })
          .eq("recipient_id", user.id)
          .eq("read", false);

        if (!error) {
          setUnreadMessages(count || 0);
        }
      };

      fetchUserData();
      fetchNotifications();
      fetchUnreadMessages();

      // Set up realtime subscriptions for notifications and messages
      const notificationsSubscription = supabase
        .channel("notifications-channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications();
          },
        )
        .subscribe();

      const messagesSubscription = supabase
        .channel("messages-channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `recipient_id=eq.${user.id}`,
          },
          () => {
            fetchUnreadMessages();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(notificationsSubscription);
        supabase.removeChannel(messagesSubscription);
      };
    }
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Use actual user data if available, otherwise use props
  const displayName = userData?.full_name || userName || "Пользователь";
  const displayAvatar =
    userData?.avatar_url ||
    userAvatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;
  const displayNotificationCount =
    notifications?.length || notificationCount || 0;

  return (
    <header className="w-full h-[72px] bg-background/80 backdrop-blur-md border-b border-border/50 px-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center">
          <h1
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mr-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Сеть
          </h1>
          <Badge
            variant="outline"
            className="hidden md:flex bg-blue-50 text-blue-600 border-blue-200"
          >
            Бета
          </Badge>
        </div>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex relative max-w-md w-full mx-4"
      >
        <Input
          type="search"
          placeholder="Поиск людей, постов или тем..."
          className="pr-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
        >
          <Search className="h-4 w-4 text-gray-500" />
        </Button>
      </form>

      <div className="flex items-center space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleDeepseekChat}
              >
                <Bot className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Deepseek R1 Чат</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ThemeToggle />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => handleNavigate("/notifications")}
              >
                <Bell className="h-5 w-5" />
                {displayNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {displayNotificationCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Уведомления</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => handleNavigate("/messages")}
              >
                <MessageSquare className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {unreadMessages}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Сообщения</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigate("/location")}
              >
                <MapPin className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Местоположение</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full ml-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div
              className="flex items-center justify-start gap-2 p-2 cursor-pointer hover:bg-accent"
              onClick={() => handleNavigate("/profile")}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  Просмотр профиля
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Профиль</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/notifications")}>
              <Bell className="mr-2 h-4 w-4" />
              <span>Уведомления</span>
              {displayNotificationCount > 0 && (
                <Badge
                  variant="outline"
                  className="ml-auto bg-red-100 text-red-600 border-red-200"
                >
                  {displayNotificationCount}
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/messages")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Сообщения</span>
              {unreadMessages > 0 && (
                <Badge
                  variant="outline"
                  className="ml-auto bg-red-100 text-red-600 border-red-200"
                >
                  {unreadMessages}
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/location")}>
              <MapPin className="mr-2 h-4 w-4" />
              <span>Местоположение</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Настройки</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigate("/code-editor")}>
              <Code className="mr-2 h-4 w-4" />
              <span>Редактор кода</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/text-editor")}>
              <PenTool className="mr-2 h-4 w-4" />
              <span>Текстовый редактор</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/graphic-editor")}>
              <Palette className="mr-2 h-4 w-4" />
              <span>Графический редактор</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Выйти</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
