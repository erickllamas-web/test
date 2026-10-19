#!/bin/sh
# Waits for the 4K stand-ins, then measures the seams before/after under 4K decode + a shaped network.
W=/tmp/claude-0/-home-user-test/6d9528b0-6431-5225-87a4-8233b3d39536/scratchpad/work
ORIG=$W/player/index.orig.html; NEW=$W/player/index.html
cd $W/tools
while ! grep -q done169n $W/site4k/encode.log; do sleep 5; done
NET=120/30   # ~2.6x the stand-ins' 46 Mbit/s, the ratio of a 9 Mbit/s master on a 25 Mbit/s line
node harness.mjs ../site4k $ORIG ../runs/4k_before start,sun,fly,drag 667x375 $NET > ../runs/4k_before.log 2>&1
python3 -I analyse.py ../runs/4k_before > ../runs/4k_before.txt 2>&1
node harness.mjs ../site4k $NEW  ../runs/4k_after  start,sun,fly,drag 667x375 $NET > ../runs/4k_after.log 2>&1
python3 -I analyse.py ../runs/4k_after > ../runs/4k_after.txt 2>&1
echo batch1 >> $W/runs/4k_progress
while ! grep -q done916n $W/site4k/encode.log; do sleep 5; done
node harness.mjs ../site4k $ORIG ../runs/4k_rot_before rotate 667x375 $NET > ../runs/4k_rot_before.log 2>&1
python3 -I analyse.py ../runs/4k_rot_before > ../runs/4k_rot_before.txt 2>&1
node harness.mjs ../site4k $NEW  ../runs/4k_rot_after  rotate 667x375 $NET > ../runs/4k_rot_after.log 2>&1
python3 -I analyse.py ../runs/4k_rot_after > ../runs/4k_rot_after.txt 2>&1
echo batch2 >> $W/runs/4k_progress
