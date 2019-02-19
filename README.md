# Live poll

[![Build Status](https://travis-ci.org/dvdcastro/moodle-mod_livepoll.svg?branch=master)](https://travis-ci.org/dvdcastro/moodle-mod_livepoll)

This module allows having a live updating poll.

It uses Firebase to push the updates and stores the data anonymously, so no GDPR
concerns there.

## Configuration

1. Go to [Firebase](https://firebase.google.com/) and create an account
2. Once in the [Firebase console](https://console.firebase.google.com), create a project
3. [Enable anonymous authentication](https://firebase.google.com/docs/auth/web/anonymous-auth), if anonymous authentication is not setup, the poll will not work.
4. From the project overview page in the [Firebase console](https://console.firebase.google.com),
click __Add Firebase to your web app__. If your project already has an app, select __Add App__
from the project overview page.
5. You can copy and paste the __Project ID__ and __API Key__ to add
them to the Moodle plugin settings page. _Site administration > Plugins > Activity modules > Live poll_

## Usage

Just use it like a normal activity, this will not store any of the responses into Moodle.

## License

Copyright (c) 2018 Blackboard Inc. (http://www.blackboard.com)

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program.  If not, see <http://www.gnu.org/licenses/>.
