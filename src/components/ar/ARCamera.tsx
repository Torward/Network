import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { Camera, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  isARSupported,
  requestARPermissions,
  initializeARCamera,
  stopARCamera,
  calculateARPosition,
  recordARInteraction,
} from "@/lib/ar-utils";

interface ARCameraProps {
  userId?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

const ARCamera = ({
  userId = "current-user",
  onClose = () => {},
  children,
}: ARCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState([1]);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [is3DMode, setIs3DMode] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Check AR support on mount
  useEffect(() => {
    const supported = isARSupported();
    setIsSupported(supported);

    if (!supported) {
      setError(
        "Ваше устройство не поддерживает функции дополненной реальности.",
      );
    }

    // Set up device orientation listener for AR positioning
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (containerRef.current && isInitialized) {
        const newPosition = calculateARPosition(event, containerRef.current);
        setPosition(newPosition);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      if (videoRef.current) {
        stopARCamera(videoRef.current);
      }
    };
  }, [isInitialized]);

  // Initialize AR when permissions are granted
  const initializeAR = async () => {
    try {
      const permissions = await requestARPermissions();
      setHasPermissions(permissions);

      if (!permissions) {
        setError("Необходимо разрешение на доступ к камере для AR функций.");
        return;
      }

      if (videoRef.current) {
        const initialized = await initializeARCamera(videoRef.current);
        setIsInitialized(initialized);

        if (initialized) {
          // Record this AR interaction for achievement tracking
          recordARInteraction(userId, "profile_view");
        } else {
          setError("Не удалось инициализировать AR камеру.");
        }
      }
    } catch (err) {
      console.error("Error initializing AR:", err);
      setError("Произошла ошибка при инициализации AR.");
    }
  };

  // Reset AR view
  const resetView = () => {
    setZoom([1]);
    setRotation(0);
  };

  // Initialize 3D scene for AR
  useEffect(() => {
    if (!isInitialized || !is3DMode || !containerRef.current) return;

    // Setup Three.js scene
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Add 3D content (example: a cube)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Animation loop
    const animate = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (
        rendererRef.current &&
        container.contains(rendererRef.current.domElement)
      ) {
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, [isInitialized, is3DMode]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* AR Camera Background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* AR Content Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
      >
        {isInitialized ? (
          <motion.div
            className="absolute"
            style={{
              left: position.x,
              top: position.y,
              transformOrigin: "center",
              transform: `scale(${zoom[0]}) rotate(${rotation}deg)`,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: zoom[0] }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
            {isSupported === false && (
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-bold mb-2">AR не поддерживается</h3>
                <p className="mb-4">
                  Ваше устройство не поддерживает функции дополненной
                  реальности.
                </p>
                <Button onClick={onClose}>Вернуться</Button>
              </div>
            )}

            {isSupported && !hasPermissions && (
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-bold mb-2">
                  Разрешите доступ к камере
                </h3>
                <p className="mb-4">
                  Для использования AR функций необходим доступ к камере
                  устройства.
                </p>
                <Button onClick={initializeAR}>Разрешить доступ</Button>
              </div>
            )}

            {error && (
              <Badge variant="destructive" className="mt-4">
                {error}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* AR Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={resetView}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant={is3DMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIs3DMode(!is3DMode)}
            >
              3D Режим
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between w-full mb-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom([Math.max(0.5, zoom[0] - 0.1)])}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Slider
            value={zoom}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={setZoom}
            className="w-[60%] mx-2"
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom([Math.min(2, zoom[0] + 0.1)])}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-full">
          <Slider
            value={[rotation]}
            min={-180}
            max={180}
            step={5}
            onValueChange={(value) => setRotation(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>-180°</span>
            <span>Поворот</span>
            <span>180°</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARCamera;
