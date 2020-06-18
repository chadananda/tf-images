# tf-images -- TensforFlow Keyword Image Grabber

![Screen Shot](sshot.png | height=300)

CLI tool for quickly fetching thousands of keyword images for ML training

Gathering up training images is a pain. With this CLI command, you can gather
thousands of training images in a minute, organized into folders by keyword.

This was an afternoon project I wrote to help my 7-yr-old learn TensorFlow.js
It has not been tested on Windows. Because I already did my time. Pull requests welcome.

## To install

```.js
npm i -g tensorflow-images
```

## Why?

Just install globally and then, from inside any directory invoke like:

```.js
ts-images "dog, cat, mouse, rat"
```

A `ts-images` dir will be created with sub-directories `dog`, `cat` etc.
Each sub-directory will contain hundreds of keyword images.pm

