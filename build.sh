echo Starting Build...

rm -rf build/*
mkdir build/unpacked
touch build/unpacked/combined.js

echo Create a combined javascript file...
cat buildPaths.config | while read file
do
	if [ ! -f $file ]; then
    	echo "File $file not found in filesystem, aborting..."
    	rm -rf build/*
    	exit 1
	fi

	cat $file >> build/unpacked/combined.js
done

echo Copying over the resources folder
cp -R resources build/unpacked

echo Copying over the _locales folder
cp -R _locales build/unpacked

echo Copying manifest
cp manifest.json build/unpacked/

echo Creating chrome extension...
zip -r -q build/webstore.zip build/unpacked/*

echo Build Successful.
