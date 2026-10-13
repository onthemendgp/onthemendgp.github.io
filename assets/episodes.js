/* =========================================================
   ON THE MEND – EPISODE + CLIP DATA
   Used by the search on /episodes/ and the grids on index.html.
   "keywords" are searchable but not displayed. "tags" are displayed.
   "suburb" + "state" render as one location tag (e.g. "Chelsea, VIC") and are
   searchable independently, so you can filter by suburb or by state as the show grows.
   Leave "suburb" empty for content that is not tied to one suburb.
   "short" is an optional footer label. Without it the footer trims the title
   at a colon, comma or " with ".
   "topic" (episodes) finishes the sentence "<guest> on ..." in the FAQ.
   "published" (episodes) is the YouTube release date. It feeds the sitemap and
   the datePublished schema.
   "release" (clips, optional) is when a scheduled Short goes public, written as
   "2026-10-16T19:00:00+11:00". Until then the clip stays hidden everywhere on
   the site, and it appears by itself at that time with no rebuild needed.
   ========================================================= */
window.OTM_DATA = [
  {
    id: "ep6",
    type: "coming",
    number: 6,
    title: "Hurt at Work? WorkCover and Occupational Health",
    short: "Work Injuries",
    topic: "work injuries and WorkCover",
    guest: "Dr Vinny Lam",
    clinic: "",
    suburb: "",
    guestCredit: "Dr Vinny Lam, GP",
    image: "",
    state: "VIC",
    description: "What to do in the first 48 hours after a workplace injury, what a certificate of capacity is, and how WorkCover appointments work.",
    tags: ["Occupational health", "WorkCover", "Work injuries"],
    keywords: "workcover work cover worksafe occupational health workplace injury injured at work certificate of capacity return to work claim number insurer employer back pain carpal tunnel desk job lam gp victoria"
  },
  {
    id: "ep5",
    next: [
      { label: "Questions to ask your doctor", by: "healthdirect", url: "https://www.healthdirect.gov.au/questions-to-ask-your-doctor", note: "Tips for preparing and writing down your questions before you go." },
      { label: "Health care and Medicare", by: "Services Australia", url: "https://www.servicesaustralia.gov.au/health-care-and-medicare", note: "What Medicare covers, including GP visits." }
    ],
    type: "episode",
    number: 5,
    page: "/episodes/making-the-most-of-your-gp-appointment/",
    title: "Making the Most of Your GP Appointment",
    short: "GP Appointments",
    topic: "making the most of your GP appointment",
    guest: "Dr Nisha Patel",
    clinic: "Balwyn Central Medical",
    suburb: "Balwyn",
    guestCredit: "Dr Nisha Patel, who practises at Balwyn Central Medical",
    image: "/assets/img/ep5.jpg",
    state: "VIC",
    published: "2026-10-09",
    description: "The Medicare rules behind how appointments are booked, why a 10-minute consult goes so quickly, why your GP asks you to come back, and how a little preparation helps.",
    tags: ["Appointments", "Medicare", "Behind the scenes"],
    keywords: "gp appointment doctor appointment consult consultation 10 minute long appointment standard appointment medicare rules care plan telehealth mymedicare follow up results same gp continuity of care prepare list questions google running late balwyn nisha patel victoria melbourne"
  },
  {
    id: "ep2",
    next: [
      { label: "Who should do the bowel screening test", by: "National Bowel Cancer Screening Program, Australian Government", url: "https://www.health.gov.au/our-work/national-bowel-cancer-screening-program/doing-a-bowel-screening-test/who-should-do-the-bowel-screening-test", note: "A free test every two years for eligible people aged 45 to 74." },
      { label: "Healthy Male", by: "Funded by the Australian Government", url: "https://healthymale.org.au/", note: "Information on men's physical and mental health." },
      { label: "Lifeline 13 11 14", by: "Lifeline Australia", url: "https://www.lifeline.org.au/", note: "24-hour crisis support. If life is in danger, call 000." }
    ],
    type: "episode",
    number: 2,
    page: "/episodes/mens-health/",
    title: "Men's Health: Starting the Conversation",
    topic: "men's health",
    guest: "Dr Geoffrey Kimanje",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    guestCredit: "Dr Geoffrey Kimanje, who practises at Chelsea Arcade Medical",
    image: "/assets/img/ep2.jpg",
    state: "VIC",
    published: "2026-07-07",
    description: "Why men's health often gets overlooked, the health checks that change with age, signs someone might be struggling, and the small changes that add up.",
    tags: ["Men's health", "Mental health", "Health checks", "Prevention"],
    keywords: "mens health men male mental health depression struggling signs checkup check up blood pressure bowel screening cancer 45 exercise weight prostate wellbeing lifestyle GP doctor kimanje chelsea arcade prevention victoria melbourne south east"
  },
  {
    id: "ep1",
    next: [
      { label: "Should I be checked for skin cancer?", by: "healthdirect", url: "https://www.healthdirect.gov.au/should-I-be-checked-for-skin-cancer", note: "Who is at higher risk, and how often to have your skin checked." },
      { label: "Checking for skin cancer", by: "SunSmart, Cancer Council Victoria", url: "https://www.sunsmart.com.au/skin-cancer/checking-for-skin-cancer", note: "Guidance on checking your own skin." },
      { label: "SunSmart Global UV app", by: "SunSmart, Cancer Council Victoria", url: "https://www.sunsmart.com.au/resources/sunsmart-app", note: "A free app showing the UV level where you are." }
    ],
    type: "episode",
    number: 1,
    page: "/episodes/skin-checks-early-detection/",
    title: "Skin Checks, Early Detection & Prevention",
    topic: "skin checks",
    guest: "Dr Ross Wines",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    guestCredit: "Dr Ross Wines, who practises at Chelsea Arcade Medical",
    image: "/assets/img/ep1.jpg",
    state: "VIC",
    published: "2026-06-25",
    description: "Why Australia sees so much skin cancer, how to protect your skin, what the SCAN self-check looks for, and what happens in a professional skin check.",
    tags: ["Skin checks", "Skin cancer", "Sun safety", "Early detection"],
    keywords: "skin check cancer melanoma mole spot sun safety uv index sunscreen slip slop slap seek slide scan self check early detection prevention wines chelsea arcade dermatology full body victoria melbourne south east"
  },
  {
    id: "ep3",
    next: [
      { label: "Free 15-minute adult hearing checks", by: "Hearing Australia", url: "https://www.hearing.com.au/free-15-minute-adult-hearing-checks", note: "Free for adults aged 18 and over, with no referral needed. Find a check near you." },
      { label: "Hearing tests", by: "healthdirect", url: "https://www.healthdirect.gov.au/hearing-test", note: "What a hearing test involves, and help with the cost." }
    ],
    type: "episode",
    number: 3,
    title: "Hearing Health with Hearing Australia",
    page: "/episodes/hearing-health/",
    topic: "hearing checks",
    guest: "Rebecca Bourke",
    clinic: "Hearing Australia",
    suburb: "",
    guestCredit: "Rebecca Bourke, Community Service Advisor at Hearing Australia",
    image: "/assets/img/ep3.jpg",
    state: "VIC",
    published: "2026-07-23",
    description: "Why hearing checks matter, the early signs of hearing loss people overlook, headphones and young ears, and the support Hearing Australia provides.",
    tags: ["Hearing", "Hearing checks", "Prevention"],
    keywords: "hearing loss check ears audiologist deaf headphones earbuds noise tinnitus hearing australia bourke ear protection volume victoria melbourne south east"
  },
  {
    id: "ep4",
    next: [
      { label: "My Health Record", by: "Australian Digital Health Agency", url: "https://www.digitalhealth.gov.au/initiatives-and-programs/my-health-record", note: "Your record can include test and scan reports uploaded by your healthcare providers." },
      { label: "Questions to ask your doctor", by: "healthdirect", url: "https://www.healthdirect.gov.au/questions-to-ask-your-doctor", note: "Tips for preparing questions, such as how you will get your results." }
    ],
    type: "episode",
    number: 4,
    page: "/episodes/medical-receptionist/",
    title: "A Day in the Life of a Receptionist",
    short: "Front Desk",
    topic: "life behind the front desk",
    guest: "Emily Ryan",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    guestCredit: "Emily Ryan, medical receptionist",
    image: "/assets/img/ep4.jpg",
    state: "VIC",
    published: "2026-08-20",
    description: "What really happens behind the front desk: the referrals and records that keep your care moving, why your results go to your doctor first, and why kindness matters on a busy morning.",
    tags: ["Behind the scenes", "Reception", "Test results"],
    keywords: "receptionist medical receptionist reception front desk day in the life behind the scenes phones bookings appointments referrals records test results pathology results medical records healthcare admin emily ryan clinic team medical practice chelsea victoria melbourne"
  },

  /* ---------------- Episode 5 clips ---------------- */
  {
    id: "ten-minutes",
    type: "clip",
    episode: 5,
    release: "2026-10-16T19:00:00+11:00",
    title: "Why 10 minutes goes so quickly",
    guest: "Dr Nisha Patel",
    clinic: "Balwyn Central Medical",
    suburb: "Balwyn",
    state: "VIC",
    image: "/assets/img/clip_Why-10-minutes-goes-so-quickly.jpg",
    description: "Your history, an examination, referrals and notes all have to fit inside a standard appointment. Why two or three issues is a safe maximum.",
    tags: ["Appointments", "Behind the scenes"],
    keywords: "10 minute appointment standard consult long appointment 20 minutes running late list of problems chest pain gp time"
  },
  {
    id: "medicare-rules",
    type: "clip",
    episode: 5,
    release: "2026-10-23T19:00:00+11:00",
    title: "Medicare rules most patients don't know",
    guest: "Dr Nisha Patel",
    clinic: "Balwyn Central Medical",
    suburb: "Balwyn",
    state: "VIC",
    image: "/assets/img/clip_Medicare-rules-most-patients-dont-know.jpg",
    description: "Why a care plan and going through your results may need separate appointments, and a note on the telehealth rules.",
    tags: ["Medicare", "Appointments"],
    keywords: "medicare rules care plan separate appointment telehealth 12 months face to face mymedicare my health record"
  },
  {
    id: "prepare-gp-appointment",
    type: "clip",
    episode: 5,
    release: "2026-10-30T19:00:00+11:00",
    title: "How to prepare for your GP appointment",
    guest: "Dr Nisha Patel",
    clinic: "Balwyn Central Medical",
    suburb: "Balwyn",
    state: "VIC",
    image: "/assets/img/clip_How-to-prepare-for-your-GP-appointment.jpg",
    description: "Bring your list, share what you are worried about, and tell your GP what you found online. It helps you both get on the same page.",
    tags: ["Appointments", "Prevention"],
    keywords: "prepare gp appointment list ideas concerns google questions what to bring doctor visit tips"
  },
  {
    id: "gp-follow-up",
    type: "clip",
    episode: 5,
    release: "2026-11-06T19:00:00+11:00",
    title: "Why your GP books a follow-up",
    guest: "Dr Nisha Patel",
    clinic: "Balwyn Central Medical",
    suburb: "Balwyn",
    state: "VIC",
    image: "/assets/img/clip_Why-your-GP-books-a-follow-up.jpg",
    description: "Even normal results can decide the next step. Why follow-ups matter, and why seeing the same GP helps.",
    tags: ["Test results", "Appointments"],
    keywords: "follow up appointment results normal referral investigation treatment same gp continuity"
  },

  /* ---------------- Episode 1 clips ---------------- */
  {
    id: "three-simple-ways",
    type: "clip",
    episode: 1,
    title: "Three simple ways to lower your skin cancer risk",
    guest: "Dr Ross Wines",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_Three-simple-ways-to-lower-your-skin-can.jpg",
    description: "Check the daily UV index, follow Slip Slop Slap Seek Slide, and get to know your own skin.",
    tags: ["Skin cancer", "Sun safety"],
    keywords: "skin cancer risk uv index sunscreen slip slop slap habits prevention sun safety"
  },
  {
    id: "down-south",
    type: "clip",
    episode: 1,
    title: "Are you safer from skin cancer down south?",
    guest: "Dr Ross Wines",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_Are-you-safer-from-skin-cancer-down-sout.jpg",
    description: "Why outdoor workers face higher sun exposure wherever they live in Australia.",
    tags: ["Skin cancer", "Outdoor workers"],
    keywords: "skin cancer south victoria melbourne farmers tradies outdoor workers sun exposure"
  },
  {
    id: "small-spot",
    type: "clip",
    episode: 1,
    title: "Why a small spot can still be serious",
    guest: "Dr Ross Wines",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_Why-a-small-spot-can-still-be-serious.jpg",
    description: "A spot does not have to be large to be worth checking. Sore, changing, abnormal or new: see your GP.",
    tags: ["Melanoma", "Early detection"],
    keywords: "small spot mole melanoma serious scan sore changing abnormal new early detection"
  },
  {
    id: "spot-vs-full",
    type: "clip",
    episode: 1,
    title: "Spot check vs full body skin check",
    guest: "Dr Ross Wines",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_Spot-check-vs-full-body-skin-check.jpg",
    description: "What the difference is and when each one makes sense.",
    tags: ["Skin checks"],
    keywords: "spot check full body skin check difference appointment what happens"
  },
  {
    id: "gp-skin-medicine",
    type: "clip",
    episode: 1,
    title: "What led this GP to skin cancer medicine",
    guest: "Dr Ross Wines",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_What-led-this-GP-to-skin-cancer-medicine.jpg",
    description: "The story behind one GP's path into skin cancer medicine.",
    tags: ["Behind the scenes"],
    keywords: "gp doctor career skin cancer medicine story behind the scenes wines"
  },

  /* ---------------- Episode 2 clips ---------------- */
  {
    id: "signs-struggling",
    type: "clip",
    episode: 2,
    title: "Signs a man might be struggling",
    guest: "Dr Geoffrey Kimanje",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_Signs-a-man-might-be-struggling.jpg",
    description: "Men's mental health does not always look the way you might expect. Signs worth noticing, in yourself or someone you care about.",
    tags: ["Mental health", "Men's health"],
    keywords: "mental health men struggling signs depression withdrawn sleep irritability alcohol lifeline wellbeing"
  },
  {
    id: "health-checks-age",
    type: "clip",
    episode: 2,
    title: "The health checks that change with age",
    guest: "Dr Geoffrey Kimanje",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_The-health-checks-that-change-with-age.jpg",
    description: "From blood pressure checks to bowel cancer screening from age 45: a simple guide to where health checks start.",
    tags: ["Health checks", "Men's health"],
    keywords: "health checks age blood pressure bowel screening 45 checkup men prevention"
  },
  {
    id: "small-changes",
    type: "clip",
    episode: 2,
    title: "Small changes for a healthier you",
    guest: "Dr Geoffrey Kimanje",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_Small-changes-for-a-healthier-you.jpg",
    description: "About 150 minutes of exercise a week, steady steps with weight, and staying connected.",
    tags: ["Prevention", "Lifestyle"],
    keywords: "small changes exercise 150 minutes weight healthy habits lifestyle connection"
  },
  {
    id: "mens-health-overlooked",
    type: "clip",
    episode: 2,
    title: "Why men's health often gets overlooked",
    guest: "Dr Geoffrey Kimanje",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_Why-mens-health-often-gets-overlooked.jpg",
    description: "Why many men wait too long before seeing a GP, and what helps start the conversation.",
    tags: ["Men's health"],
    keywords: "mens health overlooked avoid doctor gp conversation barriers stigma"
  },

  /* ---------------- Episode 3 clips ---------------- */
  {
    id: "hearing-checks-matter",
    type: "clip",
    episode: 3,
    title: "Why hearing checks matter",
    guest: "Rebecca Bourke",
    clinic: "Hearing Australia",
    suburb: "",
    state: "VIC",
    image: "/assets/img/clip_Why-hearing-checks-matter.jpg",
    description: "Hearing loss usually happens gradually, so it is often someone else who notices first. The early signs worth paying attention to.",
    tags: ["Hearing", "Hearing checks"],
    keywords: "hearing check loss early signs tv volume repeat gradual baseline"
  },
  {
    id: "protect-your-hearing",
    type: "clip",
    episode: 3,
    title: "Three ways to protect your hearing",
    guest: "Rebecca Bourke",
    clinic: "Hearing Australia",
    suburb: "",
    state: "VIC",
    image: "/assets/img/clip_Three-ways-to-protect-your-hearing.jpg",
    description: "Keep the volume down, protect your ears in noisy places like mowing and worksites, and get checked regularly.",
    tags: ["Hearing", "Prevention"],
    keywords: "protect hearing volume ear protection mowing power tools worksite noise habits"
  },
  {
    id: "earbuds-hearing",
    type: "clip",
    episode: 3,
    title: "Are your earbuds damaging your hearing?",
    guest: "Rebecca Bourke",
    clinic: "Hearing Australia",
    suburb: "",
    state: "VIC",
    image: "/assets/img/clip_Are-your-earbuds-damaging-your-hearing.jpg",
    description: "Hearing loss is not just for older people. More younger people are being affected, often through earbuds and headphones.",
    tags: ["Hearing", "Young people"],
    keywords: "earbuds headphones young people volume music hearing loss damage"
  },
  {
    id: "hearing-check-involves",
    type: "clip",
    episode: 3,
    title: "What a hearing check actually involves",
    guest: "Rebecca Bourke",
    clinic: "Hearing Australia",
    suburb: "",
    state: "VIC",
    image: "/assets/img/clip_What-a-hearing-check-actually-involves.jpg",
    description: "Quick, straightforward and nothing to feel nervous about. What to expect and why a baseline is useful.",
    tags: ["Hearing checks"],
    keywords: "hearing check test what happens involves quick non invasive baseline audiologist"
  },

  /* ---------------- Episode 4 clips ---------------- */
  {
    id: "receptionist-really-does",
    type: "clip",
    episode: 4,
    title: "What a medical receptionist really does",
    guest: "Emily Ryan",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_What-a-medical-receptionist-really-does.jpg",
    description: "There is a lot more to the front desk than checking you in and answering the phone. The work that happens out of sight.",
    tags: ["Behind the scenes", "Reception"],
    keywords: "medical receptionist front desk referrals records specialists allied health behind the scenes healthcare admin"
  },
  {
    id: "results-doctor-first",
    type: "clip",
    episode: 4,
    title: "Why your results go to your doctor first",
    guest: "Emily Ryan",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_Why-your-results-go-to-your-doctor-first.jpg",
    description: "Ever wondered why results are not sent straight to you? The step in between, and why your doctor checks the result first.",
    tags: ["Test results", "Reception"],
    keywords: "test results pathology results blood test scan why doctor checks first medical records patient privacy release of results"
  },
  {
    id: "surprise-a-doctor",
    type: "clip",
    episode: 4,
    title: "What would surprise a doctor about reception",
    guest: "Emily Ryan",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_What-would-surprise-a-doctor-about-recep.jpg",
    description: "The sheer amount happening at once on a busy morning, and why the pace never really lets up.",
    tags: ["Behind the scenes", "Reception"],
    keywords: "medical receptionist multitasking busy day phones ringing emails specialists bookings pace healthcare admin"
  },
  {
    id: "small-act-of-care",
    type: "clip",
    episode: 4,
    title: "A small act of care at the front desk",
    guest: "Emily Ryan",
    clinic: "Chelsea Arcade Medical",
    suburb: "Chelsea",
    state: "VIC",
    image: "/assets/img/clip_A-small-act-of-care-at-the-front-desk.jpg",
    description: "Sometimes the smallest bit of help means the most. The moment a patient came back to say thank you.",
    tags: ["Reception", "Patient care"],
    keywords: "kindness patient care gratitude medical receptionist front desk helping patients medical records"
  }
];
