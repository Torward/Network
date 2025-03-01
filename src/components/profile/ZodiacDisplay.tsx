import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface ZodiacDisplayProps {
  sign?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const zodiacIcons: Record<
  string,
  { symbol: string; element: string; color: string }
> = {
  aries: { symbol: "♈", element: "Fire", color: "bg-red-500" },
  taurus: { symbol: "♉", element: "Earth", color: "bg-green-600" },
  gemini: { symbol: "♊", element: "Air", color: "bg-yellow-400" },
  cancer: { symbol: "♋", element: "Water", color: "bg-blue-400" },
  leo: { symbol: "♌", element: "Fire", color: "bg-orange-500" },
  virgo: { symbol: "♍", element: "Earth", color: "bg-green-500" },
  libra: { symbol: "♎", element: "Air", color: "bg-indigo-400" },
  scorpio: { symbol: "♏", element: "Water", color: "bg-purple-600" },
  sagittarius: { symbol: "♐", element: "Fire", color: "bg-red-400" },
  capricorn: { symbol: "♑", element: "Earth", color: "bg-gray-700" },
  aquarius: { symbol: "♒", element: "Air", color: "bg-blue-500" },
  pisces: { symbol: "♓", element: "Water", color: "bg-teal-500" },
};

const zodiacNamesRussian: Record<string, string> = {
  aries: "Овен",
  taurus: "Телец",
  gemini: "Близнецы",
  cancer: "Рак",
  leo: "Лев",
  virgo: "Дева",
  libra: "Весы",
  scorpio: "Скорпион",
  sagittarius: "Стрелец",
  capricorn: "Козерог",
  aquarius: "Водолей",
  pisces: "Рыбы",
};

const elementNamesRussian: Record<string, string> = {
  Fire: "Огонь",
  Earth: "Земля",
  Air: "Воздух",
  Water: "Вода",
  Unknown: "Неизвестно",
};

const ZodiacDisplay = ({
  sign = "gemini",
  size = "md",
  showLabel = true,
  className = "",
}: ZodiacDisplayProps) => {
  const normalizedSign = sign.toLowerCase();
  const zodiacInfo = zodiacIcons[normalizedSign] || {
    symbol: "?",
    element: "Unknown",
    color: "bg-gray-400",
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={`${sizeClasses[size]} ${zodiacInfo.color} rounded-full flex items-center justify-center text-white cursor-help`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-bold">{zodiacInfo.symbol}</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-bold">
                {zodiacNamesRussian[normalizedSign] || normalizedSign}
              </p>
              <p className="text-xs">
                Стихия:{" "}
                {elementNamesRussian[zodiacInfo.element] || zodiacInfo.element}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showLabel && (
        <span className="mt-1 text-xs font-medium">
          {zodiacNamesRussian[normalizedSign] || normalizedSign}
        </span>
      )}
    </div>
  );
};

export default ZodiacDisplay;
