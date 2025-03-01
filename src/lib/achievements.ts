// Achievement system for the social network

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "social" | "content" | "engagement" | "special";
  requiredProgress: number;
  points: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  hidden?: boolean;
  unlockCondition?: (userData: any) => boolean;
}

export const achievements: Achievement[] = [
  // Social achievements
  {
    id: "first-connection",
    title: "Первое знакомство",
    description: "Добавьте первого друга",
    icon: "👋",
    category: "social",
    requiredProgress: 1,
    points: 10,
    rarity: "common",
    unlockCondition: (userData) => userData.friends?.length >= 1,
  },
  {
    id: "social-butterfly",
    title: "Социальная бабочка",
    description: "Добавьте 50 друзей",
    icon: "🦋",
    category: "social",
    requiredProgress: 50,
    points: 30,
    rarity: "uncommon",
    unlockCondition: (userData) => userData.friends?.length >= 50,
  },
  {
    id: "networking-master",
    title: "Мастер нетворкинга",
    description: "Добавьте 100 друзей",
    icon: "🌐",
    category: "social",
    requiredProgress: 100,
    points: 50,
    rarity: "rare",
    unlockCondition: (userData) => userData.friends?.length >= 100,
  },
  {
    id: "group-founder",
    title: "Основатель сообщества",
    description: "Создайте свою первую группу",
    icon: "👥",
    category: "social",
    requiredProgress: 1,
    points: 20,
    rarity: "common",
    unlockCondition: (userData) => userData.createdGroups?.length >= 1,
  },

  // Content achievements
  {
    id: "first-post",
    title: "Первый пост",
    description: "Опубликуйте свой первый пост",
    icon: "📝",
    category: "content",
    requiredProgress: 1,
    points: 10,
    rarity: "common",
    unlockCondition: (userData) => userData.posts?.length >= 1,
  },
  {
    id: "content-creator",
    title: "Создатель контента",
    description: "Опубликуйте 30 постов",
    icon: "📸",
    category: "content",
    requiredProgress: 30,
    points: 30,
    rarity: "uncommon",
    unlockCondition: (userData) => userData.posts?.length >= 30,
  },
  {
    id: "photographer",
    title: "Фотограф",
    description: "Загрузите 50 фотографий",
    icon: "📷",
    category: "content",
    requiredProgress: 50,
    points: 30,
    rarity: "uncommon",
    unlockCondition: (userData) => userData.photos?.length >= 50,
  },
  {
    id: "videographer",
    title: "Видеограф",
    description: "Загрузите 20 видео",
    icon: "🎬",
    category: "content",
    requiredProgress: 20,
    points: 40,
    rarity: "rare",
    unlockCondition: (userData) => userData.videos?.length >= 20,
  },

  // Engagement achievements
  {
    id: "first-like",
    title: "Первый лайк",
    description: "Поставьте лайк на пост другого пользователя",
    icon: "👍",
    category: "engagement",
    requiredProgress: 1,
    points: 5,
    rarity: "common",
    unlockCondition: (userData) => userData.likes?.given >= 1,
  },
  {
    id: "first-comment",
    title: "Первый комментарий",
    description: "Оставьте комментарий на пост другого пользователя",
    icon: "💬",
    category: "engagement",
    requiredProgress: 1,
    points: 5,
    rarity: "common",
    unlockCondition: (userData) => userData.comments?.given >= 1,
  },
  {
    id: "popular-post",
    title: "Популярный пост",
    description: "Получите 100 лайков на одном посте",
    icon: "⭐",
    category: "engagement",
    requiredProgress: 100,
    points: 40,
    rarity: "rare",
    unlockCondition: (userData) => userData.mostLikedPost?.likes >= 100,
  },
  {
    id: "comment-master",
    title: "Мастер комментариев",
    description: "Оставьте 500 комментариев",
    icon: "💬",
    category: "engagement",
    requiredProgress: 500,
    points: 30,
    rarity: "uncommon",
    unlockCondition: (userData) => userData.comments?.given >= 500,
  },

  // Special achievements
  {
    id: "early-adopter",
    title: "Ранний последователь",
    description: "Присоединился к платформе во время бета-тестирования",
    icon: "🚀",
    category: "special",
    requiredProgress: 1,
    points: 50,
    rarity: "rare",
    unlockCondition: (userData) => {
      const joinDate = new Date(userData.joinDate);
      const betaEndDate = new Date("2023-12-31");
      return joinDate <= betaEndDate;
    },
  },
  {
    id: "ar-explorer",
    title: "AR Исследователь",
    description: "Просмотрите 10 профилей в режиме дополненной реальности",
    icon: "👓",
    category: "special",
    requiredProgress: 10,
    points: 30,
    rarity: "uncommon",
    unlockCondition: (userData) => userData.arProfileViews >= 10,
  },
  {
    id: "zodiac-collector",
    title: "Коллекционер зодиаков",
    description: "Добавьте в друзья людей со всеми 12 знаками зодиака",
    icon: "♈♉♊♋♌♍♎♏♐♑♒♓",
    category: "special",
    requiredProgress: 12,
    points: 100,
    rarity: "legendary",
    unlockCondition: (userData) => {
      const uniqueZodiacSigns = new Set(
        userData.friends?.map((friend) => friend.zodiacSign) || [],
      );
      return uniqueZodiacSigns.size >= 12;
    },
  },
  {
    id: "platform-veteran",
    title: "Ветеран платформы",
    description: "Активен на платформе более 1 года",
    icon: "👑",
    category: "special",
    requiredProgress: 365,
    points: 100,
    rarity: "legendary",
    unlockCondition: (userData) => {
      const joinDate = new Date(userData.joinDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - joinDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 365;
    },
  },
];

/**
 * Check if a user has unlocked a specific achievement
 * @param achievementId The ID of the achievement to check
 * @param userData User data containing progress information
 * @returns Boolean indicating if the achievement is unlocked
 */
export function hasUnlockedAchievement(
  achievementId: string,
  userData: any,
): boolean {
  const achievement = achievements.find((a) => a.id === achievementId);
  if (!achievement || !achievement.unlockCondition) return false;
  return achievement.unlockCondition(userData);
}

/**
 * Get all achievements that a user has unlocked
 * @param userData User data containing progress information
 * @returns Array of unlocked achievements
 */
export function getUnlockedAchievements(userData: any): Achievement[] {
  return achievements.filter((achievement) => {
    if (!achievement.unlockCondition) return false;
    return achievement.unlockCondition(userData);
  });
}

/**
 * Calculate the total achievement points a user has earned
 * @param userData User data containing progress information
 * @returns Total achievement points
 */
export function getTotalAchievementPoints(userData: any): number {
  const unlockedAchievements = getUnlockedAchievements(userData);
  return unlockedAchievements.reduce(
    (total, achievement) => total + achievement.points,
    0,
  );
}

/**
 * Get the progress for a specific achievement
 * @param achievementId The ID of the achievement to check
 * @param userData User data containing progress information
 * @returns Object containing current progress and required progress
 */
export function getAchievementProgress(
  achievementId: string,
  userData: any,
): { current: number; required: number; percentage: number } {
  const achievement = achievements.find((a) => a.id === achievementId);
  if (!achievement) {
    return { current: 0, required: 0, percentage: 0 };
  }

  let current = 0;

  // Determine current progress based on achievement type
  switch (achievementId) {
    case "first-connection":
    case "social-butterfly":
    case "networking-master":
      current = userData.friends?.length || 0;
      break;
    case "group-founder":
      current = userData.createdGroups?.length || 0;
      break;
    case "first-post":
    case "content-creator":
      current = userData.posts?.length || 0;
      break;
    case "photographer":
      current = userData.photos?.length || 0;
      break;
    case "videographer":
      current = userData.videos?.length || 0;
      break;
    case "first-like":
      current = userData.likes?.given || 0;
      break;
    case "first-comment":
    case "comment-master":
      current = userData.comments?.given || 0;
      break;
    case "popular-post":
      current = userData.mostLikedPost?.likes || 0;
      break;
    case "early-adopter":
      current = hasUnlockedAchievement("early-adopter", userData) ? 1 : 0;
      break;
    case "ar-explorer":
      current = userData.arProfileViews || 0;
      break;
    case "zodiac-collector":
      const uniqueZodiacSigns = new Set(
        userData.friends?.map((friend) => friend.zodiacSign) || [],
      );
      current = uniqueZodiacSigns.size;
      break;
    case "platform-veteran":
      const joinDate = new Date(userData.joinDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - joinDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      current = Math.min(diffDays, achievement.requiredProgress);
      break;
    default:
      current = 0;
  }

  const percentage = Math.min(
    100,
    Math.round((current / achievement.requiredProgress) * 100),
  );

  return {
    current,
    required: achievement.requiredProgress,
    percentage,
  };
}
