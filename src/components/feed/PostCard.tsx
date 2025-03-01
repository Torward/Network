import React from "react";
import { Heart, MessageCircle, Share2, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import ZodiacDisplay from "../profile/ZodiacDisplay";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  user?: {
    name: string;
    avatar: string;
    zodiacSign?: string;
  };
  content?: {
    text?: string;
    media?: {
      type: "image" | "video" | "audio";
      url: string;
    };
    timestamp?: string;
  };
  interactions?: {
    likes: number;
    comments: number;
    shares: number;
    liked?: boolean;
  };
}

const PostCard: React.FC<PostCardProps> = ({
  user = {
    name: "Jane Cooper",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    zodiacSign: "Gemini",
  },
  content = {
    text: "Just discovered this amazing new coffee shop downtown! The atmosphere is perfect for working remotely and their specialty lattes are to die for. #CoffeeAddict #RemoteWork",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    },
    timestamp: "2 hours ago",
  },
  interactions = {
    likes: 42,
    comments: 12,
    shares: 5,
    liked: false,
  },
}) => {
  const [liked, setLiked] = React.useState(interactions.liked);
  const [likeCount, setLikeCount] = React.useState(interactions.likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  return (
    <Card className="w-full max-w-[700px] mb-4 overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm">{user.name}</h3>
              <div className="flex items-center space-x-1">
                {user.zodiacSign && (
                  <div className="flex items-center">
                    <ZodiacDisplay
                      sign={user.zodiacSign}
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                )}
                <span className="text-xs text-gray-500">
                  • {content.timestamp}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Сохранить пост</DropdownMenuItem>
              <DropdownMenuItem>Пожаловаться</DropdownMenuItem>
              <DropdownMenuItem>Скрыть</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {content.text && (
          <div className="px-4 py-2">
            <p className="text-sm">{content.text}</p>
          </div>
        )}
        {content.media && (
          <div className="relative w-full">
            {content.media.type === "image" && (
              <img
                src={content.media.url}
                alt="Post content"
                className="w-full h-auto max-h-[400px] object-cover"
              />
            )}
            {content.media.type === "video" && (
              <video
                src={content.media.url}
                controls
                className="w-full h-auto max-h-[400px] object-contain"
              />
            )}
            {content.media.type === "audio" && (
              <div className="bg-gray-100 p-4 flex items-center justify-center">
                <audio src={content.media.url} controls className="w-full" />
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 px-2"
              onClick={handleLike}
            >
              <motion.div
                whileTap={{ scale: 1.2 }}
                transition={{ duration: 0.2 }}
              >
                <Heart
                  className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : "text-gray-500"}`}
                />
              </motion.div>
              <span className="text-sm text-gray-600">{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 px-2"
            >
              <MessageCircle className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {interactions.comments}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 px-2"
            >
              <Share2 className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {interactions.shares}
              </span>
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="text-sm text-primary">
            Все комментарии
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
