export function dedupeTags(tags: string[]): string[] {
  const seen = new Set<string>();

  return tags.reduce<string[]>((acc, tag) => {
    const normalized = tag.trim();

    if (!normalized) {
      return acc;
    }

    const key = normalized.toLowerCase();

    if (seen.has(key)) {
      return acc;
    }

    seen.add(key);
    acc.push(normalized);
    return acc;
  }, []);
}
