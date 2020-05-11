#!/bin/bash

npm unpublish @obsidians/file-ops --force --registry http://localhost:4873
npm publish --registry http://localhost:4873