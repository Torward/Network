import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  UserCheck,
  MessageSquare,
  X,
  Network,
} from "lucide-react";
import ZodiacDisplay from "../profile/ZodiacDisplay";
import FriendsNetworkGraph from "./FriendsNetworkGraph";

interface FriendsPageProps {
  onNavigateToProfile?: (userId: string) => void;
  onSendMessage?: (userId: string) => void;
}

interface FriendData {
  id: string;
  name: string;
  avatar: string;
  zodiacSign: string;
  mutualFriends: number;
  isOnline: boolean;
  lastActive?: string;
}

const FriendsPage = ({
  onNavigateToProfile = () => {},
  onSendMessage = () => {},
}: FriendsPageProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock friends data
  const friendsData: FriendData[] = [
    {
      id: "1",
      name: "Анна Смирнова",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
      zodiacSign: "Лев",
      mutualFriends: 12,
      isOnline: true,
    },
    {
      id: "2",
      name: "Максим Иванов",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
      zodiacSign: "Скорпион",
      mutualFriends: 5,
      isOnline: false,
      lastActive: "3 часа назад",
    },
    {
      id: "3",
      name: "Елена Петрова",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
      zodiacSign: "Рыбы",
      mutualFriends: 8,
      isOnline: true,
    },
    {
      id: "4",
      name: "Дмитрий Козлов",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry",
      zodiacSign: "Овен",
      mutualFriends: 3,
      isOnline: false,
      lastActive: "1 день назад",
    },
  ];

  // Mock friend requests data
  const friendRequestsData: FriendData[] = [
    {
      id: "5",
      name: "Ольга Соколова",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olga",
      zodiacSign: "Телец",
      mutualFriends: 7,
      isOnline: true,
    },
    {
      id: "6",
      name: "Артём Новиков",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Artem",
      zodiacSign: "Близнецы",
      mutualFriends: 2,
      isOnline: false,
      lastActive: "5 часов назад",
    },
  ];

  // Mock suggestions data
  const suggestionsData: FriendData[] = [
    {
      id: "7",
      name: "Мария Кузнецова",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      zodiacSign: "Весы",
      mutualFriends: 15,
      isOnline: true,
    },
    {
      id: "8",
      name: "Александр Волков",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      zodiacSign: "Стрелец",
      mutualFriends: 9,
      isOnline: false,
      lastActive: "2 дня назад",
    },
    {
      id: "9",
      name: "Наталья Морозова",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Natalia",
      zodiacSign: "Козерог",
      mutualFriends: 6,
      isOnline: true,
    },
  ];

  const filteredFriends = friendsData.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRequests = friendRequestsData.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredSuggestions = suggestionsData.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddFriend = (friendId: string) => {
    // In a real app, this would send a friend request to the API
    console.log(`Adding friend with ID: ${friendId}`);
  };

  const handleRemoveFriend = (friendId: string) => {
    // In a real app, this would remove the friend via API
    console.log(`Removing friend with ID: ${friendId}`);
  };

  const renderFriendCard = (
    friend: FriendData,
    type: "friend" | "request" | "suggestion",
  ) => (
    <Card key={friend.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-4"
            onClick={() => onNavigateToProfile(friend.id)}
            style={{ cursor: "pointer" }}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={friend.avatar} alt={friend.name} />
                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                <ZodiacDisplay
                  sign={friend.zodiacSign}
                  size="sm"
                  showLabel={false}
                />
              </div>
              {friend.isOnline && (
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
              )}
            </div>
            <div>
              <h3 className="font-medium">{friend.name}</h3>
              <p className="text-xs text-muted-foreground">
                {friend.mutualFriends} общих друзей
              </p>
              {!friend.isOnline && friend.lastActive && (
                <p className="text-xs text-muted-foreground">
                  Активен: {friend.lastActive}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            {type === "friend" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSendMessage(friend.id)}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </>
            )}

            {type === "request" && (
              <>
                <Button variant="default" size="sm">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Принять
                </Button>
                <Button variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Отклонить
                </Button>
              </>
            )}

            {type === "suggestion" && (
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-[800px] mx-auto p-4 bg-background">
      <h1 className="text-2xl font-bold mb-6">Друзья</h1>

      <div className="mb-6 relative">
        <Input
          type="search"
          placeholder="Поиск друзей..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-5 mb-6">
          <TabsTrigger value="all">
            Все друзья
            <Badge className="ml-2 bg-primary">{friendsData.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="online">
            Онлайн
            <Badge className="ml-2 bg-green-500">
              {friendsData.filter((friend) => friend.isOnline).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="requests">
            Запросы
            <Badge className="ml-2 bg-primary">
              {friendRequestsData.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            Рекомендации
            <Badge className="ml-2 bg-primary">{suggestionsData.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="network">
            <Network className="h-4 w-4 mr-1" />
            Сеть связей
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => renderFriendCard(friend, "friend"))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Друзья не найдены. Попробуйте другой поисковый запрос."
                  : "У вас пока нет друзей."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="online" className="space-y-4">
          {filteredFriends.filter((friend) => friend.isOnline).length > 0 ? (
            filteredFriends
              .filter((friend) => friend.isOnline)
              .map((friend) => renderFriendCard(friend, "friend"))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Друзья онлайн не найдены. Попробуйте другой поисковый запрос."
                  : "У вас нет друзей онлайн."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((friend) =>
              renderFriendCard(friend, "request"),
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Запросы не найдены. Попробуйте другой поисковый запрос."
                  : "У вас нет запросов в друзья."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((friend) =>
              renderFriendCard(friend, "suggestion"),
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Рекомендации не найдены. Попробуйте другой поисковый запрос."
                  : "Нет рекомендаций для отображения."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="h-[600px] w-full">
            <FriendsNetworkGraph
              onAddFriend={handleAddFriend}
              onRemoveFriend={handleRemoveFriend}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendsPage;
