"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { getFundFlow, fraudApi } from "@/lib/api-service"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  Panel,
  MarkerType,
  useReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { AccountNode } from "./account-node"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, AlertTriangle } from "lucide-react"

// ✅ SOCKET IMPORT
import { io } from "socket.io-client"
import { API_BASE_URL } from "@/lib/api-service"
import { graphNodes as localGraphNodes, graphEdges as localGraphEdges } from "@/lib/mock-data"

const socket = io(API_BASE_URL, { autoConnect: false })

const nodeTypes = {
  accountNode: AccountNode,
}

export function FundFlowGraph() {
  const reactFlowInstance = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([])
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [highlightSuspicious, setHighlightSuspicious] = useState(true)
  const [loading, setLoading] = useState(true)
  const [highlightedPath, setHighlightedPath] = useState<string[]>([])

  // 🔥 NEW: SOCKET HIGHLIGHT STATES
  const [alertNodes, setAlertNodes] = useState<string[]>([])
  const [alertEdges, setAlertEdges] = useState<any[]>([])

  // 🔥 NEW: ALERTS LIST
  const [alerts, setAlerts] = useState<any[]>([])

  const loadGraphForAccount = async (accountId: string, allAlertsData: any[] = []) => {
    setLoading(true)
    try {
      let sourceNodes: any[] = []
      let sourceEdges: any[] = []

      if (accountId === "ALL") {
        try {
          const accounts = await fraudApi.getAccounts() as any[];
          const transactions = await fraudApi.getTransactions() as any[];
          
          sourceNodes = accounts.map((a, idx) => ({
            id: a.id,
            type: "accountNode",
            position: {
              x: (idx % 4) * 280,
              y: Math.floor(idx / 4) * 200,
            },
            data: {
              account: {
                id: a.id,
                riskScore: a.riskScore ?? 0,
                isSuspicious: a.isSuspicious ?? false,
                reasons: a.fraudType ? [a.fraudType] : [],
                balance: a.balance ?? 0,
                type: a.type || "individual",
                country: a.country || "IN"
              }
            }
          }))

          sourceEdges = transactions.map((t, idx) => ({
            id: t.id || `edge-${idx}`,
            source: t.from,
            target: t.to,
            label: `₹${t.amount}`,
            animated: t.status !== "normal",
            style: { 
              stroke: t.status === 'flagged' ? "#ef4444" : t.status === 'suspicious' ? "#f59e0b" : "#22c55e",
              strokeWidth: t.status !== "normal" ? 2 : 1
            },
          }))
        } catch(e) {
          console.error(e)
        }
      } else {
        const response = await getFundFlow(accountId)
        const data =
          (response as any)?.nodes && (response as any)?.edges
            ? response
            : (response as any)?.data?.nodes && (response as any)?.data?.edges
              ? (response as any).data
              : { nodes: localGraphNodes, edges: localGraphEdges }

        sourceNodes = Array.isArray(data.nodes) && data.nodes.length > 0 ? data.nodes : localGraphNodes
        sourceEdges = Array.isArray(data.edges) && data.edges.length > 0 ? data.edges : localGraphEdges
      }

      const safeNodes = (sourceNodes || []).map((node: any, index: number) => ({
        id: node.id || `node-${index}`,
        type: node.type || "accountNode",
        position: {
          x: node.position?.x ?? (index % 3) * 220,
          y: node.position?.y ?? Math.floor(index / 3) * 160,
        },
        data: {
          account: {
            id: node.data?.account?.id || node.id,
            riskScore: node.data?.account?.riskScore ?? 0,
            isSuspicious: node.data?.account?.isSuspicious ?? false,
            reasons: node.data?.account?.reasons || [],
            balance: node.data?.account?.balance ?? 0,
            type: node.data?.account?.type || "User",
            country: node.data?.account?.country || "Unknown",
          },
        },
      }))

      const safeEdges = (sourceEdges || []).map((edge: any, index: number) => ({
        id: edge.id || `edge-${index}`,
        source: edge.source,
        target: edge.target,
        label: edge.label || "",
        animated: edge.animated || false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edge.style?.stroke || "#999",
        },
        style: {
          ...edge.style,
          strokeWidth: 2,
        },
      }))

      setNodes(safeNodes)
      setEdges(safeEdges)

      setTimeout(() => {
        try {
          reactFlowInstance.fitView({ padding: 0.3 })
        } catch (e) {
          console.warn("fitView skipped")
        }
      }, 200)
    } catch (err) {
      console.error("Graph fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // 🔥 FETCH GRAPH
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const alertsData = await fraudApi.getAlerts() as any[]
        setAlerts(alertsData.filter(a => a.status === "open").slice(0, 5))
        
        await loadGraphForAccount("ALL", alertsData)
      } catch (err) {
        console.error("Failed to load initial graph config", err)
      }
    }

    fetchInitialData()
  }, [])

  // 🔥 SOCKET LISTENER (AUTO FRAUD HIGHLIGHT)
  useEffect(() => {
    socket.connect()
    socket.on("fraud-alert", (alert: any) => {
      console.log("🚨 FRAUD ALERT RECEIVED:", alert)

      const nodes = alert.path?.map((p: any) => p.from) || []
      const edges = alert.path || []

      // Check if we need to reload graph or simply visually update it
      // Currently just visual updates for existing graph:
      setAlertNodes(nodes)
      setAlertEdges(edges)
      
      // Prepend to panel alerts
      setAlerts((prev) => {
         const newA = { ...alert, id: alert._id || "unknown", status: alert.status || "open", accountId: alert.accountId || alert.senderId };
         return [newA, ...prev].slice(0, 5);
      });

      // 🔥 Auto focus graph
      setTimeout(() => {
        try {
          reactFlowInstance.fitView({ padding: 0.4 })
        } catch {}
      }, 300)
    })

    return () => {
      socket.off("fraud-alert")
      socket.disconnect()
    }
  }, [reactFlowInstance])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // 🔗 PATH DETECTION
  const getConnectedPath = (nodeId: string) => {
    const path: string[] = []

    edges.forEach((edge: any) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        path.push(edge.source)
        path.push(edge.target)
      }
    })

    return [...new Set(path)]
  }

  // 🔥 NODE CLICK
  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      setSelectedAccount(node.data?.account)
      const path = getConnectedPath(node.id)
      setHighlightedPath(path)
    },
    [edges]
  )

  // 🔥 FILTER NODES (MERGED LOGIC)
  const filteredNodes = useMemo(() => {
    return nodes.map((node: any) => {
      const isPath = highlightedPath.includes(node.id)
      const isAlert = alertNodes.includes(node.id)

      return {
        ...node,
        style: {
          opacity:
            highlightedPath.length === 0
              ? 1
              : isPath
                ? 1
                : 0.2,

          border: isAlert ? "2px solid red" : "1px solid #ccc",
          boxShadow: isAlert ? "0 0 15px red" : "none",
        },
      }
    })
  }, [nodes, highlightedPath, alertNodes])

  // 🔥 FILTER EDGES (MERGED LOGIC)
  const filteredEdges = useMemo(() => {
    return edges.map((edge: any) => {
      const isPath =
        highlightedPath.includes(edge.source) &&
        highlightedPath.includes(edge.target)

      const isAlert = alertEdges.some(
        (e: any) => e.from === edge.source && e.to === edge.target
      )

      return {
        ...edge,
        animated: isPath || isAlert,
        style: {
          stroke: isAlert
            ? "red"
            : isPath
              ? "orange"
              : edge.style?.stroke || "#999",

          strokeWidth: isAlert ? 3 : isPath ? 2 : 1,

          opacity:
            highlightedPath.length === 0
              ? 1
              : isPath || isAlert
                ? 1
                : 0.2,
        },
      }
    })
  }, [edges, highlightedPath, alertEdges])

  if (loading) {
    return <div className="p-4">Loading graph...</div>
  }

  const suspiciousCount = nodes.filter(
    (n: any) => n.data?.account?.isSuspicious
  ).length

  return (
    <div className="relative h-[calc(100vh-12rem)] w-full rounded-lg border border-border bg-card">
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes as any}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background gap={20} />
        <Controls />

        <MiniMap
          nodeColor={(node: any) => {
            const acc = node.data?.account
            if (!acc) return "#999"
            if (acc.riskScore >= 75) return "red"
            if (acc.riskScore >= 50) return "orange"
            return "green"
          }}
        />

        {/* 🔥 CONTROL PANEL */}
        <Panel position="top-left" className="!m-4">
          <Card className="w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Graph Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Active Alerts</span>
                <Badge variant="destructive">{suspiciousCount}</Badge>
              </div>

              <Button
                size="sm"
                className="w-full"
                onClick={() => setHighlightSuspicious(!highlightSuspicious)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                {highlightSuspicious ? "Showing Alerts" : "Show All"}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={async () => {
                  const alertsData = await fraudApi.getAlerts() as any[]
                  loadGraphForAccount("ALL", alertsData);
                }}
              >
                Reset to All Alerts
              </Button>

              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-sm font-semibold mb-2 block">Recent High-Risk Alerts</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {alerts.length > 0 ? alerts.map((a, idx) => (
                    <div 
                      key={idx} 
                      className="text-xs p-2 bg-muted/50 rounded border cursor-pointer hover:bg-muted"
                      onClick={() => loadGraphForAccount(a.accountId)}
                    >
                      <span className="font-medium text-destructive">Risk: {a.fraudScore ?? a.riskScore}%</span>
                      <p className="mt-1 opacity-80">Account: {a.accountId}</p>
                    </div>
                  )) : (
                    <p className="text-xs text-muted-foreground">No open alerts.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Panel>
      </ReactFlow>

      {/* 🔥 SIDE PANEL */}
      {selectedAccount && (
        <div className="absolute right-4 top-4 z-10 w-80">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold">Investigation Details</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedAccount(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
              <div className="flex justify-between items-center bg-muted/50 p-2 rounded-lg border border-border">
                <span className="font-semibold text-xs text-muted-foreground">Account ID</span>
                <span className="font-mono text-sm">{selectedAccount.id}</span>
              </div>
              <div className="flex justify-between items-center bg-muted/50 p-2 rounded-lg border border-border">
                 <span className="font-semibold text-xs text-muted-foreground">Balance</span>
                 <span className="text-sm font-medium">₹{Number(selectedAccount.balance).toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2">
                 <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-2">Risk Evaluation</span>
                 <div className="flex items-center gap-2 mb-2">
                   <div className={`p-3 rounded-lg border ${selectedAccount.riskScore >= 75 ? 'bg-destructive/10 border-destructive text-destructive' : selectedAccount.riskScore >= 40 ? 'bg-warning/10 border-warning text-warning' : 'bg-success/10 border-success text-success'}`}>
                     <span className="text-2xl font-bold">{selectedAccount.riskScore}%</span>
                   </div>
                   <div className="flex flex-col ml-auto text-right">
                     <span className="text-xs text-muted-foreground mb-1">Status</span>
                     <Badge variant={selectedAccount.isSuspicious ? "destructive" : "outline"} className={!selectedAccount.isSuspicious ? "border-success text-success bg-success/10" : ""}>
                       {selectedAccount.isSuspicious ? "Suspicious" : "Normal"}
                     </Badge>
                   </div>
                 </div>
              </div>

              {selectedAccount.reasons && selectedAccount.reasons.length > 0 && selectedAccount.reasons[0] && (
                <div className="pt-2 border-t border-border mt-2">
                   <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-2">Detected Patterns</span>
                   <ul className="space-y-2">
                     {selectedAccount.reasons.map((r: string, i: number) => (
                        <li key={i} className="text-xs flex gap-2 items-start bg-destructive/5 text-destructive p-3 rounded-lg border border-destructive/20 font-medium">
                          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                          <span className="capitalize">{r.replace(/_/g, ' ')}</span>
                        </li>
                     ))}
                   </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}