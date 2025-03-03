import React, { useState, useEffect, useRef, ReactNode } from "react";
import { saveUISettings } from "@/lib/ui-settings";
import { useAuth } from "../auth/AuthProvider";

interface DraggableProps {
  children: ReactNode;
  componentId: string;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  className?: string;
  style?: React.CSSProperties;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  resizable?: boolean;
  bounds?: "parent" | "window" | HTMLElement;
}

const Draggable: React.FC<DraggableProps> = ({
  children,
  componentId,
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 200, height: 200 },
  minWidth = 100,
  minHeight = 100,
  className = "",
  style = {},
  onPositionChange,
  onSizeChange,
  resizable = true,
  bounds = "window",
}) => {
  const { user } = useAuth();
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // Save position and size when they change
  useEffect(() => {
    const saveSettings = async () => {
      if (user && !isDragging && !isResizing) {
        await saveUISettings({
          component_id: componentId,
          position_x: position.x,
          position_y: position.y,
          width: size.width,
          height: size.height,
          is_visible: true,
        });
      }
    };

    saveSettings();
  }, [position, size, isDragging, isResizing, user, componentId]);

  // Handle mouse events for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        // Apply bounds
        if (bounds === "window") {
          newX = Math.max(0, Math.min(window.innerWidth - size.width, newX));
          newY = Math.max(0, Math.min(window.innerHeight - size.height, newY));
        } else if (bounds === "parent" && elementRef.current?.parentElement) {
          const parent = elementRef.current.parentElement;
          const parentRect = parent.getBoundingClientRect();
          newX = Math.max(0, Math.min(parentRect.width - size.width, newX));
          newY = Math.max(0, Math.min(parentRect.height - size.height, newY));
        } else if (bounds instanceof HTMLElement) {
          const boundRect = bounds.getBoundingClientRect();
          newX = Math.max(
            boundRect.left,
            Math.min(boundRect.right - size.width, newX),
          );
          newY = Math.max(
            boundRect.top,
            Math.min(boundRect.bottom - size.height, newY),
          );
        }

        setPosition({ x: newX, y: newY });
        onPositionChange?.({ x: newX, y: newY });
      } else if (isResizing && resizeDirection) {
        let newWidth = size.width;
        let newHeight = size.height;
        let newX = position.x;
        let newY = position.y;

        if (resizeDirection.includes("e")) {
          newWidth = Math.max(minWidth, e.clientX - position.x);
        }
        if (resizeDirection.includes("s")) {
          newHeight = Math.max(minHeight, e.clientY - position.y);
        }
        if (resizeDirection.includes("w")) {
          const deltaX = e.clientX - (position.x + dragOffset.x);
          const potentialWidth = Math.max(minWidth, size.width - deltaX);
          if (potentialWidth !== size.width) {
            newWidth = potentialWidth;
            newX = position.x + deltaX;
          }
        }
        if (resizeDirection.includes("n")) {
          const deltaY = e.clientY - (position.y + dragOffset.y);
          const potentialHeight = Math.max(minHeight, size.height - deltaY);
          if (potentialHeight !== size.height) {
            newHeight = potentialHeight;
            newY = position.y + deltaY;
          }
        }

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
        onSizeChange?.({ width: newWidth, height: newHeight });
        onPositionChange?.({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    dragOffset,
    position,
    size,
    resizeDirection,
    bounds,
    minWidth,
    minHeight,
    onPositionChange,
    onSizeChange,
  ]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const startResize = (direction: string, e: React.MouseEvent) => {
    if (!resizable) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  return (
    <div
      ref={elementRef}
      className={`absolute ${className}`}
      style={{
        ...style,
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        position: "absolute",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      {resizable && (
        <>
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-10"
            onMouseDown={(e) => startResize("nw", e)}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-10"
            onMouseDown={(e) => startResize("ne", e)}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-10"
            onMouseDown={(e) => startResize("sw", e)}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-10"
            onMouseDown={(e) => startResize("se", e)}
          />
          <div
            className="absolute top-0 w-full h-3 cursor-n-resize z-10"
            onMouseDown={(e) => startResize("n", e)}
          />
          <div
            className="absolute right-0 h-full w-3 cursor-e-resize z-10"
            onMouseDown={(e) => startResize("e", e)}
          />
          <div
            className="absolute bottom-0 w-full h-3 cursor-s-resize z-10"
            onMouseDown={(e) => startResize("s", e)}
          />
          <div
            className="absolute left-0 h-full w-3 cursor-w-resize z-10"
            onMouseDown={(e) => startResize("w", e)}
          />
        </>
      )}
      {children}
    </div>
  );
};

export default Draggable;
