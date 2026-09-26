import { UserNavbar } from "@/components/user/navbar"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>
    </div>
  )
}
