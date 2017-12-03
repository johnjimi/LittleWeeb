# LittleWeeb

LittleWeeb is a IRC XDCC Client Purely made for downloading anime. It features a simple design made to function and nothing more.

Be aware that this application is still in development and might still have some issues!

**Version 0.3.0 is hastly put together release due to atarashii's (public) api going down. Unfortunately I was in the middle of creating/changing the frontend to suit mobile usage and make it possible to run the back-end seperate. Normal usage should be fine, but those two things mentioned are still WIP and could possibly contain quit a few bugs/glitches since I didn't have the time to test them thoroughly.**

# Showcase/Usage
[YouTube - v0.2.0](https://youtu.be/GbBz1ReDahU)
[YouTube - pre v0.1.0 version](https://www.youtube.com/watch?v=yJjL9wQEEEQ)

# Screenshots
[![New update](https://i.imgur.com/2fAyiopl.png)](https://i.imgur.com/2fAyiop.png)
[![Currently Airing](https://i.imgur.com/H6dzjgll.png)](https://i.imgur.com/H6dzjgl.png)
[![Episodes View/Packlist View/Anime View](https://i.imgur.com/WpJcwvXl.png)](https://i.imgur.com/WpJcwvX.png)
[![Episodes View/Packlist View/Anime View - selecting episodes](https://i.imgur.com/eARK88Rl.png)](https://i.imgur.com/eARK88R.png)
[![Download View](https://i.imgur.com/x7afYadl.png)](https://i.imgur.com/x7afYad.png)

# New (Functional) Features! V0.3.0 is OUT!
- Custom build in directory browser (windows independed now).
- Old menu is back (works better :) )
- More responsive for mobile use. (still WIP)
- Additional stand-alone server to be used on a 24/7 server (still WIP)
- Possibly more things that I am currently forgetting at the moment ;)
 
**Be aware, since this is still WIP, issues can occur which didn't occur before, please notify me through the issues page!**

**More technical updates**
- Added more options for the backend api (see Wiki).
- Switched API from atarashii to anilist
- Worked on making the backend more stable 
- API: added connect and disconnect option, you can now specify which server, username and channels you want to join
- API: added directory management options: for retreiving, selecting and creating directories.
- Simplified logging system: now uses one text file.
- Added seperate irc chat log
- Did some work on parsing/searching packs from nibl using synonyms available through the api.


### Tech
LittleWeeb uses a number of open source projects to work properly:

**Interface:**
* [Semantic UI](https://semantic-ui.com/)- A slick looking CSS Framework.
* [jQuery] - unfortunately, semantic ui has a very limited angular implementation which didn't suit the needs for this application.
* [NIBL API](https://api.nibl.co.uk:8080/swagger-ui.html) - Thanks to nibl.co.uk API and the developer [Jenga201](https://github.com/jenga201) from NIBL to provide me the api and help that I need!
* [Anilist API](http://anilist-api.readthedocs.io/en/latest/introduction.html) - To replace atarashii's api.

**Backend:**

* [CefSharp](https://cefsharp.github.io/) - A awesome chromium based integrated webbrowser.
* [websocket-sharp](http://sta.github.io/websocket-sharp/) - A nice websocket library for C#.

### Installation & Local Usage

1. Go to the releases page of this repo, and download the zip file of the lastest version for local use.
2. Extract it to wherever you want. * 
3. Run the application by running the LittleWeeb.exe executable.
4. Download your anime :D.

*(Do note, the initial download directory is set to the same location where the executable is located,which can be changed in the settings menu, if you put it in your Program Files folder, it might not work correctly if you leave the downlaod directory as is!)


### Installation & Server Usage (Should work on every OS that supports MONO)

1. Go to the releases page of this repo, and download the zip file of the lastest version for server use.
2. Extract it to wherever you want. * 
3. Run the application by running the LittleWeebServer.exe executable.
4. Connect to your server with the mentioned ip:port address (which should be visible in console, if not, it is sort of like this: http://yourlocalnetworkip:6010)
5. Download your anime :D.

*(Do note, the initial download directory is set to the same location where the executable is located,which can be changed in the settings menu, if you put it in your Program Files folder, it might not work correctly if you leave the downlaod directory as is!)

### Development

This application is still in development, but I guess worthy to be thrown into the world by now. There are still a few features missing which I will add in the future (see Todos). 


### Todos

 - Fix bugs with downloading. <- still there, some files might not download very well.
 - Clean up some code. <- well, atleast I made some progress
 - Add support for running the interface and application seperate (so you can run the application on a NAS 24/7 for example) (It's WIP stage ATM).
 - Add back direct search on nibl.co.uk
 - Not being lazy and continue this project.

License
----

MIT

**Free Software, Hell Yeah!**
