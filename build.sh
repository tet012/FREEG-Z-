# install requirements:
# npm install -g uglifyjs uglifycss

# clean
rm -rf dist

# create folder
mkdir dist

# build js
cat utils.js init.js background.js packing.js petal.js core.js stem.js insects.js script.js > dist/bundle.js
cat dist/bundle.js | uglifyjs --output-opts quote_style=1 -o dist/bundle.min.js
sed 's/\\/\\\\/g' dist/bundle.min.js > dist/bundle.escaped.min.js

# build css
uglifycss style.css > dist/style.min.css
