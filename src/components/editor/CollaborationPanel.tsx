import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  UserPlus,
  Send,
  MessageSquare,
  Users,
  Settings,
  Clock,
  Eye,
  Edit2,
  Shield,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastActive?: string;
  permission: "view" | "edit" | "admin";
  currentFile?: string;
  currentCursor?: { line: number; column: number };
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  isSystemMessage?: boolean;
}

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectType: "code" | "text" | "graphic";
  currentFile?: string;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  isOpen,
  onClose,
  projectName,
  projectType,
  currentFile,
}) => {
  const [activeTab, setActiveTab] = useState("collaborators");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<
    "view" | "edit" | "admin"
  >("view");
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [isLockingEnabled, setIsLockingEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("connected");

  // Load mock data
  useEffect(() => {
    // Mock collaborators
    const mockCollaborators: Collaborator[] = [
      {
        id: "current-user",
        name: "Вы",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        isOnline: true,
        permission: "admin",
        currentFile: currentFile,
      },
      {
        id: "user1",
        name: "Анна Смирнова",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
        isOnline: true,
        permission: "edit",
        currentFile: projectType === "code" ? "main.js" : undefined,
        currentCursor:
          projectType === "code" ? { line: 42, column: 15 } : undefined,
      },
      {
        id: "user2",
        name: "Максим Иванов",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
        isOnline: false,
        lastActive: "3 часа назад",
        permission: "view",
      },
      {
        id: "user3",
        name: "Елена Петрова",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
        isOnline: true,
        permission: "edit",
        currentFile: projectType === "text" ? "Документ" : undefined,
      },
    ];

    // Mock messages
    const mockMessages: Message[] = [
      {
        id: "1",
        userId: "system",
        userName: "Система",
        userAvatar: "",
        text: `Сессия совместного редактирования для проекта "${projectName}" начата`,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isSystemMessage: true,
      },
      {
        id: "2",
        userId: "user1",
        userName: "Анна Смирнова",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
        text: "Привет всем! Я начала работать над функцией авторизации.",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "3",
        userId: "current-user",
        userName: "Вы",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        text: "Отлично! Я займусь интерфейсом.",
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: "4",
        userId: "system",
        userName: "Система",
        userAvatar: "",
        text: "Елена Петрова присоединилась к сессии",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        isSystemMessage: true,
      },
      {
        id: "5",
        userId: "user3",
        userName: "Елена Петрова",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
        text: "Всем привет! Что мне нужно сделать?",
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
    ];

    setCollaborators(mockCollaborators);
    setMessages(mockMessages);
  }, [projectName, projectType, currentFile]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      userId: "current-user",
      userName: "Вы",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;

    // In a real app, this would send an invitation
    const systemMsg: Message = {
      id: Date.now().toString(),
      userId: "system",
      userName: "Система",
      userAvatar: "",
      text: `Приглашение отправлено на ${inviteEmail} с правами ${getPermissionName(invitePermission)}`,
      timestamp: new Date().toISOString(),
      isSystemMessage: true,
    };

    setMessages([...messages, systemMsg]);
    setInviteEmail("");
  };

  const handleChangePermission = (
    userId: string,
    permission: "view" | "edit" | "admin",
  ) => {
    const updatedCollaborators = collaborators.map((collab) =>
      collab.id === userId ? { ...collab, permission } : collab,
    );
    setCollaborators(updatedCollaborators);

    // Add system message
    const user = collaborators.find((c) => c.id === userId);
    if (user) {
      const systemMsg: Message = {
        id: Date.now().toString(),
        userId: "system",
        userName: "Система",
        userAvatar: "",
        text: `Права пользователя ${user.name} изменены на ${getPermissionName(permission)}`,
        timestamp: new Date().toISOString(),
        isSystemMessage: true,
      };
      setMessages([...messages, systemMsg]);
    }
  };

  const handleRemoveCollaborator = (userId: string) => {
    const user = collaborators.find((c) => c.id === userId);
    if (!user || user.id === "current-user") return;

    const updatedCollaborators = collaborators.filter(
      (collab) => collab.id !== userId,
    );
    setCollaborators(updatedCollaborators);

    // Add system message
    const systemMsg: Message = {
      id: Date.now().toString(),
      userId: "system",
      userName: "Система",
      userAvatar: "",
      text: `Пользователь ${user.name} удален из проекта`,
      timestamp: new Date().toISOString(),
      isSystemMessage: true,
    };
    setMessages([...messages, systemMsg]);
  };

  const getPermissionName = (permission: string): string => {
    switch (permission) {
      case "view":
        return "просмотр";
      case "edit":
        return "редактирование";
      case "admin":
        return "администратор";
      default:
        return permission;
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "view":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "edit":
        return <Edit2 className="h-4 w-4 text-green-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
      className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Совместная работа</h3>
          <p className="text-xs text-muted-foreground">{projectName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={
              connectionStatus === "connected"
                ? "success"
                : connectionStatus === "connecting"
                  ? "warning"
                  : "destructive"
            }
            className="text-xs"
          >
            {connectionStatus === "connected"
              ? "Подключено"
              : connectionStatus === "connecting"
                ? "Подключение..."
                : "Отключено"}
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid grid-cols-2 px-4 pt-2">
          <TabsTrigger value="collaborators">
            <Users className="h-4 w-4 mr-2" />
            Участники
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Чат
          </TabsTrigger>
        </TabsList>

        {/* Collaborators Tab */}
        <TabsContent value="collaborators" className="flex-1 flex flex-col p-0">
          <div className="p-4 border-b border-border">
            <h4 className="text-sm font-medium mb-2">Пригласить участника</h4>
            <div className="flex space-x-2 mb-2">
              <Input
                placeholder="Email пользователя"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleInviteUser}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                Права доступа:
              </span>
              <Select
                value={invitePermission}
                onValueChange={(value: "view" | "edit" | "admin") =>
                  setInvitePermission(value)
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Просмотр</SelectItem>
                  <SelectItem value="edit">Редактирование</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="p-3 rounded-md border border-border bg-card"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={collaborator.avatar}
                            alt={collaborator.name}
                          />
                          <AvatarFallback>
                            {collaborator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {collaborator.isOnline && (
                          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border border-background"></span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium">
                            {collaborator.name}
                            {collaborator.id === "current-user" && " (Вы)"}
                          </p>
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs flex items-center space-x-1"
                          >
                            {getPermissionIcon(collaborator.permission)}
                            <span>
                              {getPermissionName(collaborator.permission)}
                            </span>
                          </Badge>
                        </div>
                        {!collaborator.isOnline && collaborator.lastActive && (
                          <p className="text-xs text-muted-foreground">
                            Был(а) {collaborator.lastActive}
                          </p>
                        )}
                        {collaborator.isOnline && collaborator.currentFile && (
                          <p className="text-xs text-muted-foreground">
                            Редактирует: {collaborator.currentFile}
                            {collaborator.currentCursor &&
                              ` (строка ${collaborator.currentCursor.line})`}
                          </p>
                        )}
                      </div>
                    </div>

                    {collaborator.id !== "current-user" && (
                      <div className="flex">
                        <Select
                          value={collaborator.permission}
                          onValueChange={(value: "view" | "edit" | "admin") =>
                            handleChangePermission(collaborator.id, value)
                          }
                        >
                          <SelectTrigger className="h-7 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">Просмотр</SelectItem>
                            <SelectItem value="edit">Редактирование</SelectItem>
                            <SelectItem value="admin">Администратор</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-1 text-red-500 hover:text-red-700"
                          onClick={() =>
                            handleRemoveCollaborator(collaborator.id)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border space-y-2">
            <h4 className="text-sm font-medium">Настройки совместной работы</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="realtime"
                  checked={isRealTimeEnabled}
                  onCheckedChange={setIsRealTimeEnabled}
                />
                <Label htmlFor="realtime" className="text-sm">
                  Редактирование в реальном времени
                </Label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="locking"
                  checked={isLockingEnabled}
                  onCheckedChange={setIsLockingEnabled}
                />
                <Label htmlFor="locking" className="text-sm">
                  Блокировка файлов при редактировании
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.userId === "current-user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.isSystemMessage
                        ? "bg-muted w-full text-center py-1 text-xs text-muted-foreground"
                        : message.userId === "current-user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                    } rounded-lg p-2`}
                  >
                    {!message.isSystemMessage && (
                      <div className="flex items-center space-x-2 mb-1">
                        {message.userId !== "current-user" && (
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={message.userAvatar}
                              alt={message.userName}
                            />
                            <AvatarFallback>
                              {message.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-xs font-medium">
                          {message.userName}
                        </span>
                        <span className="text-xs opacity-70">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                    )}
                    <p
                      className={`${message.isSystemMessage ? "" : "text-sm"}`}
                    >
                      {message.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                placeholder="Введите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default CollaborationPanel;
