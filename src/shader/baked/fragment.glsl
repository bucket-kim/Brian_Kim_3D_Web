uniform sampler2D uBakedTexture;
uniform sampler2D uBakedNightTexture;
uniform sampler2D uFairyTexture;
uniform sampler2D uLightMapTexture;

uniform float uMix;
uniform float uLightOn;

uniform vec3 uDeskLightColor;
uniform float uDeskLightStrength;

uniform vec3 uCompLightColor;
uniform float uCompLightStrength;

uniform vec3 uShelfLightColor;
uniform float uShelfLightStrength;

uniform vec3 uFairyColor;
uniform float uFairyLightStrength;

uniform vec3 uBakedColor;

varying vec2 vUv;

#pragma glslify: blendLighten = require(glsl-blend/lighten);
#pragma glslify: blendGlow = require(glsl-blend/glow);

void main()
{
    vec3 bakedDayColor = texture2D(uBakedTexture, vUv).rgb;
    vec3 bakedNightColor = texture2D(uBakedNightTexture, vUv).rgb;
    vec3 LightMapColor = texture2D(uLightMapTexture, vUv).rgb;
    vec3 fiaryLightColor = texture2D(uFairyTexture, vUv).rgb;
    vec3 bakedColor = mix(bakedDayColor, bakedNightColor, uMix);

    float lightDeskStrength = LightMapColor.r * uDeskLightStrength;
    bakedColor = blendGlow(bakedColor, uDeskLightColor, lightDeskStrength);

    float lightCompStrength = LightMapColor.g * uCompLightStrength;
    bakedColor = blendLighten(bakedColor, uCompLightColor, lightCompStrength);

    float lightShelfStrength = LightMapColor.b * uShelfLightStrength;
    bakedColor = blendGlow(bakedColor, uShelfLightColor, lightShelfStrength);

    float fairyStrength = fiaryLightColor.g * uFairyLightStrength;
    bakedColor = mix (bakedColor, uFairyColor, fairyStrength);


    gl_FragColor = vec4(bakedColor, 1.0);
}