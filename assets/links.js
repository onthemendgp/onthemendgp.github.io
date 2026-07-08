/* =========================================================
   ON THE MEND – CENTRAL LINKS CONFIG
   Everything on the site reads from this one file.
   To update a link, change it here only.
   ========================================================= */
window.OTM_LINKS = {
  // Platforms
  youtube:   "https://www.youtube.com/@onthemendGP",
  spotify:   "https://open.spotify.com/show/3uKZZ8sFK7IOiLkdJXY6R6",
  instagram: "https://www.instagram.com/onthemendgp",
  facebook:  "https://www.facebook.com/share/19Jubh4NqQ/",
  tiktok:    "https://www.tiktok.com/@onthemendgp",

  // Contact
  email: "onthemendgp@gmail.com",

  // Episodes. youtubeId is the 11-character ID from the video URL
  // (https://www.youtube.com/watch?v=THIS_PART).
  // Leave a field as "" and the site falls back to the channel / show link.
  episodes: {
    ep1: {
      youtube: "https://www.youtube.com/watch?v=6aMIbTqNKE0",
      youtubeId: "6aMIbTqNKE0",
      spotify: "https://open.spotify.com/episode/2hLo5307g2SaGUl0Vsi8Xh"
    },
    ep2: {
      youtube: "https://www.youtube.com/watch?v=P2lL6DR3WQs",
      youtubeId: "P2lL6DR3WQs",
      spotify: "https://open.spotify.com/episode/3hX3Ja4aG8X4DmXa0hGBHZ"
    }
  },

  // Individual clip / Shorts URLs. If left as "", clip cards
  // link to the YouTube channel instead.
  clips: {
    "three-simple-ways": "https://youtube.com/shorts/RRpBGxwNyWs",
    "down-south": "https://youtube.com/shorts/PXWWIFI8FWw",
    "small-spot": "https://youtube.com/shorts/kQq9Wc4u5rA",
    "spot-vs-full": "https://youtube.com/shorts/KCtS2QtS_Ew",
    "gp-skin-medicine": "https://youtube.com/shorts/xUqDQWxr8DQ",
    "signs-struggling": "https://youtube.com/shorts/mVmhK7ivCrE",
    "health-checks-age": "https://youtube.com/shorts/SR9-Ugd-bZI",
    "small-changes": "https://youtube.com/shorts/9JBLQ_aapbI",
    "mens-health-overlooked": "https://youtube.com/shorts/FkZLP0z2fKU"
  }
};
