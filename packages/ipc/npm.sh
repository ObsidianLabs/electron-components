#!/bin/bash

npm unpublish @obsidians/ipc --force --registry http://localhost:4873
npm publish --registry http://localhost:4873