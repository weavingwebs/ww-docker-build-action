#!/bin/sh

set -eu

SRC_PATH=$(pwd)
cd /ww-docker-build
yarn run build "$SRC_PATH"
