import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DatabaseInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Persistent Storage with Supabase</CardTitle>
        <CardDescription>Your virtual wardrobe is now saved between sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Database Schema</h3>
            <p className="text-sm text-muted-foreground mb-4">Your fashion data is stored in the following tables:</p>
            <ul className="space-y-2 text-sm">
              <li className="p-2 bg-muted rounded-md">
                <span className="font-medium">users</span> - Stores user information
              </li>
              <li className="p-2 bg-muted rounded-md">
                <span className="font-medium">wardrobe_items</span> - Stores your clothing items
              </li>
              <li className="p-2 bg-muted rounded-md">
                <span className="font-medium">styling_tips</span> - Stores AI-generated outfit recommendations
              </li>
              <li className="p-2 bg-muted rounded-md">
                <span className="font-medium">outfit_items</span> - Links styling tips to wardrobe items
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">How It Works</h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-4">
              <li>When you add items to your wardrobe, they're saved to the database</li>
              <li>When you generate styling tips, they're stored with references to your wardrobe items</li>
              <li>Your data is loaded automatically when you return to the site</li>
              <li>All data is associated with your user account for privacy</li>
            </ol>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">Demo Mode</h3>
            <p className="text-sm text-muted-foreground">
              For this demo, all users share the same anonymous account. In a production app, each user would have their
              own private wardrobe data associated with their account.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

