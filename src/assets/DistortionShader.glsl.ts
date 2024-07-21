export const vertex: string = /* glsl */`
varying vec2 uvFragment;

void main() {
    uvFragment = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fragment: string = /* glsl */`
uniform sampler2D map;
uniform sampler2D distortionMap;

varying vec2 uvFragment;

void main() {
    vec2 uvDistorted = uvFragment + (0.1 * ((texture2D(distortionMap, uvFragment).rg * 2.0) - 1.0));
    gl_FragColor = texture2D(map, uvDistorted);
}
`