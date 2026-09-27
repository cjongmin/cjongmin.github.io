#!/usr/bin/env bash
# Rebuild the CV PDF from cv.html and publish it to the website.
#
# One-time setup:
#   conda create -n cvpdf -c conda-forge -y python=3.11 weasyprint
#
# Usage:
#   ./cv/build.sh
set -euo pipefail

CV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$CV_DIR")"

source "$HOME/anaconda3/etc/profile.d/conda.sh"
conda activate cvpdf

# The site serves the CV from public/ (cvFile in src/data/profile.json).
OUT="$REPO_ROOT/public/Jongmin_Choi_CV.pdf"
cd "$CV_DIR"
weasyprint cv.html "$OUT"

echo "Built $(du -h "$OUT" | cut -f1) → public/Jongmin_Choi_CV.pdf"
