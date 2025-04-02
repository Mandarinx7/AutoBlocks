import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import BlockCoding from "@/pages/BlockCoding";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={BlockCoding} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
