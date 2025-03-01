import React, { useState, useEffect } from "react";
import { RefreshCw, Filter } from "lucide-react";
import CreatePostCard from "./CreatePostCard";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    zodiacSign?: string;
  };
  content: {
    text?: string;
    media?: {
      type: "image" | "video" | "audio";
      url: string;
    };
    timestamp: string;
  };
  interactions: {
    likes: number;
    comments: number;
    shares: number;
    liked?: boolean;
  };
}

interface FeedContainerProps {
  posts?: Post[];
  userAvatar?: string;
  userName?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  onPostCreate?: (post: {
    type: string;
    content: string;
    attachments?: File[];
  }) => void;
}

const FeedContainer = ({
  posts = [
    {
      id: "1",
      user: {
        name: "Jane Cooper",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        zodiacSign: "Gemini",
      },
      content: {
        text: "Just discovered this amazing new coffee shop downtown! The atmosphere is perfect for working remotely and their specialty lattes are to die for. #CoffeeAddict #RemoteWork",
        media: {
          type: "image",
          url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        },
        timestamp: "2 hours ago",
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
        name: "Alex Morgan",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        zodiacSign: "Leo",
      },
      content: {
        text: "Check out this new track I just finished! Let me know what you think in the comments. #NewMusic #Producer",
        media: {
          type: "audio",
          url: "https://example.com/audio-sample.mp3",
        },
        timestamp: "5 hours ago",
      },
      interactions: {
        likes: 28,
        comments: 8,
        shares: 3,
        liked: true,
      },
    },
    {
      id: "3",
      user: {
        name: "Taylor Swift",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=taylor",
        zodiacSign: "Sagittarius",
      },
      content: {
        text: "Just released my new music video! Watch it now and let me know what you think!",
        media: {
          type: "video",
          url: "https://example.com/video-sample.mp4",
        },
        timestamp: "1 day ago",
      },
      interactions: {
        likes: 1542,
        comments: 328,
        shares: 215,
        liked: false,
      },
    },
  ],
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  userName = "John Doe",
  isLoading = false,
  onRefresh = () => {},
  onPostCreate = () => {},
}: FeedContainerProps) => {
  const [feedType, setFeedType] = useState("all");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (feedType === "all") {
      setFilteredPosts(posts);
    } else {
      // Filter posts based on media type
      setFilteredPosts(
        posts.filter(
          (post) =>
            post.content.media?.type === feedType ||
            (feedType === "text" && !post.content.media),
        ),
      );
    }
  }, [feedType, posts]);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePostCreate = (newPost: {
    type: string;
    content: string;
    attachments?: File[];
  }) => {
    onPostCreate(newPost);
    // In a real app, you would wait for the API response before updating the UI
  };

  return (
    <div className="w-full max-w-[700px] mx-auto bg-background h-full flex flex-col">
      <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Ваша лента</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="flex items-center"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Обновить
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Фильтр
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={feedType} onValueChange={setFeedType}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="text">Текст</TabsTrigger>
            <TabsTrigger value="image">Фото</TabsTrigger>
            <TabsTrigger value="video">Видео</TabsTrigger>
            <TabsTrigger value="audio">Аудио</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 p-4">
        <CreatePostCard
          userAvatar={userAvatar}
          userName={userName}
          onPostCreate={handlePostCreate}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              user={post.user}
              content={post.content}
              interactions={post.interactions}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow mt-4">
            <p className="text-gray-500">
              Нет постов для отображения в этой категории.
            </p>
            <Button
              variant="link"
              className="mt-2 text-blue-500"
              onClick={() => setFeedType("all")}
            >
              Показать все посты
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default FeedContainer;
