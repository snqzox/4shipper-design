#!/bin/bash
# Double-click this in Finder to open the 4Shipper Design control panel.
# It starts the local dashboard server and opens it in your browser.
cd "$(dirname "$0")" || exit 1
echo "Starting 4Shipper Design control panel…"
echo "Leave this window open while you use the dashboard. Close it to stop."
DS_OPEN=1 npm run serve
