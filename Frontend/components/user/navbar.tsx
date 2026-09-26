"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Bell, Moon, Sun, User, Landmark, CreditCard, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function UserNavbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-all group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">
              Fraud<span className="text-blue-600">Shield</span> <span className="text-muted-foreground font-light text-sm ml-1">User</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-foreground bg-accent/50">
              <CreditCard className="h-4 w-4 text-primary" />
              Payments
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative text-muted-foreground hover:text-foreground hover:bg-accent">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pr-1 pl-1 rounded-full hover:bg-accent">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold">
                    RK
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start md:flex mr-2">
                  <span className="text-sm font-semibold leading-none">Ravi Kumar</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">Premium Account</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Ravi Kumar</p>
                  <p className="text-xs leading-none text-muted-foreground">ravi.kumar@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">Profile Settings</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Linked Accounts</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Security</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
