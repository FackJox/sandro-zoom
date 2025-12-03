export type VideoSource = {
  src: string;
  type: string;
};

function stripExtension(path: string) {
  const lastDot = path.lastIndexOf('.');
  if (lastDot === -1) return path;
  return path.slice(0, lastDot);
}

export function getVideoSources(path: string): VideoSource[] {
  const base = stripExtension(path);
  return [
    {
      src: `${base}.av1.webm`,
      type: 'video/webm; codecs=av01.0.05M.08'
    },
    {
      src: `${base}.hevc.mp4`,
      type: 'video/mp4; codecs=hev1.1.6.L120.B0'
    },
    {
      src: path,
      type: 'video/mp4'
    }
  ];
}
