import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Minimize, Maximize, Loader } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import {
  getOrCreateActiveConversation,
  saveChatMessage,
  getConversationMessages,
} from "@/lib/deepseek-chat";
import { getUISettings, saveUISettings } from "@/lib/ui-settings";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface DeepseekChatProps {
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

const DeepseekChat: React.FC<DeepseekChatProps> = ({
  initialPosition = { x: window.innerWidth - 420, y: window.innerHeight - 500 },
  initialSize = { width: 380, height: 450 },
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load UI settings and conversation on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        // Load UI settings
        const settings = await getUISettings("deepseek-chat");
        if (settings) {
          setPosition({ x: settings.position_x, y: settings.position_y });
          setSize({ width: settings.width, height: settings.height });
          setIsMinimized(!settings.is_visible);
        } else {
          // Save default settings if none exist
          await saveUISettings({
            component_id: "deepseek-chat",
            position_x: position.x,
            position_y: position.y,
            width: size.width,
            height: size.height,
            is_visible: !isMinimized,
          });
        }

        // Get or create active conversation
        const conversation = await getOrCreateActiveConversation();
        if (conversation) {
          setConversationId(conversation.id);

          // Load conversation messages
          const conversationMessages = await getConversationMessages(
            conversation.id,
          );
          if (conversationMessages.length > 0) {
            const formattedMessages = conversationMessages.map((msg) => ({
              id: msg.id || Date.now().toString(),
              content: msg.content,
              role: msg.role,
              timestamp: new Date(msg.created_at || Date.now()),
            }));
            setMessages(formattedMessages);
          }
        }
      }
    };

    loadSettings();
  }, [user]);

  // Save position and size when they change
  useEffect(() => {
    const saveSettings = async () => {
      if (user && !isDragging && !isResizing) {
        await saveUISettings({
          component_id: "deepseek-chat",
          position_x: position.x,
          position_y: position.y,
          width: size.width,
          height: size.height,
          is_visible: !isMinimized,
        });
      }
    };

    saveSettings();
  }, [position, size, isMinimized, isDragging, isResizing, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(
            0,
            Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x),
          ),
          y: Math.max(
            0,
            Math.min(
              window.innerHeight - size.height,
              e.clientY - dragOffset.y,
            ),
          ),
        });
      } else if (isResizing && resizeDirection) {
        let newWidth = size.width;
        let newHeight = size.height;

        if (resizeDirection.includes("e")) {
          newWidth = Math.max(300, e.clientX - position.x);
        }
        if (resizeDirection.includes("s")) {
          newHeight = Math.max(200, e.clientY - position.y);
        }
        if (resizeDirection.includes("w")) {
          const deltaX = e.clientX - (position.x + dragOffset.x);
          newWidth = Math.max(300, size.width - deltaX);
          setPosition((prev) => ({
            ...prev,
            x: Math.min(prev.x + deltaX, window.innerWidth - 300),
          }));
        }
        if (resizeDirection.includes("n")) {
          const deltaY = e.clientY - (position.y + dragOffset.y);
          newHeight = Math.max(200, size.height - deltaY);
          setPosition((prev) => ({
            ...prev,
            y: Math.min(prev.y + deltaY, window.innerHeight - 200),
          }));
        }

        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, position, size, resizeDirection]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const startResize = (direction: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message to database
      await saveChatMessage({
        content: userMessage.content,
        role: userMessage.role,
        conversation_id: conversationId,
      });

      // Simulate API call to Deepseek R1
      setTimeout(async () => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Это имитация ответа от Deepseek R1 на ваше сообщение: "${input}"\n\nВ реальном приложении здесь был бы ответ от API Deepseek R1.`,
          role: "assistant",
          timestamp: new Date(),
        };

        // Save assistant message to database
        await saveChatMessage({
          content: assistantMessage.content,
          role: assistantMessage.role,
          conversation_id: conversationId,
        });

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending message to Deepseek R1:", error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  if (isMinimized) {
    return (
      <div
        className="fixed z-50 flex items-center justify-center bg-primary text-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-primary/90 transition-all"
        style={{ left: position.x, bottom: 20 }}
        onClick={handleMaximize}
      >
        <span className="font-medium">Deepseek R1</span>
      </div>
    );
  }

  return (
    <Card
      ref={chatRef}
      className="fixed z-50 shadow-xl border border-border flex flex-col overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        resize: "both",
      }}
    >
      {/* Resize handles */}
      <div
        className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-10"
        onMouseDown={(e) => startResize("nw", e)}
      />
      <div
        className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-10"
        onMouseDown={(e) => startResize("ne", e)}
      />
      <div
        className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-10"
        onMouseDown={(e) => startResize("sw", e)}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-10"
        onMouseDown={(e) => startResize("se", e)}
      />
      <div
        className="absolute top-0 w-full h-3 cursor-n-resize z-10"
        onMouseDown={(e) => startResize("n", e)}
      />
      <div
        className="absolute right-0 h-full w-3 cursor-e-resize z-10"
        onMouseDown={(e) => startResize("e", e)}
      />
      <div
        className="absolute bottom-0 w-full h-3 cursor-s-resize z-10"
        onMouseDown={(e) => startResize("s", e)}
      />
      <div
        className="absolute left-0 h-full w-3 cursor-w-resize z-10"
        onMouseDown={(e) => startResize("w", e)}
      />

      {/* Header */}
      <CardHeader
        className="p-3 border-b flex-shrink-0 cursor-move bg-primary/5"
        onMouseDown={handleMouseDown}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Deepseek R1</CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleMinimize}
            >
              <Minimize className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSize({ width: 380, height: 450 })}
            >
              <Maximize className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setMessages([])}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            <p className="text-center">Начните диалог с Deepseek R1</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <p className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                  <div className="flex items-center space-x-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Deepseek R1 печатает...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <CardContent className="p-3 border-t">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..."
            className="min-h-[60px] resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeepseekChat;
