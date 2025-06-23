export interface ParsedFrame {
  file?: string;
  function?: string;
  line?: number;
  column?: number;
}

export function getSourceInfo(depth: number = 3): ParsedFrame {
  const err = new Error();
  const stack = err.stack || '';
  const lines = stack.split('\n').slice(depth);

  for (const line of lines) {
    const match = line.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) ||
                  line.match(/at\s+(.*):(\d+):(\d+)/);
    if (match) {
      if (match.length === 5) {
        const [, fn, file, lineNum, colNum] = match;
        return {
          file,
          function: fn.trim(),
          line: parseInt(lineNum),
          column: parseInt(colNum),
        };
      } else if (match.length === 4) {
        const [, file, lineNum, colNum] = match;
        return {
          file,
          line: parseInt(lineNum),
          column: parseInt(colNum),
        };
      }
    }
  }

  return {};
}