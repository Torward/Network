import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Lock,
  Globe,
  Settings,
  MessageSquare,
  Calendar,
  Image,
  MoreVertical,
  UserPlus,
  Send,
  Pin,
  Info,
  FileText,
  UserCheck,
  X,
  Plus,
} from "lucide-react";
import PostCard from "../feed/PostCard";
import CreatePostCard from "../feed/CreatePostCard";

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: "admin" | "moderator" | "member";
  joinDate: string;
}

interface GroupEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
}

interface GroupDetailPageProps {
  onBack?: () => void;
}

const GroupDetailPage = ({ onBack = () => {} }: GroupDetailPageProps) => {
  const [activeTab, setActiveTab] = useState("posts");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  // Mock group data
  const group = {
    id: "1",
    name: "Фотографы Москвы",
    description:
      "Группа для фотографов Москвы. Обсуждаем локации, технику и делимся опытом. Организуем совместные фотосессии и мастер-классы. Присоединяйтесь к нашему сообществу!",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=photo",
    coverImage: "https://images.unsplash.com/photo-1513326738677-b964603b136d",
    memberCount: 128,
    isPrivate: false,
    category: "Фотография",
    createdAt: "Март 2023",
    rules: [
      "Уважайте других участников группы",
      "Публикуйте только свои работы или указывайте автора",
      "Запрещена реклама без согласования с администрацией",
      "Конструктивная критика приветствуется",
    ],
    members: [
      {
        id: "101",
        name: "Анна Смирнова",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
        role: "admin",
        joinDate: "Март 2023",
      },
      {
        id: "102",
        name: "Максим Иванов",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
        role: "moderator",
        joinDate: "Апрель 2023",
      },
      {
        id: "103",
        name: "Елена Петрова",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
        role: "member",
        joinDate: "Май 2023",
      },
      {
        id: "104",
        name: "Дмитрий Козлов",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry",
        role: "member",
        joinDate: "Июнь 2023",
      },
      {
        id: "105",
        name: "Ольга Соколова",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olga",
        role: "member",
        joinDate: "Июль 2023",
      },
    ],
    events: [
      {
        id: "e1",
        title: "Фотопрогулка по центру Москвы",
        description:
          "Встречаемся у Большого театра и идем фотографировать архитектуру центра города",
        date: "15 июня 2024, 15:00",
        location: "Большой театр, Москва",
        attendees: 18,
      },
      {
        id: "e2",
        title: "Мастер-класс по портретной съемке",
        description:
          "Профессиональный фотограф поделится секретами портретной фотографии",
        date: "22 июня 2024, 12:00",
        location: "Фотостудия 'Свет', ул. Пушкина 10",
        attendees: 12,
      },
    ],
  };

  // Mock posts data
  const posts = [
    {
      id: "1",
      user: {
        name: "Анна Смирнова",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
        zodiacSign: "Лев",
      },
      content: {
        text: "Делюсь фотографиями с нашей последней встречи в парке Горького! Было очень продуктивно и весело. #ФотоМосква #ПаркГорького",
        media: {
          type: "image" as const,
          url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
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
        name: "Максим Иванов",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
        zodiacSign: "Скорпион",
      },
      content: {
        text: "Кто-нибудь пробовал новый объектив Sony 24-70mm f/2.8? Стоит ли своих денег или лучше взять Sigma?",
        timestamp: "Вчера",
      },
      interactions: {
        likes: 15,
        comments: 23,
        shares: 2,
        liked: true,
      },
    },
  ];

  const handleInvite = () => {
    console.log("Inviting:", inviteEmail);
    setInviteEmail("");
    setShowInviteDialog(false);
  };

  const handlePostCreate = (post: any) => {
    console.log("New post in group:", post);
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto p-4 bg-background">
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Группа</h1>
      </div>

      {/* Group header card */}
      <Card className="mb-6 overflow-hidden border-border bg-gradient-to-b from-background to-background/80">
        {/* Cover image */}
        <div className="h-48 md:h-64 relative">
          <img
            src={group.coverImage}
            alt={group.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Group info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-end gap-4">
              <Avatar className="h-20 w-20 border-4 border-background rounded-xl shadow-lg">
                <AvatarImage src={group.avatar} alt={group.name} />
                <AvatarFallback className="rounded-xl bg-primary text-primary-foreground">
                  {group.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{group.name}</h2>
                  {group.isPrivate ? (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-background/20 backdrop-blur-sm"
                    >
                      <Lock className="h-3 w-3" />
                      Закрытая
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-background/20 backdrop-blur-sm"
                    >
                      <Globe className="h-3 w-3" />
                      Открытая
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {group.memberCount} участников
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Создана: {group.createdAt}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog
                  open={showInviteDialog}
                  onOpenChange={setShowInviteDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-background/20 backdrop-blur-sm border-white/20 hover:bg-background/40 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Пригласить
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Пригласить в группу</DialogTitle>
                      <DialogDescription>
                        Отправьте приглашение другу по email или имени
                        пользователя
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <Input
                        placeholder="Email или имя пользователя"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowInviteDialog(false)}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={handleInvite}
                        disabled={!inviteEmail.trim()}
                      >
                        Отправить приглашение
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Обсуждение
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Group description */}
        <CardContent className="p-4">
          <p className="text-sm text-foreground/80">{group.description}</p>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Публикации
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            События
            <Badge className="ml-1 bg-primary">{group.events.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Участники
            <Badge className="ml-1 bg-primary">{group.members.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-1">
            <Info className="h-4 w-4" />О группе
          </TabsTrigger>
        </TabsList>

        {/* Posts tab */}
        <TabsContent value="posts" className="space-y-4">
          <CreatePostCard
            onPostCreate={handlePostCreate}
            userName="Вы"
            userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
          />

          {posts.map((post) => (
            <PostCard
              key={post.id}
              user={post.user}
              content={post.content}
              interactions={post.interactions}
            />
          ))}
        </TabsContent>

        {/* Events tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Предстоящие события</h3>
            <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              <Plus className="h-4 w-4 mr-2" />
              Создать событие
            </Button>
          </div>

          <div className="grid gap-4">
            {group.events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border-border hover:border-primary/50 transition-colors">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">
                          Дата и время
                        </p>
                        <p className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          {event.date}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Место</p>
                        <p className="font-medium flex items-center">
                          <Pin className="h-4 w-4 mr-2 text-primary" />
                          {event.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Участников: {event.attendees}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Подробнее
                      </Button>
                      <Button size="sm">Участвовать</Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Members tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Участники группы ({group.members.length})
            </h3>
            <Input placeholder="Поиск участников..." className="max-w-xs" />
          </div>

          <div className="grid gap-2">
            {group.members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{member.name}</h4>
                          {member.role === "admin" && (
                            <Badge className="bg-yellow-500">Админ</Badge>
                          )}
                          {member.role === "moderator" && (
                            <Badge className="bg-blue-500">Модератор</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Присоединился: {member.joinDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      {member.role !== "admin" && (
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* About tab */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />О группе
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Описание</h4>
                <p className="text-sm text-muted-foreground">
                  {group.description}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Категория</h4>
                <Badge variant="outline">{group.category}</Badge>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Правила группы</h4>
                <ul className="list-disc list-inside space-y-1">
                  {group.rules.map((rule, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Администрация</h4>
                <div className="flex flex-wrap gap-3">
                  {group.members
                    .filter((m) => m.role === "admin" || m.role === "moderator")
                    .map((admin) => (
                      <div key={admin.id} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={admin.avatar} alt={admin.name} />
                          <AvatarFallback>
                            {admin.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {admin.role === "admin"
                              ? "Администратор"
                              : "Модератор"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupDetailPage;
