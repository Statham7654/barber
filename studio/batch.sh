#!/bin/sh
# usage: PCT=25 studio/batch.sh SAMPLES shot1 shot2 ...
S=$1; shift
for s in "$@"; do python3 studio/studio.py $s $S 2>&1 | grep -E "Error|Traceback|rror:" ; echo "done $s"; done
