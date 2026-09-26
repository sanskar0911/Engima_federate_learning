"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL } from "@/lib/api-service"
import { MessageCircleQuestion } from "lucide-react"

const PREDEFINED_QAS = [
  {
    category: "Banking Fraud Patterns",
    questions: [
      { q: "What is Smurfing / Structuring?", a: "Smurfing (or Structuring) is a money laundering technique where large amounts of illicit funds are broken down into smaller, less suspicious transactions that fall below regulatory reporting thresholds. Our AI intercepts this by monitoring cross-account velocity over short timeframes." },
      { q: "What is Layering?", a: "Layering is the second stage of money laundering, where funds are moved rapidly across multiple accounts, banks, or jurisdictions to obscure their original source. GraphSentinel detects this by parsing complex multi-hop paths in the ReactFlow visualization." },
      { q: "What is a Mule Account?", a: "A Mule Account is a bank account used by criminals to receive and transfer funds from illicit activities. Often, the account holder is an unwitting participant or a 'money mule' recruited via social media." },
      { q: "What is Circular Trading?", a: "Circular trading happens when funds loop through a series of accounts and return to the originator. Shell companies use this to artificially inflate transaction volumes and simulate legitimate business activity." },
      { q: "What is a Shell Company?", a: "A shell company is a business that exists only on paper and has no active business operations or significant assets. Criminals use them to disguise the ownership of funds and avoid taxes or AML checks." }
    ]
  },
  {
    category: "Compliance & AI Tech",
    questions: [
      { q: "What is AML & KYC?", a: "Anti-Money Laundering (AML) and Know Your Customer (KYC) are regulatory frameworks. AML prevents criminals from disguising illicit funds, while KYC verifies client identities to assess risk and prevent financial crimes." },
      { q: "What is Explainable AI (XAI)?", a: "Explainable AI (XAI) refers to methods that make AI decision-making transparent. In GraphSentinel, XAI breaks down exactly why an account was flagged—whether due to transaction velocity, geographical anomalies, or network shape." },
      { q: "What are Graph Neural Networks?", a: "Graph Neural Networks (GNNs) are deep learning models designed to process data represented as graphs. We use them to detect non-linear fraud patterns that traditional rule-based systems might miss." },
      { q: "What is Behavioral Profiling?", a: "Behavioral Profiling involves creating a 'normal' baseline for user activity (typical amounts, times, locations). Any significant deviation from this baseline triggers a risk alert in our engine." }
    ]
  },
  {
     category: "System Engineering",
     questions: [
       { q: "Why use Apache Kafka?", a: "Kafka is our distributed event streaming platform. It allows us to process high-volume transaction data with ultra-low latency, ensuring that fraud is detected the second a transaction is initiated, not minutes later." },
       { q: "How does Socket.IO enable real-time tracking?", a: "Socket.IO creates a persistent bidirectional connection between the server and the dashboard. This allows the backend to 'push' fraud alerts to investigators immediately without the need for manual page refreshes." },
       { q: "What is the role of ReactFlow?", a: "ReactFlow is used for node-edge graph visualization. It allows investigators to interactively explore fund flows, move nodes around, and visually trace the path of money across complex multi-account networks." },
       { q: "Why MongoDB for Graph Data?", a: "MongoDB's flexible document schema allows us to store complex, nested transaction histories and evolving account profiles. It handles the 'unstructured' nature of financial networks more efficiently than traditional SQL databases." }
     ]
  }
]

export default function FraudChatbot({ transaction }: { transaction?: any }) {
  const [message, setMessage] = useState("")
  const [chat, setChat] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat])

  const getSuggestions = (currentQuestion: string) => {
    const allQuestions = PREDEFINED_QAS.flatMap(cat => cat.questions);
    // Return 3 random questions that aren't the current one
    return allQuestions
      .filter(q => q.q !== currentQuestion)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
  };

  const injectPredefined = (q: string, a: string) => {
    const suggestions = getSuggestions(q);
    setChat((prev) => [...prev, { user: q, bot: a, suggestions }]);
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return

    const currentMessage = message
    setLoading(true)
    setMessage("")
    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: currentMessage,
        transaction,
      })
      const suggestions = getSuggestions(currentMessage);
      setChat((prev) => [...prev, { user: currentMessage, bot: res.data.reply, suggestions }])
    } catch {
      setChat((prev) => [
        ...prev,
        {
          user: currentMessage,
          bot: "Unable to connect to AI engine right now. Currently running in offline fallback mode.",
          suggestions: getSuggestions(currentMessage)
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full border-border bg-card flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>GraphSentinel AI Assistant</CardTitle>
        <CardDescription>Get insights on system architecture and fraud analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex flex-col flex-1 pb-4">
        
        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto rounded-md border border-border p-3 text-sm h-[200px] flex flex-col focus-within:ring-1 focus-within:ring-ring bg-muted/10">
          {chat.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-70 p-4">
              <MessageCircleQuestion className="h-8 w-8 mb-2" />
              <p>Type a custom message below, or click any of the predefined knowledge tags to instantly learn about the terms powering this system!</p>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col w-full h-full">
              {chat.map((c, i) => (
                <div key={i} className="space-y-2 flex flex-col w-full">
                  <div className="self-end bg-primary/10 border border-primary/20 text-foreground p-2 rounded-lg max-w-[85%] text-right ml-auto shadow-sm">
                    <p className="font-semibold text-xs text-primary mb-1">You</p>
                    <span>{c.user}</span>
                  </div>
                  <div className="self-start bg-card border border-border p-2 rounded-lg max-w-[85%] text-left mr-auto shadow-sm">
                    <p className="font-semibold text-xs text-info mb-1">GraphSentinel AI</p>
                    <span>{c.bot}</span>

                    {/* Suggested Next Questions */}
                    {c.suggestions && c.suggestions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-2">Suggested Follow-ups:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.suggestions.map((s: any) => (
                            <Badge 
                              key={s.q} 
                              variant="outline" 
                              className="cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors text-[9px] py-0 px-2 border-primary/20"
                              onClick={() => injectPredefined(s.q, s.a)}
                            >
                              {s.q}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Predefined Questions Area - Always Visible */}
        <div className="max-h-[140px] overflow-y-auto pr-1 space-y-3 border-t border-border pt-2 pb-1">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider sticky top-0 bg-card py-1 z-10">
            Quick Knowledge Base
          </p>
          {PREDEFINED_QAS.map(cat => (
             <div key={cat.category} className="mb-2">
                <p className="font-semibold text-[10px] text-foreground mb-1.5">{cat.category}</p>
                <div className="flex flex-wrap gap-1.5">
                   {cat.questions.map(q => (
                      <Badge 
                        key={q.q} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-[10px] py-0.5 px-2 bg-muted/60"
                        onClick={() => injectPredefined(q.q, q.a)}
                      >
                         {q.q}
                      </Badge>
                   ))}
                </div>
             </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask anything..."
            className="flex-1 text-sm bg-muted/30"
          />
          <Button onClick={sendMessage} disabled={loading} className="shrink-0" size="sm">
            {loading ? "Typing..." : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}