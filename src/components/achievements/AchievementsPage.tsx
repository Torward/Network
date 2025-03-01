import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Search, Trophy, Star, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "social" | "content" | "engagement" | "special";
  progress: number;
  total: number;
  completed: boolean;
  date?: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  points: number;
}

const AchievementsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock achievements data
  const achievementsData: Achievement[] = [
    {
      id: "1",
      title: "Ранний последователь",
      description: "Присоединился к платформе во время бета-тестирования",
      icon: "🚀",
      category: "special",
      progress: 1,
      total: 1,
      completed: true,
      date: "Март 2023",
      rarity: "rare",
      points: 50,
    },
    {
      id: "2",
      title: "Создатель контента",
      description: "Опубликовал более 30 постов",
      icon: "📸",
      category: "content",
      progress: 37,
      total: 30,
      completed: true,
      date: "Июнь 2023",
      rarity: "uncommon",
      points: 30,
    },
    {
      id: "3",
      title: "Социальная бабочка",
      description: "Подключился к более чем 100 пользователям",
      icon: "🦋",
      category: "social",
      progress: 118,
      total: 100,
      completed: true,
      date: "Сентябрь 2023",
      rarity: "uncommon",
      points: 30,
    },
    {
      id: "4",
      title: "Звезда контента",
      description: "Получил 1000 лайков на своих постах",
      icon: "⭐",
      category: "engagement",
      progress: 745,
      total: 1000,
      completed: false,
      rarity: "rare",
      points: 50,
    },
    {
      id: "5",
      title: "Мастер комментариев",
      description: "Оставил 500 комментариев",
      icon: "💬",
      category: "engagement",
      progress: 342,
      total: 500,
      completed: false,
      rarity: "common",
      points: 20,
    },
    {
      id: "6",
      title: "Фотограф года",
      description: "Загрузил 100 фотографий",
      icon: "📷",
      category: "content",
      progress: 68,
      total: 100,
      completed: false,
      rarity: "uncommon",
      points: 30,
    },
    {
      id: "7",
      title: "Легенда платформы",
      description: "Активен на платформе более 1 года",
      icon: "👑",
      category: "special",
      progress: 9,
      total: 12,
      completed: false,
      rarity: "legendary",
      points: 100,
    },
  ];

  const rarityColors = {
    common: "bg-gray-500",
    uncommon: "bg-green-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-yellow-500",
  };

  const rarityNames = {
    common: "Обычное",
    uncommon: "Необычное",
    rare: "Редкое",
    epic: "Эпическое",
    legendary: "Легендарное",
  };

  const filteredAchievements = achievementsData.filter((achievement) => {
    const matchesSearch = achievement.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "completed" && achievement.completed) ||
      (activeTab === "in-progress" && !achievement.completed) ||
      activeTab === achievement.category;

    return matchesSearch && matchesTab;
  });

  // Calculate total points
  const totalPoints = achievementsData
    .filter((a) => a.completed)
    .reduce((sum, achievement) => sum + achievement.points, 0);

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (achievementsData.filter((a) => a.completed).length /
      achievementsData.length) *
      100,
  );

  return (
    <div className="w-full max-w-[800px] mx-auto p-4 bg-background">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Достижения</h1>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="font-bold">{totalPoints} очков</span>
          </div>
          <div className="flex items-center">
            <Star className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-bold">
              {achievementsData.filter((a) => a.completed).length}/
              {achievementsData.length} ({completionPercentage}%)
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 relative">
        <Input
          type="search"
          placeholder="Поиск достижений..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3 md:grid-cols-7 mb-6">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="completed">Выполненные</TabsTrigger>
          <TabsTrigger value="in-progress">В процессе</TabsTrigger>
          <TabsTrigger value="social">Социальные</TabsTrigger>
          <TabsTrigger value="content">Контент</TabsTrigger>
          <TabsTrigger value="engagement">Активность</TabsTrigger>
          <TabsTrigger value="special">Особые</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`overflow-hidden ${achievement.completed ? "border-green-500" : ""}`}
                  >
                    <div
                      className={`h-2 ${rarityColors[achievement.rarity]}`}
                    ></div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                            {achievement.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${rarityColors[achievement.rarity]} text-white border-0`}
                        >
                          {rarityNames[achievement.rarity]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-sm text-muted-foreground">
                            Прогресс: {achievement.progress}/{achievement.total}
                          </div>
                          <div className="text-sm font-medium">
                            {achievement.points} очков
                          </div>
                        </div>
                        <Progress
                          value={
                            (achievement.progress / achievement.total) * 100
                          }
                          className="h-2"
                        />
                      </div>
                      {achievement.completed && achievement.date && (
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Получено: {achievement.date}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Достижения не найдены. Попробуйте другой поисковый запрос."
                  : "Нет достижений для отображения."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementsPage;
