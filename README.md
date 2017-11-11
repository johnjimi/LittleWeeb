# LittleWeeb

LittleWeeb is a IRC XDCC Client Purely made for downloading anime. It features a simple design made to function and nothing more.

Be aware that this application is still in development and might still have some issues!

# Showcase/Usage
[YouTube - v0.2.0] (https://youtu.be/GbBz1ReDahU)
[YouTube - pre v0.1.0 version](https://www.youtube.com/watch?v=yJjL9wQEEEQ)

# Screenshots
[![New update](https://i.imgur.com/2fAyiopl.png)](https://i.imgur.com/2fAyiop.png)
[![Currently Airing](https://i.imgur.com/H6dzjgll.png)](https://i.imgur.com/H6dzjgl.png)
[![Episodes View/Packlist View/Anime View](https://i.imgur.com/WpJcwvXl.png)](https://i.imgur.com/WpJcwvX.png)
[![Episodes View/Packlist View/Anime View - selecting episodes](https://i.imgur.com/eARK88Rl.png)](https://i.imgur.com/eARK88R.png)
[![Download View](https://i.imgur.com/x7afYadl.png)](https://i.imgur.com/x7afYad.png)

# New Features! V0.2.0 is OUT!
- Going full JSON :)  (See wiki for backend api if you want to develop your own interface ;D)
- Made episode ordering/searching better.
- Used Atarashii's API for currently airing and anime information.
- Made it more stable ;), mostly under the hood stuff. 
 
**Be aware, since this is still WIP, issues can occur which didn't occur before, please notify me through the issues page!**

**Actual new features that you see!**
V0.1.3
- Listing with packs/files now only shows available bots which actually contain episodes!
- Listing with packs/files now orders per episode!
- Listing with packs/files can now suggest the best download by hitting the checkbox infront of the episode number!
- Listing with packs/files can now select all episodes for the current anime at once and does the above for downloading.
- Listing with packs/files now shows the file size per file
- The menu now shows next to the Downloads button the amount of files being downloaded
- The downloads page now shows all already downloaded files
- The downloads page now shows file size per file
- Search results now shows per anime, instead of per file. It also shows a nice cover/picture.
- Removed unecesarry botlist and latest pack view.
- Added version control, when a new version releases, you get a message!
- Probably more things which I am forgetting at the moment.
- Somewhat finished about page, with license and terms of use etc.

V0.2.0
- Improved loading times
- No loading again if you view currently airing after first load.
- Fully detailed anime information
- High dpi screens now supported



### Tech

LittleWeeb uses a number of open source projects to work properly:

**Interface:**
* [CefSharp](https://cefsharp.github.io/) - A awesome chromium based integrated webbrowser.
* [websocket-sharp](http://sta.github.io/websocket-sharp/) - A nice websocket library for C#.
* [Semantic UI](https://semantic-ui.com/)- A slick looking CSS Framework.
* [jQuery] - unfortunately, semantic ui has a very limited angular implementation which didn't suit the needs for this application.
* [NIBL API](https://api.nibl.co.uk:8080/swagger-ui.html) - Thanks to nibl.co.uk API and the developer [Jenga201](https://github.com/jenga201) from NIBL to provide me the api and help that I need!
* [Atarashii API](https://atarashii.toshocat.com/docs/) - Open available api to get anime information.


### Installation & Usage

1. Go to the releases page of this repo, and download the zip file of the lastest version.
2. Extract it to wherever you want. * 
3. Run the application by running the LittleWeeb.exe executable.
4. Download your anime :D.

*(Do note, the initial download directory is set to the same location where the executable is located,which can be changed in the settings menu, if you put it in your Program Files folder, it might not work correctly if you leave the downlaod directory as is!)

### Development

This application is still in development, but I guess worthy to be thrown into the world by now. There are still a few features missing which I will add in the future (see Todos). 


### Todos

 - Fix bugs with downloading. <- still there, some files might not download very well.
 - Clean up some code. <- well, atleast I made some progress
 - Add support for running the interface and application seperate (so you can run the application on a NAS 24/7 for example).
 - Add back direct search on nibl.co.uk
 - Not being lazy and continue this project.

License
----

MIT

**Free Software, Hell Yeah!**
