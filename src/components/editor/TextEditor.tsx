import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Save,
  Plus,
  File,
  Settings,
  Download,
  Upload,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image,
  Home,
  Search,
  CheckSquare,
  Table,
  Type,
  PenTool,
  Palette,
  FileText,
  BookOpen,
  Printer,
  Share2,
  RotateCw,
  Columns,
  Highlighter,
  Paperclip,
  Undo,
  Redo,
  ChevronDown,
  X,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Sparkles,
  Spline,
  Pilcrow,
  Indent,
  Outdent,
  Superscript,
  Subscript,
  Quote,
  Code,
  User,
  Lock,
  GitBranch,
  MessageSquare,
  Users,
  Minus,
  Plus as PlusIcon,
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

interface TextDocument {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  format?: "plain" | "rich";
  styles?: DocumentStyles;
  comments?: DocumentComment[];
  revisions?: DocumentRevision[];
  tables?: Table[];
  userId?: string;
  isPublic?: boolean;
}

interface Table {
  id: string;
  rows: number;
  columns: number;
  data: string[][];
  position: number; // Position in the document
  styles?: TableStyles;
}

interface TableStyles {
  headerRow?: boolean;
  headerColumn?: boolean;
  striped?: boolean;
  bordered?: boolean;
  cellPadding?: number;
  width?: string; // percentage or pixels
  alignment?: "left" | "center" | "right";
}

interface DocumentStyles {
  fontFamily?: string;
  fontSize?: number;
  lineSpacing?: number;
  pageMargins?: { top: number; right: number; bottom: number; left: number };
  pageSize?: "A4" | "Letter" | "Legal";
  pageOrientation?: "portrait" | "landscape";
}

interface DocumentComment {
  id: string;
  author: string;
  text: string;
  position: { start: number; end: number };
  createdAt: string;
  resolved: boolean;
}

interface DocumentRevision {
  id: string;
  author: string;
  date: string;
  changes: string;
}

