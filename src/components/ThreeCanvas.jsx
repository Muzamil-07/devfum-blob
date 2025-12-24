import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
// import vertexPars from "./vertex_pars.glsl?raw";
// import vertexMain from "./vertex_main.glsl?raw";
import vertexShader from "./Sphere.vertex.glsl?raw";
import fragmentShader from "./Sphere.fragment.glsl?raw";
import { useRef, useState, useEffect } from "react";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

export const ThreeCanvas = ({ targetPattern }) => {
  return (
    <div
      style={{ width: "100vw", height: "100vh", background: "linear-gradient(to top, #000000 0%, #060912 55%, #0e1324 100%)"
, }}
    >
      <Canvas>
        <Environment preset="studio" />
        <ambientLight color={"#526cff"} intensity={0.5} />
        <directionalLight
          color={"#4255ff"}
          position={[2, 2, 2]}
          intensity={0.6}
        />
        <OrbitControls makeDefault />
        <Sphere targetPattern={targetPattern} />

        {/* post processing */}
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.7}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.4}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

const Sphere = ({ targetPattern }) => {
  const meshRef = useRef();
  const morphProgressRef = useRef(0);
  const [currentPattern, setCurrentPattern] = useState(0);
  
  // Smoothly animate morphProgress when target changes
  useEffect(() => {
    if (targetPattern !== currentPattern) {
      setCurrentPattern(targetPattern);
    }
  }, [targetPattern, currentPattern]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const material = meshRef.current.material;
    if (!material.uniforms) return;
    
    // Update time uniform
    if (material.uniforms.uTime) {
      material.uniforms.uTime.value += delta;
    }
    
    // Smoothly transition morphProgress
    if (material.uniforms.uMorphProgress) {
      const target = targetPattern;
      const current = morphProgressRef.current;
      const transitionSpeed = 1.5; // Adjust for faster/slower transitions
      
      if (Math.abs(target - current) > 0.001) {
        morphProgressRef.current += (target - current) * delta * transitionSpeed;
      } else {
        morphProgressRef.current = target;
      }
      
      material.uniforms.uMorphProgress.value = morphProgressRef.current;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 200]} />
      <shaderMaterial args={[{
        vertexShader,
        fragmentShader,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uMorphProgress: { value: 0 },
        }
      }]} />
    </mesh>
  );
};
