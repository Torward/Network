import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Save,
  Plus,
  Image,
  Settings,
  Download,
  Upload,
  Trash2,
  Square,
  Circle,
  Triangle,
  Type,
  Pencil,
  Eraser,
  Move,
  Undo,
  Redo,
  Palette,
  Layers,
  Home,
  X,
  Minus,
  Eye,
  EyeOff,
  User,
  Share2,
  Lock,
  GitBranch,
  MessageSquare,
  Users,
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
import CollaborationPanel from "./CollaborationPanel";

interface GraphicProject {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  thumbnail: string;
  canvasData: string;
  layers: Layer[];
  userId?: string;
  isPublic?: boolean;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  data: string;
  zIndex: number;
}

interface Brush {
  id: string;
  name: string;
  size: number;
  opacity: number;
  hardness: number;
  color: string;
  type: "round" | "square" | "textured";
  texture?: string;
}

interface GraphicEditorProps {}

const GraphicEditor: React.FC<GraphicEditorProps> = () => {
  const [projects, setProjects] = useState<GraphicProject[]>([]);
  const [currentProject, setCurrentProject] = useState<GraphicProject | null>(
    null,
  );
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectWidth, setNewProjectWidth] = useState(800);
  const [newProjectHeight, setNewProjectHeight] = useState(600);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState("pencil");
  const [brushSize, setBrushSize] = useState([5]);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushOpacity, setBrushOpacity] = useState([100]);
  const [brushHardness, setBrushHardness] = useState([50]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [brushes, setBrushes] = useState<Brush[]>([
    {
      id: "1",
      name: "Круглая кисть",
      size: 5,
      opacity: 100,
      hardness: 100,
      color: "#000000",
      type: "round",
    },
    {
      id: "2",
      name: "Мягкая кисть",
      size: 20,
      opacity: 70,
      hardness: 30,
      color: "#000000",
      type: "round",
    },
    {
      id: "3",
      name: "Квадратная кисть",
      size: 10,
      opacity: 100,
      hardness: 100,
      color: "#000000",
      type: "square",
    },
  ]);
  const [activeBrushId, setActiveBrushId] = useState("1");
  const [showBrushesPanel, setShowBrushesPanel] = useState(false);
  const [isImportingProject, setIsImportingProject] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [lastOpenedProjectId, setLastOpenedProjectId] = useState<string | null>(
    null,
  );
  const [isCollaborationPanelOpen, setIsCollaborationPanelOpen] =
    useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });

  // Load projects from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("graphicProjects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    // Load last opened project
    const lastProjectId = localStorage.getItem("lastOpenedGraphicProject");
    if (lastProjectId && savedProjects) {
      const projects = JSON.parse(savedProjects);
      const lastProject = projects.find(
        (p: GraphicProject) => p.id === lastProjectId,
      );
      if (lastProject) {
        setCurrentProject(lastProject);
        setLastOpenedProjectId(lastProjectId);
      }
    }
  }, []);

  // Save projects to localStorage when they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("graphicProjects", JSON.stringify(projects));
    }
  }, [projects]);

  // Initialize canvas when current project changes
  useEffect(() => {
    if (currentProject && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = currentProject.width;
      canvas.height = currentProject.height;

      // Save as last opened project
      localStorage.setItem("lastOpenedGraphicProject", currentProject.id);
      setLastOpenedProjectId(currentProject.id);

      // Initialize or load layers
      if (!currentProject.layers || currentProject.layers.length === 0) {
        // Create default layer if none exist
        const defaultLayer: Layer = {
          id: Date.now().toString(),
          name: "Слой 1",
          visible: true,
          locked: false,
          opacity: 100,
          data: "",
          zIndex: 0,
        };

        setLayers([defaultLayer]);
        setActiveLayerId(defaultLayer.id);

        // Update project with the new layer
        const updatedProject = {
          ...currentProject,
          layers: [defaultLayer],
        };
        setCurrentProject(updatedProject);
        setProjects(
          projects.map((p) =>
            p.id === currentProject.id ? updatedProject : p,
          ),
        );
      } else {
        // Load existing layers
        setLayers(currentProject.layers);
        setActiveLayerId(currentProject.layers[0].id);

        // Draw all visible layers
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Sort layers by z-index
          const sortedLayers = [...currentProject.layers].sort(
            (a, b) => a.zIndex - b.zIndex,
          );

          // Draw each visible layer
          sortedLayers.forEach((layer) => {
            if (layer.visible && layer.data) {
              const img = new Image();
              img.onload = () => {
                if (ctx) {
                  ctx.globalAlpha = layer.opacity / 100;
                  ctx.drawImage(img, 0, 0);
                  ctx.globalAlpha = 1.0;
                }
              };
              img.src = layer.data;
            }
          });
        }
      }

      // Clear undo/redo stacks
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [currentProject]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    // Create default layer
    const defaultLayer: Layer = {
      id: Date.now().toString(),
      name: "Слой 1",
      visible: true,
      locked: false,
      opacity: 100,
      data: "",
      zIndex: 0,
    };

    const newProject: GraphicProject = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription,
      width: newProjectWidth,
      height: newProjectHeight,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnail: "",
      canvasData: "",
      layers: [defaultLayer],
      userId: "current-user", // In a real app, this would be the actual user ID
      isPublic: false,
    };

    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setIsCreatingProject(false);
    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectWidth(800);
    setNewProjectHeight(600);
  };

  const handleSaveProject = () => {
    if (!currentProject || !canvasRef.current || !activeLayerId) return;

    const canvas = canvasRef.current;

    // Update the active layer data
    const updatedLayers = layers.map((layer) => {
      if (layer.id === activeLayerId) {
        return {
          ...layer,
          data: canvas.toDataURL("image/png"),
        };
      }
      return layer;
    });

    // Render all layers to create the final composite image
    const compositeCanvas = document.createElement("canvas");
    compositeCanvas.width = canvas.width;
    compositeCanvas.height = canvas.height;
    const compositeCtx = compositeCanvas.getContext("2d");

    if (compositeCtx) {
      // Sort layers by z-index and draw them
      const sortedLayers = [...updatedLayers].sort(
        (a, b) => a.zIndex - b.zIndex,
      );

      sortedLayers.forEach((layer) => {
        if (layer.visible && layer.data) {
          const img = new Image();
          img.onload = () => {
            if (compositeCtx) {
              compositeCtx.globalAlpha = layer.opacity / 100;
              compositeCtx.drawImage(img, 0, 0);
              compositeCtx.globalAlpha = 1.0;
            }
          };
          img.src = layer.data;
        }
      });
    }

    // Wait for all images to load and render
    setTimeout(() => {
      const canvasData = compositeCanvas.toDataURL("image/png");

      // Create a thumbnail (scaled down version)
      const thumbnailCanvas = document.createElement("canvas");
      thumbnailCanvas.width = 200;
      thumbnailCanvas.height = (200 * canvas.height) / canvas.width;
      const thumbnailCtx = thumbnailCanvas.getContext("2d");
      if (thumbnailCtx) {
        thumbnailCtx.drawImage(
          compositeCanvas,
          0,
          0,
          thumbnailCanvas.width,
          thumbnailCanvas.height,
        );
      }
      const thumbnail = thumbnailCanvas.toDataURL("image/png");

      const updatedProject = {
        ...currentProject,
        canvasData,
        thumbnail,
        layers: updatedLayers,
        updatedAt: new Date().toISOString(),
      };

      setLayers(updatedLayers);
      setProjects(
        projects.map((p) => (p.id === currentProject.id ? updatedProject : p)),
      );
      setCurrentProject(updatedProject);
    }, 100); // Small delay to ensure all images are loaded
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    setProjects(updatedProjects);

    if (currentProject && currentProject.id === projectId) {
      setCurrentProject(null);
    }
  };

  const handleExportProject = () => {
    if (!currentProject || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${currentProject.name}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !activeLayerId) return;

    // Check if the active layer is locked
    const activeLayer = layers.find((layer) => layer.id === activeLayerId);
    if (activeLayer?.locked) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    lastPos.current = { x, y };

    // Save current state for undo
    const currentState = canvas.toDataURL();
    setUndoStack([...undoStack, currentState]);
    setRedoStack([]);

    // Get the active brush
    const activeBrush =
      brushes.find((brush) => brush.id === activeBrushId) || brushes[0];

    // Start drawing based on selected tool
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize[0];
      ctx.lineCap = activeBrush.type === "square" ? "butt" : "round";
      ctx.lineJoin = activeBrush.type === "square" ? "miter" : "round";

      // Apply opacity
      ctx.globalAlpha = brushOpacity[0] / 100;

      // Apply brush hardness (simplified simulation)
      if (brushHardness[0] < 100 && selectedTool === "pencil") {
        ctx.shadowBlur = (100 - brushHardness[0]) / 5;
        ctx.shadowColor = brushColor;
      } else {
        ctx.shadowBlur = 0;
      }

      if (selectedTool === "pencil") {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (selectedTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (selectedTool === "rectangle" || selectedTool === "circle") {
        // For shapes, we'll handle in mouseUp
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (selectedTool === "pencil" || selectedTool === "eraser") {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    lastPos.current = { x, y };
  };

  const handleMouseUp = () => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      if (selectedTool === "rectangle") {
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize[0];
        ctx.strokeRect(
          lastPos.current.x,
          lastPos.current.y,
          lastPos.current.x - lastPos.current.x,
          lastPos.current.y - lastPos.current.y,
        );
      } else if (selectedTool === "circle") {
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize[0];
        ctx.beginPath();
        const radius = Math.sqrt(
          Math.pow(lastPos.current.x - lastPos.current.x, 2) +
            Math.pow(lastPos.current.y - lastPos.current.y, 2),
        );
        ctx.arc(lastPos.current.x, lastPos.current.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Reset for next drawing
      ctx.globalCompositeOperation = "source-over";
      ctx.closePath();
    }

    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save current state to redo stack
    const currentState = canvas.toDataURL();
    setRedoStack([...redoStack, currentState]);

    // Pop the last state from undo stack
    const newUndoStack = [...undoStack];
    const lastState = newUndoStack.pop();
    setUndoStack(newUndoStack);

    if (lastState) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = lastState;
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save current state to undo stack
    const currentState = canvas.toDataURL();
    setUndoStack([...undoStack, currentState]);

    // Pop the last state from redo stack
    const newRedoStack = [...redoStack];
    const nextState = newRedoStack.pop();
    setRedoStack(newRedoStack);

    if (nextState) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = nextState;
    }
  };

  const handleClearCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Save current state for undo
      const currentState = canvas.toDataURL();
      setUndoStack([...undoStack, currentState]);
      setRedoStack([]);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="w-full h-[calc(100vh-72px)] bg-background flex relative">
      {/* Projects sidebar */}
      <div className="w-64 border-r border-border h-full flex flex-col">
        <div className="p-4 border-b border-border flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/")}
            className="mr-2 bg-blue-500 hover:bg-blue-600 text-white border-none"
          >
            <Home className="h-4 w-4 mr-2" />В сетку
          </Button>
          <Input
            type="search"
            placeholder="Поиск проектов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="project-width"
                        className="text-sm font-medium"
                      >
                        Ширина (px)
                      </label>
                      <Input
                        id="project-width"
                        type="number"
                        value={newProjectWidth}
                        onChange={(e) =>
                          setNewProjectWidth(parseInt(e.target.value) || 800)
                        }
                        min={100}
                        max={2000}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="project-height"
                        className="text-sm font-medium"
                      >
                        Высота (px)
                      </label>
                      <Input
                        id="project-height"
                        type="number"
                        value={newProjectHeight}
                        onChange={(e) =>
                          setNewProjectHeight(parseInt(e.target.value) || 600)
                        }
                        min={100}
                        max={2000}
                      />
                    </div>
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

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`p-2 rounded-md cursor-pointer ${currentProject?.id === project.id ? "bg-accent" : "hover:bg-accent/50"}`}
                onClick={() => setCurrentProject(project)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Image className="h-4 w-4 mr-2 text-blue-500" />
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
                      <DropdownMenuItem onClick={handleExportProject}>
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
                  {project.width} x {project.height} px
                </p>
                {project.thumbnail && (
                  <div className="mt-2 rounded overflow-hidden border border-border">
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="w-full h-auto"
                    />
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
                  {currentProject.width} x {currentProject.height} px •
                  Последнее обновление: {formatDate(currentProject.updatedAt)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Импорт/Экспорт
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportProject}>
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт как PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsImportingProject(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Импорт изображения
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <GitBranch className="h-4 w-4 mr-2" />
                      Загрузить с GitHub
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={handleSaveProject}>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Настройки
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Профиль пользователя
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Поделиться проектом
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsCollaborationPanelOpen(true)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Совместное редактирование
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Lock className="h-4 w-4 mr-2" />
                      {currentProject?.isPublic
                        ? "Сделать приватным"
                        : "Сделать публичным"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Import dialog */}
              {isImportingProject && (
                <Dialog
                  open={isImportingProject}
                  onOpenChange={setIsImportingProject}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Импорт изображения</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="import-url"
                          className="text-sm font-medium"
                        >
                          URL изображения
                        </label>
                        <Input
                          id="import-url"
                          value={importUrl}
                          onChange={(e) => setImportUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">или</p>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="import-file"
                          className="text-sm font-medium"
                        >
                          Загрузить с компьютера
                        </label>
                        <Input
                          id="import-file"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            // Handle file upload
                            const file = e.target.files?.[0];
                            if (file && currentProject && canvasRef.current) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = canvasRef.current;
                                  if (canvas) {
                                    const ctx = canvas.getContext("2d");
                                    if (ctx) {
                                      ctx.clearRect(
                                        0,
                                        0,
                                        canvas.width,
                                        canvas.height,
                                      );
                                      ctx.drawImage(
                                        img,
                                        0,
                                        0,
                                        canvas.width,
                                        canvas.height,
                                      );

                                      // Update active layer
                                      if (activeLayerId) {
                                        const updatedLayers = layers.map(
                                          (layer) => {
                                            if (layer.id === activeLayerId) {
                                              return {
                                                ...layer,
                                                data: canvas.toDataURL(
                                                  "image/png",
                                                ),
                                              };
                                            }
                                            return layer;
                                          },
                                        );
                                        setLayers(updatedLayers);

                                        // Update project
                                        const updatedProject = {
                                          ...currentProject,
                                          layers: updatedLayers,
                                        };
                                        setCurrentProject(updatedProject);
                                        setProjects(
                                          projects.map((p) =>
                                            p.id === currentProject.id
                                              ? updatedProject
                                              : p,
                                          ),
                                        );
                                      }
                                    }
                                  }
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                              setIsImportingProject(false);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsImportingProject(false)}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={() => {
                          // Import from URL
                          if (
                            importUrl &&
                            currentProject &&
                            canvasRef.current
                          ) {
                            const img = new Image();
                            img.crossOrigin = "anonymous";
                            img.onload = () => {
                              const canvas = canvasRef.current;
                              if (canvas) {
                                const ctx = canvas.getContext("2d");
                                if (ctx) {
                                  ctx.clearRect(
                                    0,
                                    0,
                                    canvas.width,
                                    canvas.height,
                                  );
                                  ctx.drawImage(
                                    img,
                                    0,
                                    0,
                                    canvas.width,
                                    canvas.height,
                                  );

                                  // Update active layer
                                  if (activeLayerId) {
                                    const updatedLayers = layers.map(
                                      (layer) => {
                                        if (layer.id === activeLayerId) {
                                          return {
                                            ...layer,
                                            data: canvas.toDataURL("image/png"),
                                          };
                                        }
                                        return layer;
                                      },
                                    );
                                    setLayers(updatedLayers);

                                    // Update project
                                    const updatedProject = {
                                      ...currentProject,
                                      layers: updatedLayers,
                                    };
                                    setCurrentProject(updatedProject);
                                    setProjects(
                                      projects.map((p) =>
                                        p.id === currentProject.id
                                          ? updatedProject
                                          : p,
                                      ),
                                    );
                                  }
                                }
                              }
                            };
                            img.onerror = () => {
                              alert(
                                "Не удалось загрузить изображение по указанному URL",
                              );
                            };
                            img.src = importUrl;
                            setIsImportingProject(false);
                            setImportUrl("");
                          }
                        }}
                        disabled={!importUrl}
                      >
                        Импортировать
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Toolbar */}
            <div className="p-2 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Button
                  variant={selectedTool === "pencil" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setSelectedTool("pencil")}
                  title="Карандаш"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedTool === "eraser" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setSelectedTool("eraser")}
                  title="Ластик"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedTool === "rectangle" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setSelectedTool("rectangle")}
                  title="Прямоугольник"
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedTool === "circle" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setSelectedTool("circle")}
                  title="Круг"
                >
                  <Circle className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedTool === "text" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setSelectedTool("text")}
                  title="Текст"
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Brush selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Palette className="h-4 w-4 mr-1" />
                      Кисти
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {brushes.map((brush) => (
                      <DropdownMenuItem
                        key={brush.id}
                        onClick={() => {
                          setActiveBrushId(brush.id);
                          setBrushSize([brush.size]);
                          setBrushOpacity([brush.opacity]);
                          setBrushHardness([brush.hardness]);
                        }}
                        className={
                          activeBrushId === brush.id ? "bg-accent" : ""
                        }
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 mr-2 rounded-full ${brush.type === "square" ? "rounded-sm" : "rounded-full"}`}
                            style={{ backgroundColor: brush.color }}
                          />
                          {brush.name}
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                      onClick={() => setShowBrushesPanel(!showBrushesPanel)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Управление кистями
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="brush-color"
                    className="text-xs text-muted-foreground"
                  >
                    Цвет:
                  </label>
                  <input
                    id="brush-color"
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="brush-size"
                    className="text-xs text-muted-foreground"
                  >
                    Размер:
                  </label>
                  <Slider
                    id="brush-size"
                    value={brushSize}
                    onValueChange={setBrushSize}
                    min={1}
                    max={50}
                    step={1}
                    className="w-24"
                  />
                  <span className="text-xs">{brushSize[0]}px</span>
                </div>

                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="brush-opacity"
                    className="text-xs text-muted-foreground"
                  >
                    Прозрачность:
                  </label>
                  <Slider
                    id="brush-opacity"
                    value={brushOpacity}
                    onValueChange={setBrushOpacity}
                    min={1}
                    max={100}
                    step={1}
                    className="w-24"
                  />
                  <span className="text-xs">{brushOpacity[0]}%</span>
                </div>

                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="brush-hardness"
                    className="text-xs text-muted-foreground"
                  >
                    Жесткость:
                  </label>
                  <Slider
                    id="brush-hardness"
                    value={brushHardness}
                    onValueChange={setBrushHardness}
                    min={0}
                    max={100}
                    step={1}
                    className="w-24"
                  />
                  <span className="text-xs">{brushHardness[0]}%</span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLayersPanel(!showLayersPanel)}
                  className="flex items-center"
                >
                  <Layers className="h-4 w-4 mr-1" />
                  Слои
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  title="Отменить"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  title="Повторить"
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCanvas}
                  title="Очистить холст"
                >
                  Очистить
                </Button>
              </div>
            </div>

            {/* Canvas area with layers panel */}
            <div className="flex-1 overflow-auto flex bg-gray-100 dark:bg-gray-800">
              {/* Layers panel */}
              {showLayersPanel && (
                <div className="w-64 bg-background border-r border-border">
                  <div className="p-2 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-medium">Слои</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        // Add new layer
                        if (!currentProject) return;

                        const newLayer: Layer = {
                          id: Date.now().toString(),
                          name: `Слой ${layers.length + 1}`,
                          visible: true,
                          locked: false,
                          opacity: 100,
                          data: "",
                          zIndex: layers.length,
                        };

                        const updatedLayers = [...layers, newLayer];
                        setLayers(updatedLayers);
                        setActiveLayerId(newLayer.id);

                        // Update project
                        const updatedProject = {
                          ...currentProject,
                          layers: updatedLayers,
                        };
                        setCurrentProject(updatedProject);
                        setProjects(
                          projects.map((p) =>
                            p.id === currentProject.id ? updatedProject : p,
                          ),
                        );
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <ScrollArea className="h-[calc(100%-36px)]">
                    <div className="p-2 space-y-1">
                      {layers
                        .sort((a, b) => b.zIndex - a.zIndex)
                        .map((layer) => (
                          <div
                            key={layer.id}
                            className={`p-2 rounded-md ${activeLayerId === layer.id ? "bg-accent" : "hover:bg-accent/50"} ${!layer.visible ? "opacity-50" : ""}`}
                            onClick={() => setActiveLayerId(layer.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 mr-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Toggle visibility
                                    const updatedLayers = layers.map((l) => {
                                      if (l.id === layer.id) {
                                        return { ...l, visible: !l.visible };
                                      }
                                      return l;
                                    });
                                    setLayers(updatedLayers);

                                    // Update project
                                    if (currentProject) {
                                      const updatedProject = {
                                        ...currentProject,
                                        layers: updatedLayers,
                                      };
                                      setCurrentProject(updatedProject);
                                      setProjects(
                                        projects.map((p) =>
                                          p.id === currentProject.id
                                            ? updatedProject
                                            : p,
                                        ),
                                      );
                                    }
                                  }}
                                >
                                  {layer.visible ? (
                                    <Eye className="h-3 w-3" />
                                  ) : (
                                    <EyeOff className="h-3 w-3" />
                                  )}
                                </Button>
                                <span className="text-sm truncate">
                                  {layer.name}
                                </span>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Settings className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // Toggle lock
                                      const updatedLayers = layers.map((l) => {
                                        if (l.id === layer.id) {
                                          return { ...l, locked: !l.locked };
                                        }
                                        return l;
                                      });
                                      setLayers(updatedLayers);

                                      // Update project
                                      if (currentProject) {
                                        const updatedProject = {
                                          ...currentProject,
                                          layers: updatedLayers,
                                        };
                                        setCurrentProject(updatedProject);
                                        setProjects(
                                          projects.map((p) =>
                                            p.id === currentProject.id
                                              ? updatedProject
                                              : p,
                                          ),
                                        );
                                      }
                                    }}
                                  >
                                    {layer.locked
                                      ? "Разблокировать"
                                      : "Заблокировать"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // Move layer up
                                      if (layer.zIndex < layers.length - 1) {
                                        const updatedLayers = layers.map(
                                          (l) => {
                                            if (l.id === layer.id) {
                                              return {
                                                ...l,
                                                zIndex: l.zIndex + 1,
                                              };
                                            } else if (
                                              l.zIndex ===
                                              layer.zIndex + 1
                                            ) {
                                              return {
                                                ...l,
                                                zIndex: l.zIndex - 1,
                                              };
                                            }
                                            return l;
                                          },
                                        );
                                        setLayers(updatedLayers);

                                        // Update project
                                        if (currentProject) {
                                          const updatedProject = {
                                            ...currentProject,
                                            layers: updatedLayers,
                                          };
                                          setCurrentProject(updatedProject);
                                          setProjects(
                                            projects.map((p) =>
                                              p.id === currentProject.id
                                                ? updatedProject
                                                : p,
                                            ),
                                          );
                                        }
                                      }
                                    }}
                                  >
                                    Переместить выше
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // Move layer down
                                      if (layer.zIndex > 0) {
                                        const updatedLayers = layers.map(
                                          (l) => {
                                            if (l.id === layer.id) {
                                              return {
                                                ...l,
                                                zIndex: l.zIndex - 1,
                                              };
                                            } else if (
                                              l.zIndex ===
                                              layer.zIndex - 1
                                            ) {
                                              return {
                                                ...l,
                                                zIndex: l.zIndex + 1,
                                              };
                                            }
                                            return l;
                                          },
                                        );
                                        setLayers(updatedLayers);

                                        // Update project
                                        if (currentProject) {
                                          const updatedProject = {
                                            ...currentProject,
                                            layers: updatedLayers,
                                          };
                                          setCurrentProject(updatedProject);
                                          setProjects(
                                            projects.map((p) =>
                                              p.id === currentProject.id
                                                ? updatedProject
                                                : p,
                                            ),
                                          );
                                        }
                                      }
                                    }}
                                  >
                                    Переместить ниже
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // Delete layer (if not the only one)
                                      if (layers.length > 1) {
                                        const updatedLayers = layers.filter(
                                          (l) => l.id !== layer.id,
                                        );
                                        setLayers(updatedLayers);

                                        // Set active layer to the first one if deleting active layer
                                        if (activeLayerId === layer.id) {
                                          setActiveLayerId(updatedLayers[0].id);
                                        }

                                        // Update project
                                        if (currentProject) {
                                          const updatedProject = {
                                            ...currentProject,
                                            layers: updatedLayers,
                                          };
                                          setCurrentProject(updatedProject);
                                          setProjects(
                                            projects.map((p) =>
                                              p.id === currentProject.id
                                                ? updatedProject
                                                : p,
                                            ),
                                          );
                                        }
                                      }
                                    }}
                                    className="text-red-500"
                                  >
                                    Удалить слой
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Layer opacity slider */}
                            <div className="mt-1 flex items-center">
                              <span className="text-xs mr-2 w-16">
                                Прозрачность:
                              </span>
                              <Slider
                                value={[layer.opacity]}
                                onValueChange={(value) => {
                                  // Update layer opacity
                                  const updatedLayers = layers.map((l) => {
                                    if (l.id === layer.id) {
                                      return { ...l, opacity: value[0] };
                                    }
                                    return l;
                                  });
                                  setLayers(updatedLayers);

                                  // Update project
                                  if (currentProject) {
                                    const updatedProject = {
                                      ...currentProject,
                                      layers: updatedLayers,
                                    };
                                    setCurrentProject(updatedProject);
                                    setProjects(
                                      projects.map((p) =>
                                        p.id === currentProject.id
                                          ? updatedProject
                                          : p,
                                      ),
                                    );
                                  }
                                }}
                                min={0}
                                max={100}
                                step={1}
                                className="w-24"
                              />
                              <span className="text-xs ml-2">
                                {layer.opacity}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Brushes panel */}
              {showBrushesPanel && (
                <div className="absolute right-4 top-20 w-80 bg-background border border-border rounded-md shadow-lg z-10">
                  <div className="p-2 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-medium">Управление кистями</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowBrushesPanel(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Доступные кисти</h4>
                      {brushes.map((brush) => (
                        <div
                          key={brush.id}
                          className={`p-2 rounded-md ${activeBrushId === brush.id ? "bg-accent" : "hover:bg-accent/50"}`}
                          onClick={() => {
                            setActiveBrushId(brush.id);
                            setBrushSize([brush.size]);
                            setBrushOpacity([brush.opacity]);
                            setBrushHardness([brush.hardness]);
                            setBrushColor(brush.color);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div
                                className={`w-6 h-6 mr-2 ${brush.type === "square" ? "rounded-sm" : "rounded-full"}`}
                                style={{ backgroundColor: brush.color }}
                              />
                              <span>{brush.name}</span>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {brush.size}px, {brush.opacity}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Сохранить текущую кисть
                      </h4>
                      <Input
                        placeholder="Название кисти"
                        className="mb-2"
                        value={
                          activeBrushId
                            ? brushes.find((b) => b.id === activeBrushId)
                                ?.name || ""
                            : ""
                        }
                        onChange={(e) => {
                          // Update brush name
                          if (activeBrushId) {
                            const updatedBrushes = brushes.map((b) => {
                              if (b.id === activeBrushId) {
                                return { ...b, name: e.target.value };
                              }
                              return b;
                            });
                            setBrushes(updatedBrushes);
                          }
                        }}
                      />
                      <Button
                        className="w-full"
                        onClick={() => {
                          // Save current brush settings as a new brush
                          const newBrush: Brush = {
                            id: Date.now().toString(),
                            name: `Новая кисть ${brushes.length + 1}`,
                            size: brushSize[0],
                            opacity: brushOpacity[0],
                            hardness: brushHardness[0],
                            color: brushColor,
                            type: "round",
                          };

                          setBrushes([...brushes, newBrush]);
                          setActiveBrushId(newBrush.id);
                        }}
                      >
                        Сохранить как новую кисть
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Canvas */}
              <div className="flex-1 p-4 flex items-center justify-center">
                <div className="relative bg-white shadow-md">
                  <canvas
                    ref={canvasRef}
                    width={currentProject.width}
                    height={currentProject.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="cursor-crosshair"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Image className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
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
        projectType="graphic"
        currentFile={currentProject?.name}
      />
    </div>
  );
};

export default GraphicEditor;
