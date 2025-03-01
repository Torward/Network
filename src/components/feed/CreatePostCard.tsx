import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Image, Mic, Video, Send, Smile, Paperclip } from "lucide-react";

interface CreatePostCardProps {
  onPostCreate?: (post: {
    type: string;
    content: string;
    attachments?: File[];
  }) => void;
  userAvatar?: string;
  userName?: string;
}

const CreatePostCard = ({
  onPostCreate = () => {},
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  userName = "John Doe",
}: CreatePostCardProps) => {
  const [activeTab, setActiveTab] = useState("text");
  const [postContent, setPostContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSubmit = () => {
    if (postContent.trim() || attachments.length > 0) {
      onPostCreate({
        type: activeTab,
        content: postContent,
        attachments: attachments,
      });
      setPostContent("");
      setAttachments([]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileList = Array.from(event.target.files);
      setAttachments([...attachments, ...fileList]);
    }
  };

  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm border-border/50 mb-4 shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={userAvatar}
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="font-medium">{userName}</div>
        </div>

        <Tabs
          defaultValue="text"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="text">Текст</TabsTrigger>
            <TabsTrigger value="image">Фото</TabsTrigger>
            <TabsTrigger value="video">Видео</TabsTrigger>
            <TabsTrigger value="audio">Аудио</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="О чем вы думаете?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <Textarea
              placeholder="Добавьте подпись к изображению..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[60px] resize-none mb-2"
            />
            <div className="flex flex-col space-y-2">
              <label className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent/50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  multiple
                />
                <div className="flex flex-col items-center">
                  <Image className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">
                    Загрузить изображения
                  </span>
                </div>
              </label>
              {attachments.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Выбрано файлов: {attachments.length}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <Textarea
              placeholder="Добавьте подпись к видео..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[60px] resize-none mb-2"
            />
            <div className="flex flex-col space-y-2">
              <label className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent/50">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center">
                  <Video className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">
                    Загрузить видео
                  </span>
                </div>
              </label>
              {attachments.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Выбрано файлов: {attachments.length}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <Textarea
              placeholder="Добавьте подпись к аудио..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[60px] resize-none mb-2"
            />
            <div className="flex flex-col space-y-2">
              <label className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent/50">
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center">
                  <Mic className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">
                    Загрузить аудио
                  </span>
                </div>
              </label>
              {attachments.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Выбрано файлов: {attachments.length}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0 border-t border-border">
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Smile className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>
        <Button
          onClick={handleSubmit}
          className="bg-primary hover:bg-primary/90"
        >
          <Send className="h-4 w-4 mr-2" />
          Опубликовать
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreatePostCard;
