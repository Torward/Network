import React, { useState } from "react";
import { Bell, Search, User, Menu, MessageSquare, LogOut } from "lucide-react";
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

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
  onMenuToggle?: () => void;
  onSearchSubmit?: (query: string) => void;
}

const Header = ({
  userName = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  notificationCount = 3,
  onMenuToggle = () => {},
  onSearchSubmit = () => {},
}: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchQuery);
  };

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
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mr-2">
            СоциальноеAR
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
        <ThemeToggle />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {notificationCount}
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
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Сообщения</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full ml-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">
                  Просмотр профиля
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Профиль</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              <span>Уведомления</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Сообщения</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
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
