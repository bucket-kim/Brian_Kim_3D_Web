uniform vec2 vUvFrequency;

varying vec2 vUv;

#pragma glslify: perlin2d = require('../partials/perlin2d.glsl')

void main()
{
    float perlin = perlin2d(vUv * vUvFrequency);
    gl_FragColor = vec4(1.0, 1.0, 1.0, perlin);
}