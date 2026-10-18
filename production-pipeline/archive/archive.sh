#!/bin/bash
# archive.sh FILM.json WORK_DIR OUT_DIR [--drive "Drive folder"] — the film's proof in one folder: the shot file, the EDL,
# the checks, the qc, the master manifest, every clip manifest found, the resolved settings, the libraries at this
# revision, and the masters. One folder per film per date; an INDEX.md names everything with its sha256.
# With --drive, each file is put in the Drive with A-FILES' `drive put` (hash checked by it).
set -u
FILM=${1:?FILM.json}; WORK=${2:?work dir}; OUT=${3:?out dir}; shift 3; DRIVE=""
while [ $# -gt 0 ]; do case "$1" in --drive) DRIVE=$2; shift 2;; *) shift;; esac; done
H=$(cd "$(dirname "$0")/.." && pwd); T=$(python3 -I -c "import json,sys;print(json.load(open(sys.argv[1]))['title'])" "$FILM" 2>/dev/null || node -e "console.log(require(process.argv[1]).title)" "$FILM")
D="$OUT/${T}_$(date +%Y%m%d)"; mkdir -p "$D"/{film,edit,master,clips,library}
cp "$FILM" "$D/film/"; cp -n "$WORK"/*_edl.json "$WORK"/*_check_edit.md "$WORK"/*_qc.md "$WORK"/*_chapters.txt "$WORK"/*_voice.srt "$WORK"/*.otio "$WORK"/compare_*.json "$WORK"/compare_*.png "$D/edit/" 2>/dev/null
cp -n "$WORK"/master/*_master.json "$WORK"/master/*.srt "$WORK"/master/*_chapters.txt "$WORK"/master/*_poster.* "$D/master/" 2>/dev/null
for f in "$WORK"/master/*_master.* "$WORK"/master/*_youtube.* "$WORK"/master/*_preview.*; do [ -f "$f" ] && cp -n "$f" "$D/master/"; done
find "$WORK" -maxdepth 3 -name '*.manifest.json' -exec cp -n {} "$D/clips/" \; 2>/dev/null
cp "$H"/film-language/*.json "$H"/film-language/FILM_LANGUAGE.md "$D/library/" 2>/dev/null; cp -r "$H"/director/strategies "$D/library/" 2>/dev/null
SET=$(node -e "try{const s=require(process.argv[1]).site;console.log(s||'')}catch(e){console.log('')}" "$FILM"); [ -n "${GO_SH:-}" ] && [ -f "$GO_SH" ] && node "$H/render/manifest.js" settings "$GO_SH" > "$D/film/settings_resolved.txt"
{ echo "# $T — archive $(date -Is)"; echo; echo "Made by archive.sh from $WORK. Every file with its sha256 (first 16)."; echo; for f in $(cd "$D" && find . -type f | sort); do printf -- '- `%s` %s %s\n' "$f" "$(sha256sum "$D/$f" | cut -c1-16)" "$(du -h "$D/$f" | cut -f1)"; done; } > "$D/INDEX.md"
echo "archive $D ($(find "$D" -type f | wc -l) files, $(du -sh "$D" | cut -f1))"
if [ -n "$DRIVE" ]; then DP=/home/erick/agents/a-files/bin/drive; [ -x "$DP" ] && (cd "$D" && find . -type f | sed 's|^\./||' | while read -r f; do "$DP" put "$D/$f" "$DRIVE/$(basename "$D")/$(dirname "$f")"; done) || echo "drive tool not here: $DP (run on the laptop)"; fi
