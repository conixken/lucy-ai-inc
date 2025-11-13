// Video enhancement utilities for color grading and quality improvements

export interface VideoEnhancement {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  vignette: number;
}

export const defaultEnhancement: VideoEnhancement = {
  brightness: 1.0,
  contrast: 1.1,
  saturation: 1.15,
  temperature: 0,
  vignette: 0.3,
};

export const applyVideoEnhancement = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  enhancement: VideoEnhancement = defaultEnhancement
) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Apply brightness
    r *= enhancement.brightness;
    g *= enhancement.brightness;
    b *= enhancement.brightness;

    // Apply contrast
    r = ((r / 255 - 0.5) * enhancement.contrast + 0.5) * 255;
    g = ((g / 255 - 0.5) * enhancement.contrast + 0.5) * 255;
    b = ((b / 255 - 0.5) * enhancement.contrast + 0.5) * 255;

    // Apply saturation
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + enhancement.saturation * (r - gray);
    g = gray + enhancement.saturation * (g - gray);
    b = gray + enhancement.saturation * (b - gray);

    // Apply temperature
    if (enhancement.temperature > 0) {
      r += enhancement.temperature * 10;
      b -= enhancement.temperature * 10;
    } else if (enhancement.temperature < 0) {
      r += enhancement.temperature * 10;
      b -= enhancement.temperature * 10;
    }

    // Clamp values
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);

  // Apply vignette
  if (enhancement.vignette > 0) {
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${enhancement.vignette})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
};
