#!/bin/bash
# Start the Gradio admin panel using the tclif conda environment.
# Run from the project root:  bash admin/start.sh
cd "$(dirname "$0")/.."
exec /home/jongmin/anaconda3/envs/tclif/bin/python admin/app.py
