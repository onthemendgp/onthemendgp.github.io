/* =========================================================
   ON THE MEND – PARTNER CLINIC CONFIG
   Each key is a partner code. A clinic's button links to:
   /episodes/?p=THEIRCODE
   - name: shown in the welcome banner on their view
   - featuredClinic: must exactly match the "clinic" field in
     episodes.js. Those episodes appear first with a badge.
   - excludeSuburbs: episodes from clinics in these suburbs are
     hidden on this partner's view (their own clinic always shows).
   ========================================================= */
window.OTM_PARTNERS = {

  // Live demo used on the For Clinics page
  demo: {
    name: "Chelsea Arcade Medical (demo view)",
    featuredClinic: "Chelsea Arcade Medical",
    excludeSuburbs: []
  }

  // To add a real partner, copy the block above, e.g.:
  // baysideclinic: {
  //   name: "Bayside Family Practice",
  //   featuredClinic: "Bayside Family Practice",
  //   excludeSuburbs: ["Chelsea", "Edithvale", "Bonbeach"]
  // }
};
