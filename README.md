# Byte 3D Building Explorer

## Dev Setup
To start the dev server simply run
`npm run serve`
Note to to have dev server be accessable to other local computers you must set a correct local ip in package.json under scripts serve --host
To find your local ip you can run
`ifconfig | egrep --color '(?:inet )(\d|\.)+'`
Example output:
inet 127.0.0.1 netmask 0xff000000 
inet **192.168.10.172** netmask 0xffffff00 broadcast 192.168.10.255
