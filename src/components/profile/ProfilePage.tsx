import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Edit, Settings, Image, Award } from "lucide-react";
import ZodiacDisplay from "./ZodiacDisplay";
import PostCard from "../feed/PostCard";

interface ProfilePageProps {
  userId?: string;
  isCurrentUser?: boolean;
  userData?: {
    name: string;
    avatar: string;
    bio: string;
    zodiacSign: string;
    followers: number;
    following: number;
    posts: number;
    joinDate: string;
  };
}

const ProfilePage = ({
  userId = "1",
  isCurrentUser = true,
  userData = {
    name: "Иван Петров",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan",
    bio: "Цифровой кочевник, любитель кофе и фотограф-любитель. Всегда в поиске новых приключений!",
    zodiacSign: "Близнецы",
    followers: 245,
    following: 118,
    posts: 37,
    joinDate: "Март 2023",
  },
}: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState("posts");

  // Mock posts data
  const userPosts = [
    {
      id: "1",
      user: {
        name: userData.name,
        avatar: userData.avatar,
        zodiacSign: userData.zodiacSign,
      },
      content: {
        text: "Только что открыл для себя потрясающую новую кофейню в центре города! Атмосфера идеально подходит для удаленной работы, а их фирменные латте просто восхитительны. #КофеМания #УдаленнаяРабота",
        media: {
          type: "image" as const,
          url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        },
        timestamp: "2 часа назад",
      },
      interactions: {
        likes: 42,
        comments: 12,
        shares: 5,
        liked: false,
      },
    },
    {
      id: "2",
      user: {
        name: userData.name,
        avatar: userData.avatar,
        zodiacSign: userData.zodiacSign,
      },
      content: {
        text: "Закат на пляже сегодня был просто невероятным! #Природа #Закат",
        media: {
          type: "image" as const,
          url: "https://images.unsplash.com/photo-1616036740257-9449ea1f6605?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        },
        timestamp: "2 дня назад",
      },
      interactions: {
        likes: 87,
        comments: 23,
        shares: 12,
        liked: true,
      },
    },
  ];

  // Mock achievements data
  const achievements = [
    {
      id: "1",
      title: "Ранний последователь",
      description: "Присоединился к платформе во время бета-тестирования",
      icon: "🚀",
      date: "Март 2023",
    },
    {
      id: "2",
      title: "Создатель контента",
      description: "Опубликовал более 30 постов",
      icon: "📸",
      date: "Июнь 2023",
    },
    {
      id: "3",
      title: "Социальная бабочка",
      description: "Подключился к более чем 100 пользователям",
      icon: "🦋",
      date: "Сентябрь 2023",
    },
  ];

  // Mock photos data
  const photos = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a",
    "https://images.unsplash.com/photo-1551632811-561732d1e306",
    "https://images.unsplash.com/photo-1516655855035-d5215bcb5604",
    "https://images.unsplash.com/photo-1504297050568-910d24c426d3",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  ];

  return (
    <div className="w-full max-w-[1000px] mx-auto p-4 bg-background">
      <Card className="mb-6 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-400 to-indigo-500 relative">
          {isCurrentUser && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4">
            <div className="relative ml-4">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <ZodiacDisplay
                  sign={userData.zodiacSign}
                  size="sm"
                  showLabel={false}
                />
              </div>
            </div>

            <div className="flex-1 mt-4 md:mt-0 md:ml-4 mb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{userData.name}</h1>
                  <p className="text-muted-foreground text-sm">
                    Присоединился: {userData.joinDate}
                  </p>
                </div>

                <div className="mt-4 md:mt-0 flex space-x-2">
                  {isCurrentUser ? (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать профиль
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Настройки
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="default" size="sm">
                        Подписаться
                      </Button>
                      <Button variant="outline" size="sm">
                        Сообщение
                      </Button>
                      <Button variant="outline" size="icon">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm">{userData.bio}</p>
          </div>

          <div className="flex justify-around border-y border-border py-3">
            <div className="text-center">
              <div className="font-bold">{userData.posts}</div>
              <div className="text-xs text-muted-foreground">Посты</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{userData.followers}</div>
              <div className="text-xs text-muted-foreground">Подписчики</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{userData.following}</div>
              <div className="text-xs text-muted-foreground">Подписки</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            Посты
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            Фото
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            Достижения
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {userPosts.map((post) => (
            <PostCard
              key={post.id}
              user={post.user}
              content={post.content}
              interactions={post.interactions}
            />
          ))}
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="aspect-square rounded-md overflow-hidden"
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardHeader className="p-4 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {achievement.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {achievement.date}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
