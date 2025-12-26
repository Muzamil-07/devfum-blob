
vNormal = normal;
vPosition = position;
vUv = uv;

vec3 coords = vNormal;
coords.y += uTime * 0.1;

// Calculate five kept patterns (each returns vec4 with position and displacement)
vec4 pattern1 = noisePattern1(coords);
vec4 pattern2 = noisePattern2(vUv);
vec4 pattern3 = noisePattern3(coords);
vec4 pattern4 = noisePattern6(coords); // Domain Warp
vec4 pattern5 = noisePattern7(coords); // Marble Veins

// Blend between the patterns based on morphProgress
// Pattern mapping:
// 0→1, 1→2, 2→3, 3→4 (Domain Warp), 4→5 (Marble Veins)
vec3 newPosition;
float displacement;

float idx = floor(uMorphProgress);
float t = fract(uMorphProgress);

vec4 fromPattern;
vec4 toPattern;

if (idx < 1.0) {
  fromPattern = pattern1; toPattern = pattern2;
} else if (idx < 2.0) {
  fromPattern = pattern2; toPattern = pattern3;
} else if (idx < 3.0) {
  fromPattern = pattern3; toPattern = pattern4;
} else if (idx < 4.0) {
  fromPattern = pattern4; toPattern = pattern5;
} else {
  fromPattern = pattern5; toPattern = pattern5; t = 0.0;
}

newPosition = mix(fromPattern.xyz, toPattern.xyz, t);
displacement = mix(fromPattern.w, toPattern.w, t);

vDisplacement = displacement;
float displacementAmount = vDisplacement / 3.0;

transformed += normalize(objectNormal) * displacementAmount;