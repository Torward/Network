import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Camera,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Globe,
  Moon,
  Sun,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "Иван Петров",
    email: "ivan@example.com",
    bio: "Цифровой кочевник, любитель кофе и фотограф-любитель. Всегда в поиске новых приключений!",
    birthdate: "1990-05-15",
    location: "Москва, Россия",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    pushNotifications: true,
    privateProfile: false,
    twoFactorAuth: false,
    language: "ru",
    theme: "system",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    console.log("Saving profile:", formData);
    // In a real app, this would send the data to an API
  };

  const handleSavePassword = () => {
    console.log("Changing password");
    // In a real app, this would send the password change request to an API
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleSaveNotifications = () => {
    console.log("Saving notification settings:", {
      emailNotifications: formData.emailNotifications,
      pushNotifications: formData.pushNotifications,
    });
    // In a real app, this would send the notification settings to an API
  };

  const handleSavePrivacy = () => {
    console.log("Saving privacy settings:", {
      privateProfile: formData.privateProfile,
      twoFactorAuth: formData.twoFactorAuth,
    });
    // In a real app, this would send the privacy settings to an API
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-4 bg-background">
      <h1 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
        Настройки
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Информация профиля</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarImage src={formData.avatar} alt={formData.name} />
                    <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full bg-background shadow-md"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">Дата рождения</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => handleChange("birthdate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Местоположение</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">О себе</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  Сохранить изменения
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Изменение пароля</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Текущий пароль</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      handleChange("currentPassword", e.target.value)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Новый пароль</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleChange("newPassword", e.target.value)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  Подтвердите новый пароль
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePassword}
                  disabled={
                    !formData.currentPassword ||
                    !formData.newPassword ||
                    formData.newPassword !== formData.confirmPassword
                  }
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  Изменить пароль
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Приватность и безопасность</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="private-profile">Приватный профиль</Label>
                  <p className="text-sm text-muted-foreground">
                    Только друзья могут видеть ваш профиль
                  </p>
                </div>
                <Switch
                  id="private-profile"
                  checked={formData.privateProfile}
                  onCheckedChange={(checked) =>
                    handleChange("privateProfile", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">
                    Двухфакторная аутентификация
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Повышенная безопасность для вашего аккаунта
                  </p>
                </div>
                <Switch
                  id="two-factor"
                  checked={formData.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    handleChange("twoFactorAuth", checked)
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePrivacy}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  Сохранить настройки
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать уведомления на email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleChange("emailNotifications", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push-уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать уведомления в браузере
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={formData.pushNotifications}
                  onCheckedChange={(checked) =>
                    handleChange("pushNotifications", checked)
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveNotifications}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  Сохранить настройки
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Внешний вид</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Тема</Label>
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="language">Язык</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => handleChange("language", value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Выберите язык" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                  Сохранить настройки
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
