#!/usr/bin/env bash
# The bundler's own strip + parse + leak checks (bundle_birthday.sh), applied to one player file.
set -u; in="$1"; tmp=$(mktemp)
awk '
  /<script>/ { js = 1 }  /<\/script>/ { js = 0 }
  /<style>/  { css = 1 } /<\/style>/  { css = 0 }
  {
    line = $0
    if (html) { if (line ~ /-->/) { sub(/.*-->/, "", line); html = 0 } else next }
    while (!js && match(line, /<!--/)) {
      pre = substr(line, 1, RSTART - 1); rest = substr(line, RSTART + 4)
      if (match(rest, /-->/)) line = pre substr(rest, RSTART + 3)
      else { line = pre; html = 1; break }
    }
    if (css) {
      if (cc) { if (line ~ /\*\//) { sub(/.*\*\//, "", line); cc = 0 } else next }
      while (match(line, /\/\*/)) {
        pre = substr(line, 1, RSTART - 1); rest = substr(line, RSTART + 2)
        if (match(rest, /\*\//)) line = pre substr(rest, RSTART + 2)
        else { line = pre; cc = 1; break }
      }
    }
    if (js) {
      if (line ~ /^[ \t]*\/\//) next
      sub(/[ \t]+\/\/.*$/, "", line)
    }
    if (line ~ /^[ \t]*$/) { if (blank++) next } else blank = 0
    print line
  }' "$in" > "$tmp.html"
awk '/<script>/{s=1; next} /<\/script>/{s=0} s' "$tmp.html" > "$tmp.js"
node --check "$tmp.js" && echo "stripped player parses: OK ($(wc -c < "$tmp.html") bytes)"
leak=$(grep -o -i -E "babel_productions|daemon|dtrig|the baker|bake time|on the metal|sky\.rs|morpheus|celestial|nemo|c3po|grid-search|erick|nous|birthday\.rs" "$tmp.html" | sort | uniq -c | tr '\n' ' ')
[ -z "$leak" ] && echo "leak scan: clean" || echo "LEAK: $leak"
cp "$tmp.html" "${in%.html}.stripped.html"; rm -f "$tmp" "$tmp.html" "$tmp.js"
