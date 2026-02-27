import * as cheerio from "cheerio";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Episode, EpisodeIndex, SeasonEntry } from "../src/types/transcript.js";
import { classifyParagraph } from "./parse-utils.js";

const BASE_URL = "https://bigbangtrans.wordpress.com/";
const DATA_DIR = join(import.meta.dirname, "..", "public", "data", "tbbt");

interface EpisodeLink {
  season: number;
  episode: number;
  title: string;
  url: string;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function seasonFolderName(season: number): string {
  return `S${pad2(season)}`;
}

function episodeFileName(season: number, episode: number): string {
  return `s${pad2(season)}e${pad2(episode)}.json`;
}

function episodeRelativePath(season: number, episode: number): string {
  return `${seasonFolderName(season)}/${episodeFileName(season, episode)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

async function scrapeIndex(): Promise<EpisodeLink[]> {
  console.log("Fetching homepage...");
  const html = await fetchPage(BASE_URL);
  const $ = cheerio.load(html);

  const links: EpisodeLink[] = [];
  $("li.page_item a").each((_, el) => {
    const anchor = $(el);
    const text = anchor.text().trim();
    const url = anchor.attr("href");
    if (!url) return;

    const match = text.match(
      /series\s+(\d+)\s+episode\s+(\d+)\s*[-–—]\s*(.+)/i
    );
    if (match) {
      links.push({
        season: parseInt(match[1], 10),
        episode: parseInt(match[2], 10),
        title: match[3].trim(),
        url,
      });
    }
  });

  links.sort((a, b) => a.season - b.season || a.episode - b.episode);
  console.log(`Found ${links.length} episodes.`);
  return links;
}

function buildIndex(links: EpisodeLink[]): EpisodeIndex {
  const seasonMap = new Map<number, SeasonEntry>();

  for (const link of links) {
    let season = seasonMap.get(link.season);
    if (!season) {
      season = { season: link.season, episodes: [] };
      seasonMap.set(link.season, season);
    }
    const file = episodeRelativePath(link.season, link.episode);
    season.episodes.push({
      episode: link.episode,
      title: link.title,
      file,
    });
  }

  const seasons = Array.from(seasonMap.values()).sort(
    (a, b) => a.season - b.season
  );

  return { series: "The Big Bang Theory", seasons };
}

async function scrapeEpisode(link: EpisodeLink): Promise<Episode> {
  const html = await fetchPage(link.url);
  const $ = cheerio.load(html);

  const entryText = $(".entrytext");
  const lines: Episode["lines"] = [];

  entryText.find("p").each((_, el) => {
    const p = $(el);
    const line = classifyParagraph($, p);
    if (line) {
      lines.push(line);
    }
  });

  return {
    series: "The Big Bang Theory",
    season: link.season,
    episode: link.episode,
    title: link.title,
    url: link.url,
    lines,
  };
}

function saveJSON(filePath: string, data: Episode | EpisodeIndex): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

async function main(): Promise<void> {
  mkdirSync(DATA_DIR, { recursive: true });

  const indexOnly = process.argv.includes("--index-only");
  const seasonArg = process.argv.find((a) => a.startsWith("--season="));
  const episodeArg = process.argv.find((a) => a.startsWith("--episode="));
  const targetSeason = seasonArg ? parseInt(seasonArg.split("=")[1], 10) : null;
  const targetEpisode = episodeArg
    ? parseInt(episodeArg.split("=")[1], 10)
    : null;

  let links: EpisodeLink[];

  const indexPath = join(DATA_DIR, "index.json");
  if (!indexOnly && existsSync(indexPath)) {
    console.log("Using existing index.json...");
    const existingIndex: EpisodeIndex = JSON.parse(readFileSync(indexPath, "utf-8"));
    links = [];
    for (const season of existingIndex.seasons) {
      for (const ep of season.episodes) {
        links.push({
          season: season.season,
          episode: ep.episode,
          title: ep.title,
          url: "",
        });
      }
    }
    const freshLinks = await scrapeIndex();
    const urlMap = new Map(
      freshLinks.map((l) => [`${l.season}-${l.episode}`, l.url])
    );
    for (const link of links) {
      link.url = urlMap.get(`${link.season}-${link.episode}`) ?? "";
    }
  } else {
    links = await scrapeIndex();
  }

  const index = buildIndex(links);
  saveJSON(indexPath, index);
  console.log(`Saved index.json with ${links.length} episodes.`);

  if (indexOnly) return;

  let toScrape = links;
  if (targetSeason !== null) {
    toScrape = toScrape.filter((l) => l.season === targetSeason);
  }
  if (targetEpisode !== null) {
    toScrape = toScrape.filter((l) => l.episode === targetEpisode);
  }

  console.log(`Scraping ${toScrape.length} episodes...`);

  for (let i = 0; i < toScrape.length; i++) {
    const link = toScrape[i];
    const seasonFolder = seasonFolderName(link.season);
    const file = episodeFileName(link.season, link.episode);
    const relativePath = `${seasonFolder}/${file}`;
    const seasonDirPath = join(DATA_DIR, seasonFolder);
    const filePath = join(seasonDirPath, file);

    mkdirSync(seasonDirPath, { recursive: true });

    console.log(
      `[${i + 1}/${toScrape.length}] S${String(link.season).padStart(2, "0")}E${String(link.episode).padStart(2, "0")} - ${link.title}`
    );

    const episode = await scrapeEpisode(link);
    saveJSON(filePath, episode);
    console.log(`  → ${episode.lines.length} lines (${relativePath})`);

    if (i < toScrape.length - 1) {
      await sleep(1500);
    }
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
