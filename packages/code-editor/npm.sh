#!/bin/bash

npm unpublish @obsidians/code-editor --force --registry http://localhost:4873
npm publish --registry http://localhost:4873