import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, Car
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState("pencil");
  const [brushSize, setBrushSize] = useState([5]);
  const [brushColor, setBrushColor] = useState("#000000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });

  // Load projects from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("graphicProjects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
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

      const ctx = canvas.getContext("2d");
      if (ctx && currentProject.canvasData) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = currentProject.canvasData;
      }

      // Clear undo/redo stacks
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [currentProject]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

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
    if (!currentProject || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasData = canvas.toDataURL("image/png");

    // Create a thumbnail (scaled down version)
    const thumbnailCanvas = document.createElement("canvas");
    thumbnailCanvas.width = 200;
    thumbnailCanvas.height = (200 * canvas.height) / canvas.width;
    const thumbnailCtx = thumbnailCanvas.getContext("2d");
    if (thumbnailCtx) {
      thumbnailCtx.drawImage(
        canvas,
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
      updatedAt: new Date().toISOString(),
    };

    setProjects(
      projects.map((p) => (p.id === currentProject.id ? updatedProject : p)),
    );
    setCurrentProject(updatedProject);
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
    if (!canvasRef.current) return;

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

    // Start drawing based on selected tool
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize[0];
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (selectedTool === "pencil") {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (selectedTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (selectedTool === "rectangle") {
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportProject}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveProject}>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </Button>
              </div>
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
              </div>

              <div className="flex items-center space-x-1">
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

            {/* Canvas area */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
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
    </div>
  );
};

export default GraphicEditor;
