import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";
import ZodiacDisplay from "../profile/ZodiacDisplay";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    zodiacSign: string;
    isOnline: boolean;
    lastActive?: string;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isFromUser: boolean;
    read: boolean;
  };
  unreadCount: number;
}

const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null,
  );
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: "1",
      user: {
        id: "101",
        name: "Анна Смирнова",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
        zodiacSign: "Лев",
        isOnline: true,
      },
      lastMessage: {
        text: "Привет! Как дела? Давно не виделись.",
        timestamp: "10:23",
        isFromUser: false,
        read: false,
      },
      unreadCount: 2,
    },
    {
      id: "2",
      user: {
        id: "102",
        name: "Максим Иванов",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
        zodiacSign: "Скорпион",
        isOnline: false,
        lastActive: "3 часа назад",
      },
      lastMessage: {
        text: "Спасибо за информацию! Я посмотрю позже.",
        timestamp: "Вчера",
        isFromUser: true,
        read: true,
      },
      unreadCount: 0,
    },
    {
      id: "3",
      user: {
        id: "103",
        name: "Елена Петрова",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
        zodiacSign: "Рыбы",
        isOnline: true,
      },
      lastMessage: {
        text: "Не забудь про встречу завтра в 15:00!",
        timestamp: "Вчера",
        isFromUser: false,
        read: true,
      },
      unreadCount: 0,
    },
  ];

  // Mock messages data for each conversation
  const messagesData: Record<string, Message[]> = {
    "1": [
      {
        id: "1-1",
        senderId: "101",
        text: "Привет! Как у тебя дела?",
        timestamp: "10:15",
        read: true,
      },
      {
        id: "1-2",
        senderId: "user",
        text: "Привет, Анна! У меня всё хорошо, спасибо. Как твои дела?",
        timestamp: "10:17",
        read: true,
      },
      {
        id: "1-3",
        senderId: "101",
        text: "Тоже неплохо! Работаю над новым проектом.",
        timestamp: "10:20",
        read: true,
      },
      {
        id: "1-4",
        senderId: "101",
        text: "Кстати, ты не хочешь встретиться на выходных? Можем сходить в новое кафе в центре.",
        timestamp: "10:21",
        read: true,
      },
      {
        id: "1-5",
        senderId: "101",
        text: "Говорят, там отличный кофе и десерты!",
        timestamp: "10:23",
        read: false,
      },
    ],
    "2": [
      {
        id: "2-1",
        senderId: "102",
        text: "Привет! Ты видел новую статью о технологиях AR?",
        timestamp: "Вчера, 15:30",
        read: true,
      },
      {
        id: "2-2",
        senderId: "user",
        text: "Да, очень интересная! Особенно часть про интеграцию с социальными сетями.",
        timestamp: "Вчера, 16:45",
        read: true,
      },
      {
        id: "2-3",
        senderId: "102",
        text: "Точно! Я думаю, это будущее социальных взаимодействий.",
        timestamp: "Вчера, 17:10",
        read: true,
      },
      {
        id: "2-4",
        senderId: "user",
        text: "Спасибо за информацию! Я посмотрю позже.",
        timestamp: "Вчера, 18:22",
        read: true,
      },
    ],
    "3": [
      {
        id: "3-1",
        senderId: "user",
        text: "Привет, Елена! Какие планы на завтра?",
        timestamp: "Вчера, 12:10",
        read: true,
      },
      {
        id: "3-2",
        senderId: "103",
        text: "Привет! У нас завтра встреча команды, помнишь?",
        timestamp: "Вчера, 12:15",
        read: true,
      },
      {
        id: "3-3",
        senderId: "user",
        text: "Точно! Совсем забыл. Во сколько она?",
        timestamp: "Вчера, 12:20",
        read: true,
      },
      {
        id: "3-4",
        senderId: "103",
        text: "Не забудь про встречу завтра в 15:00!",
        timestamp: "Вчера, 12:25",
        read: true,
      },
    ],
  };

  // Filter conversations based on search query and active tab
  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch = conversation.user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && conversation.unreadCount > 0);

    return matchesSearch && matchesTab;
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation, messagesData]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (messageText.trim() && activeConversation) {
      // In a real app, this would send the message to an API
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  // Get the active conversation data
  const currentConversation = conversations.find(
    (conv) => conv.id === activeConversation,
  );

  return (
    <div className="w-full h-[calc(100vh-72px)] bg-background flex">
      {/* Conversations list */}
      <div className="w-full md:w-1/3 border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold mb-4">Сообщения</h2>
          <div className="relative mb-4">
            <Input
              type="search"
              placeholder="Поиск сообщений..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="unread">
                Непрочитанные
                {conversations.reduce(
                  (sum, conv) => sum + conv.unreadCount,
                  0,
                ) > 0 && (
                  <Badge className="ml-2 bg-primary">
                    {conversations.reduce(
                      (sum, conv) => sum + conv.unreadCount,
                      0,
                    )}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-border hover:bg-accent/50 cursor-pointer ${
                  activeConversation === conversation.id ? "bg-accent" : ""
                }`}
                onClick={() => setActiveConversation(conversation.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={conversation.user.avatar}
                        alt={conversation.user.name}
                      />
                      <AvatarFallback>
                        {conversation.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      <ZodiacDisplay
                        sign={conversation.user.zodiacSign}
                        size="sm"
                        showLabel={false}
                      />
                    </div>
                    {conversation.user.isOnline && (
                      <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">
                        {conversation.user.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {conversation.lastMessage.timestamp}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-sm truncate ${
                          !conversation.lastMessage.read &&
                          !conversation.lastMessage.isFromUser
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {conversation.lastMessage.isFromUser && "Вы: "}
                        {conversation.lastMessage.text}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-primary ml-2">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Сообщения не найдены. Попробуйте другой поисковый запрос."
                  : "У вас пока нет сообщений."}
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      {activeConversation && currentConversation ? (
        <div className="hidden md:flex flex-col flex-1">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={currentConversation.user.avatar}
                  alt={currentConversation.user.name}
                />
                <AvatarFallback>
                  {currentConversation.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{currentConversation.user.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {currentConversation.user.isOnline
                    ? "В сети"
                    : currentConversation.user.lastActive}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messagesData[activeConversation].map((message) => {
                const isFromUser = message.senderId === "user";
                return (
                  <div
                    key={message.id}
                    className={`flex ${isFromUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${isFromUser ? "bg-primary text-primary-foreground" : "bg-accent"}`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div
                        className={`text-xs mt-1 ${isFromUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Введите сообщение..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button variant="ghost" size="icon">
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-col flex-1 items-center justify-center bg-accent/10">
          <div className="text-center p-8">
            <h3 className="text-xl font-medium mb-2">Выберите чат</h3>
            <p className="text-muted-foreground">
              Выберите существующий чат или начните новый разговор
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
