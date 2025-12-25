import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import vertexPars from "./vertex_pars.glsl?raw";
import vertexMain from "./vertex_main.glsl?raw";
import fragmentPars from "./fragment_pars.glsl?raw";
import fragmentMain from "./fragment_main.glsl?raw";
// import vertexShader from "./Sphere.vertex.glsl?raw";
// import fragmentShader from "./Sphere.fragment.glsl?raw";
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
  const materiaRef = useRef();
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
    if (!material.userData.shader) return;
    
    // Update time uniform (slowed down)
    if (material.userData.shader.uniforms.uTime) {
      material.userData.shader.uniforms.uTime.value += delta;
    }
    
    // Smoothly transition morphProgress
    if (material.userData.shader.uniforms.uMorphProgress) {
      // Map pattern index (0-3) to morphProgress value (0-3)
      const target = targetPattern;
      const current = morphProgressRef.current;
      const transitionSpeed = 1.5; // Adjust for faster/slower transitions
      
      if (Math.abs(target - current) > 0.001) {
        morphProgressRef.current += (target - current) * delta * transitionSpeed;
      } else {
        morphProgressRef.current = target;
      }
      
      material.userData.shader.uniforms.uMorphProgress.value = morphProgressRef.current;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 300]} />
      <meshStandardMaterial
        ref={materiaRef}
        color="#3f5cff"
        roughness={0.35}
        metalness={0.15}
        onBeforeCompile={(shader) => {
          shader.uniforms.uTime = { value: 0 };
          shader.uniforms.uMorphProgress = { value: 0 };
          materiaRef.current.userData.shader = shader;
          const pars = `#include <displacementmap_pars_vertex>`;
          shader.vertexShader = shader.vertexShader.replace(pars, pars + '\n' + vertexPars);
          const main = `#include <displacementmap_vertex>`;
          shader.vertexShader = shader.vertexShader.replace(main, main + '\n' + vertexMain);
          const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`
          const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`
          shader.fragmentShader = shader.fragmentShader.replace(
            parsFragmentString,
            parsFragmentString + fragmentPars
          )
          shader.fragmentShader = shader.fragmentShader.replace(
            mainFragmentString,
            mainFragmentString + fragmentMain
          )
        }}
      />
      {/* <shaderMaterial args={[{
        vertexShader,
        fragmentShader,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uMorphProgress: { value: 0 },
        }
      }]} /> */}
    </mesh>
  );
};
