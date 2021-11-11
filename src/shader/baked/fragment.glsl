uniform sampler2D uBakedTexture;
uniform sampler2D uBakedNightTexture;
uniform sampler2D uFairyTexture;
uniform sampler2D uLightMapTexture;

// nightlight on and off
uniform sampler2D uNightLightTexture;
uniform float uNightLight;

uniform vec3 uRoomColor;
uniform float uRoomLightStrength;

uniform float uMix;

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
// #pragma glslify: blend = require(glsl-blend/soft-light);

void main()
{
    vec3 bakedDayColor = texture2D(uBakedTexture, vUv).rgb;
    vec3 bakedNightColor = texture2D(uBakedNightTexture, vUv).rgb;
    vec3 nightLightColor = texture2D(uNightLightTexture, vUv).rgb;
    vec3 LightMapColor = texture2D(uLightMapTexture, vUv).rgb;
    vec3 fiaryLightColor = texture2D(uFairyTexture, vUv).rgb;

    vec3 bakedColor = mix(bakedDayColor, nightLightColor, uMix);
    // vec3 totalColor = mix(bakedColor, nightLightColor, uNightLight);

    float lightDeskStrength = LightMapColor.r * uDeskLightStrength;
    bakedColor = blendGlow(bakedColor, uDeskLightColor, lightDeskStrength);

    float lightCompStrength = LightMapColor.g * uCompLightStrength;
    bakedColor = blendLighten(bakedColor, uCompLightColor, lightCompStrength);

    float lightShelfStrength = LightMapColor.b * uShelfLightStrength;
    bakedColor = blendGlow(bakedColor, uShelfLightColor, lightShelfStrength);

    float fairyStrength = fiaryLightColor.g * uFairyLightStrength;
    bakedColor = mix (bakedColor, uFairyColor, fairyStrength);

    // float roomStrength = fiaryLightColor.b * uRoomLightStrength;
    // bakedColor = blend (bakedColor, uRoomColor, roomStrength);


    gl_FragColor = vec4(bakedColor, 1.0);
}