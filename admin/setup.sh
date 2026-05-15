#!/bin/bash
# tclif conda env already has gradio + pillow — no install needed.
# Run the admin panel with:
#   /home/jongmin/anaconda3/envs/tclif/bin/python admin/app.py
#
# Or from the project root:
#   bash admin/start.sh

echo "Using tclif conda env (gradio $(
  /home/jongmin/anaconda3/envs/tclif/bin/python -c 'import gradio; print(gradio.__version__)'
))"
echo "Start with: bash admin/start.sh"
