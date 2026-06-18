import fs from "node:fs";
import path from "node:path";

export type SourceRole =
  | "master"
  | "supplement"
  | "candidate"
  | "excluded"
  | "manual";

export interface GolfCourseSource {
  id: string;
  name: string;
  role: SourceRole;
  provider: string;
  expected_file_name: string;
  download_status: string;
  download_method: string;
  requires_login: boolean;
  requires_api_key: boolean;
  download_url?: string;
  expected_columns: string[];
  trusted_fields: string[];
  notes?: string;
}

export interface SourceRegistry {
  version: number;
  description?: string;
  roles?: Record<string, string>;
  sources: GolfCourseSource[];
  excluded_category_keywords?: string[];
  merge_policy_summary?: Record<string, boolean>;
}

const ROOT = path.resolve(__dirname, "../..");

export function getProjectRoot(): string {
  return ROOT;
}

export function getRegistryPath(): string {
  return path.join(ROOT, "data/sources/golf_course_sources.json");
}

export function getRawDir(): string {
  return path.join(ROOT, "data/raw");
}

export function getRawFilePath(expectedFileName: string): string {
  return path.join(getRawDir(), expectedFileName);
}

export function loadSourceRegistry(): SourceRegistry {
  const registryPath = getRegistryPath();
  const raw = fs.readFileSync(registryPath, "utf8");
  return JSON.parse(raw) as SourceRegistry;
}

export function sortSourcesMasterFirst(sources: GolfCourseSource[]): GolfCourseSource[] {
  const roleOrder: Record<string, number> = {
    master: 0,
    supplement: 1,
    manual: 2,
    candidate: 3,
    excluded: 4,
  };
  return [...sources].sort(
    (a, b) => (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99),
  );
}

export function findSourceByFileName(
  registry: SourceRegistry,
  fileName: string,
): GolfCourseSource | undefined {
  return registry.sources.find((s) => s.expected_file_name === fileName);
}

export function getMasterSource(registry: SourceRegistry): GolfCourseSource | undefined {
  return registry.sources.find((s) => s.role === "master");
}

export function isMasterSourceAvailable(registry?: SourceRegistry): boolean {
  const reg = registry ?? loadSourceRegistry();
  const master = getMasterSource(reg);
  if (!master) return false;
  const filePath = getRawFilePath(master.expected_file_name);
  if (!fs.existsSync(filePath)) return false;
  const stat = fs.statSync(filePath);
  return stat.size > 0;
}
