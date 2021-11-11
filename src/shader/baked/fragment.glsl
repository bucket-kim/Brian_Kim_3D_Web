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

#pragma glslify: blendScreen = require(glsl-blend/screen);
#pragma glslify: blendLighten = require(glsl-blend/lighten);
#pragma glslify: blendGlow = require(glsl-blend/glow);

void main()
{
    vec3 bakedColor = texture2D(uBakedTexture, vUv).rgb;

    vec3 ambientMapColor = texture2D(uAmbientMapTexture, vUv).rgb;
    vec3 LightMapColor = texture2D(uLightMapTexture, vUv).rgb;

    float lightDeskStrength = LightMapColor.r * uDeskLightStrength;
    bakedColor = blendGlow(bakedColor, uDeskLightColor, lightDeskStrength);

    float lightCompStrength = LightMapColor.g * uCompLightStrength;
    bakedColor = blendLighten(bakedColor, uCompLightColor, lightCompStrength);

    float lightShelfStrength = LightMapColor.b * uShelfLightStrength;
    bakedColor = blendGlow(bakedColor, uShelfLightColor, lightShelfStrength);


    gl_FragColor = vec4(bakedColor, 1.0);
}