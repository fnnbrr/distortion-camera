export const vertex = /* glsl */`
varying vec2 uvVertex;

void main() {
    uvVertex = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fragment = /* glsl */`
uniform sampler2D map;

varying vec2 uvVertex;

void main() {
    gl_FragColor = texture2D(map, uvVertex);
}
`