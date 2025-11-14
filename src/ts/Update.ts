import { getVersion } from "@tauri-apps/api/app";

export async function checkUpdate(): Promise<{version: string, notes: string, url: string} | null> {
  try {
    const currentVersion = await getVersion();
    const url = "https://gist.githubusercontent.com/fynn-gr/1a58d8cd372928f40e1b046da69c38b4/raw/update-stable.json";
    const res = await fetch(url, { cache: "no-store"});
    if (!res.ok) throw new Error(`Failed to fetch ${res.status}`)
    const data = await res.json();
    const latestVersion = data.version?.trim();
    if (!latestVersion) throw new Error("invalid format")

      // Simple semver comparison
      if (isNewerVersion(latestVersion, currentVersion)) {
        console.log("new update", data)
        return {
          version: latestVersion,
          notes: data.notes,
          url: data.url
        };
      } else {
        console.log("✅ App is up to date:", currentVersion);
        return null;
      }
  } catch(err) {
    console.error(err)
    return null;
  }
}

function isNewerVersion(remote: string, local: string): boolean {
  const r = remote.split(".").map(Number);
  const l = local.split(".").map(Number);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const diff = (r[i] || 0) - (l[i] || 0);
    if (diff > 0) return true;
    if (diff < 0) return false;
  }
  return false;
}