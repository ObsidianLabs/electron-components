#!/bin/bash

npm unpublish @obsidians/notification --force --registry http://localhost:4873
npm publish --registry http://localhost:4873