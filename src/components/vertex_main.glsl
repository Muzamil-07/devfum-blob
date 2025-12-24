// Use 'normal' (object space) instead of 'vNormal' (view space)
vec3 coords = normal;  // <- CHANGED FROM vNormal
coords.y += uTime * 0.1;
vec3 noisePattern = vec3(cnoise(coords));
// float strips = wave(noisePattern);

// vDisplacement = strips;
vDisplacement = noisePattern.y;  // <- CHANGED TO NOISE PATTERN Y COMPONENT

float displacement = vDisplacement;

transformed += normal * displacement;

// // Now recalculate the normal based on displacement gradient
// float offset = 0.01;

// // Sample displacement at neighboring points
// vec3 coordsX = normal + vec3(offset, 0.0, 0.0);
// coordsX.y += uTime * 0.1;
// float dispX = wave(vec3(cnoise(coordsX))) / 2.0;

// vec3 coordsY = normal + vec3(0.0, offset, 0.0);
// coordsY.y += uTime * 0.1;
// float dispY = wave(vec3(cnoise(coordsY))) / 2.0;

// vec3 coordsZ = normal + vec3(0.0, 0.0, offset);
// coordsZ.y += uTime * 0.1;
// float dispZ = wave(vec3(cnoise(coordsZ))) / 2.0;

// // Calculate gradient
// vec3 grad = vec3(
//     dispX - displacement,
//     dispY - displacement,
//     dispZ - displacement
// ) / offset;

// // New normal is the original normal minus the gradient
// vec3 displacedNormal = normalize(normal - grad * 0.5);

// Transform to view space
// vNormal = normalize(normalMatrix * displacedNormal);