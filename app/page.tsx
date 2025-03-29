import { FashionTrendDashboard } from "@/components/fashion-trend-dashboard"
import { AIModelInfo } from "@/components/ai-model-info"
import { DatabaseInfo } from "@/components/database-info"
import { TrendSources } from "@/components/trend-sources"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-10">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Fashion Trend Analyzer</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Analyze real-time fashion trends and manage your virtual wardrobe with AI
            </p>
          </div>
        </div>
        <FashionTrendDashboard />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <AIModelInfo />
          <DatabaseInfo />
        </div>
        <div className="mt-6">
          <TrendSources />
        </div>
      </div>
    </main>
  )
}

