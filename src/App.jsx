import { useState } from "react";
import { ThreeCanvas } from "./components/ThreeCanvas";
import { PatternButtons } from "./components/PatternButtons";

function App() {
  const [targetPattern, setTargetPattern] = useState(0);

  return (
    <>
      <ThreeCanvas targetPattern={targetPattern} />
      <PatternButtons onPatternChange={setTargetPattern} />
    </>
  );
}

export default App;
