import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AIModelInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hugging Face AI Models</CardTitle>
        <CardDescription>
          This application uses the following Hugging Face models for AI-powered features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="classification">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="generation">Text Generation</TabsTrigger>
            <TabsTrigger value="vision">Computer Vision</TabsTrigger>
          </TabsList>

          <TabsContent value="classification" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">ResNet-50</h3>
              <p className="text-sm text-muted-foreground">
                Used for classifying clothing items into categories like tops, bottoms, outerwear, etc.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">Image Classification</Badge>
                <Badge variant="outline">Computer Vision</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="generation" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">GPT-2</h3>
              <p className="text-sm text-muted-foreground">
                Generates styling tips and outfit recommendations based on your wardrobe items.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">Text Generation</Badge>
                <Badge variant="outline">Natural Language</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vision" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">DETR (DEtection TRansformer)</h3>
              <p className="text-sm text-muted-foreground">
                Extracts color information and detects objects in clothing images.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">Object Detection</Badge>
                <Badge variant="outline">Color Analysis</Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">How It Works</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-4">
            <li>
              When you upload a clothing item, the image is sent to Hugging Face's ResNet-50 model to classify the type
              of clothing.
            </li>
            <li>The DETR model analyzes the image to extract dominant colors and patterns.</li>
            <li>
              When generating styling tips, the GPT-2 model creates personalized recommendations based on your wardrobe
              items.
            </li>
            <li>All processing happens securely through the Hugging Face Inference API.</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

