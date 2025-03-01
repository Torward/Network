import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Save,
  Play,
  Plus,
  Folder,
  File,
  Settings,
  Download,
  Upload,
  Trash2,
  Copy,
  FolderPlus,
  FilePlus,
  Home,
  Search,
  RefreshCw,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Terminal,
  Bug,
  Code as CodeIcon,
  Zap,
  Sparkles,
  Wrench,
  Lightbulb,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Project {
  id: string;
  name: string;
  description: string;
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
  gitBranch?: string;
  runConfigurations?: RunConfiguration[];
}

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  problems?: FileProblem[];
}

interface FileProblem {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning" | "info";
}

interface RunConfiguration {
  id: string;
  name: string;
  command: string;
  environment: Record<string, string>;
}

const CodeEditor = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentFile, setCurrentFile] = useState<ProjectFile | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFilePath, setNewFilePath] = useState("");
  const [newFileLanguage, setNewFileLanguage] = useState("javascript");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    { file: string; line: number; match: string }[]
  >([]);
  const [currentBranch, setCurrentBranch] = useState("main");
  const [showProblems, setShowProblems] = useState(false);
  const [problems, setProblems] = useState<FileProblem[]>([]);
  const [activeRunConfig, setActiveRunConfig] = useState<string | null>(null);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });

  // Load projects from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("codeProjects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Save projects to localStorage when they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("codeProjects", JSON.stringify(projects));
    }
  }, [projects]);

  // Update code when current file changes
  useEffect(() => {
    if (currentFile) {
      setCode(currentFile.content);
      // Analyze code for problems
      analyzeCode(currentFile.content, currentFile.language);
      // Generate suggestions based on code context
      generateSuggestions(currentFile.content, currentFile.language);
    } else {
      setCode("");
      setProblems([]);
      setSuggestions([]);
    }
  }, [currentFile]);

  // Auto-save functionality
  useEffect(() => {
    if (isAutoSaveEnabled && currentFile && code !== currentFile.content) {
      const timer = setTimeout(() => {
        handleSaveFile();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [code, isAutoSaveEnabled]);

  // Analyze code for problems
  const analyzeCode = (codeContent: string, language: string) => {
    // Simple code analysis for demonstration
    const problems: FileProblem[] = [];
    const lines = codeContent.split("\n");

    lines.forEach((line, index) => {
      // Check for console.log (warning)
      if (line.includes("console.log") && language === "javascript") {
        problems.push({
          line: index + 1,
          column: line.indexOf("console.log"),
          message: "Consider removing console.log before production",
          severity: "warning",
        });
      }

      // Check for TODO comments (info)
      if (line.includes("TODO")) {
        problems.push({
          line: index + 1,
          column: line.indexOf("TODO"),
          message: "TODO comment found",
          severity: "info",
        });
      }

      // Check for potential errors in JavaScript
      if (language === "javascript" || language === "typescript") {
        // Missing semicolons in non-empty lines that don't end with {, }, or ;
        if (
          line.trim() &&
          !line.trim().endsWith(";") &&
          !line.trim().endsWith("{") &&
          !line.trim().endsWith("}") &&
          !line.trim().endsWith("//") &&
          !line.trim().startsWith("import") &&
          !line.trim().startsWith("export")
        ) {
          problems.push({
            line: index + 1,
            column: line.length,
            message: "Missing semicolon",
            severity: "warning",
          });
        }

        // Undefined variable usage (very simplified check)
        if (
          line.includes("var ") ||
          line.includes("let ") ||
          line.includes("const ")
        ) {
          // This is a declaration, we would track it in a real IDE
        }
      }
    });

    setProblems(problems);
  };

  // Generate code suggestions
  const generateSuggestions = (codeContent: string, language: string) => {
    // Simple suggestion generation for demonstration
    const suggestions: string[] = [];

    if (language === "javascript" || language === "typescript") {
      suggestions.push(
        "function myFunction() { }",
        "const myVar = [];",
        'console.log("Hello, world!");',
        "for (let i = 0; i < array.length; i++) { }",
        "if (condition) { } else { }",
        "const myPromise = new Promise((resolve, reject) => { });",
      );
    } else if (language === "html") {
      suggestions.push(
        '<div class="container"></div>',
        "<h1>Heading</h1>",
        "<p>Paragraph</p>",
        '<a href="#">Link</a>',
        '<button type="button">Click me</button>',
      );
    } else if (language === "css") {
      suggestions.push(
        ".class-name { }",
        "display: flex;",
        "margin: 10px;",
        "color: #333;",
        "font-size: 16px;",
      );
    }

    setSuggestions(suggestions);
  };

  // Handle cursor position change
  const handleCursorPositionChange = (
    e:
      | React.MouseEvent<HTMLTextAreaElement>
      | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    const textarea = e.currentTarget;
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;

    // Calculate line and column
    let line = 1;
    let column = 1;

    for (let i = 0; i < selectionStart; i++) {
      if (value[i] === "\n") {
        line++;
        column = 1;
      } else {
        column++;
      }
    }

    setCursorPosition({ line, column });
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription,
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gitBranch: "main",
      runConfigurations: [
        {
          id: "default",
          name: "Default",
          command: "node index.js",
          environment: { NODE_ENV: "development" },
        },
      ],
    };

    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setIsCreatingProject(false);
    setNewProjectName("");
    setNewProjectDescription("");
  };

  const handleCreateFile = () => {
    if (!currentProject || !newFileName.trim()) return;

    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: newFileName,
      path: newFilePath || "/",
      content: "",
      language: newFileLanguage,
    };

    const updatedProject = {
      ...currentProject,
      files: [...currentProject.files, newFile],
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((p) => (p.id === currentProject.id ? updatedProject : p)),
    );
    setCurrentProject(updatedProject);
    setCurrentFile(newFile);
    setIsCreatingFile(false);
    setNewFileName("");
    setNewFilePath("");
    setNewFileLanguage("javascript");
  };

  const handleSaveFile = () => {
    if (!currentProject || !currentFile) return;

    const updatedFile = { ...currentFile, content: code };
    const updatedFiles = currentProject.files.map((f) =>
      f.id === currentFile.id ? updatedFile : f,
    );

    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((p) => (p.id === currentProject.id ? updatedProject : p)),
    );
    setCurrentProject(updatedProject);
    setCurrentFile(updatedFile);
  };

  const handleRunCode = (configId?: string) => {
    if (!currentFile || !currentProject) return;

    // Save file before running
    handleSaveFile();

    // Get the run configuration
    const runConfig = configId
      ? currentProject.runConfigurations?.find((c) => c.id === configId)
      : currentProject.runConfigurations?.[0];

    if (runConfig) {
      setActiveRunConfig(runConfig.id);
    }

    try {
      // For JavaScript files, we can use eval (not recommended for production)
      if (currentFile.language === "javascript") {
        // Create a safe console.log replacement to capture output
        const originalConsoleLog = console.log;
        let outputText = "";

        // Add run configuration info to output
        if (runConfig) {
          outputText += `[Running: ${runConfig.name}] ${runConfig.command}\n`;
          outputText += `[Environment: ${Object.entries(runConfig.environment)
            .map(([key, value]) => `${key}=${value}`)
            .join(", ")}]\n\n`;
        }

        console.log = (...args) => {
          outputText += args.join(" ") + "\n";
          originalConsoleLog(...args);
        };

        // Run the code
        try {
          // Add a timestamp to the output
          outputText += `[${new Date().toLocaleTimeString()}] Running code...\n`;

          // Execute the code with a timeout for safety
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Execution timed out")), 5000);
          });

          const execPromise = new Promise<void>((resolve) => {
            eval(code);
            resolve();
          });

          Promise.race([execPromise, timeoutPromise])
            .then(() => {
              outputText += `\n[${new Date().toLocaleTimeString()}] Execution completed successfully.`;
              setOutput(
                outputText || "Code executed successfully with no output.",
              );
            })
            .catch((error: any) => {
              outputText += `\n[${new Date().toLocaleTimeString()}] Error: ${error.message}`;
              setOutput(outputText);
            });
        } catch (error: any) {
          outputText += `\n[${new Date().toLocaleTimeString()}] Error: ${error.message}`;
          setOutput(outputText);
        }

        // Restore original console.log
        console.log = originalConsoleLog;
      } else {
        setOutput(
          `Running code for ${currentFile.language} is not supported in this demo.\n` +
            `In a real IDE, this would execute the appropriate compiler or interpreter.`,
        );
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    }
  };

  // Global search across all files
  const handleGlobalSearch = () => {
    if (!searchTerm.trim() || !currentProject) return;

    setIsSearching(true);
    const results: { file: string; line: number; match: string }[] = [];

    // Search through all files in the project
    currentProject.files.forEach((file) => {
      const lines = file.content.split("\n");
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            file: file.name,
            line: index + 1,
            match: line.trim(),
          });
        }
      });
    });

    setSearchResults(results);
    setIsSearching(false);
  };

  // Navigate to search result
  const navigateToSearchResult = (file: string, line: number) => {
    if (!currentProject) return;

    // Find the file
    const targetFile = currentProject.files.find((f) => f.name === file);
    if (targetFile) {
      setCurrentFile(targetFile);

      // Scroll to the line (would be implemented with a real editor component)
      setTimeout(() => {
        const textarea = document.querySelector("textarea");
        if (textarea) {
          const lines = targetFile.content.split("\n");
          let position = 0;

          // Calculate position of the target line
          for (let i = 0; i < line - 1; i++) {
            position += lines[i].length + 1; // +1 for the newline character
          }

          textarea.focus();
          textarea.setSelectionRange(position, position);
        }
      }, 100);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    setProjects(updatedProjects);

    if (currentProject && currentProject.id === projectId) {
      setCurrentProject(null);
      setCurrentFile(null);
      setCode("");
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (!currentProject) return;

    const updatedFiles = currentProject.files.filter((f) => f.id !== fileId);
    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((p) => (p.id === currentProject.id ? updatedProject : p)),
    );
    setCurrentProject(updatedProject);

    if (currentFile && currentFile.id === fileId) {
      setCurrentFile(null);
      setCode("");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="w-full h-[calc(100vh-72px)] bg-background flex relative">
      {/* Project sidebar */}
      <div className="w-64 border-r border-border h-full flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/")}
            className="mr-2 bg-blue-500 hover:bg-blue-600 text-white border-none"
          >
            <Home className="h-4 w-4 mr-2" />В сетку
          </Button>
          <h2 className="font-semibold">Проекты</h2>
          <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новый проект</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="project-name" className="text-sm font-medium">
                    Название проекта
                  </label>
                  <Input
                    id="project-name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Мой проект"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="project-description"
                    className="text-sm font-medium"
                  >
                    Описание
                  </label>
                  <Textarea
                    id="project-description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Описание проекта"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingProject(false)}
                >
                  Отмена
                </Button>
                <Button onClick={handleCreateProject}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`p-2 rounded-md cursor-pointer ${currentProject?.id === project.id ? "bg-accent" : "hover:bg-accent/50"}`}
                onClick={() => setCurrentProject(project)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Folder className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium truncate">
                      {project.name}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {project.description}
                </p>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                <p>Нет проектов</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setIsCreatingProject(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать проект
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {currentProject ? (
          <>
            {/* Project header */}
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{currentProject.name}</h2>
                <p className="text-xs text-muted-foreground">
                  Последнее обновление: {formatDate(currentProject.updatedAt)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Dialog open={isCreatingFile} onOpenChange={setIsCreatingFile}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FilePlus className="h-4 w-4 mr-2" />
                      Новый файл
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Создать новый файл</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="file-name"
                          className="text-sm font-medium"
                        >
                          Имя файла
                        </label>
                        <Input
                          id="file-name"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="main.js"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="file-path"
                          className="text-sm font-medium"
                        >
                          Путь (опционально)
                        </label>
                        <Input
                          id="file-path"
                          value={newFilePath}
                          onChange={(e) => setNewFilePath(e.target.value)}
                          placeholder="/src"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="file-language"
                          className="text-sm font-medium"
                        >
                          Язык
                        </label>
                        <select
                          id="file-language"
                          value={newFileLanguage}
                          onChange={(e) => setNewFileLanguage(e.target.value)}
                          className="w-full p-2 rounded-md border border-input bg-background"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreatingFile(false)}
                      >
                        Отмена
                      </Button>
                      <Button onClick={handleCreateFile}>Создать</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Editor area */}
            <div className="flex-1 flex">
              {/* File explorer */}
              <div className="w-48 border-r border-border">
                <div className="p-2">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-2">
                    Файлы
                  </h3>
                  <div className="space-y-1">
                    {currentProject.files.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm ${currentFile?.id === file.id ? "bg-accent" : "hover:bg-accent/50"}`}
                        onClick={() => setCurrentFile(file)}
                      >
                        <div className="flex items-center truncate">
                          <File className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}

                    {currentProject.files.length === 0 && (
                      <div className="p-2 text-center text-muted-foreground text-xs">
                        <p>Нет файлов</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Code editor and output */}
              <div className="flex-1 flex flex-col">
                {currentFile ? (
                  <>
                    <div className="p-2 border-b border-border flex justify-between items-center">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm font-medium">
                          {currentFile.name}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({currentFile.language})
                        </span>
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs flex items-center"
                        >
                          <GitBranch className="h-3 w-3 mr-1" />
                          {currentProject?.gitBranch || "main"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRunCode()}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Запустить
                          </Button>
                          {currentProject?.runConfigurations &&
                            currentProject.runConfigurations.length > 1 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 ml-1"
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {currentProject.runConfigurations.map(
                                    (config) => (
                                      <DropdownMenuItem
                                        key={config.id}
                                        onClick={() => handleRunCode(config.id)}
                                      >
                                        <Play className="h-4 w-4 mr-2" />
                                        {config.name}
                                      </DropdownMenuItem>
                                    ),
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveFile}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Сохранить
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setIsSearching(true)}
                            >
                              <Search className="h-4 w-4 mr-2" />
                              Найти в проекте
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Terminal className="h-4 w-4 mr-2" />
                              Открыть терминал
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <GitMerge className="h-4 w-4 mr-2" />
                              Управление ветками
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Wrench className="h-4 w-4 mr-2" />
                              Настройки проекта
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Global search dialog */}
                    {isSearching && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-background border border-border rounded-lg shadow-lg w-[600px] max-w-[90vw] max-h-[80vh] flex flex-col overflow-hidden">
                          <div className="p-4 border-b border-border flex justify-between items-center">
                            <h3 className="font-semibold">Поиск в проекте</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setIsSearching(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="p-4 border-b border-border">
                            <div className="flex space-x-2">
                              <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Введите текст для поиска..."
                                className="flex-1"
                              />
                              <Button onClick={handleGlobalSearch}>
                                <Search className="h-4 w-4 mr-2" />
                                Найти
                              </Button>
                            </div>
                          </div>

                          <ScrollArea className="flex-1 p-4">
                            {searchResults.length > 0 ? (
                              <div className="space-y-2">
                                {searchResults.map((result, index) => (
                                  <div
                                    key={index}
                                    className="p-2 hover:bg-accent rounded cursor-pointer"
                                    onClick={() => {
                                      navigateToSearchResult(
                                        result.file,
                                        result.line,
                                      );
                                      setIsSearching(false);
                                    }}
                                  >
                                    <div className="flex items-center">
                                      <File className="h-4 w-4 mr-2 text-blue-500" />
                                      <span className="font-medium">
                                        {result.file}
                                      </span>
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        Line {result.line}
                                      </span>
                                    </div>
                                    <pre className="text-xs bg-muted/50 p-1 mt-1 rounded overflow-x-auto">
                                      {result.match}
                                    </pre>
                                  </div>
                                ))}
                              </div>
                            ) : searchTerm ? (
                              <div className="text-center text-muted-foreground py-8">
                                {searchTerm && <p>Ничего не найдено</p>}
                              </div>
                            ) : null}
                          </ScrollArea>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 flex flex-col">
                      <Tabs
                        defaultValue="editor"
                        className="flex-1 flex flex-col"
                      >
                        <TabsList className="mx-4 mt-2 justify-start">
                          <TabsTrigger value="editor">Редактор</TabsTrigger>
                          <TabsTrigger value="output">Вывод</TabsTrigger>
                        </TabsList>

                        <TabsContent
                          value="editor"
                          className="flex-1 p-0 m-0 data-[state=active]:flex flex-col"
                        >
                          <div className="flex-1 p-4 relative">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="text-xs text-muted-foreground">
                                  Line: {cursorPosition.line}, Column:{" "}
                                  {cursorPosition.column}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {currentFile.language.toUpperCase()}
                                </Badge>
                                {problems.length > 0 && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${problems.some((p) => p.severity === "error") ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}`}
                                  >
                                    {
                                      problems.filter(
                                        (p) => p.severity === "error",
                                      ).length
                                    }{" "}
                                    errors,{" "}
                                    {
                                      problems.filter(
                                        (p) => p.severity === "warning",
                                      ).length
                                    }{" "}
                                    warnings
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Switch
                                    id="auto-save"
                                    checked={isAutoSaveEnabled}
                                    onCheckedChange={setIsAutoSaveEnabled}
                                    size="sm"
                                  />
                                  <Label
                                    htmlFor="auto-save"
                                    className="text-xs"
                                  >
                                    Auto-save
                                  </Label>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => setShowProblems(!showProblems)}
                                >
                                  <Bug className="h-3 w-3 mr-1" />
                                  Problems
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() =>
                                    setShowSuggestions(!showSuggestions)
                                  }
                                >
                                  <Lightbulb className="h-3 w-3 mr-1" />
                                  Suggestions
                                </Button>
                              </div>
                            </div>

                            <div className="flex h-[calc(100%-28px)]">
                              {/* Line numbers */}
                              <div className="w-10 bg-muted/50 font-mono text-xs text-muted-foreground p-1 text-right select-none">
                                {code.split("\n").map((_, i) => (
                                  <div key={i} className="leading-5">
                                    {i + 1}
                                  </div>
                                ))}
                              </div>

                              {/* Code editor */}
                              <div className="flex-1 relative">
                                <Textarea
                                  value={code}
                                  onChange={(e) => setCode(e.target.value)}
                                  onKeyUp={handleCursorPositionChange}
                                  onClick={handleCursorPositionChange}
                                  className="font-mono text-sm h-full resize-none pl-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                  placeholder="Введите код..."
                                  spellCheck={false}
                                />

                                {/* Problem markers */}
                                {problems.map((problem, index) => (
                                  <div
                                    key={index}
                                    className={`absolute left-0 right-0 h-5 ${problem.severity === "error" ? "border-b border-red-500/30" : problem.severity === "warning" ? "border-b border-yellow-500/30" : "border-b border-blue-500/30"}`}
                                    style={{
                                      top: `${(problem.line - 1) * 20}px`,
                                    }}
                                    title={problem.message}
                                  >
                                    <div
                                      className={`absolute h-2 w-2 rounded-full ${problem.severity === "error" ? "bg-red-500" : problem.severity === "warning" ? "bg-yellow-500" : "bg-blue-500"}`}
                                      style={{
                                        left: `${problem.column * 8}px`,
                                        top: "10px",
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Problems panel */}
                              {showProblems && problems.length > 0 && (
                                <div className="absolute right-4 bottom-4 w-80 h-48 bg-background border border-border rounded-md shadow-lg overflow-hidden z-10">
                                  <div className="flex items-center justify-between p-2 border-b border-border bg-muted/50">
                                    <h4 className="text-sm font-medium">
                                      Problems
                                    </h4>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() => setShowProblems(false)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <ScrollArea className="h-[calc(100%-32px)]">
                                    <div className="p-2 space-y-1">
                                      {problems.map((problem, index) => (
                                        <div
                                          key={index}
                                          className="text-xs p-1 hover:bg-accent rounded"
                                        >
                                          <div className="flex items-center">
                                            <div
                                              className={`h-3 w-3 rounded-full mr-2 ${problem.severity === "error" ? "bg-red-500" : problem.severity === "warning" ? "bg-yellow-500" : "bg-blue-500"}`}
                                            />
                                            <span className="font-medium">
                                              {problem.message}
                                            </span>
                                          </div>
                                          <div className="ml-5 text-muted-foreground">
                                            Line {problem.line}, Column{" "}
                                            {problem.column}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </div>
                              )}

                              {/* Code suggestions panel */}
                              {showSuggestions && (
                                <div className="absolute right-4 bottom-4 w-80 h-48 bg-background border border-border rounded-md shadow-lg overflow-hidden z-10">
                                  <div className="flex items-center justify-between p-2 border-b border-border bg-muted/50">
                                    <h4 className="text-sm font-medium">
                                      Code Suggestions
                                    </h4>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() => setShowSuggestions(false)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <ScrollArea className="h-[calc(100%-32px)]">
                                    <div className="p-2 space-y-1">
                                      {suggestions.map((suggestion, index) => (
                                        <div
                                          key={index}
                                          className="text-xs p-2 hover:bg-accent rounded cursor-pointer font-mono"
                                          onClick={() => {
                                            setCode(code + "\n" + suggestion);
                                            setShowSuggestions(false);
                                          }}
                                        >
                                          <div className="flex items-center">
                                            <Sparkles className="h-3 w-3 mr-2 text-primary" />
                                            <span>{suggestion}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="output"
                          className="flex-1 p-0 m-0 data-[state=active]:flex flex-col"
                        >
                          <ScrollArea className="flex-1 p-4">
                            <pre className="font-mono text-sm whitespace-pre-wrap">
                              {output ||
                                "Нет вывода. Запустите код для просмотра результатов."}
                            </pre>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <File className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
                      <h3 className="mt-4 text-lg font-medium">
                        Выберите файл или создайте новый
                      </h3>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsCreatingFile(true)}
                      >
                        <FilePlus className="h-4 w-4 mr-2" />
                        Создать файл
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Folder className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">
                Выберите проект или создайте новый
              </h3>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreatingProject(true)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Создать проект
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
