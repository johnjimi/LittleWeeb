import {Component} from '@angular/core';

@Component({
    selector: 'about',
    template: `<div class="row"> <div class="ui horizontal divider"> ABOUT </div></div>
    <div class="row">
  <p><strong>What is LittleWeeb?</strong></p>
<p>LittleWeeb is (supposed) to be a simplistic application with automates downloading using XDCC.</p>
<p><strong>What is XDCC?</strong></p>
<p>XDCC is a file sharing protocol build upon the DCC protocol running over IRC (Internet Relay Chat). It basically allows files to be shared using a central server acting as a bot on a chat channel, you can message the bot with an indicator for which file you want to download.</p>
<p>XDCC used to be popular in the day where IRC was used often to chat with each other, up till 2005. Then other chat services such as MSN and Skype took over. WIthout the file sharing part. But fortunately, the anime scene kept using XDCC, and due to the limited users, there is plenty of bandwith available! (Depending on the bot you choose to download from).</p>
<p><strong>What are the advantages of XDCC over other file sharing methods?</strong></p>
<ul>
<li>XDCC uses TCP instead of UDP (P2P/torrent)</li>
<li>TCP = serial download, you can start playing the file right after the download starts!</li>
<li>Single server that provides the file</li>
<li>You are not uploading</li>
<li>Stable download speed</li>
</ul>
<p><strong>What are the disadvantages of XDCC over other file sharing methods?</strong></p>
<ul>
<li>XDCC depends on a single file host.</li>
<li>Host regulates speed.</li>
<li>Host regulates availability.</li>
</ul>
<p><strong>How does LittleWeeb get it&#39;s information?</strong></p>
<p>LittleWeeb uses the API&#39;s from the following sources:</p>
<ul>
<li><a href="https://nibl.co.uk/"> NIBL - A XDCC indexer site for Anime</a></li>
<li><a href="https://atarashii.toshocat.com/docs/"> Atarashii - A anime information site.</a></li>
</ul>
<p><strong>Is LittleWeeb open source?</strong></p>
<p>Yup, ofcourse it is! Best way to be trusted is by opensourcing right? It&#39;s licensed using the MIT license, so technically speaking, you can do whatever you want with it!</p>
<p>Here you can find the source code AND the latest versions: https://github.com/EldinZenderink/LittleWeeb</p>
<p><strong>How does LittleWeeb work?</strong></p>
<p>LittleWeeb automatically connects you to a irc server (irc.rizon.net) and channel(s): #nibl,#horriblesubs,#littleweeb</p>
<p>It generates a username for you, so you don&#39;t have to do these little steps anymore. It gets the latest released episodes from NIBL and when you search for an anime, it uses the atarashii api (basically a MyAnimeList api, but done better). It then retreives every episode for each bot. You can specify a bot and a resolution. If you select the file and press Append to downloads, it starts downloading.&nbsp;</p>
<p>The back-end runs on your PC as well. That&#39;s the console window that shows when you launch the application. This application handles the connection with IRC and the downloading part. Everything else is done through the interface you are looking at right now. The interface launches in Chrome through the backend.&nbsp;</p>
<p>The interface is written in Angular 2/4 using TypeScript (it&#39;s awesome :D) and semanticui as css framework.</p>
<p>The backend is written in C#, using a few home made Libraries for WebSockets(connection between the interface and backend) and the IRC part.</p>
<p>All this can be found on github!</p>
<p><strong>Copyright Notice</strong></p>
<p><span style="color: rgb(68, 68, 68); font-family: Tahoma, Arial, Helvetica, sans-serif;">Copyrights and trademarks for the anime, and other promotional materials are held by their respective owners and their use is allowed under the fair use clause of the Copyright Law.</span></p>
<p><strong>Terms of Use</strong></p>
<p>You accept the Terms of Use when you start using this application!&nbsp;</p>
<p>There is nothing fancy. LittleWeeb is a free for all application in the purest meaning of the word.</p>
<p>It will not use any of your data for commercial ends. It does not track anything internally, neither does LittleWeeb log your usage.&nbsp;</p>
<p>It does log debug information locally, but it will not be send or transmitted or used without YOUR permission!.&nbsp;</p>
<p><strong>I &#39;the developer&#39; am not responsible for anything that happens when you use and/or after and/or before you used this application(The literal meaning of this sentence.). Using this application is at your OWN risk.&nbsp;</strong></p>
<p><strong>Legality&nbsp;</strong></p>
<p>LittleWeeb does not host and does not upload any copyrighted material. It is only a portal and uses third party sources for it&#39;s resources.&nbsp;</p>
<p><strong>As mentioned in the terms-of-use, it is your OWN responsibility to check if usage of this application is legal or illegal depending on your location and situation!</strong></p>
<p><em><strong>Europe:</strong></em></p>
<p>&nbsp;</p>
<p><b style="color: rgb(51, 51, 51); font-family: Verdana, Arial, sans-serif; text-align: justify;">Article&nbsp;3(1) of Directive 2001/29/EC of the European Parliament and of the Council of 22&nbsp;May 2001 on the harmonisation of certain aspects of copyright and related rights in the information society must be interpreted as meaning that, in order to establish whether the fact of posting, on a website, hyperlinks to protected works, which are freely available on another website without the consent of the copyright holder, constitutes a &lsquo;communication to the public&rsquo; within the meaning of that provision, it is to be determined whether those links are provided without the pursuit of financial gain by a person who did not know or could not reasonably have known the illegal nature of the publication of those works on that other website or whether, on the contrary, those links are provided for such a purpose, a situation in which that knowledge must be presumed.</b></p>
<p><strong>United States:</strong></p>
<p style="margin: 0.5em 0px; line-height: inherit; color: rgb(37, 37, 37); font-family: sans-serif; font-size: 14px;">There is substantial debate, and a number of disputes brewing, about whether linking to sites that allegedly engage in copyright infringing activities results in contributory or vicarious liability for the linking site. While the&nbsp;<b><a href="https://ilt.eff.org/index.php/Copyright:_Digital_Millennium_Copyright_Act" style="text-decoration-line: none; color: rgb(11, 0, 128); background: none;" title="Copyright: Digital Millennium Copyright Act">Digital Millennium Copyright Act (DMCA)</a></b>&nbsp;provides some protection for &ldquo;information location tools&rdquo; that link to infringing content, the law remains unsettled.</p>
<p>&nbsp;</p>
<ol style="line-height: 1.5em; margin: 0.3em 0px 0px 3.2em; padding: 0px; list-style-image: none; color: rgb(37, 37, 37); font-family: sans-serif; font-size: 14px;">
<li style="margin-bottom: 0.1em;"><i>Ticketmaster Corp. v. Microsoft Corp.</i>, No. 97-3055 DDP (C.D. Cal. Apr. 29, 1997). Microsoft operated a site called Sidewalk Seattle, which provided information about upcoming entertainment in the Seattle area. Among other things, it linked to the order form page at Ticketmaster&rsquo;s site in order to allow its users to easily order tickets to events described on the Seattle Sidewalk site. Ticketmaster argued that such deep linking unfairly avoided advertising and marketing on its site. Ticketmaster sued Microsoft alleging trademark dilution, false representation of affiliation under the Lanham Act, and false advertising and unfair competition under California law. Microsoft then filed a counterclaim seeking a declaration that linking is per se legal. The case was settled in February 1999. Microsoft agreed not to deep link from its Sidewalk city guides to pages within the Ticketmaster site and instead to point visitors to Ticketmaster&rsquo;s home page.</li>
<li style="margin-bottom: 0.1em;"><i>Shetland Times Ltd. v. Wills, et al.</i>, 1997 F.S.R. 604 (Ct. Sess. O.H.) (Ireland Oct. 24, 1996). The Shetland Times newspaper sought an injunction to prevent the Shetland News, a rival news website, from linking to Shetland Times websites, copying the text of the Times&rsquo; headlines and linking to the Times&rsquo; articles in such a way that readers might mistake them for the work of the News. The Times maintained that the News&rsquo; use of the Times&rsquo; site constituted copyright infringement and unfair competition. The court stated in an interlocutory decision that headlines could constitute literary works justifying copyright protection. The News maintained that creating links without permission is the essence of how the Web operates, and an injunction would &ldquo;block free access to the Internet.&rdquo; The case settled in November 1997. The Shetland News was granted permission to link to the Times&rsquo; headlines, so long as the links were labeled &ldquo;A Shetland Times Story&rdquo; and included a button linking to the Times.</li>
<li style="margin-bottom: 0.1em;"><i>Bernstein v. JC Penney, Inc.</i>, No. 98-2958, 1998 WL 906644, at *1 (C.D.Cal. Sept. 29, 1998) (unpublished) (granting, without discussion, defendant&#39;s motion to dismiss on the ground that hyperlinking cannot constitute direct infringement)</li>
<li style="margin-bottom: 0.1em;"><i>Intellectual Reserve, Inc. v. Utah Lighthouse Ministry</i>, 75 F. Supp. 2d 1290 (D. Utah 1999). Holders of a copyright in the Church Handbook of Instruction sued defendant for contributory infringement for linking to infringing copies of the work (after defendant was enjoined from itself posting the infringing copies). On unusual facts, the court found that defendants could be held liable for contributory infringement since they actively directed users to the infringing sites. Due to the unusual facts, this case has not been widely followed.</li>
<li style="margin-bottom: 0.1em;"><i><a href="https://ilt.eff.org/index.php/Ticketmaster_v._Tickets.com" style="text-decoration-line: none; color: rgb(11, 0, 128); background: none;" title="Ticketmaster v. Tickets.com">Ticketmaster v. Tickets.com</a></i>, 54 U.S.P.Q.2d 1344 (C.D. Cal. 2000) (&quot;[H]yperlinking does not itself involve a [direct] violation of the Copyright Act (whatever it may do for other claims) since no copying is involved.&quot;)</li>
<li style="margin-bottom: 0.1em;"><i>Arista Records, Inc. v. MP3Board, Inc.</i>, No. 00 CIV. 4660, 2002 WL 1997918, at *4 (S.D.N.Y. Aug. 29, 2002) (unreported) (linking to content does not implicate distribution right and thus, does not give rise to liability for direct copyright infringement)</li>
<li style="margin-bottom: 0.1em;"><i>Batesville Services, Inc. v. Funeral Depot, Inc.</i>, 2004 WL 2750253 (S.D.Ind. 2004) (unpublished) (&quot;facts are unusual enough to take this case out of the general principle that linking does not amount to copying. These facts indicate a sufficient involvement by Funeral Depot that could allow a reasonable jury to hold Funeral Depot liable for copyright infringement or contributory infringement, if infringement it is. The possibility of copyright infringement liability on these unusual facts showing such extensive involvement in the allegedly infringing display should not pose any broad threat to the use of hyperlinks on the internet.&quot;)</li>
<li style="margin-bottom: 0.1em;"><i>Online Policy Group v. Diebold, Inc.</i>, 337 F.Supp.2d 1195, 1202 n.12 (N.D. Cal. 2004) (&quot;Hyperlinking per se does not constitute direct copyright infringement because there is no copying.&quot;)</li>
<li style="margin-bottom: 0.1em;"><i>Comcast of Illinois X, LLC. v. Hightech Electronics, Inc.</i>, 2004 WL 1718522 (N.D.Ill. 2004) (unpublished) (allegations of paid &quot;hyper-links to websites that sold illegal pirating devices&quot; sufficient to state a claim under&nbsp;<a href="https://ilt.eff.org/index.php/Copyright:_Digital_Millennium_Copyright_Act#Anti-Circumvention_and_Anti-Trafficking_Provisions" style="text-decoration-line: none; color: rgb(11, 0, 128); background: none;" title="Copyright: Digital Millennium Copyright Act">17 U.S.C. &sect; 1203(a)</a>.)</li>
<li style="margin-bottom: 0.1em;"><i><a class="mw-redirect" href="https://ilt.eff.org/index.php/Perfect_10_v._Google,_Inc." style="text-decoration-line: none; color: rgb(11, 0, 128); background: none;" title="Perfect 10 v. Google, Inc.">Perfect 10 v. Google, Inc.</a></i>, 416 F.Supp.2d 828 (C.D.Cal. 2006) (&quot;use of frames and in-line links does not constitute a &quot;display&quot; of the full-size images stored on and served by infringing third-party websites.&quot;)</li>
</ol>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p><strong>Sources:&nbsp;</strong></p>
<p><a href="https://daniel.haxx.se/irchistory.html">https://daniel.haxx.se/irchistory.html</a></p>
<p><a href="https://en.wikipedia.org/wiki/XDCC">https://en.wikipedia.org/wiki/XDCC</a></p>
<p><a href="http://curia.europa.eu/juris/document/document.jsf;jsessionid=9ea7d2dc30d5429d5c79998d41e3ad5b92fcdabdc41d.e34KaxiLc3qMb40Rch0SaxyKa3b0?text=&amp;docid=183124&amp;pageIndex=0&amp;doclang=EN&amp;mode=req&amp;dir=&amp;occ=first&amp;part=1&amp;cid=764739">http://curia.europa.eu/juris/document/document.jsf;jsessionid=9ea7d2dc30d5429d5c79998d41e3ad5b92fcdabdc41d.e34KaxiLc3qMb40Rch0SaxyKa3b0?text=&amp;docid=183124&amp;pageIndex=0&amp;doclang=EN&amp;mode=req&amp;dir=&amp;occ=first&amp;part=1&amp;cid=764739</a></p>
<p><a href="https://ilt.eff.org/index.php/Copyright:_Infringement_Issues#Linking">https://ilt.eff.org/index.php/Copyright:_Infringement_Issues#Linking</a></p>
    </div>

              `,
})
export class About {
}