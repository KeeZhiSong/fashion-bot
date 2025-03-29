import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TrendSources() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fashion Trend Data Sources</CardTitle>
        <CardDescription>Curated fashion trend data from industry experts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Our Fashion Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our application uses carefully curated fashion trend data from multiple sources:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="p-2 bg-muted rounded-md flex items-center justify-between">
                <span className="font-medium">Fashion Trend Analysis</span>
                <Badge variant="outline">Seasonal Trends</Badge>
              </li>
              <li className="p-2 bg-muted rounded-md flex items-center justify-between">
                <span className="font-medium">Style Forecasting</span>
                <Badge variant="outline">Growth Metrics</Badge>
              </li>
              <li className="p-2 bg-muted rounded-md flex items-center justify-between">
                <span className="font-medium">Color Trend Research</span>
                <Badge variant="outline">Palette Analysis</Badge>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Data Processing</h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-4">
              <li>We compile trend data from fashion industry experts</li>
              <li>Our algorithm analyzes content to identify trending items and categories</li>
              <li>Growth percentages are calculated based on popularity and adoption rates</li>
              <li>Data is refreshed regularly to ensure you see the latest trends</li>
            </ol>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">Future Enhancements</h3>
            <p className="text-sm text-muted-foreground">
              We're working on integrating live data feeds from fashion publications and social media to provide even
              more up-to-date trend information. Stay tuned for updates!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

