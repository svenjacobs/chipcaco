chipcaco (**Ch**inese **IP** **Ca**mera **Co**nverter) is a Node.js application
and library for converting `.264` files produced by some Chinese IP cameras.

At first glance it seems these files are raw H.264 streams. However they can't
be played or converted by common applications like [VLC](https://www.videolan.org/vlc/).
As it turns out proprietary extensions have been added to these files which need
to removed before they can be played or converted.

This is a port of the C application by [Ralph Spitzner](https://www.spitzner.org/kkmoon.html).
