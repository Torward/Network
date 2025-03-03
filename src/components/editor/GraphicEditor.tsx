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
import { Slider } from "@/components/ui/slider";
import {
  Save,
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
  Square,
  Circle,
  Triangle,
  Hexagon,
  Star,
  Type,
  Image,
  Palette,
  Scissors,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  PenTool,
  Eraser,
  Pipette,
  Grid,
  Ruler,
  Crop,
  Share2,
  Lock,
  Unlock,
  Group,
  Ungroup,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Edit,
  MousePointer,
  Maximize,
  Magnet,
  Clipboard,
  Eye,
  EyeOff,
  MoreVertical,
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import CollaborationPanel from "./CollaborationPanel";

interface GraphicProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  width: number;
  height: number;
  layers: Layer[];
  elements: GraphicElement[];
  background: string;
  tags: string[];
  userId?: string;
  isPublic?: boolean;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  elements: string[]; // IDs of elements in this layer
}

interface GraphicElement {
  id: string;
  type: "rect" | "circle" | "triangle" | "path" | "text" | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: { x: number; y: number }[];
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  rotation?: number;
  imageUrl?: string;
  layerId: string;
  zIndex: number;
  locked?: boolean;
}

const GraphicEditor = () => {
  const [projects, setProjects] = useState<GraphicProject[]>([]);
  const [currentProject, setCurrentProject] = useState<GraphicProject | null>(
    null,
  );
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectWidth, setNewProjectWidth] = useState(800);
  const [newProjectHeight, setNewProjectHeight] = useState(600);
  const [newProjectTags, setNewProjectTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [currentTool, setCurrentTool] = useState<
    | "select"
    | "rectangle"
    | "circle"
    | "triangle"
    | "pen"
    | "text"
    | "image"
    | "eraser"
    | "pipette"
    | "move"
  >("select");
  const [zoom, setZoom] = useState([1]);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [fillColor, setFillColor] = useState("#3b82f6");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState([2]);
  const [fontSize, setFontSize] = useState([16]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>(
    [],
  );
  const [isAddingText, setIsAddingText] = useState(false);
  const [newText, setNewText] = useState("");
  const [isImportingImage, setIsImportingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [lastOpenedProjectId, setLastOpenedProjectId] = useState<string | null>(
    null,
  );
  const [isCollaborationPanelOpen, setIsCollaborationPanelOpen] =
    useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

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
    const savedProjects = localStorage.getItem("graphicProjects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    // Load last opened project
    const lastProjectId = localStorage.getItem("lastOpenedGraphicProject");
    if (lastProjectId && savedProjects) {
      const projectsList = JSON.parse(savedProjects);
      const lastProject = projectsList.find(
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

  // Update last opened project
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem("lastOpenedGraphicProject", currentProject.id);
      setLastOpenedProjectId(currentProject.id);
    }
  }, [currentProject]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const tags = newProjectTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const newProject: GraphicProject = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      width: newProjectWidth,
      height: newProjectHeight,
      layers: [
        {
          id: "layer-1",
          name: "Layer 1",
          visible: true,
          locked: false,
          opacity: 1,
          elements: [],
        },
      ],
      elements: [],
      background: "#ffffff",
      tags,
      userId: "current-user",
      isPublic: false,
    };

    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setIsCreatingProject(false);
    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectWidth(800);
    setNewProjectHeight(600);
    setNewProjectTags("");
  };

  const handleSaveProject = () => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(
      (project) => project.id !== projectId,
    );
    setProjects(updatedProjects);

    if (currentProject && currentProject.id === projectId) {
      setCurrentProject(null);
    }
  };

  const handleExportProject = () => {
    if (!currentProject) return;

    // In a real app, this would create an image from the canvas
    // For this demo, we'll just export the project data as JSON
    const projectData = JSON.stringify(currentProject, null, 2);
    const blob = new Blob([projectData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentProject.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddElement = (type: GraphicElement["type"]) => {
    if (!currentProject) return;

    // Find the first visible and unlocked layer
    const activeLayer = currentProject.layers.find(
      (layer) => layer.visible && !layer.locked,
    );

    if (!activeLayer) {
      alert("No active layer available. Please create or unlock a layer.");
      return;
    }

    // Calculate center of the visible canvas
    const canvasCenter = {
      x: currentProject.width / 2,
      y: currentProject.height / 2,
    };

    // Create a new element based on the type
    const newElement: GraphicElement = {
      id: `element-${Date.now()}`,
      type,
      x: canvasCenter.x - 50,
      y: canvasCenter.y - 50,
      width: 100,
      height: 100,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth[0],
      opacity: 1,
      rotation: 0,
      layerId: activeLayer.id,
      zIndex: currentProject.elements.length,
    };

    // Customize element based on type
    if (type === "circle") {
      newElement.radius = 50;
      delete newElement.width;
      delete newElement.height;
    } else if (type === "triangle") {
      newElement.points = [
        { x: canvasCenter.x, y: canvasCenter.y - 50 },
        { x: canvasCenter.x - 50, y: canvasCenter.y + 50 },
        { x: canvasCenter.x + 50, y: canvasCenter.y + 50 },
      ];
      delete newElement.width;
      delete newElement.height;
    } else if (type === "text") {
      newElement.text = "Двойной клик для редактирования";
      newElement.fontFamily = fontFamily;
      newElement.fontSize = fontSize[0];
      newElement.fontWeight = "normal";
      newElement.fontStyle = "normal";
      newElement.textDecoration = "none";
    } else if (type === "image") {
      newElement.imageUrl =
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop";
    }

    // Add the new element to the project
    const updatedElements = [...currentProject.elements, newElement];

    // Add the element ID to the active layer
    const updatedLayers = currentProject.layers.map((layer) =>
      layer.id === activeLayer.id
        ? {
            ...layer,
            elements: [...layer.elements, newElement.id],
          }
        : layer,
    );

    const updatedProject = {
      ...currentProject,
      elements: updatedElements,
      layers: updatedLayers,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
    setSelectedElements([newElement.id]);
  };

  const handleDeleteElement = () => {
    if (!currentProject || selectedElements.length === 0) return;

    // Remove elements from the project
    const updatedElements = currentProject.elements.filter(
      (element) => !selectedElements.includes(element.id),
    );

    // Remove element IDs from layers
    const updatedLayers = currentProject.layers.map((layer) => ({
      ...layer,
      elements: layer.elements.filter(
        (elementId) => !selectedElements.includes(elementId),
      ),
    }));

    const updatedProject = {
      ...currentProject,
      elements: updatedElements,
      layers: updatedLayers,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
    setSelectedElements([]);
  };

  const handleAddLayer = () => {
    if (!currentProject) return;

    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${currentProject.layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      elements: [],
    };

    const updatedLayers = [...currentProject.layers, newLayer];

    const updatedProject = {
      ...currentProject,
      layers: updatedLayers,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
  };

  const handleToggleLayerVisibility = (layerId: string) => {
    if (!currentProject) return;

    const updatedLayers = currentProject.layers.map((layer) =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer,
    );

    const updatedProject = {
      ...currentProject,
      layers: updatedLayers,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
  };

  const handleToggleLayerLock = (layerId: string) => {
    if (!currentProject) return;

    const updatedLayers = currentProject.layers.map((layer) =>
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer,
    );

    const updatedProject = {
      ...currentProject,
      layers: updatedLayers,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
  };

  const handleLayerOpacityChange = (layerId: string, opacity: number) => {
    if (!currentProject) return;

    const updatedLayers = currentProject.layers.map((layer) =>
      layer.id === layerId ? { ...layer, opacity } : layer,
    );

    const updatedProject = {
      ...currentProject,
      layers: updatedLayers,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
  };

  const handleMoveLayer = (layerId: string, direction: "up" | "down") => {
    if (!currentProject) return;

    const layerIndex = currentProject.layers.findIndex(
      (layer) => layer.id === layerId,
    );
    if (layerIndex === -1) return;

    const newIndex =
      direction === "up"
        ? Math.min(layerIndex + 1, currentProject.layers.length - 1)
        : Math.max(layerIndex - 1, 0);

    if (newIndex === layerIndex) return;

    const updatedLayers = [...currentProject.layers];
    const [movedLayer] = updatedLayers.splice(layerIndex, 1);
    updatedLayers.splice(newIndex, 0, movedLayer);

    const updatedProject = {
      ...currentProject,
      layers: updatedLayers,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
  };

  const handleRenameLayer = (layerId: string, newName: string) => {
    if (!currentProject || !newName.trim()) return;

    const updatedLayers = currentProject.layers.map((layer) =>
      layer.id === layerId ? { ...layer, name: newName } : layer,
    );

    const updatedProject = {
      ...currentProject,
      layers: updatedLayers,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
  };

  const handleDeleteLayer = (layerId: string) => {
    if (!currentProject) return;

    // Don't delete the last layer
    if (currentProject.layers.length <= 1) {
      alert("Cannot delete the last layer.");
      return;
    }

    // Get element IDs in this layer
    const layerToDelete = currentProject.layers.find(
      (layer) => layer.id === layerId,
    );
    if (!layerToDelete) return;

    // Remove elements from the project
    const updatedElements = currentProject.elements.filter(
      (element) => !layerToDelete.elements.includes(element.id),
    );

    // Remove the layer
    const updatedLayers = currentProject.layers.filter(
      (layer) => layer.id !== layerId,
    );

    const updatedProject = {
      ...currentProject,
      elements: updatedElements,
      layers: updatedLayers,
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((project) =>
        project.id === currentProject.id ? updatedProject : project,
      ),
    );
    setCurrentProject(updatedProject);
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
                        max={3000}
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
                        max={3000}
                      />
                    </div>
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
                      placeholder="графика, дизайн, логотип"
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
                    <Palette className="h-4 w-4 mr-2 text-blue-500" />
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
                  {formatDate(project.updatedAt)}
                </p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>
                    {project.width} × {project.height}px
                  </span>
                  <span className="mx-1">•</span>
                  <span>{project.layers.length} слоев</span>
                </div>
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
                  {currentProject.width} × {currentProject.height}px • Последнее
                  обновление: {formatDate(currentProject.updatedAt)}
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
                  onClick={handleExportProject}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт
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

            {/* Main toolbar */}
            <div className="border-b border-border">
              <div className="p-2 flex items-center space-x-1 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8">
                      <File className="h-4 w-4 mr-1" />
                      Файл
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => setIsCreatingProject(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Новый проект
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSaveProject}>
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportProject}>
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Поделиться
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Edit className="h-4 w-4 mr-1" />
                      Правка
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Undo className="h-4 w-4 mr-2" />
                      Отменить
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Redo className="h-4 w-4 mr-2" />
                      Повторить
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Копировать
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Scissors className="h-4 w-4 mr-2" />
                      Вырезать
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Clipboard className="h-4 w-4 mr-2" />
                      Вставить
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDeleteElement}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Eye className="h-4 w-4 mr-1" />
                      Вид
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setShowGrid(!showGrid)}>
                      <Grid className="h-4 w-4 mr-2" />
                      {showGrid ? "Скрыть сетку" : "Показать сетку"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowRulers(!showRulers)}
                    >
                      <Ruler className="h-4 w-4 mr-2" />
                      {showRulers ? "Скрыть линейки" : "Показать линейки"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSnapToGrid(!snapToGrid)}
                    >
                      <Magnet className="h-4 w-4 mr-2" />
                      {snapToGrid
                        ? "Отключить привязку к сетке"
                        : "Включить привязку к сетке"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setZoom([Math.max(0.25, zoom[0] - 0.25)])}
                    >
                      <ZoomOut className="h-4 w-4 mr-2" />
                      Уменьшить
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setZoom([Math.min(3, zoom[0] + 0.25)])}
                    >
                      <ZoomIn className="h-4 w-4 mr-2" />
                      Увеличить
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setZoom([1])}>
                      <Maximize className="h-4 w-4 mr-2" />
                      Сбросить масштаб (100%)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
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
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Layers className="h-4 w-4 mr-1" />
                      Слои
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleAddLayer}>
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить слой
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Group className="h-4 w-4 mr-2" />
                      Группировать слои
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Ungroup className="h-4 w-4 mr-2" />
                      Разгруппировать слои
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Переместить вверх
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowDown className="h-4 w-4 mr-2" />
                      Переместить вниз
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-8 mx-2" />

                <div className="flex items-center space-x-1">
                  <Button
                    variant={currentTool === "select" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentTool("select")}
                    title="Выделение"
                  >
                    <MousePointer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentTool === "move" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentTool("move")}
                    title="Перемещение"
                  >
                    <Move className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentTool === "rectangle" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentTool("rectangle")}
                    title="Прямоугольник"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentTool === "circle" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentTool("circle")}
                    title="Круг"
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentTool === "triangle" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentTool("triangle")}
                    title="Треугольник"
                  >
                    <Triangle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentTool === "pen" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentTool("pen")}
                    title="Перо"
                  >
                    <PenTool className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentTool === "text" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentTool("text")}
                    title="Текст"
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentTool === "image" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentTool("image")}
                    title="Изображение"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentTool === "eraser" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentTool("eraser")}
                    title="Ластик"
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentTool === "pipette" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentTool("pipette")}
                    title="Пипетка"
                  >
                    <Pipette className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-8 mx-2" />

                <div className="flex items-center space-x-2">
                  <div className="flex flex-col">
                    <label className="text-xs text-muted-foreground">
                      Заливка
                    </label>
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-6 h-6 rounded border border-border cursor-pointer"
                        style={{ backgroundColor: fillColor }}
                        onClick={() => {
                          // Open color picker
                        }}
                      />
                      <Input
                        type="text"
                        value={fillColor}
                        onChange={(e) => setFillColor(e.target.value)}
                        className="w-20 h-6 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs text-muted-foreground">
                      Обводка
                    </label>
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-6 h-6 rounded border border-border cursor-pointer"
                        style={{ backgroundColor: strokeColor }}
                        onClick={() => {
                          // Open color picker
                        }}
                      />
                      <Input
                        type="text"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="w-20 h-6 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs text-muted-foreground">
                      Толщина
                    </label>
                    <Slider
                      value={strokeWidth}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={setStrokeWidth}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas area with layers panel */}
            <div
              className={`flex-1 overflow-auto flex bg-gray-100 dark:bg-gray-800 ${isFullScreen ? "fixed inset-0 z-50" : ""}`}
            >
              {isFullScreen && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 z-50"
                  onClick={() => setIsFullScreen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {/* Layers panel */}
              <div className="w-64 bg-background border-r border-border">
                <div className="p-2 border-b border-border flex justify-between items-center">
                  <h3 className="text-sm font-medium">Слои</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleAddLayer}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100%-36px)]">
                  <div className="p-2 space-y-1">
                    {currentProject.layers.map((layer, index) => (
                      <div
                        key={layer.id}
                        className="p-2 rounded-md border border-border bg-card hover:bg-accent/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() =>
                                handleToggleLayerVisibility(layer.id)
                              }
                            >
                              {layer.visible ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <EyeOff className="h-3 w-3" />
                              )}
                            </Button>
                            <span className="text-sm">{layer.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleToggleLayerLock(layer.id)}
                            >
                              {layer.locked ? (
                                <Lock className="h-3 w-3" />
                              ) : (
                                <Unlock className="h-3 w-3" />
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleMoveLayer(layer.id, "up")
                                  }
                                >
                                  <ArrowUp className="h-4 w-4 mr-2" />
                                  Переместить вверх
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleMoveLayer(layer.id, "down")
                                  }
                                >
                                  <ArrowDown className="h-4 w-4 mr-2" />
                                  Переместить вниз
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    const newName = prompt(
                                      "Введите новое имя слоя:",
                                      layer.name,
                                    );
                                    if (newName) {
                                      handleRenameLayer(layer.id, newName);
                                    }
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Переименовать
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteLayer(layer.id)}
                                  className="text-red-500"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Удалить
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="mt-1">
                          <label className="text-xs text-muted-foreground">
                            Прозрачность: {Math.round(layer.opacity * 100)}%
                          </label>
                          <Slider
                            value={[layer.opacity]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={(value) =>
                              handleLayerOpacityChange(layer.id, value[0])
                            }
                          />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {layer.elements.length} элементов
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Canvas */}
              <div className="flex-1 relative overflow-auto">
                {/* Rulers */}
                {showRulers && (
                  <>
                    <div className="absolute top-0 left-0 w-full h-6 bg-background border-b border-border z-10">
                      {/* Horizontal ruler */}
                    </div>
                    <div className="absolute top-0 left-0 w-6 h-full bg-background border-r border-border z-10">
                      {/* Vertical ruler */}
                    </div>
                    <div className="absolute top-0 left-0 w-6 h-6 bg-background border-r border-b border-border z-20">
                      {/* Ruler corner */}
                    </div>
                  </>
                )}

                {/* Canvas content */}
                <div
                  className="relative"
                  style={{
                    marginTop: showRulers ? "1.5rem" : 0,
                    marginLeft: showRulers ? "1.5rem" : 0,
                    padding: "2rem",
                  }}
                >
                  <div
                    ref={canvasRef}
                    className="relative bg-white shadow-md"
                    style={{
                      width: currentProject.width,
                      height: currentProject.height,
                      transform: `scale(${zoom[0]})`,
                      transformOrigin: "0 0",
                    }}
                  >
                    {/* Grid */}
                    {showGrid && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
                          backgroundSize: `${gridSize}px ${gridSize}px`,
                        }}
                      />
                    )}

                    {/* Render elements */}
                    {currentProject.layers.map((layer) => {
                      if (!layer.visible) return null;

                      // Get elements for this layer
                      const layerElements = currentProject.elements.filter(
                        (element) => element.layerId === layer.id,
                      );

                      return layerElements.map((element) => {
                        // Determine if element is selected
                        const isSelected = selectedElements.includes(
                          element.id,
                        );

                        // Render element based on type
                        let elementJsx;

                        switch (element.type) {
                          case "rect":
                            elementJsx = (
                              <div
                                className={`absolute ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                                style={{
                                  left: element.x,
                                  top: element.y,
                                  width: element.width,
                                  height: element.height,
                                  backgroundColor: element.fill,
                                  border: `${element.strokeWidth}px solid ${element.stroke}`,
                                  opacity: element.opacity * layer.opacity,
                                  transform: `rotate(${element.rotation}deg)`,
                                  pointerEvents: layer.locked ? "none" : "auto",
                                }}
                                onClick={() =>
                                  setSelectedElements([element.id])
                                }
                              />
                            );
                            break;

                          case "circle":
                            elementJsx = (
                              <div
                                className={`absolute rounded-full ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                                style={{
                                  left: element.x - element.radius,
                                  top: element.y - element.radius,
                                  width: element.radius * 2,
                                  height: element.radius * 2,
                                  backgroundColor: element.fill,
                                  border: `${element.strokeWidth}px solid ${element.stroke}`,
                                  opacity: element.opacity * layer.opacity,
                                  transform: `rotate(${element.rotation}deg)`,
                                  pointerEvents: layer.locked ? "none" : "auto",
                                }}
                                onClick={() =>
                                  setSelectedElements([element.id])
                                }
                              />
                            );
                            break;

                          case "text":
                            elementJsx = (
                              <div
                                className={`absolute ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                                style={{
                                  left: element.x,
                                  top: element.y,
                                  color: element.fill,
                                  fontFamily: element.fontFamily,
                                  fontSize: `${element.fontSize}px`,
                                  fontWeight: element.fontWeight,
                                  fontStyle: element.fontStyle,
                                  textDecoration: element.textDecoration,
                                  opacity: element.opacity * layer.opacity,
                                  transform: `rotate(${element.rotation}deg)`,
                                  pointerEvents: layer.locked ? "none" : "auto",
                                }}
                                onClick={() =>
                                  setSelectedElements([element.id])
                                }
                              >
                                {element.text}
                              </div>
                            );
                            break;

                          case "image":
                            elementJsx = (
                              <div
                                className={`absolute ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                                style={{
                                  left: element.x,
                                  top: element.y,
                                  width: element.width,
                                  height: element.height,
                                  opacity: element.opacity * layer.opacity,
                                  transform: `rotate(${element.rotation}deg)`,
                                  pointerEvents: layer.locked ? "none" : "auto",
                                }}
                                onClick={() =>
                                  setSelectedElements([element.id])
                                }
                              >
                                <img
                                  src={element.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                            break;

                          default:
                            elementJsx = null;
                        }

                        return (
                          <div key={element.id} className="absolute">
                            {elementJsx}
                          </div>
                        );
                      });
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Palette className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
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
