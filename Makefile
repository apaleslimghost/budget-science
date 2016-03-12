SRC_FILES = $(wildcard src/*.js)
JS_FILES = $(patsubst src/%, lib/%, $(SRC_FILES))
BABEL_OPTS = --presets es2015 --plugins transform-class-properties

all: $(JS_FILES)

lib/%.js: src/%.js
	@mkdir -p $(@D)
	babel $< $(BABEL_OPTS) -o $@

run: all test.js
	node test.js

db.json:
	node -e "require('stepford-cache')('db.json', require('./config.json'))"

.PHONY: db.json
