
vNormal = normal;
vPosition = position;
vUv = uv;

vec3 coords = vNormal;
coords.y += uTime * 0.1;

// Calculate all four noise patterns (each returns vec4 with position and displacement)
vec4 pattern1 = noisePattern1(coords);
vec4 pattern2 = noisePattern2(vUv);
vec4 pattern3 = noisePattern3(coords);
vec4 pattern4 = noisePattern4(vUv);

// Blend between the patterns based on morphProgress
// Button 1: morphProgress = 0 (pattern 1)
// Button 2: morphProgress = 1 (pattern 2)
// Button 3: morphProgress = 2 (pattern 3)
// Button 4: morphProgress = 3 (pattern 4)
vec3 newPosition;
float displacement;

if (uMorphProgress < 1.0) {
  // Between pattern 1 and 2
  newPosition = mix(pattern1.xyz, pattern2.xyz, uMorphProgress);
  displacement = mix(pattern1.w, pattern2.w, uMorphProgress);
} else if (uMorphProgress < 2.0) {
  // Between pattern 2 and 3
  float t = uMorphProgress - 1.0;
  newPosition = mix(pattern2.xyz, pattern3.xyz, t);
  displacement = mix(pattern2.w, pattern3.w, t);
} else if (uMorphProgress < 3.0) {
  // Between pattern 3 and 4
  float t = uMorphProgress - 2.0;
  newPosition = mix(pattern3.xyz, pattern4.xyz, t);
  displacement = mix(pattern3.w, pattern4.w, t);
} else {
  // Fully pattern 4
  newPosition = pattern4.xyz;
  displacement = pattern4.w;
}

vDisplacement = displacement;
float displacementAmount = vDisplacement / 3.0;

transformed += normalize(objectNormal) * displacementAmount;