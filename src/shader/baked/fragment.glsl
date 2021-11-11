uniform sampler2D uBakedTexture;
uniform sampler2D uLightMapTexture;
uniform sampler2D uAmbientMapTexture;

uniform vec3 uDeskLightColor;
uniform float uDeskLightStrength;

uniform vec3 uCompLightColor;
uniform float uCompLightStrength;

uniform vec3 uShelfLightColor;
uniform float uShelfLightStrength;

uniform vec3 uAmbientColor;
uniform float uAmbientStrength;

varying vec2 vUv;

#pragma glslify: blendAdd = require(glsl-blend/add);
#pragma glslify: blendGlow = require(glsl-blend/glow);

void main()
{
    vec3 bakedColor = texture2D(uBakedTexture, vUv).rgb;

    vec3 ambientMapColor = texture2D(uAmbientMapTexture, vUv).rgb;
    vec3 LightMapColor = texture2D(uLightMapTexture, vUv).rgb;

    float lightDeskStrength = LightMapColor.r * uDeskLightStrength;
    bakedColor = blendAdd(bakedColor, uDeskLightColor, lightDeskStrength);

    float lightCompStrength = LightMapColor.g * uCompLightStrength;
    bakedColor = blendAdd(bakedColor, uCompLightColor, lightCompStrength);

    float lightShelfStrength = LightMapColor.b * uShelfLightStrength;
    bakedColor = blendAdd(bakedColor, uShelfLightColor, lightShelfStrength);


    gl_FragColor = vec4(bakedColor, 1.0);
}