#!/bin/bash

uv venv
source ./venv/bin/activate
uv pip sync requirements.txt
