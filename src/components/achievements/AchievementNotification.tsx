import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AchievementNotificationProps {
  achievement?: {
    id: string;
    title: string;
    description: string;
    icon?: string;
    badgeColor?: string;
  };
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
  soundEffect?: string;
  isVisible?: boolean;
}

const AchievementNotification = ({
  achievement = {
    id: "first-post",
    title: "First Post!",
    description: "You created your first post on the platform.",
    icon: "🏆",
    badgeColor: "bg-yellow-500",
  },
  onClose = () => {},
  autoClose = true,
  autoCloseTime = 5000,
  soundEffect = "/achievement-sound.mp3",
  isVisible = true,
}: AchievementNotificationProps) => {
  const [visible, setVisible] = useState(isVisible);
  const [audio] = useState<HTMLAudioElement | null>(
    typeof Audio !== "undefined" ? new Audio(soundEffect) : null,
  );

  useEffect(() => {
    setVisible(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (visible && audio) {
      // Play sound effect when achievement appears
      audio
        .play()
        .catch((error) => console.error("Error playing sound:", error));
    }

    // Auto close after specified time if enabled
    let timer: NodeJS.Timeout;
    if (visible && autoClose) {
      timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, autoCloseTime);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (audio) audio.pause();
    };
  }, [visible, audio, autoClose, autoCloseTime, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-4 right-4 z-50 max-w-[350px] bg-white"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border border-yellow-400/50 overflow-hidden shadow-lg bg-card/80 backdrop-blur-md">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 py-2 px-4 flex justify-between items-center shadow-md">
              <h3 className="text-white font-bold text-lg">
                Достижение разблокировано!
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-yellow-500/20"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-yellow-100 border-2 border-yellow-400">
                    {achievement.icon ? (
                      <span className="text-2xl">{achievement.icon}</span>
                    ) : (
                      <Award className="h-8 w-8 text-yellow-600" />
                    )}
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-yellow-400"
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{
                      opacity: 0,
                      scale: 1.6,
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeOut",
                    }}
                  />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">
                      {achievement.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`${achievement.badgeColor} text-white border-0 text-xs`}
                    >
                      +50 XP
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              </div>
              <motion.div
                className="w-full h-1 bg-gray-200 mt-4 rounded-full overflow-hidden"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: autoCloseTime / 1000 }}
              >
                <div className="h-full bg-yellow-500" />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementNotification;
