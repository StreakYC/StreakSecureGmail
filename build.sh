echo Starting Build...

rm -rf build/*
mkdir build/temp
touch build/temp/combined.js

echo Create a combined javascript file...
cat buildPaths.config | while read file
do 
	if [ ! -f $file ]; then
    	echo "File $file not found in filesystem, aborting..."
    	rm -rf build/*
    	exit 1
	fi

	cat $file >> build/temp/combined.js
done

echo Copying over the resources folder
cp -R resources build/temp

echo Copying over manifest.json
cp manifest.json build/temp

echo Creating chrome extension...
zip -r -q build/webstore.zip build/temp/*

echo Cleaning up...
rm -rf build/temp

echo Build Successful.
