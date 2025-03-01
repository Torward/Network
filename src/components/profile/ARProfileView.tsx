import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ZodiacDisplay from "./ZodiacDisplay";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Image,
  User,
  Info,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

interface ARProfileViewProps {
  user?: {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
    zodiacSign?: string;
    achievements?: Array<{
      id: string;
      name: string;
      icon: string;
      description: string;
    }>;
    photos?: Array<{
      id: string;
      url: string;
      caption?: string;
    }>;
  };
  onClose?: () => void;
}

const ARProfileView = ({
  user = {
    id: "1",
    name: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    bio: "Digital nomad, coffee enthusiast, and amateur photographer. Always looking for the next adventure!",
    zodiacSign: "Aquarius",
    achievements: [
      {
        id: "1",
        name: "Early Adopter",
        icon: "🚀",
        description: "Joined during the platform's beta phase",
      },
      {
        id: "2",
        name: "Content Creator",
        icon: "📸",
        description: "Posted 50+ pieces of content",
      },
      {
        id: "3",
        name: "Social Butterfly",
        icon: "🦋",
        description: "Connected with 100+ users",
      },
    ],
    photos: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        caption: "Hiking in the mountains last weekend",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a",
        caption: "Coffee shop vibes",
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1551632811-561732d1e306",
        caption: "Exploring the city",
      },
    ],
  },
  onClose = () => {},
}: ARProfileViewProps) => {
  const [activeTab, setActiveTab] = useState("avatar");
  const [zoom, setZoom] = useState([1]);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Update fullscreen state based on document state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Reset transformations
  const resetView = () => {
    setZoom([1]);
    setRotation(0);
  };

  return (
    <div
      ref={containerRef}
      className={`bg-gradient-to-b from-primary/5 to-blue-600/10 rounded-lg overflow-hidden backdrop-blur-sm border border-primary/20 shadow-lg ${isFullscreen ? "fixed inset-0 z-50" : "w-full max-w-[450px] h-[600px]"}`}
    >
      <Card className="h-full border-0 bg-transparent shadow-none flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">
            AR Просмотр профиля
          </CardTitle>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetView}
                    className="h-8 w-8 bg-white/80"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Сбросить вид</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="h-8 w-8 bg-white/80"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isFullscreen
                      ? "Выйти из полноэкранного режима"
                      : "Полноэкранный режим"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-3 mx-4">
            <TabsTrigger value="avatar" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Аватар
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-1">
              <Image className="h-4 w-4" />
              Фото
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              Инфо
            </TabsTrigger>
          </TabsList>

          <CardContent className="flex-1 p-4 flex items-center justify-center overflow-hidden">
            <TabsContent
              value="avatar"
              className="w-full h-full flex items-center justify-center mt-0"
            >
              <motion.div
                animate={{
                  scale: zoom[0],
                  rotate: rotation,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative"
              >
                <div className="relative">
                  <Avatar className="h-64 w-64 border-4 border-background shadow-lg relative">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-6xl">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {user.zodiacSign && (
                    <div className="absolute bottom-2 right-2 z-10">
                      <ZodiacDisplay
                        sign={user.zodiacSign}
                        size="sm"
                        showLabel={false}
                      />
                    </div>
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mt-4"
                >
                  <h2 className="text-2xl font-bold text-indigo-900">
                    {user.name}
                  </h2>
                  {user.bio && (
                    <p className="text-sm text-indigo-700 mt-2">{user.bio}</p>
                  )}
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent
              value="photos"
              className="w-full h-full mt-0 overflow-y-auto"
            >
              <div className="grid grid-cols-1 gap-4">
                {user.photos?.map((photo) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring" }}
                    className="relative rounded-lg overflow-hidden shadow-md"
                  >
                    <motion.img
                      src={photo.url}
                      alt={photo.caption || "User photo"}
                      className="w-full h-auto object-cover"
                      style={{
                        transformOrigin: "center",
                        scale: zoom[0],
                        rotate: `${rotation}deg`,
                      }}
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white text-sm">
                        {photo.caption}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="info"
              className="w-full h-full mt-0 overflow-y-auto"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Достижения
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {user.achievements?.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring" }}
                        className="bg-white/80 rounded-lg p-3 shadow-sm flex items-center space-x-3"
                      >
                        <div className="text-2xl">{achievement.icon}</div>
                        <div>
                          <h4 className="font-medium text-indigo-900">
                            {achievement.name}
                          </h4>
                          <p className="text-xs text-indigo-700">
                            {achievement.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>

        <CardFooter className="flex flex-col space-y-4 bg-white/50 p-4">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom([Math.max(0.5, zoom[0] - 0.1)])}
              className="h-8 w-8 bg-white/80"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Slider
              value={zoom}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={setZoom}
              className="w-[60%] mx-2"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom([Math.min(2, zoom[0] + 0.1)])}
              className="h-8 w-8 bg-white/80"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-full">
            <Slider
              value={[rotation]}
              min={-180}
              max={180}
              step={5}
              onValueChange={(value) => setRotation(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-180°</span>
              <span>Поворот</span>
              <span>180°</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ARProfileView;
