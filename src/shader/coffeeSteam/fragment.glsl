uniform float uTime;
uniform float uTimeFreq;
uniform vec2 vUvFrequency;
uniform vec3 uColor;

varying vec2 vUv;

#pragma glslify: perlin2d = require('../partials/perlin2d.glsl')

void main()
{
    vec2 uv = vUv * vUvFrequency;
    uv.x -= uTime * uTimeFreq;

    float borderAlpha = min(vUv.y * 2.5, (1.0 - vUv.y) * 2.5);
    borderAlpha = borderAlpha * (1.0 - vUv.x);

    float perlin = perlin2d(uv);
    perlin *= borderAlpha;

    gl_FragColor = vec4(uColor, perlin);
}