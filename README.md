chipcaco (**Ch**inese **IP** **Ca**mera **Co**nverter) is a Node.js application
and library for converting `.264` files produced by some Chinese IP cameras.

At first glance it seems these files are raw H.264 streams. However they can't
be played or converted by common applications like [VLC](https://www.videolan.org/vlc/).
As it turns out proprietary extensions have been added to these files which need
to removed before they can be played or converted.

This is a port of the C application by [Ralph Spitzner](https://www.spitzner.org/kkmoon.html).

## Installation

Just install via [npm](https://npmjs.com/):

    npm install -g chipcaco

## Usage

    chipcaco <src> <dest>

where `<src>` is the source file produced by the camera and `<dest>` the destination file containing the processed data.

**Note**: The produced file must likely be additionally processed by `ffmpeg` or similar applications before it can be played. Example:

    ffmpeg -framerate 25 -i intermediate.264 -c copy video.mp4
