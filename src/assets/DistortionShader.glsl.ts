export const vertex: string = /* glsl */`
varying vec2 uvVertex;

void main() {
    uvVertex = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fragment: string = /* glsl */`
uniform sampler2D map;
uniform sampler2D distortionMap;

varying vec2 uvVertex;

void main() {
    gl_FragColor = texture2D(map, uvVertex);
}
`