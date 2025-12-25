
vNormal = normal;
vPosition = position;
vUv = uv;

vec3 coords = vNormal;
coords.y += uTime * 0.1;

// Calculate both noise patterns (each returns vec4 with position and displacement)
vec4 pattern1 = noisePattern1(coords);
// vec4 pattern2 = noisePattern3(coords);
vec4 pattern2 = noisePattern2(vUv);

vec4 pattern3 = noisePattern3(coords);
vec4 pattern4 = noisePattern4(vUv);

// Smooth interpolation using smoothstep for better transition
float smoothProgress = smoothstep(0.0, 1.0, uMorphProgress);

// Blend between the two patterns (positions)
vec3 newPosition = mix(pattern1.xyz, pattern2.xyz, smoothProgress);

// Blend between the two displacements
vDisplacement = mix(pattern1.w, pattern2.w, smoothProgress);


float displacement = vDisplacement / 3.0;

transformed += normalize(objectNormal) * displacement;