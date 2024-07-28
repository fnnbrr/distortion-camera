export const vertex: string = /* glsl */`
varying vec2 uvFragment;

void main() {
    uvFragment = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Adapted from "Free-Form Deformation of Solid Geometric Models": 
// https://dl.acm.org/doi/pdf/10.1145/15886.15903
export const fragment: string = /* glsl */`
uniform sampler2D map;
uniform sampler2D distortionMap;
uniform vec2[4] controlPoints;

varying vec2 uvFragment;

float factorial(int n) {
    int result = 1;
    
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    
    return float(result);
}

float binomialCoefficient(int n, int k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
}

void main() {
    int numX = 2;
    int numY = 2;
    
    int l = 1;
    int m = 1;
    
    float s = uvFragment.x;
    float t = uvFragment.y;
    
    vec2 uvDisplaced = vec2(0, 0);
    
    for (int i = 0; i < numX; i++) {
        for (int j = 0; j < numY; j++) {
        
            float sWeight = binomialCoefficient(i, l) *
                                pow((1.0 - s), (float(l) - float(i))) *
                                pow(s, float(i));
                                
            float tWeight = binomialCoefficient(j, m) *
                                pow((1.0 - t), (float(m) - float(j))) *
                                pow(t, float(j));
            
            vec2 controlPoint = controlPoints[(i * numX) + j];
            
            uvDisplaced += sWeight * tWeight * controlPoint;
        }
    }
    
    gl_FragColor = texture2D(map, uvDisplaced);
}
`