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
  MessageSquare,
  Users,
  Maximize2,
  Minimize2,
  X,
  Edit,
  Clipboard,
  MousePointer,
  Magnet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import CollaborationPanel from "./CollaborationPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../auth/AuthProvider";
import { saveUISettings, getUISettings } from "@/lib/ui-settings";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string;
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
  language: string;
  tags: string[];
  userId?: string;
  isPublic?: boolean;
}

interface ProjectFile {
  id: string;
  name: string;
  content: string;
  path: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  isFolder: boolean;
  children?: ProjectFile[];
}

const CodeEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentFile, setCurrentFile] = useState<ProjectFile | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectLanguage, setNewProjectLanguage] = useState("javascript");
  const [newProjectTags, setNewProjectTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFilePath, setNewFilePath] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderPath, setNewFolderPath] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("");
  const [terminalCommand, setTerminalCommand] = useState("");
  const [activeTab, setActiveTab] = useState<"editor" | "terminal">("editor");
  const [isRunning, setIsRunning] = useState(false);
  const [lastOpenedProjectId, setLastOpenedProjectId] = useState<string | null>(
    null,
  );
  const [isCollaborationPanelOpen, setIsCollaborationPanelOpen] =
    useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  // Load projects from localStorage on component mount
  useEffect(() => {
    const loadProjects = async () => {
      // Try to load from localStorage first
      const savedProjects = localStorage.getItem("codeProjects");
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }

      // Load last opened project
      const lastProjectId = localStorage.getItem("lastOpenedCodeProject");
      if (lastProjectId && savedProjects) {
        const projectsList = JSON.parse(savedProjects);
        const lastProject = projectsList.find(
          (p: Project) => p.id === lastProjectId,
        );
        if (lastProject) {
          setCurrentProject(lastProject);
          setLastOpenedProjectId(lastProjectId);

          // Set first file as current file
          if (lastProject.files.length > 0) {
            const firstNonFolderFile = findFirstFile(lastProject.files);
            if (firstNonFolderFile) {
              setCurrentFile(firstNonFolderFile);
              setFileContent(firstNonFolderFile.content);
            }
          }
        }
      }

      // Load UI settings if available
      if (user) {
        const settings = await getUISettings("code-editor");
        if (settings) {
          setIsFullScreen(settings.is_visible);
        }
      }
    };

    loadProjects();
  }, [user]);

  // Helper function to find the first non-folder file
  const findFirstFile = (files: ProjectFile[]): ProjectFile | null => {
    for (const file of files) {
      if (!file.isFolder) {
        return file;
      }
      if (file.children && file.children.length > 0) {
        const childFile = findFirstFile(file.children);
        if (childFile) {
          return childFile;
        }
      }
    }
    return null;
  };

  // Save projects to localStorage when they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("codeProjects", JSON.stringify(projects));
    }
  }, [projects]);

  // Update last opened project
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem("lastOpenedCodeProject", currentProject.id);
      setLastOpenedProjectId(currentProject.id);
    }
  }, [currentProject]);

  // Update file content when current file changes
  useEffect(() => {
    if (currentFile) {
      setFileContent(currentFile.content);
    } else {
      setFileContent("");
    }
  }, [currentFile]);

  // Save fullscreen state
  useEffect(() => {
    const saveFullscreenState = async () => {
      if (user) {
        await saveUISettings({
          component_id: "code-editor",
          position_x: 0,
          position_y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          is_visible: isFullScreen,
        });
      }
    };

    saveFullscreenState();
  }, [isFullScreen, user]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const tags = newProjectTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription,
      language: newProjectLanguage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [
        {
          id: "root",
          name: "root",
          content: "",
          path: "/",
          language: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFolder: true,
          children: [],
        },
      ],
      tags,
      userId: user?.id || "anonymous",
      isPublic: false,
    };

    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setIsCreatingProject(false);
    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectLanguage("javascript");
    setNewProjectTags("");
  };

  const handleSaveProject = () => {
    if (!currentProject || !currentFile) return;

    // Update the current file content
    const updatedFiles = updateFileContent(
      currentProject.files,
      currentFile.id,
      fileContent,
    );

    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
  };

  // Helper function to update file content in the file tree
  const updateFileContent = (
    files: ProjectFile[],
    fileId: string,
    content: string,
  ): ProjectFile[] => {
    return files.map((file) => {
      if (file.id === fileId) {
        return { ...file, content, updatedAt: new Date().toISOString() };
      }
      if (file.children) {
        return {
          ...file,
          children: updateFileContent(file.children, fileId, content),
        };
      }
      return file;
    });
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(
      (project) => project.id !== projectId,
    );
    setProjects(updatedProjects);

    if (currentProject && currentProject.id === projectId) {
      setCurrentProject(null);
      setCurrentFile(null);
      setFileContent("");
    }
  };

  const handleCreateFile = () => {
    if (!currentProject || !newFileName.trim()) return;

    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: newFileName,
      content: "",
      path: newFilePath || "/",
      language: getLanguageFromFileName(newFileName),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFolder: false,
    };

    // Add file to the appropriate location in the file tree
    const updatedFiles = addFileToPath(
      currentProject.files,
      newFilePath || "/",
      newFile,
    );

    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
    setCurrentFile(newFile);
    setFileContent("");
    setIsCreatingFile(false);
    setNewFileName("");
    setNewFilePath("");
  };

  const handleCreateFolder = () => {
    if (!currentProject || !newFolderName.trim()) return;

    const newFolder: ProjectFile = {
      id: Date.now().toString(),
      name: newFolderName,
      content: "",
      path: newFolderPath || "/",
      language: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFolder: true,
      children: [],
    };

    // Add folder to the appropriate location in the file tree
    const updatedFiles = addFileToPath(
      currentProject.files,
      newFolderPath || "/",
      newFolder,
    );

    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
    setIsCreatingFolder(false);
    setNewFolderName("");
    setNewFolderPath("");
  };

  // Helper function to add a file or folder to a specific path in the file tree
  const addFileToPath = (
    files: ProjectFile[],
    path: string,
    newFile: ProjectFile,
  ): ProjectFile[] => {
    if (path === "/") {
      // Add to root
      return files.map((file) => {
        if (file.id === "root" && file.isFolder) {
          return { ...file, children: [...(file.children || []), newFile] };
        }
        return file;
      });
    }

    // Split path into segments
    const pathSegments = path.split("/").filter((segment) => segment);
    let currentPath = "";
    let currentFiles = files;

    // Navigate through path segments
    for (const segment of pathSegments) {
      currentPath += "/" + segment;
      const folder = currentFiles.find(
        (file) => file.isFolder && file.name === segment,
      );
      if (!folder || !folder.children) {
        // Path doesn't exist, add to root instead
        return addFileToPath(files, "/", newFile);
      }
      currentFiles = folder.children;
    }

    // Add file to the current path
    return files.map((file) => {
      if (file.path === path && file.isFolder) {
        return { ...file, children: [...(file.children || []), newFile] };
      }
      if (file.children) {
        return {
          ...file,
          children: addFileToPath(file.children, path, newFile),
        };
      }
      return file;
    });
  };

  const handleDeleteFile = (fileId: string) => {
    if (!currentProject) return;

    // Remove file from the file tree
    const updatedFiles = removeFileById(currentProject.files, fileId);

    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);

    if (currentFile && currentFile.id === fileId) {
      setCurrentFile(null);
      setFileContent("");
    }
  };

  // Helper function to remove a file by ID from the file tree
  const removeFileById = (
    files: ProjectFile[],
    fileId: string,
  ): ProjectFile[] => {
    return files
      .filter((file) => file.id !== fileId)
      .map((file) => {
        if (file.children) {
          return { ...file, children: removeFileById(file.children, fileId) };
        }
        return file;
      });
  };

  const handleFileSelect = (file: ProjectFile) => {
    if (file.isFolder) return;
    setCurrentFile(file);
    setFileContent(file.content);
  };

  const handleFileContentChange = (content: string) => {
    setFileContent(content);
  };

  const handleRunCode = () => {
    if (!currentFile) return;

    setIsRunning(true);
    setActiveTab("terminal");
    setTerminalOutput("Running code...\n");

    // Simulate code execution
    setTimeout(() => {
      let output = "";
      try {
        // For JavaScript/TypeScript files, try to evaluate the code
        if (
          ["js", "javascript", "ts", "typescript"].includes(
            currentFile.language,
          )
        ) {
          // This is just a simulation - in a real app, you'd use a safer approach
          output =
            "Output:\n" +
            eval(
              "(() => { try { " +
                fileContent +
                "\n return 'Code executed successfully!'; } catch(e) { return e.toString(); } })()",
            );
        } else {
          output =
            "Simulated execution for " +
            currentFile.language +
            " code.\nCode executed successfully!";
        }
      } catch (error) {
        output = "Error executing code: " + (error as Error).toString();
      }

      setTerminalOutput(output);
      setIsRunning(false);
    }, 1000);
  };

  const handleTerminalCommand = () => {
    if (!terminalCommand.trim()) return;

    setTerminalOutput((prev) => prev + "\n> " + terminalCommand);

    // Simulate command execution
    setTimeout(() => {
      let output = "";
      const command = terminalCommand.trim().toLowerCase();

      if (command.startsWith("echo ")) {
        output = command.substring(5);
      } else if (command === "clear") {
        setTerminalOutput("");
        setTerminalCommand("");
        return;
      } else if (command === "ls" || command === "dir") {
        output =
          "Simulated file listing:\nindex.js\npackage.json\nsrc/\nnode_modules/";
      } else if (command === "help") {
        output =
          "Available commands:\necho <text> - Display text\nclear - Clear terminal\nls/dir - List files\nhelp - Show this help";
      } else {
        output = `Command not found: ${command}\nType 'help' for available commands.`;
      }

      setTerminalOutput((prev) => prev + "\n" + output);
      setTerminalCommand("");
    }, 500);
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTerminalCommand();
    }
  };

  // Helper function to determine language from file extension
  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      py: "python",
      rb: "ruby",
      java: "java",
      php: "php",
      go: "go",
      rs: "rust",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
    };

    return languageMap[extension] || "plaintext";
  };

  const filteredProjects = projects.filter((project) => {
    const matchesName = project.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDescription = project.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTags = project.tags.some((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return matchesName || matchesDescription || matchesTags;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Render file tree recursively
  const renderFileTree = (files: ProjectFile[], depth = 0) => {
    return files.map((file) => (
      <div key={file.id} style={{ marginLeft: `${depth * 16}px` }}>
        <div
          className={`flex items-center p-1 rounded-md cursor-pointer ${currentFile?.id === file.id ? "bg-accent" : "hover:bg-accent/50"}`}
          onClick={() => handleFileSelect(file)}
        >
          {file.isFolder ? (
            <Folder className="h-4 w-4 mr-2 text-yellow-500" />
          ) : (
            <File className="h-4 w-4 mr-2 text-blue-500" />
          )}
          <span className="text-sm truncate">{file.name}</span>
          {!file.isFolder && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile(file.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        {file.isFolder && file.children && file.children.length > 0 && (
          <div>{renderFileTree(file.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="w-full h-[calc(100vh-72px)] bg-background flex relative">
      {/* Projects sidebar */}
      <div className="w-64 border-r border-border h-full flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="mr-2 bg-blue-500 hover:bg-blue-600 text-white border-none"
          >
            <Home className="h-4 w-4 mr-2" />В сетку
          </Button>
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Проекты</h2>
            <Dialog
              open={isCreatingProject}
              onOpenChange={setIsCreatingProject}
            >
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
                    <label
                      htmlFor="project-name"
                      className="text-sm font-medium"
                    >
                      Название
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
                  <div className="space-y-2">
                    <label
                      htmlFor="project-language"
                      className="text-sm font-medium"
                    >
                      Основной язык
                    </label>
                    <select
                      id="project-language"
                      value={newProjectLanguage}
                      onChange={(e) => setNewProjectLanguage(e.target.value)}
                      className="w-full p-2 rounded-md border border-border bg-background"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                      <option value="cpp">C++</option>
                      <option value="php">PHP</option>
                      <option value="ruby">Ruby</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="project-tags"
                      className="text-sm font-medium"
                    >
                      Теги (через запятую)
                    </label>
                    <Input
                      id="project-tags"
                      value={newProjectTags}
                      onChange={(e) => setNewProjectTags(e.target.value)}
                      placeholder="web, frontend, react"
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
        </div>

        <div className="p-4">
          <Input
            type="search"
            placeholder="Поиск проектов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`p-2 rounded-md cursor-pointer ${currentProject?.id === project.id ? "bg-accent" : "hover:bg-accent/50"}`}
                onClick={() => setCurrentProject(project)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CodeIcon className="h-4 w-4 mr-2 text-blue-500" />
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
                      <DropdownMenuItem onClick={() => handleSaveProject()}>
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Экспорт
                      </DropdownMenuItem>
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
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(project.updatedAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {project.language}
                </p>
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-accent/50 text-accent-foreground px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                <p>{searchQuery ? "Проекты не найдены" : "Нет проектов"}</p>
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
                  {currentProject.language} • Последнее обновление:{" "}
                  {formatDate(currentProject.updatedAt)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleSaveProject}>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCollaborationPanelOpen(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Совместная работа
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                >
                  {isFullScreen ? (
                    <>
                      <Minimize2 className="h-4 w-4 mr-2" />
                      Выйти из полноэкранного режима
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Полноэкранный режим
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* File explorer and editor */}
            <div className="flex-1 flex overflow-hidden">
              {/* File explorer */}
              <div className="w-64 border-r border-border flex flex-col">
                <div className="p-2 border-b border-border flex justify-between items-center">
                  <h3 className="text-sm font-medium">Файлы</h3>
                  <div className="flex space-x-1">
                    <Dialog
                      open={isCreatingFile}
                      onOpenChange={setIsCreatingFile}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <FilePlus className="h-3 w-3" />
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
                              placeholder="example.js"
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

                    <Dialog
                      open={isCreatingFolder}
                      onOpenChange={setIsCreatingFolder}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <FolderPlus className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Создать новую папку</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="folder-name"
                              className="text-sm font-medium"
                            >
                              Имя папки
                            </label>
                            <Input
                              id="folder-name"
                              value={newFolderName}
                              onChange={(e) => setNewFolderName(e.target.value)}
                              placeholder="src"
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="folder-path"
                              className="text-sm font-medium"
                            >
                              Путь (опционально)
                            </label>
                            <Input
                              id="folder-path"
                              value={newFolderPath}
                              onChange={(e) => setNewFolderPath(e.target.value)}
                              placeholder="/"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsCreatingFolder(false)}
                          >
                            Отмена
                          </Button>
                          <Button onClick={handleCreateFolder}>Создать</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {currentProject.files.length > 0 ? (
                      renderFileTree(currentProject.files)
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        <p>Нет файлов</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setIsCreatingFile(true)}
                        >
                          <FilePlus className="h-4 w-4 mr-2" />
                          Создать файл
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Editor and terminal */}
              <div className="flex-1 flex flex-col">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as "editor" | "terminal")
                  }
                  className="flex-1 flex flex-col"
                >
                  <TabsList className="border-b border-border rounded-none px-4">
                    <TabsTrigger
                      value="editor"
                      className="data-[state=active]:bg-background"
                    >
                      <CodeIcon className="h-4 w-4 mr-2" />
                      Редактор
                    </TabsTrigger>
                    <TabsTrigger
                      value="terminal"
                      className="data-[state=active]:bg-background"
                    >
                      <Terminal className="h-4 w-4 mr-2" />
                      Терминал
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="editor" className="flex-1 p-0 m-0">
                    {currentFile ? (
                      <div className="h-full flex flex-col">
                        <div className="p-2 border-b border-border flex justify-between items-center">
                          <div className="flex items-center">
                            <File className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm font-medium">
                              {currentFile.name}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRunCode}
                              disabled={isRunning}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Запустить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSaveProject}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Сохранить
                            </Button>
                          </div>
                        </div>
                        <div className="flex-1 p-4 bg-background">
                          <textarea
                            value={fileContent}
                            onChange={(e) =>
                              handleFileContentChange(e.target.value)
                            }
                            className="w-full h-full p-2 font-mono text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            spellCheck="false"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <CodeIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>
                            Выберите файл для редактирования или создайте новый
                          </p>
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
                  </TabsContent>

                  <TabsContent value="terminal" className="flex-1 p-0 m-0">
                    <div className="h-full flex flex-col bg-black text-white font-mono">
                      <div className="flex-1 p-4 overflow-auto">
                        <pre className="whitespace-pre-wrap">
                          {terminalOutput}
                        </pre>
                      </div>
                      <div className="p-2 border-t border-gray-800 flex items-center">
                        <span className="text-green-400 mr-2">$</span>
                        <input
                          type="text"
                          value={terminalCommand}
                          onChange={(e) => setTerminalCommand(e.target.value)}
                          onKeyDown={handleTerminalKeyDown}
                          className="flex-1 bg-transparent border-none outline-none"
                          placeholder="Введите команду..."
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <CodeIcon className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">
                Выберите проект или создайте новый
              </h3>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreatingProject(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать проект
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Collaboration Panel */}
      <CollaborationPanel
        isOpen={isCollaborationPanelOpen}
        onClose={() => setIsCollaborationPanelOpen(false)}
        projectName={currentProject?.name || "Проект"}
        projectType="code"
        currentFile={currentFile?.name}
      />

      {/* Fullscreen overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="w-full h-full flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center">
                <CodeIcon className="h-5 w-5 mr-2 text-blue-500" />
                <h2 className="font-semibold">{currentProject?.name}</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(false)}
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Выйти из полноэкранного режима
              </Button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* File explorer */}
              <div className="w-64 border-r border-border flex flex-col">
                <div className="p-2 border-b border-border flex justify-between items-center">
                  <h3 className="text-sm font-medium">Файлы</h3>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsCreatingFile(true)}
                    >
                      <FilePlus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsCreatingFolder(true)}
                    >
                      <FolderPlus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {currentProject?.files.length > 0 ? (
                      renderFileTree(currentProject.files)
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        <p>Нет файлов</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setIsCreatingFile(true)}
                        >
                          <FilePlus className="h-4 w-4 mr-2" />
                          Создать файл
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Editor and terminal */}
              <div className="flex-1 flex flex-col">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as "editor" | "terminal")
                  }
                  className="flex-1 flex flex-col"
                >
                  <TabsList className="border-b border-border rounded-none px-4">
                    <TabsTrigger
                      value="editor"
                      className="data-[state=active]:bg-background"
                    >
                      <CodeIcon className="h-4 w-4 mr-2" />
                      Редактор
                    </TabsTrigger>
                    <TabsTrigger
                      value="terminal"
                      className="data-[state=active]:bg-background"
                    >
                      <Terminal className="h-4 w-4 mr-2" />
                      Терминал
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="editor" className="flex-1 p-0 m-0">
                    {currentFile ? (
                      <div className="h-full flex flex-col">
                        <div className="p-2 border-b border-border flex justify-between items-center">
                          <div className="flex items-center">
                            <File className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm font-medium">
                              {currentFile.name}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRunCode}
                              disabled={isRunning}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Запустить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSaveProject}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Сохранить
                            </Button>
                          </div>
                        </div>
                        <div className="flex-1 p-4 bg-background">
                          <textarea
                            value={fileContent}
                            onChange={(e) =>
                              handleFileContentChange(e.target.value)
                            }
                            className="w-full h-full p-2 font-mono text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            spellCheck="false"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <CodeIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>
                            Выберите файл для редактирования или создайте новый
                          </p>
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
                  </TabsContent>

                  <TabsContent value="terminal" className="flex-1 p-0 m-0">
                    <div className="h-full flex flex-col bg-black text-white font-mono">
                      <div className="flex-1 p-4 overflow-auto">
                        <pre className="whitespace-pre-wrap">
                          {terminalOutput}
                        </pre>
                      </div>
                      <div className="p-2 border-t border-gray-800 flex items-center">
                        <span className="text-green-400 mr-2">$</span>
                        <input
                          type="text"
                          value={terminalCommand}
                          onChange={(e) => setTerminalCommand(e.target.value)}
                          onKeyDown={handleTerminalKeyDown}
                          className="flex-1 bg-transparent border-none outline-none"
                          placeholder="Введите команду..."
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
