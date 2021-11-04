uniform float uTime;
uniform float uTimeFreq;
uniform vec2 vUvFrequency;

varying vec2 vUv;

#pragma glslify: perlin2d = require('../partials/perlin2d.glsl')

void main()
{
    vec2 uv = vUv * vUvFrequency;
    uv.x -= uTime * uTimeFreq;
    float perlin = perlin2d(uv);
    gl_FragColor = vec4(1.0, 1.0, 1.0, perlin);
}