# Terminal Switcher README

Welcome to Flo's terminal switcher. :)

## Features

This extension automatically switches to a terminal window that is in the (top-most) git root of a file when you open / switch to the file's editor window. This way you can have multiple projects open at once and rest assured that your terminal context will swap when your file does. It will also open a new terminal if you don't have one open in the file's git root

## Requirements

Uses `lsof`, and thus requires you to be on a linux distro. If you know any non-linux distros that come with lsof I could always add them

## Known Issues

This will switch to the first open terminal that matches the git root it finds. Currently there is no way to specify beyond this which terminal is associated with a git root 

## Release Notes

### 1.0.0

Initial release of Terminal Switcher
