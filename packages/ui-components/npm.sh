#!/bin/bash

npm unpublish @obsidians/ui-components --force --registry http://localhost:4873
npm publish --registry http://localhost:4873