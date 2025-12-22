import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { PrototypeTwo } from './PrototypeTwo';

export default function App() {
  return (
    <div className="size-full bg-muted p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="mb-2">Image Classification Game Prototype</h1>
          <p className="text-muted-foreground">
            Prototypes exploring different game mechanics for teaching Vision Transformers & Convolutional Neural Networks
          </p>
        </header>

        <Tabs defaultValue="prototype1" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="prototype2">Prototype Game</TabsTrigger>
          </TabsList>

          <TabsContent value="prototype2">
            <PrototypeTwo />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
