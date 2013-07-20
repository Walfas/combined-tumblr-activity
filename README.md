Combined Tumblr Activity
========================

This userscript adds the notifications functionality of the Tumblr apps on 
iOS and Android, where notifications include notes from all sideblogs.

![Notifications page](tumblr_notifications.png)

The script adds a link to the right sidebar to a _notifications_ page, and 
on that page, the script makes a request to the activity page for each 
sideblog in the sideblogs dropdown. It takes all the notes on those pages 
combined (up to a certain amount, defined by `maxNotes` in the script), sorts 
them by date, and adds date separators between posts that occur on different 
days.

