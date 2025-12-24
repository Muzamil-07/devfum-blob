

varying float vDisplacement;

void main() {
    gl_FragColor = vec4(vec3(vDisplacement), 1.0);
}