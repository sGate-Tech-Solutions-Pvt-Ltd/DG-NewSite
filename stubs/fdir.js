// Stub for `fdir` (pulled in transitively via `tinyglobby`, used by StudioCMS's
// i18n "load JS translation files from disk" feature). fdir's real
// implementation calls `createRequire(import.meta.url)` at module load time,
// which crashes immediately once bundled for the Workers runtime (no real
// file: URL there). This feature also can't work in Workers regardless — there
// is no filesystem to glob, and dynamic `import()` of arbitrary file paths
// isn't supported — so rather than crash on merely importing it, this stub
// makes any crawl/glob call resolve to an empty result, matching what
// tinyglobby's `glob()` returns when a pattern matches nothing.
class Crawler {
  withPromise() {
    return Promise.resolve([]);
  }
  sync() {
    return [];
  }
}

export class fdir {
  group() {
    return this;
  }
  withPathSeparator() {
    return this;
  }
  withBasePath() {
    return this;
  }
  withRelativePaths() {
    return this;
  }
  withDirs() {
    return this;
  }
  withMaxDepth() {
    return this;
  }
  withMaxFiles() {
    return this;
  }
  withFullPaths() {
    return this;
  }
  withErrors() {
    return this;
  }
  withSymlinks() {
    return this;
  }
  withAbortSignal() {
    return this;
  }
  normalize() {
    return this;
  }
  filter() {
    return this;
  }
  onlyDirs() {
    return this;
  }
  exclude() {
    return this;
  }
  onlyCounts() {
    return this;
  }
  withGlobFunction() {
    return this;
  }
  crawl() {
    return new Crawler();
  }
  crawlWithOptions() {
    return new Crawler();
  }
  glob() {
    return new Crawler();
  }
  globWithOptions() {
    return new Crawler();
  }
}
export default { fdir };
