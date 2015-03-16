## Prototype SD card image writer for linux
This is a prototype nw.js app which provides a GUI allowing users to write .img files to SD cards connected to linux systems and also keeps track of the progress by displaying it on a progress bar. With this the user will not have to touch the terminal.

![proto-sd](https://cloud.githubusercontent.com/assets/751875/6658099/b34fa86e-cb84-11e4-896c-011b32382fba.png)

###Usage
**Note**: The app does not work properly on nw.js v0.11.x due to this issue: https://github.com/nwjs/nw.js/issues/272

**Please use nw.js v0.10.5 or lower (tested on v0.10.5)**

**Warning**: This is a prototype and all errors may not be handled properly

* Simply download/clone and run `nw` on the `app/` directory
* Choose the disk corresponding to your SD card (you can remove and re-insert and refresh to find out)
* Browse for your .img file and locate it
* Press the Write Image button, watch the progress and wait for it to complete.

###Working
The app works as follows:
* Finds and lists all available disk drives. (using `fdisk`)
* Unmounts all partitions pertaining to the selected disk (using `df` and `umount`)
* Writes image to disk using `dd`
* Tracks progress by `watch`ing periodic `pkill`s on `dd`

(Clearly watching pkills doesn't seem to be a very efficient way to track progress, but is the only option given that dd does not write to output streams at all)
