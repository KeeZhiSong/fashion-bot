import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TrendCardProps {
  title: string
  description: string
  image: string
  tags: string[]
  growth: number
}

export function TrendCard({ title, description, image, tags, growth }: TrendCardProps) {
  return (
    <Card className="overflow-hidden">
      <img src={image || "/placeholder.svg"} alt={title} className="w-full h-48 object-cover" />
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className="bg-primary">+{growth}%</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

