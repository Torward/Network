import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, User, Lock, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage = ({ onLoginSuccess = () => {} }: LoginPageProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
    acceptTerms: false,
  });

  const handleLoginChange = (field: string, value: string | boolean) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegisterChange = (field: string, value: string | boolean) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // In a real app, this would authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          throw new Error(
            "Email не подтвержден. Пожалуйста, проверьте вашу почту и перейдите по ссылке для подтверждения.",
          );
        }
        throw error;
      }

      // For demo purposes, we'll just simulate a successful login
      console.log("Login successful", data);
      onLoginSuccess();
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.message ||
          "Ошибка входа. Пожалуйста, проверьте данные и попробуйте снова.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    // Validate terms acceptance
    if (!registerData.acceptTerms) {
      setError("Необходимо принять условия использования");
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
            birthdate: registerData.birthdate,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      // Check if user needs to confirm email
      if (data?.user?.identities?.length === 0) {
        setError(
          "Этот email уже зарегистрирован. Пожалуйста, войдите в систему.",
        );
        return;
      }

      // Automatically assign zodiac sign based on birthdate
      const birthdate = new Date(registerData.birthdate);
      console.log("User birthdate:", birthdate, "Zodiac sign will be assigned");

      setActiveTab("login");
      setError(
        "Регистрация успешна! Пожалуйста, подтвердите email и войдите в систему.",
      );
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(
        err.message || "Ошибка регистрации. Пожалуйста, попробуйте снова.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl shadow-lg">
                <Camera className="h-10 w-10" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-400"
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ opacity: 0, scale: 1.4 }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            СоциальноеAR
          </h1>
          <p className="text-gray-600 mt-2">
            Социальная сеть с дополненной реальностью
          </p>
        </div>

        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-xl font-semibold">
              {activeTab === "login" ? "Вход в аккаунт" : "Регистрация"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-6 w-full">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={loginData.email}
                        onChange={(e) =>
                          handleLoginChange("email", e.target.value)
                        }
                        required
                        className="pl-10"
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Пароль</Label>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs text-blue-600"
                        type="button"
                      >
                        Забыли пароль?
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) =>
                          handleLoginChange("password", e.target.value)
                        }
                        required
                        className="pl-10"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={loginData.rememberMe}
                      onCheckedChange={(checked) =>
                        handleLoginChange(
                          "rememberMe",
                          checked === true ? true : false,
                        )
                      }
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      Запомнить меня
                    </Label>
                  </div>

                  {error && activeTab === "login" && (
                    <div className="text-sm text-red-500">{error}</div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Вход...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <LogIn className="mr-2 h-4 w-4" /> Войти
                      </div>
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    Нет аккаунта?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600"
                      onClick={() => setActiveTab("register")}
                      type="button"
                    >
                      Зарегистрироваться
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Имя</Label>
                    <Input
                      id="register-name"
                      placeholder="Иван Петров"
                      value={registerData.name}
                      onChange={(e) =>
                        handleRegisterChange("name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={registerData.email}
                      onChange={(e) =>
                        handleRegisterChange("email", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-birthdate">Дата рождения</Label>
                    <Input
                      id="register-birthdate"
                      type="date"
                      value={registerData.birthdate}
                      onChange={(e) =>
                        handleRegisterChange("birthdate", e.target.value)
                      }
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Используется для определения знака зодиака
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Пароль</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) =>
                          handleRegisterChange("password", e.target.value)
                        }
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">
                      Подтвердите пароль
                    </Label>
                    <Input
                      id="register-confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        handleRegisterChange("confirmPassword", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={registerData.acceptTerms}
                      onCheckedChange={(checked) =>
                        handleRegisterChange(
                          "acceptTerms",
                          checked === true ? true : false,
                        )
                      }
                      required
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      Я принимаю{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600"
                        type="button"
                      >
                        условия использования
                      </Button>
                    </Label>
                  </div>

                  {error && activeTab === "register" && (
                    <div className="text-sm text-red-500">{error}</div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Регистрация...
                      </div>
                    ) : (
                      "Зарегистрироваться"
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    Уже есть аккаунт?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600"
                      onClick={() => setActiveTab("login")}
                      type="button"
                    >
                      Войти
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
