## 📱 Blogger Feed Reader (PWA Version)

A lightweight Progressive Web App that fetches and displays Blogger RSS feeds with:
- ✔ Image preview
- ✔ Popup full-post reader
- ✔ Pagination
- ✔ Add-to-Home-Screen (PWA)
- ✔ Offline UI support

Perfect for users who want a simple, fast, mobile-friendly Blogger feed reader.


---

## 🚀 Features

- ✔ 1. Blogger RSS Feed Fetch

Supports:

yourblog.blogspot.com

Custom domains (dpdns.org, qzz.io, .com, etc.)


- ✔ 2. Auto Image Extract

Automatically grabs the featured image from each Blogger post.

- ✔ 3. Beautiful Popup Reader

Tap on any feed item to open a full content popup with:

Scrollable content

Images, text, headings

Clean, mobile-friendly layout


- ✔ 4. Pagination

Navigate your feed easily using:

Next Page

Previous Page


(Each page shows up to 15 posts by default.)

- ✔ 5. Add-To-Home-Screen (PWA Install)

Fully installable on:
📱 Android / Chrome / Edge
Works like a native mobile app.

- ✔ 6. Offline Cache (Service Worker)

The UI (HTML, CSS, JS, icons) is cached offline after the first load.

> ⚠ Important Note:
If the user clears browser cache manually, PWA offline files are also removed
(which means offline mode will no longer work until the app is loaded online again).
This is normal browser behavior and not a bug.




---

## 📦 Installation (For Developers)

1. Clone the Repository

git clone https://github.com/yourname/blogger-feed-reader

2. Project Structure

📁 root
 ├── index.html
 ├── style.css
 ├── script.js
 ├── sw.js
 ├── manifest.json
 └── icons/
       ├── icon-192.png
       └── icon-512.png

3. Deploy on GitHub Pages

Go to:
Settings → Pages → Deploy from /root

Your app will be published instantly.


---

## 🛠 How to Use

1. Open the app


2. Enter your Blogger site URL

Example:

https://yourblog.blogspot.com


3. Click Load Feed


4. Scroll through the feed or use pagination


5. Click any post to open the full-screen popup


6. If the Install App button appears, you can install it as a PWA




---

## ⚡ Technologies Used

HTML5 / CSS3 / JavaScript

RSS2JSON API

PWA (Service Worker + Manifest)

Offline caching

Mobile-first responsive design



---

## 📝 License

MIT License — You are free to customize or modify it.


---

## ❤️ Author

Created with passion by [Khin Maung Win]

