export function parseTranscript(source: string) {
  const headers = [...source.matchAll(/^(?:(.+?) \((\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\)|\[(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\] (.+?):)[ \t]*$/gm)];
  return headers.map((header, index) => ({
    speaker: (header[1] || header[4])!.trim(),
    timestamp: (header[2] || header[3])!,
    text: source.slice(header.index! + header[0].length, headers[index + 1]?.index ?? source.length).trim().replace(/\s*\n\s*/g, ' '),
  }));
}
