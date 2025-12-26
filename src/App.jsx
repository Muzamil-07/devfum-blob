import { useState } from "react";
import { ThreeCanvas } from "./components/ThreeCanvas";

function App() {
  const [targetPattern, setTargetPattern] = useState(0);

  return (
    <>
      <ThreeCanvas
        targetPattern={targetPattern}
        onPatternChange={setTargetPattern}
      />
    </>
  );
}

export default App;
