"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bell,
  Shield,
  Database,
  Zap,
  Globe,
  Lock,
  Mail,
  Webhook,
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your fraud detection system preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Detection Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Shield className="h-5 w-5" />
              Detection Settings
            </CardTitle>
            <CardDescription>Configure fraud detection parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Risk Score Threshold</Label>
              <Select defaultValue="70">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 - Low Sensitivity</SelectItem>
                  <SelectItem value="60">60 - Medium Sensitivity</SelectItem>
                  <SelectItem value="70">70 - High Sensitivity</SelectItem>
                  <SelectItem value="80">80 - Very High Sensitivity</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Transactions above this threshold will be flagged
              </p>
            </div>

            <div className="space-y-2">
              <Label>Structuring Detection Amount</Label>
              <Input type="number" defaultValue="10000" />
              <p className="text-xs text-muted-foreground">
                Detect transactions just below this amount
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Circular Transaction Detection</Label>
                <p className="text-xs text-muted-foreground">
                  Detect money flowing back to origin
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Velocity Monitoring</Label>
                <p className="text-xs text-muted-foreground">
                  Monitor unusual transaction frequency
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dormant Account Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Alert when inactive accounts become active
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive alerts via email
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Push Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Webhook className="h-4 w-4" />
                  Webhook Integration
                </Label>
                <p className="text-xs text-muted-foreground">
                  Send alerts to external systems
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Notification Email</Label>
              <Input type="email" defaultValue="analyst@fraudshield.ai" />
            </div>

            <div className="space-y-2">
              <Label>Alert Frequency</Label>
              <Select defaultValue="realtime">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Database className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>Configure backend API connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Flask Backend URL</Label>
              <Input defaultValue="http://localhost:5000" placeholder="http://localhost:5000" />
              <p className="text-xs text-muted-foreground">
                Connect to your Flask backend API
              </p>
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" defaultValue="sk-••••••••••••••••" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Real-time Sync
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable WebSocket connection for live updates
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button className="w-full">Test Connection</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Lock className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">
                  Require 2FA for sensitive actions
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-xs text-muted-foreground">
                  Auto-logout after inactivity
                </p>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Audit Logging</Label>
                <p className="text-xs text-muted-foreground">
                  Log all user actions for compliance
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  IP Restriction
                </Label>
                <p className="text-xs text-muted-foreground">
                  Limit access to specific IP ranges
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}
