// Browser Fingerprint Utility
// Generates a unique hardware fingerprint for trusted device verification
// Uses canvas, WebGL, and other browser characteristics

/**
 * Generate a SHA-256 hash of a string
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get canvas fingerprint
 * Different GPUs render text slightly differently
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 200;
    canvas.height = 50;

    // Draw text with specific styling
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Faber Smart Home', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Faber Smart Home', 4, 17);

    return canvas.toDataURL();
  } catch {
    return '';
  }
}

/**
 * Get WebGL fingerprint
 * Graphics card information
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';

    const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}~${renderer}`;
  } catch {
    return '';
  }
}

/**
 * Get audio fingerprint
 * Audio processing characteristics
 */
function getAudioFingerprint(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        resolve('');
        return;
      }

      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gainNode = context.createGain();
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0; // Mute
      oscillator.type = 'triangle';
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(0);

      scriptProcessor.onaudioprocess = (event) => {
        const data = event.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += Math.abs(data[i]);
        }
        
        oscillator.disconnect();
        scriptProcessor.disconnect();
        gainNode.disconnect();
        context.close();

        resolve(sum.toString());
      };

      // Timeout fallback
      setTimeout(() => {
        try {
          oscillator.disconnect();
          scriptProcessor.disconnect();
          gainNode.disconnect();
          context.close();
        } catch {}
        resolve('');
      }, 1000);
    } catch {
      resolve('');
    }
  });
}

/**
 * Get browser and system information
 */
function getSystemInfo(): string {
  const info = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0,
    navigator.platform,
  ];
  return info.join('|');
}

/**
 * Get installed plugins (limited in modern browsers)
 */
function getPlugins(): string {
  try {
    const plugins = Array.from(navigator.plugins || []);
    return plugins.map(p => p.name).join(',');
  } catch {
    return '';
  }
}

/**
 * Generate a unique hardware fingerprint
 * Combines multiple browser characteristics into a single hash
 */
export async function getHardwareFingerprint(): Promise<string> {
  try {
    const components = [
      getCanvasFingerprint(),
      getWebGLFingerprint(),
      getSystemInfo(),
      getPlugins(),
    ];

    // Add audio fingerprint (async)
    const audioFp = await getAudioFingerprint();
    components.push(audioFp);

    // Combine all components and hash
    const combined = components.join('###');
    const hash = await sha256(combined);

    return hash;
  } catch (error) {
    console.error('Failed to generate fingerprint:', error);
    return '';
  }
}

/**
 * Get a cached fingerprint (stored in sessionStorage)
 * Avoids recalculating on every request
 */
let cachedFingerprint: string | null = null;

export async function getCachedFingerprint(): Promise<string> {
  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  // Check sessionStorage
  const stored = sessionStorage.getItem('hw_fingerprint');
  if (stored) {
    cachedFingerprint = stored;
    return stored;
  }

  // Generate new fingerprint
  const fingerprint = await getHardwareFingerprint();
  if (fingerprint) {
    sessionStorage.setItem('hw_fingerprint', fingerprint);
    cachedFingerprint = fingerprint;
  }

  return fingerprint;
}
