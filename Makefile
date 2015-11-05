db.json:
	node -e "require('stepford-cache')('db.json', require('./config.json'))"

.PHONY: db.json
