import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Users,
  Lock,
  Globe,
  Settings,
  MessageSquare,
  Calendar,
  Image,
  MoreVertical,
  UserPlus,
  X,
} from "lucide-react";

interface GroupsPageProps {
  onNavigateToGroup?: (groupId: string) => void;
}

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: "admin" | "moderator" | "member";
}

interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage?: string;
  memberCount: number;
  isPrivate: boolean;
  category: string;
  lastActivity?: string;
  members: GroupMember[];
}

const GroupsPage = ({ onNavigateToGroup = () => {} }: GroupsPageProps) => {
  const [activeTab, setActiveTab] = useState("my-groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: "",
    description: "",
    isPrivate: false,
    category: "general",
  });

  // Mock groups data
  const myGroups: Group[] = [
    {
      id: "1",
      name: "Фотографы Москвы",
      description:
        "Группа для фотографов Москвы. Обсуждаем локации, технику и делимся опытом.",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=photo",
      coverImage:
        "https://images.unsplash.com/photo-1513326738677-b964603b136d",
      memberCount: 128,
      isPrivate: false,
      category: "Фотография",
      lastActivity: "2 часа назад",
      members: [
        {
          id: "101",
          name: "Анна Смирнова",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
          role: "admin",
        },
        {
          id: "102",
          name: "Максим Иванов",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
          role: "moderator",
        },
      ],
    },
    {
      id: "2",
      name: "Разработчики AR/VR",
      description:
        "Закрытое сообщество разработчиков AR/VR приложений. Обсуждаем технологии, фреймворки и проекты.",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=vr",
      memberCount: 56,
      isPrivate: true,
      category: "Технологии",
      lastActivity: "Вчера",
      members: [
        {
          id: "103",
          name: "Дмитрий Козлов",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry",
          role: "admin",
        },
      ],
    },
  ];

  const discoverGroups: Group[] = [
    {
      id: "3",
      name: "Любители кофе",
      description: "Обсуждаем кофейни, способы заваривания и сорта кофе.",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=coffee",
      coverImage:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
      memberCount: 342,
      isPrivate: false,
      category: "Еда и напитки",
      lastActivity: "3 часа назад",
      members: [
        {
          id: "104",
          name: "Елена Петрова",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
          role: "admin",
        },
      ],
    },
    {
      id: "4",
      name: "Цифровые художники",
      description:
        "Сообщество цифровых художников. Делимся работами, советами и вдохновением.",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=art",
      memberCount: 215,
      isPrivate: false,
      category: "Искусство",
      lastActivity: "5 часов назад",
      members: [
        {
          id: "105",
          name: "Александр Волков",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
          role: "admin",
        },
      ],
    },
    {
      id: "5",
      name: "Клуб путешественников",
      description:
        "Делимся впечатлениями о путешествиях, советами и планируем совместные поездки.",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=travel",
      coverImage:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
      memberCount: 189,
      isPrivate: false,
      category: "Путешествия",
      lastActivity: "Вчера",
      members: [
        {
          id: "106",
          name: "Мария Кузнецова",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
          role: "admin",
        },
      ],
    },
  ];

  // Filter groups based on search query
  const filteredMyGroups = myGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredDiscoverGroups = discoverGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateGroup = () => {
    console.log("Creating group:", newGroupData);
    // In a real app, this would send the data to an API
    setShowCreateDialog(false);
    // Reset form
    setNewGroupData({
      name: "",
      description: "",
      isPrivate: false,
      category: "general",
    });
  };

  const renderGroupCard = (group: Group) => (
    <motion.div
      key={group.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card className="overflow-hidden bg-background border-border hover:border-primary/50 transition-colors">
        {group.coverImage && (
          <div className="h-32 overflow-hidden">
            <img
              src={group.coverImage}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 rounded-xl border-2 border-background shadow-md">
              <AvatarImage src={group.avatar} alt={group.name} />
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/40">
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{group.name}</h3>
                  {group.isPrivate ? (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-secondary/50"
                    >
                      <Lock className="h-3 w-3" />
                      Закрытая
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-primary/10"
                    >
                      <Globe className="h-3 w-3" />
                      Открытая
                    </Badge>
                  )}
                </div>

                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {group.description}
              </p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    {group.memberCount} участников
                  </div>
                  {group.lastActivity && (
                    <div className="text-xs text-muted-foreground">
                      Активность: {group.lastActivity}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => onNavigateToGroup(group.id)}
                  >
                    Просмотр
                  </Button>
                  {!myGroups.some((g) => g.id === group.id) && (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 flex items-center gap-1"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Вступить
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="w-full max-w-[900px] mx-auto p-4 bg-background">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mb-4 md:mb-0">
          Группы
        </h1>

        <div className="flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Input
              type="search"
              placeholder="Поиск групп..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 w-full"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                <Plus className="h-4 w-4 mr-2" />
                Создать группу
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Создание новой группы</DialogTitle>
                <DialogDescription>
                  Создайте группу для общения с единомышленниками
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="group-name">Название группы</Label>
                  <Input
                    id="group-name"
                    placeholder="Введите название группы"
                    value={newGroupData.name}
                    onChange={(e) =>
                      setNewGroupData({ ...newGroupData, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="group-description">Описание</Label>
                  <Textarea
                    id="group-description"
                    placeholder="Расскажите о вашей группе"
                    value={newGroupData.description}
                    onChange={(e) =>
                      setNewGroupData({
                        ...newGroupData,
                        description: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="group-category">Категория</Label>
                  <Select
                    value={newGroupData.category}
                    onValueChange={(value) =>
                      setNewGroupData({ ...newGroupData, category: value })
                    }
                  >
                    <SelectTrigger id="group-category">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Общее</SelectItem>
                      <SelectItem value="technology">Технологии</SelectItem>
                      <SelectItem value="art">Искусство</SelectItem>
                      <SelectItem value="sports">Спорт</SelectItem>
                      <SelectItem value="education">Образование</SelectItem>
                      <SelectItem value="entertainment">Развлечения</SelectItem>
                      <SelectItem value="travel">Путешествия</SelectItem>
                      <SelectItem value="food">Еда и напитки</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="group-privacy"
                    checked={newGroupData.isPrivate}
                    onCheckedChange={(checked) =>
                      setNewGroupData({ ...newGroupData, isPrivate: checked })
                    }
                  />
                  <Label
                    htmlFor="group-privacy"
                    className="flex items-center gap-2"
                  >
                    {newGroupData.isPrivate ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Закрытая группа (вступление только по приглашению)
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4" />
                        Открытая группа (может вступить любой)
                      </>
                    )}
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  disabled={
                    !newGroupData.name.trim() ||
                    !newGroupData.description.trim()
                  }
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  Создать группу
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="my-groups" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Мои группы
            <Badge className="ml-2 bg-primary">{myGroups.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            Обзор групп
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-4">
          {filteredMyGroups.length > 0 ? (
            filteredMyGroups.map(renderGroupCard)
          ) : (
            <div className="text-center py-12 bg-gradient-to-b from-background to-secondary/20 rounded-lg border border-dashed border-border">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? "Группы не найдены" : "У вас пока нет групп"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {searchQuery
                  ? "Попробуйте изменить поисковый запрос или создайте новую группу"
                  : "Создайте свою первую группу или присоединитесь к существующим в разделе 'Обзор групп'"}
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать группу
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          {filteredDiscoverGroups.length > 0 ? (
            filteredDiscoverGroups.map(renderGroupCard)
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Группы не найдены. Попробуйте другой поисковый запрос."
                  : "Нет групп для отображения."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupsPage;
