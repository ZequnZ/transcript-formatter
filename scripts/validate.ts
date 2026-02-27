import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Episode, EpisodeIndex } from "../src/types/transcript.js";

const DATA_DIR = join(import.meta.dirname, "..", "public", "data", "tbbt");

function padded(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

function isValidEpisodePath(file: string): boolean {
  if (!file) return false;
  if (file.startsWith("/") || file.startsWith("\\")) return false;
  return /^S\d{2}\/s\d{2}e\d{2}\.json$/.test(file);
}

function main(): void {
  const indexPath = join(DATA_DIR, "index.json");
  if (!existsSync(indexPath)) {
    console.error("index.json not found. Run scrape:index first.");
    process.exit(1);
  }

  const index: EpisodeIndex = JSON.parse(readFileSync(indexPath, "utf-8"));

  let totalEpisodes = 0;
  let totalLines = 0;
  let errors = 0;

  for (const season of index.seasons) {
    const seasonChars = new Set<string>();

    for (const ep of season.episodes) {
      totalEpisodes++;

      if (!isValidEpisodePath(ep.file)) {
        console.error(
          `INVALID PATH: ${ep.file} (expected S{SS}/s{SS}e{EE}.json for S${padded(season.season)}E${padded(ep.episode)})`
        );
        errors++;
        continue;
      }

      const filePath = join(DATA_DIR, ep.file);

      if (!existsSync(filePath)) {
        console.error(
          `MISSING: ${ep.file} (resolved ${filePath}) (S${padded(season.season)}E${padded(ep.episode)} - ${ep.title})`
        );
        errors++;
        continue;
      }

      const episode: Episode = JSON.parse(readFileSync(filePath, "utf-8"));

      if (episode.lines.length < 10) {
        console.error(`TOO FEW LINES: ${ep.file} has ${episode.lines.length} lines`);
        errors++;
      }

      for (const line of episode.lines) {
        totalLines++;

        if (line.type === "dialog" && !line.character) {
          console.error(`NULL CHARACTER: ${ep.file} has dialog line without character: "${line.text.slice(0, 50)}"`);
          errors++;
        }

        if (line.type === "dialog" && line.character) {
          seasonChars.add(line.character);
        }

        const lowerText = line.text.toLowerCase();
        if (lowerText.includes("credit") || lowerText.startsWith("previously on")) {
          console.warn(`POSSIBLE LEAKED LINE: ${ep.file}: "${line.text.slice(0, 60)}"`);
        }
      }
    }

    console.log(`Season ${season.season}: ${season.episodes.length} episodes, ${seasonChars.size} unique characters`);
  }

  console.log(`\nTotal: ${totalEpisodes} episodes, ${totalLines} lines`);

  if (errors > 0) {
    console.error(`\n${errors} error(s) found.`);
    process.exit(1);
  } else {
    console.log("All checks passed.");
  }
}

main();