const TextEditor = () => {
  const [documents, setDocuments] = useState<TextDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<TextDocument | null>(
    null,
  );
  const [content, setContent] = useState("");
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const [newDocumentTags, setNewDocumentTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [viewMode, setViewMode] = useState<"edit" | "read">("edit");
  const [fontSize, setFontSize] = useState([12]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [lineSpacing, setLineSpacing] = useState([1.5]);
  const [showComments, setShowComments] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [isSpellCheckEnabled, setIsSpellCheckEnabled] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [pageLayout, setPageLayout] = useState<"web" | "print" | "book">("web");
  const [selectedText, setSelectedText] = useState({
    start: 0,
    end: 0,
    text: "",
  });
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [searchReplaceVisible, setSearchReplaceVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableRows, setNewTableRows] = useState(3);
  const [newTableColumns, setNewTableColumns] = useState(3);
  const [newTableStyles, setNewTableStyles] = useState<TableStyles>({
    headerRow: true,
    headerColumn: false,
    striped: false,
    bordered: true,
    cellPadding: 8,
    width: "100%",
    alignment: "left",
  });
  const [isImportingDocument, setIsImportingDocument] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [lastOpenedDocumentId, setLastOpenedDocumentId] = useState<
    string | null
  >(null);
  const [availableStyles, setAvailableStyles] = useState([
    {
      id: "1",
      name: "Заголовок 1",
      tag: "h1",
      fontSize: 24,
      fontWeight: "bold",
    },
    {
      id: "2",
      name: "Заголовок 2",
      tag: "h2",
      fontSize: 20,
      fontWeight: "bold",
    },
    {
      id: "3",
      name: "Заголовок 3",
      tag: "h3",
      fontSize: 18,
      fontWeight: "bold",
    },
    {
      id: "4",
      name: "Обычный текст",
      tag: "p",
      fontSize: 16,
      fontWeight: "normal",
    },
    {
      id: "5",
      name: "Цитата",
      tag: "blockquote",
      fontSize: 16,
      fontStyle: "italic",
    },
    { id: "6", name: "Код", tag: "pre", fontFamily: "monospace", fontSize: 14 },
  ]);
  const [activeStyleId, setActiveStyleId] = useState("4");
  const [isCollaborationPanelOpen, setIsCollaborationPanelOpen] =
    useState(false);

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

  // Load documents from localStorage on component mount
  useEffect(() => {
    const savedDocuments = localStorage.getItem("textDocuments");
    if (savedDocuments) {
      setDocuments(JSON.parse(savedDocuments));
    }

    // Load last opened document
    const lastDocId = localStorage.getItem("lastOpenedTextDocument");
    if (lastDocId && savedDocuments) {
      const docs = JSON.parse(savedDocuments);
      const lastDoc = docs.find((d: TextDocument) => d.id === lastDocId);
      if (lastDoc) {
        setCurrentDocument(lastDoc);
        setLastOpenedDocumentId(lastDocId);
      }
    }
  }, []);

  // Save documents to localStorage when they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem("textDocuments", JSON.stringify(documents));
    }
  }, [documents]);

  // Update content when current document changes
  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content);

      // Save as last opened document
      localStorage.setItem("lastOpenedTextDocument", currentDocument.id);
      setLastOpenedDocumentId(currentDocument.id);

      // Set document styles
      if (currentDocument.styles) {
        if (currentDocument.styles.fontSize) {
          setFontSize([currentDocument.styles.fontSize]);
        }
        if (currentDocument.styles.fontFamily) {
          setFontFamily(currentDocument.styles.fontFamily);
        }
        if (currentDocument.styles.lineSpacing) {
          setLineSpacing([currentDocument.styles.lineSpacing]);
        }
      }

      // Set comments
      if (currentDocument.comments) {
        setComments(currentDocument.comments);
      }
    } else {
      setContent("");
    }
  }, [currentDocument]);

  // Update word and character count when content changes
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;

    setWordCount(words);
    setCharCount(chars);

    // Auto-save content to current document
    if (currentDocument) {
      handleSaveDocument();
    }

    // Update comments positions if content changes
    if (currentDocument?.comments) {
      // This would adjust comment positions based on content changes in a real editor
      setComments(currentDocument.comments);
    }

    // Check for spelling errors (simplified simulation)
    if (isSpellCheckEnabled) {
      // In a real app, this would use a dictionary and more sophisticated checking
      // Here we just simulate finding some common typos
      const commonTypos = ["teh", "adn", "taht", "wiht", "becuase"];
      let hasTypos = false;

      commonTypos.forEach((typo) => {
        if (content.toLowerCase().includes(typo)) {
          hasTypos = true;
        }
      });

      // In a real app, we would mark these in the UI
    }
  }, [content]);

  // Handle text selection
  const handleTextSelection = () => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      setSelectedText({
        start,
        end,
        text: content.substring(start, end),
      });
    }
  };

  // Add a comment to the selected text
  const handleAddComment = () => {
    if (!currentDocument || !selectedText.text || !newComment.trim()) return;

    const comment: DocumentComment = {
      id: Date.now().toString(),
      author: "You",
      text: newComment,
      position: { start: selectedText.start, end: selectedText.end },
      createdAt: new Date().toISOString(),
      resolved: false,
    };

    const updatedComments = [...(currentDocument.comments || []), comment];

    const updatedDocument = {
      ...currentDocument,
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    };

    setDocuments(
      documents.map((doc) =>
        doc.id === currentDocument.id ? updatedDocument : doc,
      ),
    );

    setCurrentDocument(updatedDocument);
    setComments(updatedComments);
    setNewComment("");
    setIsAddingComment(false);
  };

  // Resolve a comment
  const handleResolveComment = (commentId: string) => {
    if (!currentDocument || !currentDocument.comments) return;

    const updatedComments = currentDocument.comments.map((comment) =>
      comment.id === commentId ? { ...comment, resolved: true } : comment,
    );

    const updatedDocument = {
      ...currentDocument,
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    };

    setDocuments(
      documents.map((doc) =>
        doc.id === currentDocument.id ? updatedDocument : doc,
      ),
    );

    setCurrentDocument(updatedDocument);
    setComments(updatedComments);
  };

  // Search and replace functionality
  const handleSearch = () => {
    if (!searchText.trim() || !content) return;

    const matches: number[] = [];
    let startIndex = 0;
    let index;

    while (
      (index = content
        .toLowerCase()
        .indexOf(searchText.toLowerCase(), startIndex)) > -1
    ) {
      matches.push(index);
      startIndex = index + searchText.length;
    }

    setSearchMatches(matches);
    setCurrentMatchIndex(matches.length > 0 ? 0 : -1);

    // Highlight the first match
    if (matches.length > 0) {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(matches[0], matches[0] + searchText.length);
      }
    }
  };

  // Navigate between search matches
  const navigateSearchMatch = (direction: "next" | "prev") => {
    if (searchMatches.length === 0) return;

    let newIndex;
    if (direction === "next") {
      newIndex = (currentMatchIndex + 1) % searchMatches.length;
    } else {
      newIndex =
        (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    }

    setCurrentMatchIndex(newIndex);

    // Highlight the match
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(
        searchMatches[newIndex],
        searchMatches[newIndex] + searchText.length,
      );
    }
  };

  // Replace current match or all matches
  const handleReplace = (replaceAll: boolean = false) => {
    if (searchMatches.length === 0 || !replaceText) return;

    if (replaceAll) {
      // Replace all occurrences
      const newContent = content.replace(
        new RegExp(searchText, "gi"),
        replaceText,
      );
      setContent(newContent);
      setSearchMatches([]);
      setCurrentMatchIndex(-1);
    } else if (currentMatchIndex >= 0) {
      // Replace only current match
      const before = content.substring(0, searchMatches[currentMatchIndex]);
      const after = content.substring(
        searchMatches[currentMatchIndex] + searchText.length,
      );
      const newContent = before + replaceText + after;

      setContent(newContent);

      // Update search matches after replacement
      handleSearch();
    }
  };

  const handleCreateDocument = () => {
    if (!newDocumentTitle.trim()) return;

    const tags = newDocumentTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const newDocument: TextDocument = {
      id: Date.now().toString(),
      title: newDocumentTitle,
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags,
      format: "rich",
      styles: {
        fontFamily: "Arial",
        fontSize: 12,
        lineSpacing: 1.5,
        pageMargins: { top: 2.54, right: 2.54, bottom: 2.54, left: 2.54 },
        pageSize: "A4",
        pageOrientation: "portrait",
      },
      comments: [],
      revisions: [
        {
          id: "1",
          author: "You",
          date: new Date().toISOString(),
          changes: "Document created",
        },
      ],
    };

    setDocuments([...documents, newDocument]);
    setCurrentDocument(newDocument);
    setIsCreatingDocument(false);
    setNewDocumentTitle("");
    setNewDocumentTags("");
  };

  const handleSaveDocument = () => {
    if (!currentDocument) return;

    const updatedDocument = {
      ...currentDocument,
      content,
      updatedAt: new Date().toISOString(),
    };

    setDocuments(
      documents.map((doc) =>
        doc.id === currentDocument.id ? updatedDocument : doc,
      ),
    );
    setCurrentDocument(updatedDocument);
  };

  const handleDeleteDocument = (documentId: string) => {
    const updatedDocuments = documents.filter((doc) => doc.id !== documentId);
    setDocuments(updatedDocuments);

    if (currentDocument && currentDocument.id === documentId) {
      setCurrentDocument(null);
      setContent("");
    }
  };

  const handleExportDocument = () => {
    if (!currentDocument) return;

    const blob = new Blob([currentDocument.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentDocument.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFormatText = (format: string) => {
    // This is a simplified implementation
    // In a real app, you would use a rich text editor library
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let formattedText = "";
    let cursorPosition = 0;

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        cursorPosition = 2;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        cursorPosition = 1;
        break;
      case "heading1":
        formattedText = `# ${selectedText}`;
        cursorPosition = 2;
        break;
      case "heading2":
        formattedText = `## ${selectedText}`;
        cursorPosition = 3;
        break;
      case "heading3":
        formattedText = `### ${selectedText}`;
        cursorPosition = 4;
        break;
      case "list":
        formattedText = `- ${selectedText}`;
        cursorPosition = 2;
        break;
      case "orderedList":
        formattedText = `1. ${selectedText}`;
        cursorPosition = 3;
        break;
      default:
        return;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    // Set cursor position after the formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorPosition,
        start + cursorPosition + selectedText.length,
      );
    }, 0);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesTitle = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTags = doc.tags.some((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return matchesTitle || matchesTags;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="w-full h-[calc(100vh-72px)] bg-background flex relative">
      {/* Documents sidebar */}
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
            placeholder="Поиск документов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Документы</h2>
            <Dialog
              open={isCreatingDocument}
              onOpenChange={setIsCreatingDocument}
            >
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать новый документ</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="document-title"
                      className="text-sm font-medium"
                    >
                      Название
                    </label>
                    <Input
                      id="document-title"
                      value={newDocumentTitle}
                      onChange={(e) => setNewDocumentTitle(e.target.value)}
                      placeholder="Мой документ"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="document-tags"
                      className="text-sm font-medium"
                    >
                      Теги (через запятую)
                    </label>
                    <Input
                      id="document-tags"
                      value={newDocumentTags}
                      onChange={(e) => setNewDocumentTags(e.target.value)}
                      placeholder="заметка, идея, проект"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingDocument(false)}
                  >
                    Отмена
                  </Button>
                  <Button onClick={handleCreateDocument}>Создать</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`p-2 rounded-md cursor-pointer ${currentDocument?.id === doc.id ? "bg-accent" : "hover:bg-accent/50"}`}
                onClick={() => setCurrentDocument(doc)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <File className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium truncate">
                      {doc.title}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportDocument}>
                        <Download className="h-4 w-4 mr-2" />
                        Экспорт
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(doc.updatedAt)}
                </p>
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {doc.tags.map((tag, index) => (
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

            {filteredDocuments.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                <p>{searchQuery ? "Документы не найдены" : "Нет документов"}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setIsCreatingDocument(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать документ
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {currentDocument ? (
          <>
            {/* Document header */}
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{currentDocument.title}</h2>
                <p className="text-xs text-muted-foreground">
                  Последнее обновление: {formatDate(currentDocument.updatedAt)}
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
                    <DropdownMenuItem onClick={handleExportDocument}>
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт как TXT
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsImportingDocument(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Импорт документа
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <GitBranch className="h-4 w-4 mr-2" />
                      Загрузить с GitHub
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDocument}
                >
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
                      Поделиться документом
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsCollaborationPanelOpen(true)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Совместное редактирование
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Lock className="h-4 w-4 mr-2" />
                      {currentDocument?.isPublic
                        ? "Сделать приватным"
                        : "Сделать публичным"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Import dialog */}
              {isImportingDocument && (
                <Dialog
                  open={isImportingDocument}
                  onOpenChange={setIsImportingDocument}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Импорт документа</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="import-url"
                          className="text-sm font-medium"
                        >
                          URL документа
                        </label>
                        <Input
                          id="import-url"
                          value={importUrl}
                          onChange={(e) => setImportUrl(e.target.value)}
                          placeholder="https://example.com/document.txt"
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
                          accept=".txt,.md,.html,.docx"
                          onChange={(e) => {
                            // Handle file upload
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const content = event.target?.result as string;

                                // Create new document from file
                                const newDocument: TextDocument = {
                                  id: Date.now().toString(),
                                  title: file.name.replace(/\.[^/.]+$/, ""),
                                  content: content,
                                  createdAt: new Date().toISOString(),
                                  updatedAt: new Date().toISOString(),
                                  tags: [],
                                  format: "plain",
                                  styles: {
                                    fontFamily: "Arial",
                                    fontSize: 12,
                                    lineSpacing: 1.5,
                                    pageMargins: {
                                      top: 2.54,
                                      right: 2.54,
                                      bottom: 2.54,
                                      left: 2.54,
                                    },
                                    pageSize: "A4",
                                    pageOrientation: "portrait",
                                  },
                                  comments: [],
                                  revisions: [
                                    {
                                      id: "1",
                                      author: "You",
                                      date: new Date().toISOString(),
                                      changes: "Document imported",
                                    },
                                  ],
                                  userId: "current-user",
                                  isPublic: false,
                                };

                                setDocuments([...documents, newDocument]);
                                setCurrentDocument(newDocument);
                                setIsImportingDocument(false);
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsImportingDocument(false)}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={() => {
                          // Import from URL
                          if (importUrl) {
                            fetch(importUrl)
                              .then((response) => response.text())
                              .then((content) => {
                                // Create new document from URL
                                const fileName =
                                  importUrl.split("/").pop() ||
                                  "Imported Document";
                                const newDocument: TextDocument = {
                                  id: Date.now().toString(),
                                  title: fileName.replace(/\.[^/.]+$/, ""),
                                  content: content,
                                  createdAt: new Date().toISOString(),
                                  updatedAt: new Date().toISOString(),
                                  tags: [],
                                  format: "plain",
                                  styles: {
                                    fontFamily: "Arial",
                                    fontSize: 12,
                                    lineSpacing: 1.5,
                                    pageMargins: {
                                      top: 2.54,
                                      right: 2.54,
                                      bottom: 2.54,
                                      left: 2.54,
                                    },
                                    pageSize: "A4",
                                    pageOrientation: "portrait",
                                  },
                                  comments: [],
                                  revisions: [
                                    {
                                      id: "1",
                                      author: "You",
                                      date: new Date().toISOString(),
                                      changes: "Document imported from URL",
                                    },
                                  ],
                                  userId: "current-user",
                                  isPublic: false,
                                };

                                setDocuments([...documents, newDocument]);
                                setCurrentDocument(newDocument);
                                setIsImportingDocument(false);
                                setImportUrl("");
                              })
                              .catch((error) => {
                                alert(
                                  "Не удалось загрузить документ по указанному URL: " +
                                    error.message,
                                );
                              });
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

            {/* Main toolbar */}
            <div className="border-b border-border">
              {/* File and view options */}
              <div className="p-1 border-b border-border flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7">
                        <FileText className="h-4 w-4 mr-1" />
                        Файл
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => setIsCreatingDocument(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Новый документ
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSaveDocument}>
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportDocument}>
                        <Download className="h-4 w-4 mr-2" />
                        Экспорт
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Printer className="h-4 w-4 mr-2" />
                        Печать
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Поделиться
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7">
                        <Type className="h-4 w-4 mr-1" />
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
                      <DropdownMenuItem
                        onClick={() => setSearchReplaceVisible(true)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Найти и заменить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Вид
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          setViewMode(viewMode === "edit" ? "read" : "edit")
                        }
                      >
                        {viewMode === "edit" ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Режим чтения
                          </>
                        ) : (
                          <>
                            <PenTool className="h-4 w-4 mr-2" />
                            Режим редактирования
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const layouts: ("web" | "print" | "book")[] = [
                            "web",
                            "print",
                            "book",
                          ];
                          const currentIndex = layouts.indexOf(pageLayout);
                          const nextIndex = (currentIndex + 1) % layouts.length;
                          setPageLayout(layouts[nextIndex]);
                        }}
                      >
                        {pageLayout === "web" ? (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Режим страницы A4
                          </>
                        ) : pageLayout === "print" ? (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Книжный разворот
                          </>
                        ) : (
                          <>
                            <Columns className="h-4 w-4 mr-2" />
                            Веб-режим
                          </>
                        )}
                      </DropdownMenuItem>
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
                      <DropdownMenuItem
                        onClick={() => setShowRuler(!showRuler)}
                      >
                        {showRuler ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Скрыть линейку
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Показать линейку
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7">
                        <Sparkles className="h-4 w-4 mr-1" />
                        Вставка
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Image className="h-4 w-4 mr-2" />
                        Изображение
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsAddingTable(true)}>
                        <Table className="h-4 w-4 mr-2" />
                        Таблица
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Spline className="h-4 w-4 mr-2" />
                        Фигура
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link className="h-4 w-4 mr-2" />
                        Ссылка
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Paperclip className="h-4 w-4 mr-2" />
                        Вложение
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Комментарии
                    {currentDocument?.comments &&
                      currentDocument.comments.length > 0 && (
                        <Badge className="ml-1">
                          {currentDocument.comments.length}
                        </Badge>
                      )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => setShowRevisions(!showRevisions)}
                  >
                    <RotateCw className="h-4 w-4 mr-1" />
                    История
                  </Button>
                </div>
              </div>

              {/* Formatting toolbar */}
              <div className="p-2 flex items-center space-x-1 flex-wrap">
                <div className="flex items-center space-x-1 mr-2">
                  <select
                    className="h-8 px-2 rounded-md border border-input bg-background text-xs"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>

                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs">{fontSize[0]}pt</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <PlusIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFormatText("bold")}
                  title="Полужирный"
                  className="h-8 w-8"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFormatText("italic")}
                  title="Курсив"
                  className="h-8 w-8"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFormatText("underline")}
                  title="Подчеркнутый"
                  className="h-8 w-8"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Выделение"
                  className="h-8 w-8"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFormatText("heading1")}
                  title="Заголовок 1"
                  className="h-8 w-8"
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFormatText("heading2")}
                  title="Заголовок 2"
                  className="h-8 w-8"
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFormatText("heading3")}
                  title="Заголовок 3"
                  className="h-8 w-8"
                >
                  <Heading3 className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  title="Выравнивание по левому краю"
                  className="h-8 w-8"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Выравнивание по центру"
                  className="h-8 w-8"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Выравнивание по правому краю"
                  className="h-8 w-8"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFormatText("list")}
                  title="Маркированный список"
                  className="h-8 w-8"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFormatText("orderedList")}
                  title="Нумерованный список"
                  className="h-8 w-8"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Уменьшить отступ"
                  className="h-8 w-8"
                >
                  <Outdent className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Увеличить отступ"
                  className="h-8 w-8"
                >
                  <Indent className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  title="Цитата"
                  className="h-8 w-8"
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Код"
                  className="h-8 w-8"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Надстрочный индекс"
                  className="h-8 w-8"
                >
                  <Superscript className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Подстрочный индекс"
                  className="h-8 w-8"
                >
                  <Subscript className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFormatText("link")}
                  title="Ссылка"
                  className="h-8 w-8"
                >
                  <Link className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFormatText("image")}
                  title="Изображение"
                  className="h-8 w-8"
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Таблица"
                  className="h-8 w-8"
                  onClick={() => setIsAddingTable(true)}
                >
                  <Table className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Добавить комментарий"
                  className="h-8 w-8"
                  onClick={() => {
                    handleTextSelection();
                    if (selectedText.text) {
                      setIsAddingComment(true);
                    }
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>

              {/* Search and replace panel */}
              {searchReplaceVisible && (
                <div className="p-2 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Найти и заменить</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSearchReplaceVisible(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Найти..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button size="sm" onClick={handleSearch} className="h-8">
                        <Search className="h-4 w-4 mr-1" />
                        Найти
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      <Input
                        placeholder="Заменить на..."
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleReplace()}
                        className="h-8"
                      >
                        Заменить
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReplace(true)}
                        className="h-8"
                      >
                        Заменить все
                      </Button>
                    </div>

                    {searchMatches.length > 0 && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Найдено совпадений: {searchMatches.length}</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => navigateSearchMatch("prev")}
                            disabled={searchMatches.length <= 1}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <span>
                            {currentMatchIndex + 1} из {searchMatches.length}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => navigateSearchMatch("next")}
                            disabled={searchMatches.length <= 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Editor area */}
            <div className="flex-1 flex">
              {/* Main editor */}
              <div className="flex-1 relative">
                {/* Ruler (if enabled) */}
                {showRuler && pageLayout !== "web" && (
                  <div className="h-6 border-b border-border flex items-end px-4">
                    <div className="w-full h-4 relative">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute h-2 border-l border-border"
                          style={{ left: `${i * 10}%` }}
                        >
                          <span className="absolute -left-2 top-2 text-[8px] text-muted-foreground">
                            {i}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`flex-1 ${pageLayout !== "web" ? "bg-muted/30 p-8" : "p-4"} ${isFullScreen ? "fixed inset-0 z-50 bg-background" : ""}`}
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
                  {pageLayout === "print" ? (
                    <div
                      className="mx-auto bg-white shadow-lg p-8 border border-border"
                      style={{
                        width: "210mm",
                        minHeight: "297mm",
                        fontFamily: fontFamily,
                        fontSize: `${fontSize[0]}pt`,
                        lineHeight: lineSpacing[0],
                      }}
                    >
                      {viewMode === "edit" ? (
                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          onClick={handleTextSelection}
                          onKeyUp={handleTextSelection}
                          className="h-full min-h-[280mm] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          placeholder="Начните писать..."
                          spellCheck={isSpellCheckEnabled}
                        />
                      ) : (
                        <div className="prose max-w-none">
                          {content.split("\n").map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : pageLayout === "book" ? (
                    <div className="flex justify-center space-x-8">
                      <div
                        className="bg-white shadow-lg p-8 border border-border"
                        style={{
                          width: "210mm",
                          minHeight: "297mm",
                          fontFamily: fontFamily,
                          fontSize: `${fontSize[0]}pt`,
                          lineHeight: lineSpacing[0],
                        }}
                      >
                        {viewMode === "edit" ? (
                          <Textarea
                            value={content
                              .split("\n\n")
                              .filter((_, i) => i % 2 === 0)
                              .join("\n\n")}
                            onChange={(e) => {
                              const leftPages = e.target.value.split("\n\n");
                              const rightPages = content
                                .split("\n\n")
                                .filter((_, i) => i % 2 === 1);
                              const newContent = leftPages
                                .flatMap((page, i) => {
                                  if (i < rightPages.length) {
                                    return [page, rightPages[i]];
                                  }
                                  return [page];
                                })
                                .join("\n\n");
                              setContent(newContent);
                            }}
                            onClick={handleTextSelection}
                            onKeyUp={handleTextSelection}
                            className="h-full min-h-[280mm] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Левая страница..."
                            spellCheck={isSpellCheckEnabled}
                          />
                        ) : (
                          <div className="prose max-w-none">
                            {content
                              .split("\n\n")
                              .filter((_, i) => i % 2 === 0)
                              .map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                              ))}
                          </div>
                        )}
                      </div>
                      <div
                        className="bg-white shadow-lg p-8 border border-border"
                        style={{
                          width: "210mm",
                          minHeight: "297mm",
                          fontFamily: fontFamily,
                          fontSize: `${fontSize[0]}pt`,
                          lineHeight: lineSpacing[0],
                        }}
                      >
                        {viewMode === "edit" ? (
                          <Textarea
                            value={content
                              .split("\n\n")
                              .filter((_, i) => i % 2 === 1)
                              .join("\n\n")}
                            onChange={(e) => {
                              const rightPages = e.target.value.split("\n\n");
                              const leftPages = content
                                .split("\n\n")
                                .filter((_, i) => i % 2 === 0);
                              const newContent = leftPages
                                .flatMap((page, i) => {
                                  if (i < rightPages.length) {
                                    return [page, rightPages[i]];
                                  }
                                  return [page];
                                })
                                .join("\n\n");
                              setContent(newContent);
                            }}
                            onClick={handleTextSelection}
                            onKeyUp={handleTextSelection}
                            className="h-full min-h-[280mm] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Правая страница..."
                            spellCheck={isSpellCheckEnabled}
                          />
                        ) : (
                          <div className="prose max-w-none">
                            {content
                              .split("\n\n")
                              .filter((_, i) => i % 2 === 1)
                              .map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="h-full"
                      style={{
                        fontFamily: fontFamily,
                        fontSize: `${fontSize[0]}pt`,
                        lineHeight: lineSpacing[0],
                      }}
                    >
                      {viewMode === "edit" ? (
                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          onClick={handleTextSelection}
                          onKeyUp={handleTextSelection}
                          className="h-full resize-none"
                          placeholder="Начните писать..."
                          spellCheck={isSpellCheckEnabled}
                        />
                      ) : (
                        <div className="prose max-w-none">
                          {content.split("\n").map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fullscreen toggle button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-4 right-4 z-10"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    title={
                      isFullScreen
                        ? "Выйти из полноэкранного режима"
                        : "Полноэкранный режим"
                    }
                  >
                    {isFullScreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Add comment dialog */}
                {isAddingComment && (
                  <div className="absolute right-8 top-1/4 w-64 bg-background border border-border rounded-md shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-border bg-muted/50 flex justify-between items-center">
                      <h4 className="text-sm font-medium">
                        Добавить комментарий
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsAddingComment(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="p-2">
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Выделенный текст:
                        </p>
                        <div className="text-xs bg-muted/30 p-1 rounded">
                          {selectedText.text.length > 100
                            ? selectedText.text.substring(0, 100) + "..."
                            : selectedText.text}
                        </div>
                      </div>
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Введите комментарий..."
                        className="text-sm h-20 resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                        >
                          Добавить
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add table dialog */}
                {isAddingTable && (
                  <div className="absolute right-8 top-1/4 w-80 bg-background border border-border rounded-md shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-border bg-muted/50 flex justify-between items-center">
                      <h4 className="text-sm font-medium">Добавить таблицу</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsAddingTable(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Строки</label>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={newTableRows}
                            onChange={(e) =>
                              setNewTableRows(parseInt(e.target.value) || 3)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Столбцы</label>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={newTableColumns}
                            onChange={(e) =>
                              setNewTableColumns(parseInt(e.target.value) || 3)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Стиль таблицы
                        </label>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={newTableStyles.headerRow}
                              onCheckedChange={(checked) =>
                                setNewTableStyles({
                                  ...newTableStyles,
                                  headerRow: checked,
                                })
                              }
                              id="header-row"
                            />
                            <Label htmlFor="header-row">Заголовок строки</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={newTableStyles.headerColumn}
                              onCheckedChange={(checked) =>
                                setNewTableStyles({
                                  ...newTableStyles,
                                  headerColumn: checked,
                                })
                              }
                              id="header-column"
                            />
                            <Label htmlFor="header-column">
                              Заголовок столбца
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={newTableStyles.striped}
                              onCheckedChange={(checked) =>
                                setNewTableStyles({
                                  ...newTableStyles,
                                  striped: checked,
                                })
                              }
                              id="striped"
                            />
                            <Label htmlFor="striped">Чередующиеся строки</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={newTableStyles.bordered}
                              onCheckedChange={(checked) =>
                                setNewTableStyles({
                                  ...newTableStyles,
                                  bordered: checked,
                                })
                              }
                              id="bordered"
                            />
                            <Label htmlFor="bordered">Границы</Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Выравнивание
                        </label>
                        <div className="flex space-x-2">
                          <Button
                            variant={
                              newTableStyles.alignment === "left"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setNewTableStyles({
                                ...newTableStyles,
                                alignment: "left",
                              })
                            }
                            className="flex-1"
                          >
                            <AlignLeft className="h-4 w-4 mr-2" />
                            Слева
                          </Button>
                          <Button
                            variant={
                              newTableStyles.alignment === "center"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setNewTableStyles({
                                ...newTableStyles,
                                alignment: "center",
                              })
                            }
                            className="flex-1"
                          >
                            <AlignCenter className="h-4 w-4 mr-2" />
                            По центру
                          </Button>
                          <Button
                            variant={
                              newTableStyles.alignment === "right"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setNewTableStyles({
                                ...newTableStyles,
                                alignment: "right",
                              })
                            }
                            className="flex-1"
                          >
                            <AlignRight className="h-4 w-4 mr-2" />
                            Справа
                          </Button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          className="w-full"
                          onClick={() => {
                            // Create table HTML
                            const tableId = Date.now().toString();
                            let tableHTML = `<table id="${tableId}" style="width:${newTableStyles.width};border-collapse:collapse;margin:1em 0;">`;

                            // Create table data structure
                            const tableData: string[][] = [];

                            for (let i = 0; i < newTableRows; i++) {
                              tableHTML += "<tr>";
                              const rowData: string[] = [];

                              for (let j = 0; j < newTableColumns; j++) {
                                const isHeaderRow =
                                  newTableStyles.headerRow && i === 0;
                                const isHeaderCol =
                                  newTableStyles.headerColumn && j === 0;
                                const cellTag =
                                  isHeaderRow || isHeaderCol ? "th" : "td";
                                const cellStyle = [];

                                if (newTableStyles.bordered) {
                                  cellStyle.push("border:1px solid #ddd");
                                }

                                if (
                                  newTableStyles.striped &&
                                  i % 2 === 1 &&
                                  !isHeaderRow
                                ) {
                                  cellStyle.push("background-color:#f9f9f9");
                                }

                                cellStyle.push(
                                  `padding:${newTableStyles.cellPadding}px`,
                                );
                                cellStyle.push(
                                  `text-align:${newTableStyles.alignment}`,
                                );

                                if (isHeaderRow || isHeaderCol) {
                                  cellStyle.push("font-weight:bold");
                                  cellStyle.push("background-color:#f2f2f2");
                                }

                                const cellContent = isHeaderRow
                                  ? `Заголовок ${j + 1}`
                                  : isHeaderCol
                                    ? `Строка ${i}`
                                    : `Ячейка ${i + 1},${j + 1}`;

                                rowData.push(cellContent);

                                tableHTML += `<${cellTag} style="${cellStyle.join(";")}">${cellContent}</${cellTag}>`;
                              }

                              tableData.push(rowData);
                              tableHTML += "</tr>";
                            }

                            tableHTML += "</table>";

                            // Create table object
                            const table: Table = {
                              id: tableId,
                              rows: newTableRows,
                              columns: newTableColumns,
                              data: tableData,
                              position: selectedText.start,
                              styles: newTableStyles,
                            };

                            // Insert table into content
                            const newContent =
                              content.substring(0, selectedText.start) +
                              tableHTML +
                              content.substring(selectedText.end);

                            setContent(newContent);

                            // Update document tables
                            if (currentDocument) {
                              const updatedTables = [
                                ...(currentDocument.tables || []),
                                table,
                              ];
                              const updatedDocument = {
                                ...currentDocument,
                                content: newContent,
                                tables: updatedTables,
                                updatedAt: new Date().toISOString(),
                              };

                              setDocuments(
                                documents.map((doc) =>
                                  doc.id === currentDocument.id
                                    ? updatedDocument
                                    : doc,
                                ),
                              );
                              setCurrentDocument(updatedDocument);
                            }

                            setIsAddingTable(false);
                          }}
                        >
                          Вставить таблицу
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Comments panel */}
              {showComments && (
                <div className="w-64 border-l border-border">
                  <div className="p-2 border-b border-border bg-muted/50">
                    <h4 className="font-medium text-sm">Комментарии</h4>
                  </div>
                  <ScrollArea className="h-[calc(100%-36px)]">
                    {currentDocument?.comments &&
                    currentDocument.comments.length > 0 ? (
                      <div className="p-2 space-y-3">
                        {currentDocument.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className={`p-2 rounded border ${comment.resolved ? "bg-muted/30 border-muted" : "bg-yellow-50/50 border-yellow-200"}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <span className="text-xs font-medium">
                                  {comment.author}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {new Date(
                                    comment.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {!comment.resolved && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() =>
                                    handleResolveComment(comment.id)
                                  }
                                >
                                  <CheckSquare className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-xs">{comment.text}</p>
                            <div className="mt-1 text-xs bg-muted/30 p-1 rounded">
                              {content.substring(
                                comment.position.start,
                                comment.position.end,
                              ).length > 50
                                ? content.substring(
                                    comment.position.start,
                                    comment.position.start + 50,
                                  ) + "..."
                                : content.substring(
                                    comment.position.start,
                                    comment.position.end,
                                  )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">Нет комментариев</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}

              {/* Revisions panel */}
              {showRevisions && (
                <div className="w-64 border-l border-border">
                  <div className="p-2 border-b border-border bg-muted/50">
                    <h4 className="font-medium text-sm">История изменений</h4>
                  </div>
                  <ScrollArea className="h-[calc(100%-36px)]">
                    {currentDocument?.revisions &&
                    currentDocument.revisions.length > 0 ? (
                      <div className="p-2 space-y-2">
                        {currentDocument.revisions.map((revision) => (
                          <div
                            key={revision.id}
                            className="p-2 hover:bg-accent rounded cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium">
                                {revision.author}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(revision.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {revision.changes}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        <RotateCw className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">Нет истории изменений</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Status bar */}
            <div className="p-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div>
                  {wordCount} слов, {charCount} символов
                </div>
                <div className="flex items-center space-x-1">
                  <Switch
                    id="spell-check"
                    checked={isSpellCheckEnabled}
                    onCheckedChange={setIsSpellCheckEnabled}
                    size="sm"
                  />
                  <Label htmlFor="spell-check" className="text-xs">
                    Проверка орфографии
                  </Label>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <span className="font-medium">Интервал:</span>{" "}
                  {lineSpacing[0]}
                </div>
                <div>Автосохранение включено</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <File className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">
                Выберите документ или создайте новый
              </h3>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreatingDocument(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать документ
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Collaboration Panel */}
      <CollaborationPanel
        isOpen={isCollaborationPanelOpen}
        onClose={() => setIsCollaborationPanelOpen(false)}
        projectName={currentDocument?.title || "Документ"}
        projectType="text"
        currentFile={currentDocument?.title}
      />
    </div>
  );
};

export default TextEditor;
