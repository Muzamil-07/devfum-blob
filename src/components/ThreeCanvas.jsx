import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import vertexPars from "./vertex_pars.glsl?raw";
import vertexMain from "./vertex_main.glsl?raw";
import fragmentPars from "./fragment_pars.glsl?raw";
import fragmentMain from "./fragment_main.glsl?raw";
// import vertexShader from "./Sphere.vertex.glsl?raw";
// import fragmentShader from "./Sphere.fragment.glsl?raw";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

const PATTERN_COUNT = 5;

export const ThreeCanvas = ({ targetPattern, onPatternChange }) => {
  const dragStartX = useRef(null);
  const [spinDirection, setSpinDirection] = useState(1);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const wrapPattern = (value) => ((value % PATTERN_COUNT) + PATTERN_COUNT) % PATTERN_COUNT;

  const handlePointerDown = (event) => {
    dragStartX.current = event.clientX;
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (dragStartX.current === null || !isDragging) return;
    const deltaX = event.clientX - dragStartX.current;
    // Map drag distance to a very subtle X offset (reduced for smoother feel)
    const maxOffset = 0.3;
    const sensitivity = 0.0008;
    const offset = Math.max(-maxOffset, Math.min(maxOffset, deltaX * sensitivity));
    setDragOffsetX(offset);
  };

  const handlePointerUp = (event) => {
    if (dragStartX.current === null) return;
    const deltaX = event.clientX - dragStartX.current;
    dragStartX.current = null;
    setIsDragging(false);
    setDragOffsetX(0); // Reset offset - will animate back to center

    const threshold = 25;
    if (Math.abs(deltaX) < threshold) return;

    const direction = deltaX > 0 ? 1 : -1;
    setSpinDirection(direction);
    if (typeof onPatternChange === "function") {
      onPatternChange((prev) => wrapPattern(prev + direction));
    }
  };

  // Handle scroll to change patterns
  const handleWheel = (event) => {
    event.preventDefault();
    
    // Debounce scroll to prevent rapid pattern changes
    if (scrollTimeoutRef.current) return;
    
    const direction = event.deltaY > 0 ? 1 : -1;
    setSpinDirection(direction);
    
    if (typeof onPatternChange === "function") {
      onPatternChange((prev) => wrapPattern(prev + direction));
    }
    
    // Set a cooldown before next scroll triggers pattern change
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null;
    }, 400);
  };

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{ width: "100vw", height: "100vh", background: "white" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      <Canvas>
        <Environment preset="studio" />
        <ambientLight color={"#ffffff"} intensity={0.5} />
        <directionalLight
          color={"#ffffff"}
          position={[2, 2, 2]}
          intensity={0.6}
        />
        {/* <OrbitControls makeDefault /> */}
        <Sphere
          targetPattern={targetPattern}
          patternCount={PATTERN_COUNT}
          spinDirection={spinDirection}
          dragOffsetX={dragOffsetX}
          isDragging={isDragging}
        />

        {/* post processing */}
        {/* <EffectComposer multisampling={1}>
          <Bloom
            intensity={0.2}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.1}
          />
        </EffectComposer> */}
      </Canvas>
    </div>
  );
};

const Sphere = ({ targetPattern, patternCount, spinDirection, dragOffsetX, isDragging }) => {
  const meshRef = useRef();
  const materiaRef = useRef();
  const morphProgressRef = useRef(0);
  const [currentPattern, setCurrentPattern] = useState(0);
  const spinTweenRef = useRef(null);
  const positionTweenRef = useRef(null);
  const morphTweenRef = useRef(null);
  
  // Load textures with appropriate loaders
  const diffuseMap1 = useLoader(THREE.TextureLoader, '/grad1.png');
  const diffuseMap2 = useLoader(THREE.TextureLoader, '/grad2.png');
  const diffuseMap3 = useLoader(THREE.TextureLoader, '/grad3.png');
  const diffuseMap4 = useLoader(THREE.TextureLoader, '/grad4.png');
  const diffuseMap5 = useLoader(THREE.TextureLoader, '/grad5.png');

  // Combine diffuse maps into an array for easy access in shader
  const diffuseMaps = [diffuseMap1, diffuseMap2, diffuseMap3, diffuseMap4, diffuseMap5];
  
  // Set texture wrapping to repeat mode for seamless wrapping
  
  // Smoothly animate morphProgress when target changes
  useEffect(() => {
    const wrapped = ((targetPattern % patternCount) + patternCount) % patternCount;
    if (wrapped !== currentPattern) {
      setCurrentPattern(wrapped);
    }
  }, [targetPattern, patternCount, currentPattern]);

  // Animate X position based on drag with smooth follow during drag
  useEffect(() => {
    if (!meshRef.current) return;
    
    if (positionTweenRef.current) {
      positionTweenRef.current.kill();
    }

    if (isDragging) {
      // During drag: smoothly follow the drag offset
      positionTweenRef.current = gsap.to(meshRef.current.position, {
        duration: 0.15,
        x: dragOffsetX,
        ease: "power2.out",
      });
    } else {
      // After drag release: smoothly return to center with elastic effect
      positionTweenRef.current = gsap.to(meshRef.current.position, {
        duration: 0.8,
        x: 0,
        ease: "elastic.out(1, 0.5)",
      });
    }

    return () => {
      if (positionTweenRef.current) positionTweenRef.current.kill();
    };
  }, [dragOffsetX, isDragging]);

  // Smooth morph transition with GSAP
  useEffect(() => {
    if (morphTweenRef.current) {
      morphTweenRef.current.kill();
    }

    const target = Math.max(0, Math.min(patternCount - 1, targetPattern));
    
    morphTweenRef.current = gsap.to(morphProgressRef, {
      duration: 1.2,
      current: target,
      ease: "power3.inOut",
      onUpdate: () => {
        if (materiaRef.current?.userData?.shader?.uniforms?.uMorphProgress) {
          materiaRef.current.userData.shader.uniforms.uMorphProgress.value = morphProgressRef.current;
        }
      }
    });

    return () => {
      if (morphTweenRef.current) morphTweenRef.current.kill();
    };
  }, [targetPattern, patternCount]);

  useEffect(() => {
    if (!meshRef.current) return;
    if (spinTweenRef.current) {
      spinTweenRef.current.kill();
    }
    const direction = spinDirection >= 0 ? 1 : -1;
    const mesh = meshRef.current;
    spinTweenRef.current = gsap.to(mesh.rotation, {
      duration: 0.8,
      y: mesh.rotation.y + direction * Math.PI * 2,
      x: mesh.rotation.x + direction * 0.15,
      z: mesh.rotation.z - direction * 0.15,
      ease: "power2.out",
    });

    return () => {
      if (spinTweenRef.current) spinTweenRef.current.kill();
    };
  }, [targetPattern, spinDirection]);


  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    
    const material = meshRef.current.material;
    if (!material.userData.shader) return;
    
    // Update time uniform (slowed down)
    if (material.userData.shader.uniforms.uTime) {
      material.userData.shader.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 300]} rotateX={Math.PI} />
      {/* <sphereGeometry args={[2, 300, 300]} /> */}
      {/* <torusKnotGeometry args={[1, 0.4, 3000, 3000]} /> */}
      <meshStandardMaterial
        ref={materiaRef}
        map={diffuseMaps[currentPattern]}
        // normalMap={normalMap}
        // roughnessMap={roughnessMap}
        // displacementMap={displacementMap}
        displacementScale={0.1}
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
