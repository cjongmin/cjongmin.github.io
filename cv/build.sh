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

cd "$CV_DIR"
weasyprint cv.html Jongmin_Choi_CV.pdf

# The site serves the CV from public/ — keep the published copy in sync.
cp Jongmin_Choi_CV.pdf "$REPO_ROOT/public/Jongmin_Choi_CV.pdf"

echo "Built $(du -h Jongmin_Choi_CV.pdf | cut -f1) → cv/Jongmin_Choi_CV.pdf and public/"
