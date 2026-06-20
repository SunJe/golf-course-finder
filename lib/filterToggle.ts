/** Toggle a filter chip; `전체` clears the group. */
export function toggleFilterOption(
  selected: string[],
  option: string,
  allLabel = "전체",
): string[] {
  if (option === allLabel) return [];
  if (selected.includes(option)) {
    return selected.filter((value) => value !== option);
  }
  return [...selected, option];
}
