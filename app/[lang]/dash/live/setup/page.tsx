
export default function LiveCreatePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Create Live Session
            </h1>
            <p className="text-muted-foreground mt-1">
              Set up a new live session for your audience.
            </p>
          </div>
        </div>
      </div>
      {/* Main content goes here */}
    </div>
  );
}
