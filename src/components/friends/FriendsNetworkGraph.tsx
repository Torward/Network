import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  UserPlus,
  UserMinus,
  User,
  Users,
  Network,
  Minus,
  Plus,
  Zap,
} from "lucide-react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import * as THREE from "three";
import { supabase } from "@/lib/supabase";

interface FriendNode {
  id: string;
  name: string;
  avatar: string;
  zodiacSign?: string;
  group?: number;
  val?: number;
  mutualFriends?: number;
  connectionScore?: number;
  highlighted?: boolean;
}

interface FriendLink {
  source: string;
  target: string;
  strength?: number;
  type: "friend" | "pending" | "suggested";
}

interface FriendsNetworkGraphProps {
  userId?: string;
  onAddFriend?: (friendId: string) => void;
  onRemoveFriend?: (friendId: string) => void;
}

const FriendsNetworkGraph = ({
  userId = "current-user",
  onAddFriend = () => {},
  onRemoveFriend = () => {},
}: FriendsNetworkGraphProps) => {
  const graphRef = useRef<any>(null);
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState<{
    nodes: FriendNode[];
    links: FriendLink[];
  }>({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState<FriendNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch friends network data
  useEffect(() => {
    const fetchFriendsNetwork = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch current user (for demo, we'll use the first user)
        const { data: currentUserData, error: currentUserError } =
          await supabase
            .from("users")
            .select("id, name, avatar, zodiac_sign")
            .limit(1);

        if (currentUserError) throw currentUserError;
        if (!currentUserData || currentUserData.length === 0)
          throw new Error("No users found");

        const currentUser = currentUserData[0];
        const currentUserId = currentUser.id;

        console.log("Current user:", currentUser);

        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, avatar, zodiac_sign, is_online, last_active, bio");

        if (usersError) throw usersError;
        if (!usersData) throw new Error("No users found");

        // Fetch all connections
        const { data: connectionsData, error: connectionsError } =
          await supabase
            .from("user_connections")
            .select("user_id, connected_user_id, connection_type");

        if (connectionsError) throw connectionsError;
        if (!connectionsData) throw new Error("No connections found");

        // Create nodes for the graph
        const nodes: FriendNode[] = [];

        // Add current user node
        nodes.push({
          id: currentUserId,
          name: currentUser.name,
          avatar: currentUser.avatar,
          zodiacSign: currentUser.zodiac_sign,
          group: 0,
          val: 30, // Larger size for current user
        });

        // Get direct friends of current user
        const directFriendIds = new Set<string>();
        connectionsData.forEach((conn) => {
          if (conn.connection_type === "friend") {
            if (conn.user_id === currentUserId) {
              directFriendIds.add(conn.connected_user_id);
            } else if (conn.connected_user_id === currentUserId) {
              directFriendIds.add(conn.user_id);
            }
          }
        });

        // Get friends of friends
        const friendsOfFriendsIds = new Set<string>();
        connectionsData.forEach((conn) => {
          if (conn.connection_type === "friend") {
            if (
              directFriendIds.has(conn.user_id) &&
              conn.connected_user_id !== currentUserId
            ) {
              friendsOfFriendsIds.add(conn.connected_user_id);
            } else if (
              directFriendIds.has(conn.connected_user_id) &&
              conn.user_id !== currentUserId
            ) {
              friendsOfFriendsIds.add(conn.user_id);
            }
          }
        });

        // Remove direct friends from friends of friends
        directFriendIds.forEach((id) => {
          friendsOfFriendsIds.delete(id);
        });

        // Get suggested connections
        const suggestedIds = new Set<string>();
        connectionsData.forEach((conn) => {
          if (conn.connection_type === "suggested") {
            if (conn.user_id === currentUserId) {
              suggestedIds.add(conn.connected_user_id);
            } else if (conn.connected_user_id === currentUserId) {
              suggestedIds.add(conn.user_id);
            }
          }
        });

        // Calculate mutual friends for each user
        const mutualFriendsCount: Record<string, number> = {};
        usersData.forEach((user) => {
          if (user.id !== currentUserId) {
            let count = 0;
            connectionsData.forEach((conn) => {
              if (conn.connection_type === "friend") {
                // If this connection is between the user and a direct friend of current user
                if (
                  (conn.user_id === user.id &&
                    directFriendIds.has(conn.connected_user_id)) ||
                  (conn.connected_user_id === user.id &&
                    directFriendIds.has(conn.user_id))
                ) {
                  count++;
                }
              }
            });
            mutualFriendsCount[user.id] = count;
          }
        });

        // Add other users as nodes with appropriate groups
        usersData.forEach((user) => {
          if (user.id !== currentUserId) {
            const node: FriendNode = {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              zodiacSign: user.zodiac_sign,
              mutualFriends: mutualFriendsCount[user.id] || 0,
              val: 4, // Default size
            };

            // Assign group based on relationship
            if (directFriendIds.has(user.id)) {
              node.group = 1; // Direct friends
              node.val = 15;
            } else if (friendsOfFriendsIds.has(user.id)) {
              node.group = 2; // Friends of friends
              node.val = 8;
            } else if (suggestedIds.has(user.id)) {
              node.group = 5; // Suggested connections
              node.val = 4;

              // Calculate connection score for suggested friends
              const score = Math.min(
                100,
                Math.round((mutualFriendsCount[user.id] || 0) * 25),
              );
              node.connectionScore = score;
            } else {
              node.group = 3; // Other users
              node.val = 6;
            }

            nodes.push(node);
          }
        });

        // Create links for the graph
        const links: FriendLink[] = [];

        // Add connections as links
        connectionsData.forEach((conn) => {
          // Skip duplicate links (we'll create one link per connection)
          const existingLink = links.find(
            (link) =>
              (link.source === conn.user_id &&
                link.target === conn.connected_user_id) ||
              (link.source === conn.connected_user_id &&
                link.target === conn.user_id),
          );

          if (!existingLink) {
            let strength = 0.5; // Default strength

            // Adjust strength based on relationship
            if (conn.connection_type === "friend") {
              // Direct connections to current user are stronger
              if (
                conn.user_id === currentUserId ||
                conn.connected_user_id === currentUserId
              ) {
                strength = 0.9;
              } else {
                strength = 0.6;
              }
            } else if (conn.connection_type === "pending") {
              strength = 0.3;
            } else if (conn.connection_type === "suggested") {
              strength = 0.2;
            }

            links.push({
              source: conn.user_id,
              target: conn.connected_user_id,
              type: conn.connection_type as "friend" | "pending" | "suggested",
              strength,
            });
          }
        });

        setGraphData({ nodes, links });
      } catch (err: any) {
        console.error("Error fetching friends network:", err);
        setError("Не удалось загрузить сеть друзей: " + (err.message || err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendsNetwork();
  }, [userId]);

  const handleNodeClick = (node: FriendNode) => {
    setSelectedNode(node);

    // In a real app, you would navigate to the user's profile
    if (node.id !== "current-user") {
      navigate(`/profile/${node.id}`);
      console.log(`Navigating to profile of ${node.name}`);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    try {
      // Get current user ID
      const { data: currentUserData } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      if (!currentUserData || currentUserData.length === 0) {
        throw new Error("Current user not found");
      }

      const currentUserId = currentUserData[0].id;

      // Add connection to database
      const { error } = await supabase.from("user_connections").upsert([
        {
          user_id: currentUserId,
          connected_user_id: friendId,
          connection_type: "friend",
        },
      ]);

      if (error) throw error;

      // Update local state for immediate feedback
      setGraphData((prevData) => {
        const newLinks = [...prevData.links];

        // Find and update the link type
        const linkIndex = newLinks.findIndex(
          (link) =>
            (link.source === currentUserId && link.target === friendId) ||
            (link.target === currentUserId && link.source === friendId),
        );

        if (linkIndex >= 0) {
          newLinks[linkIndex] = {
            ...newLinks[linkIndex],
            type: "friend",
            strength: 0.8,
          };
        } else {
          // Create new link if none exists
          newLinks.push({
            source: currentUserId,
            target: friendId,
            type: "friend",
            strength: 0.8,
          });
        }

        return { ...prevData, links: newLinks };
      });

      // Call the parent handler
      onAddFriend(friendId);
    } catch (err) {
      console.error("Error adding friend:", err);
      setError("Не удалось добавить друга");
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      // Get current user ID
      const { data: currentUserData } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      if (!currentUserData || currentUserData.length === 0) {
        throw new Error("Current user not found");
      }

      const currentUserId = currentUserData[0].id;

      // Remove connection from database
      const { error } = await supabase
        .from("user_connections")
        .delete()
        .or(`user_id.eq.${currentUserId},connected_user_id.eq.${currentUserId}`)
        .or(`user_id.eq.${friendId},connected_user_id.eq.${friendId}`);

      if (error) throw error;

      // Update local state for immediate feedback
      setGraphData((prevData) => {
        const newLinks = [...prevData.links];

        // Find and remove the link
        const linkIndex = newLinks.findIndex(
          (link) =>
            (link.source === currentUserId && link.target === friendId) ||
            (link.target === currentUserId && link.source === friendId),
        );

        if (linkIndex >= 0) {
          newLinks.splice(linkIndex, 1);
        }

        return { ...prevData, links: newLinks };
      });

      // Call the parent handler
      onRemoveFriend(friendId);
    } catch (err) {
      console.error("Error removing friend:", err);
      setError("Не удалось удалить друга");
    }
  };

  const getLinkColor = (link: any) => {
    // Get the actual link object if it's an index
    const linkObj =
      typeof link.type === "undefined" ? graphData.links[link.index] : link;

    switch (linkObj.type) {
      case "friend":
        return "rgba(59, 130, 246, 0.8)"; // Blue for friends
      case "pending":
        return "rgba(245, 158, 11, 0.8)"; // Amber for pending
      case "suggested":
        return "rgba(156, 163, 175, 0.6)"; // Gray for suggested
      default:
        return "rgba(209, 213, 219, 0.5)"; // Light gray default
    }
  };

  const getNodeColor = (node: any) => {
    // Node is being hovered or has many mutual connections
    if (node.highlighted) {
      return "#ec4899"; // Pink for highlighted nodes with aura
    }

    // Current user is highlighted
    if (node.id === "current-user") return "#3b82f6"; // Blue

    // Color based on group
    switch (node.group) {
      case 1:
        return "#10b981"; // Green for close friends (inner circle)
      case 2:
        return "#8b5cf6"; // Purple for friends of friends (middle circle)
      case 3:
        return "#f59e0b"; // Amber for distant connections (outer circle)
      case 4:
        return "#6366f1"; // Indigo for other connections
      case 5:
        return "#9ca3af"; // Gray for suggested friends
      default:
        return "#d1d5db"; // Light gray default
    }
  };

  // Calculate connection score for suggested friends
  const calculateConnectionScore = useCallback(
    (nodeId: string) => {
      if (!graphData.nodes.length) return 0;

      const node = graphData.nodes.find((n) => n.id === nodeId);
      if (!node || node.id === "current-user" || node.connectionScore)
        return node?.connectionScore || 0;

      // Count how many of user's friends are connected to this node
      let mutualConnections = 0;
      let totalUserFriends = 0;

      // First, find all direct friends of current user
      const userFriends = new Set<string>();
      graphData.links.forEach((link) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;

        if (sourceId === "current-user" && link.type === "friend") {
          userFriends.add(targetId);
          totalUserFriends++;
        } else if (targetId === "current-user" && link.type === "friend") {
          userFriends.add(sourceId);
          totalUserFriends++;
        }
      });

      // Then count how many of those friends are connected to the target node
      graphData.links.forEach((link) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;

        if (sourceId === nodeId && userFriends.has(targetId)) {
          mutualConnections++;
        } else if (targetId === nodeId && userFriends.has(sourceId)) {
          mutualConnections++;
        }
      });

      // Calculate score as percentage of user's friends that are connected to this node
      const score =
        totalUserFriends > 0
          ? Math.round((mutualConnections / totalUserFriends) * 100)
          : 0;
      return score;
    },
    [graphData],
  );

  return (
    <div className="w-full h-full relative bg-background rounded-lg overflow-hidden">
      {/* Zoom slider */}
      <div className="absolute right-4 top-4 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-md border border-border">
        <div className="flex items-center space-x-2">
          <Minus className="h-4 w-4 text-muted-foreground" />
          <Slider
            defaultValue={[2.0]}
            min={0.5}
            max={5}
            step={0.1}
            className="w-32"
            onValueChange={(value) => {
              if (graphRef.current) {
                graphRef.current.zoom(value[0]);
              }
            }}
          />
          <Plus className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center p-4">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={() => window.location.reload()}>Повторить</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute top-4 left-4 z-10">
            <Badge
              variant="outline"
              className="bg-background/80 backdrop-blur-sm"
            >
              <Network className="h-4 w-4 mr-1" />
              {graphData.nodes.length} пользователей, {graphData.links.length}{" "}
              связей
            </Badge>
          </div>

          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 z-10 w-64"
            >
              <Card className="bg-background/90 backdrop-blur-sm border shadow-lg">
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                      <img
                        src={selectedNode.avatar}
                        alt={selectedNode.name}
                        className="h-12 w-12 rounded-full bg-muted"
                      />
                      {selectedNode.zodiacSign && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full w-6 h-6 flex items-center justify-center text-xs border">
                          {getZodiacSymbol(selectedNode.zodiacSign)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedNode.name}</h3>
                      {selectedNode.zodiacSign && (
                        <p className="text-xs text-muted-foreground">
                          {selectedNode.zodiacSign}
                        </p>
                      )}
                      {selectedNode.id !== "current-user" &&
                        selectedNode.mutualFriends !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            {selectedNode.mutualFriends} общих друзей
                          </p>
                        )}
                      {selectedNode.connectionScore !== undefined && (
                        <div className="mt-1 flex items-center">
                          <Zap className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-xs font-medium text-yellow-600">
                            {selectedNode.connectionScore}% совместимость
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {selectedNode.id !== "current-user" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            navigate(`/profile/${selectedNode.id}`)
                          }
                        >
                          <User className="h-4 w-4 mr-1" />
                          Профиль
                        </Button>

                        {isFriend(selectedNode.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-500 hover:text-red-600"
                            onClick={() => handleRemoveFriend(selectedNode.id)}
                          >
                            <UserMinus className="h-4 w-4 mr-1" />
                            Удалить
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAddFriend(selectedNode.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Добавить
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <div className="w-full h-full">
            {graphData.nodes.length > 0 && (
              <ForceGraph3D
                ref={graphRef}
                graphData={graphData}
                nodeLabel={(node) =>
                  `${node.name}${node.zodiacSign ? ` (${node.zodiacSign})` : ""}`
                }
                nodeColor={getNodeColor}
                nodeVal={(node) => node.val || 15}
                linkColor={getLinkColor}
                linkWidth={(link) => (link.strength || 0.5) * 3}
                linkDirectionalParticles={4}
                linkDirectionalParticleWidth={(link) => {
                  return link.type === "friend" ? 1.5 : 0.5;
                }}
                nodeThreeObject={(node) => {
                  try {
                    // Create a group to hold avatar, text, and potential aura
                    const group = new THREE.Group();

                    // Add aura for nodes with high connection score or many mutual friends
                    if (node.connectionScore && node.connectionScore > 50) {
                      const aura = new THREE.Sprite(
                        new THREE.SpriteMaterial({
                          color: 0xec4899, // Pink color for aura
                          transparent: true,
                          opacity: 0.3,
                          depthWrite: false,
                        }),
                      );
                      // Size aura based on connection score
                      const auraSize = 30 + (node.connectionScore / 100) * 20;
                      aura.scale.set(auraSize, auraSize, 1);
                      group.add(aura);
                    }

                    // Create avatar sprite with error handling
                    const avatarTexture = new THREE.TextureLoader().load(
                      node.avatar,
                      undefined, // onLoad callback
                      undefined, // onProgress callback
                      () => {
                        // onError callback - use fallback texture
                        console.warn(
                          `Failed to load avatar for ${node.name}, using fallback`,
                        );
                      },
                    );

                    const avatar = new THREE.Sprite(
                      new THREE.SpriteMaterial({
                        map: avatarTexture,
                        transparent: true,
                        depthWrite: false,
                      }),
                    );

                    // Scale avatar based on node type
                    const avatarSize =
                      node.id === "current-user"
                        ? 30
                        : node.group === 1
                          ? 20
                          : node.group === 2
                            ? 15
                            : 10;
                    avatar.scale.set(avatarSize, avatarSize, 1);

                    // Create text label
                    const text = new SpriteText(node.name);
                    text.color =
                      node.id === "current-user" ? "#ffffff" : "#333333";
                    text.textHeight = node.id === "current-user" ? 10 : 8;
                    text.position.y = -(avatarSize / 2 + 10); // Position below avatar

                    // Add mutual friends count for non-current-user nodes
                    if (
                      node.id !== "current-user" &&
                      node.mutualFriends !== undefined
                    ) {
                      const mutualText = new SpriteText(
                        `${node.mutualFriends} общих`,
                      );
                      mutualText.color = "#666666";
                      mutualText.textHeight = 6;
                      mutualText.position.y = -(avatarSize / 2 + 18); // Position below name
                      group.add(mutualText);
                    }

                    // Add connection score for suggested friends
                    if (node.connectionScore) {
                      const scoreText = new SpriteText(
                        `${node.connectionScore}% совместимость`,
                      );
                      scoreText.color = "#ec4899"; // Pink color
                      scoreText.textHeight = 6;
                      scoreText.position.y = -(
                        avatarSize / 2 +
                        (node.mutualFriends !== undefined ? 26 : 18)
                      );
                      group.add(scoreText);
                    }

                    // Add all elements to group
                    group.add(avatar);
                    group.add(text);

                    return group;
                  } catch (error) {
                    console.error("Error creating node object:", error);
                    // Fallback to simple text node
                    const text = new SpriteText(node.name);
                    text.color =
                      node.id === "current-user" ? "#ffffff" : "#333333";
                    text.textHeight = node.id === "current-user" ? 10 : 8;
                    return text;
                  }
                }}
                nodeThreeObjectExtend={true}
                onNodeClick={handleNodeClick}
                onNodeHover={(node) => {
                  if (!node) {
                    // Reset all node sizes and highlights when not hovering
                    setGraphData((prevData) => {
                      const updatedNodes = prevData.nodes.map((n) => ({
                        ...n,
                        highlighted: false,
                        val:
                          n.id === "current-user"
                            ? 30
                            : n.group === 1
                              ? 15
                              : n.group === 2
                                ? 8
                                : n.group === 3
                                  ? 6
                                  : 4,
                      }));
                      return { ...prevData, nodes: updatedNodes };
                    });

                    setHighlightNodes(new Set());
                    setHighlightLinks(new Set());
                    return;
                  }

                  // Get connected links and nodes
                  const connectedNodes = new Set([node.id]);
                  const connectedLinks = new Set();

                  graphData.links.forEach((link, index) => {
                    const sourceId =
                      typeof link.source === "object"
                        ? link.source.id
                        : link.source;
                    const targetId =
                      typeof link.target === "object"
                        ? link.target.id
                        : link.target;

                    if (sourceId === node.id || targetId === node.id) {
                      connectedLinks.add(index);
                      if (sourceId === node.id) connectedNodes.add(targetId);
                      if (targetId === node.id) connectedNodes.add(sourceId);
                    }
                  });

                  // Update node sizes and highlights
                  setGraphData((prevData) => {
                    const updatedNodes = prevData.nodes.map((n) => {
                      // If this is the hovered node or connected to it
                      if (connectedNodes.has(n.id)) {
                        // Calculate connection score for suggested friends when hovered
                        let connectionScore = n.connectionScore;
                        if (
                          n.id !== "current-user" &&
                          n.id !== node.id &&
                          !connectionScore &&
                          n.group === 5
                        ) {
                          connectionScore = calculateConnectionScore(n.id);
                        }

                        return {
                          ...n,
                          highlighted: n.id !== node.id && n.group === 5, // Highlight suggested friends
                          val:
                            n.id === node.id
                              ? n.id === "current-user"
                                ? 30
                                : 25 // Enlarge hovered node
                              : n.id === "current-user"
                                ? 30 // Keep current user large
                                : n.group === 1
                                  ? 20 // Enlarge connected nodes
                                  : n.group === 2
                                    ? 15
                                    : n.group === 3
                                      ? 12
                                      : 10,
                          connectionScore,
                        };
                      }
                      // Nodes not connected to hovered node
                      return {
                        ...n,
                        highlighted: false,
                        val:
                          n.id === "current-user"
                            ? 30
                            : n.group === 1
                              ? 15
                              : n.group === 2
                                ? 8
                                : n.group === 3
                                  ? 6
                                  : 4, // Smaller size for non-connected nodes
                      };
                    });
                    return { ...prevData, nodes: updatedNodes };
                  });

                  setHighlightNodes(connectedNodes);
                  setHighlightLinks(connectedLinks);
                }}
                cooldownTicks={100}
                enableNodeDrag={true}
                enableNavigationControls={true}
                controlType="orbit"
                onEngineStop={() => {
                  // Center the graph on the current user node after initial physics simulation
                  if (graphRef.current) {
                    const currentUserNode = graphData.nodes.find(
                      (node) => node.id === "current-user",
                    );
                    if (currentUserNode) {
                      graphRef.current.centerAt(
                        currentUserNode.x,
                        currentUserNode.y,
                        1000, // transition duration in ms
                      );
                      graphRef.current.zoom(2.5, 1000); // zoom in more to focus on user
                    }
                  }
                }}
                enableZoomInteraction={true}
                enablePanInteraction={true}
                onZoom={(zoom) => {
                  // Update nodes appearance based on zoom level
                  const scaleFactor = 1 / zoom;
                  if (graphRef.current) {
                    // Adjust text visibility based on zoom
                    const textElements =
                      document.querySelectorAll(".SpriteText");
                    textElements.forEach((el) => {
                      if (zoom < 1.0) {
                        el.style.opacity = `${zoom}`;
                      } else {
                        el.style.opacity = "1";
                      }
                    });
                  }
                }}
                width={window.innerWidth - 100}
                height={window.innerHeight - 200}
                onBackgroundClick={() => setSelectedNode(null)}
                d3AlphaDecay={0.02} // Slower decay for more natural movement
                d3VelocityDecay={0.3} // Adjust for smoother motion
                dagMode={null} // No specific layout mode
                dagLevelDistance={50} // Distance between levels if using dag layout
                backgroundColor="rgba(248, 250, 252, 0.8)" // Light background
                linkDirectionalParticleSpeed={0.01} // Slower particles
                linkDirectionalParticleWidth={(link) => {
                  // Wider particles for friend connections
                  return link.type === "friend" ? 2 : 0.8;
                }}
                linkDirectionalParticleColor={getLinkColor}
                onNodeDragEnd={(node) => {
                  // Fix node position after drag
                  if (node) {
                    node.fx = node.x;
                    node.fy = node.y;
                    node.fz = node.z;
                  }
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );

  // Helper function to check if a user is a friend
  function isFriend(userId: string): boolean {
    // Check in local graph data for immediate response
    return graphData.links.some((link) => {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;

      return (
        link.type === "friend" &&
        ((sourceId === "current-user" && targetId === userId) ||
          (targetId === "current-user" && sourceId === userId))
      );
    });
  }

  // Helper function to get zodiac symbol
  function getZodiacSymbol(sign: string): string {
    const symbols: Record<string, string> = {
      Aries: "♈",
      Taurus: "♉",
      Gemini: "♊",
      Cancer: "♋",
      Leo: "♌",
      Virgo: "♍",
      Libra: "♎",
      Scorpio: "♏",
      Sagittarius: "♐",
      Capricorn: "♑",
      Aquarius: "♒",
      Pisces: "♓",
    };

    return symbols[sign] || sign.charAt(0);
  }
};

export default FriendsNetworkGraph;
