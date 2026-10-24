// Master FAQ for /faq (owner-approved wording). Questions waiting for owner answers are kept out of the site:
//   - How long does stage setup take at the venue?  [CONFIRM]
//   - Do you do balloon decoration?                  [CONFIRM]
// The price question appears ONLY on /faq (and its own variant on the wedding stage page).
// Advance and removal answers come from the site's existing Terms page and How It Works steps.

export const FAQ_GROUPS = [
  {
    id: 'about', en: 'About VRK Decor', ta: 'VRK Decor பற்றி',
    items: [
      { id: 'what',
        en: ['What does VRK Decor do?', 'VRK Decor is a decoration company in Nagercoil. We do wedding stage decoration, engagement and reception decoration, birthday decoration, housewarming, baby shower, puberty function and corporate event decoration. We started in 2011 and have done more than 700 celebrations.'],
        ta: ['VRK Decor என்ன செய்கிறது?', 'VRK Decor நாகர்கோவிலில் உள்ள ஒரு அலங்கார நிறுவனம். திருமண மேடை அலங்காரம், நிச்சயதார்த்தம் மற்றும் வரவேற்பு அலங்காரம், பிறந்தநாள் அலங்காரம், புதுமனை புகுவிழா, வளைகாப்பு, மஞ்சள் நீராட்டு விழா மற்றும் நிறுவன நிகழ்வு அலங்காரம் செய்கிறோம். 2011-ல் தொடங்கி, 700-க்கும் மேற்பட்ட விழாக்களை அலங்கரித்துள்ளோம்.'] },
      { id: 'who',
        en: ['Who will take care of my event?', 'Our founder, V. Raja Kumerasen, leads a team of more than 35 people. The same team designs your decoration, sets it up at the venue and stays during the function, so you only need to call one team for everything.'],
        ta: ['என் விழாவை யார் கவனிப்பார்கள்?', 'எங்கள் நிறுவனர் V. ராஜா குமரேசன் அவர்கள் 35-க்கும் மேற்பட்டவர்கள் கொண்ட குழுவை வழிநடத்துகிறார். அதே குழுதான் உங்கள் அலங்காரத்தை வடிவமைத்து, மண்டபத்தில் அமைத்து, விழா முடியும் வரை உடன் இருக்கும். எல்லாவற்றுக்கும் ஒரே குழுவை அழைத்தால் போதும்.'] },
      { id: 'same',
        en: ['Is VRK Decor the same as VRK Groups?', 'Yes. VRK Decor is also known as VRK Groups and VRK Groups Wedding Planners. It is the same team and the same phone number.'],
        ta: ['VRK Decor-ம் VRK Groups-ம் ஒன்றா?', 'ஆம். VRK Decor-க்கு VRK Groups, VRK Groups Wedding Planners என்ற பெயர்களும் உண்டு. ஒரே குழு, ஒரே தொலைபேசி எண்.'] },
    ],
  },
  {
    id: 'cost', en: 'Cost and booking', ta: 'செலவு மற்றும் முன்பதிவு',
    items: [
      { id: 'price', faqOnly: true,
        en: ['How much does stage decoration cost in Nagercoil?', 'A simple stage decoration with us starts from ₹10,000. The final cost depends on the type of event, the venue, the area, the size of the stage, the flowers and the theme you choose. Send us your date and venue on WhatsApp and we will share a clear quote.'],
        ta: ['நாகர்கோவிலில் மேடை அலங்காரத்திற்கு எவ்வளவு செலவாகும்?', 'எங்களிடம் எளிய மேடை அலங்காரம் ₹10,000 முதல் தொடங்குகிறது. இறுதி விலை விழா வகை, மண்டபம், இடம், மேடையின் அளவு, பூக்கள் மற்றும் நீங்கள் தேர்வு செய்யும் தீம் ஆகியவற்றைப் பொறுத்தது. உங்கள் தேதியையும் மண்டபத்தையும் WhatsApp-ல் அனுப்புங்கள், தெளிவான விலையைச் சொல்கிறோம்.'] },
      { id: 'quote',
        en: ['How do I get a quote?', 'Send us a WhatsApp message at +91 99940 72435 with your event type, date, venue and any photos or ideas you like. We will reply with a design idea and the cost. You can also call us or visit our shop in Vettunimadam.'],
        ta: ['விலை விவரம் எப்படி பெறுவது?', '+91 99940 72435 என்ற எண்ணுக்கு WhatsApp-ல் உங்கள் விழா வகை, தேதி, மண்டபம் மற்றும் உங்களுக்குப் பிடித்த படங்கள் அல்லது யோசனைகளை அனுப்புங்கள். வடிவமைப்பு யோசனையுடன் விலையையும் சொல்கிறோம். எங்களை அழைக்கலாம், அல்லது வெட்டூர்ணிமடத்தில் உள்ள எங்கள் கடைக்கு நேரில் வரலாம்.'] },
      { id: 'early',
        en: ['How early should I book?', 'Please book as soon as your date is fixed. Wedding season and good muhurtham dates fill up quickly in Nagercoil, so booking early makes sure we are free on your day.'],
        ta: ['எவ்வளவு முன்பே புக் செய்ய வேண்டும்?', 'உங்கள் தேதி முடிவானதும் உடனே புக் செய்யுங்கள். நாகர்கோவிலில் திருமண சீசனும் நல்ல முகூர்த்த நாட்களும் சீக்கிரம் நிரம்பிவிடும். முன்பே புக் செய்தால் உங்கள் நாளில் நாங்கள் கண்டிப்பாக இருப்போம்.'] },
      { id: 'design',
        en: ['Can I see the design before the event?', 'Yes. You share your plan and ideas with us, we show you a design concept, and we start the work only after you are happy with it.'],
        ta: ['விழாவுக்கு முன் வடிவமைப்பைப் பார்க்க முடியுமா?', 'ஆம். உங்கள் திட்டத்தையும் யோசனைகளையும் சொல்லுங்கள். நாங்கள் ஒரு வடிவமைப்பைக் காட்டுவோம். உங்களுக்குப் பிடித்த பிறகுதான் வேலையைத் தொடங்குவோம்.'] },
      { id: 'advance',
        en: ['How much advance do I need to pay to book?', 'The advance amount is written in your quotation. Your booking is confirmed once the advance is paid, and the balance is paid as agreed in the quotation.'],
        ta: ['புக் செய்ய எவ்வளவு முன்பணம் கட்ட வேண்டும்?', 'முன்பணத் தொகை உங்கள் quotation-ல் குறிப்பிடப்பட்டிருக்கும். முன்பணம் செலுத்தியதும் உங்கள் புக்கிங் உறுதியாகும். மீதித் தொகையை quotation-ல் ஒப்புக்கொண்டபடி செலுத்தலாம்.'] },
    ],
  },
  {
    id: 'weddings', en: 'Weddings and venues', ta: 'திருமணங்களும் மண்டபங்களும்',
    items: [
      { id: 'halls',
        en: ['Do you decorate wedding stages in marriage halls in Nagercoil?', 'Yes. We regularly decorate at Ganga Grandeur, Y.R. Mahal, Perumal Thirumana Mandapam, Shree Lakshman Mahal, VMS Mahal, AMOHAA PALACE Kalyana Mandapam, P.S. Mahal, GPK Mahal and Madha Maaligai, and at many other halls and venues. We are also happy to decorate at open grounds, gardens and any other venue you choose.'],
        ta: ['நாகர்கோவில் திருமண மண்டபங்களில் மேடை அலங்காரம் செய்வீர்களா?', 'ஆம். Ganga Grandeur, Y.R. Mahal, Perumal Thirumana Mandapam, Shree Lakshman Mahal, VMS Mahal, AMOHAA PALACE Kalyana Mandapam, P.S. Mahal, GPK Mahal, Madha Maaligai ஆகிய மண்டபங்களிலும், இன்னும் பல மண்டபங்கள் மற்றும் இடங்களிலும் அலங்காரம் செய்திருக்கிறோம். திறந்த வெளி மைதானம், தோட்டம் உள்ளிட்ட நீங்கள் தேர்ந்தெடுக்கும் எந்த இடத்திலும் அலங்கரிக்கத் தயார்.'] },
      { id: 'church',
        en: ['Do you decorate church and temple weddings?', 'Yes. We decorate weddings in churches, temples, halls and homes. We plan the decoration to suit the place and its customs.'],
        ta: ['தேவாலய மற்றும் கோவில் திருமணங்களை அலங்கரிப்பீர்களா?', 'ஆம். தேவாலயங்கள், கோவில்கள், மண்டபங்கள், வீடுகளில் நடக்கும் திருமணங்களை அலங்கரிக்கிறோம். அந்த இடத்திற்கும் அதன் வழக்கங்களுக்கும் ஏற்ப அலங்காரத்தைத் திட்டமிடுகிறோம்.'] },
      { id: 'together',
        en: ['Can you handle engagement, wedding and reception together?', 'Yes. Many families give us all their functions. One team does the design for every event, so the look stays matched and you do not have to manage different decorators.'],
        ta: ['நிச்சயதார்த்தம், திருமணம், வரவேற்பு மூன்றையும் சேர்த்து செய்வீர்களா?', 'ஆம். பல குடும்பங்கள் எல்லா விழாக்களையும் எங்களிடமே தருகிறார்கள். எல்லா நிகழ்வுக்கும் ஒரே குழு வடிவமைப்பதால் தோற்றம் ஒன்றுக்கொன்று பொருந்தும். வெவ்வேறு அலங்காரக்காரர்களை நீங்கள் கவனிக்க வேண்டியதில்லை.'] },
      { id: 'remove',
        en: ['Will you remove the decoration after the function?', 'Yes. Our team stays through the event and clears the decoration from the venue after the function.'],
        ta: ['விழா முடிந்ததும் அலங்காரத்தை அகற்றுவீர்களா?', 'ஆம். விழா முடியும் வரை எங்கள் குழு உடன் இருந்து, விழா முடிந்ததும் மண்டபத்திலிருந்து அலங்காரத்தை அகற்றுகிறோம்.'] },
    ],
  },
  {
    id: 'other', en: 'Other functions', ta: 'மற்ற விழாக்கள்',
    items: [
      { id: 'family',
        en: ['Do you decorate birthdays, baby showers and puberty functions?', 'Yes. We decorate birthdays, baby showers (valaikappu), puberty functions (manjal neerattu vizha), housewarmings (gruhapravesam) and wedding anniversaries, at homes and halls.'],
        ta: ['பிறந்தநாள், வளைகாப்பு, மஞ்சள் நீராட்டு விழாக்களுக்கு அலங்காரம் செய்வீர்களா?', 'ஆம். பிறந்தநாள், வளைகாப்பு, மஞ்சள் நீராட்டு விழா, புதுமனை புகுவிழா (கிரகப்பிரவேசம்), திருமண நாள் விழாக்களை வீடுகளிலும் மண்டபங்களிலும் அலங்கரிக்கிறோம்.'] },
      { id: 'corporate',
        en: ['Do you do corporate event decoration?', 'Yes. We decorate for product launches, annual days, office meetings and company celebrations, including branded stages and entrance decoration.'],
        ta: ['நிறுவன நிகழ்வுகளுக்கு அலங்காரம் செய்வீர்களா?', 'ஆம். தயாரிப்பு அறிமுகம், ஆண்டு விழா, அலுவலக கூட்டங்கள், நிறுவன கொண்டாட்டங்களுக்கு, நிறுவனப் பெயருடன் மேடை மற்றும் நுழைவாயில் அலங்காரம் செய்கிறோம்.'] },
      { id: 'extras',
        en: ['What else do you provide apart from the stage?', 'We provide fresh flower decoration, entrance and welcome decoration, lighting, furniture and seating, car decoration, bouquets, custom themes, and effects like smoke and fog. Band set, sound system and garlands are arranged through our trusted partners.'],
        ta: ['மேடையைத் தவிர வேறு என்ன தருவீர்கள்?', 'புதிய பூ அலங்காரம், நுழைவாயில் மற்றும் வரவேற்பு அலங்காரம், விளக்குகள், இருக்கை ஏற்பாடு, கார் அலங்காரம், பூச்செண்டுகள், தனிப்பட்ட தீம்கள், ஸ்மோக் மற்றும் ஃபாக் எஃபெக்ட் தருகிறோம். பேண்ட் செட், சவுண்ட் சிஸ்டம், மாலைகள் ஆகியவை நம்பகமான பார்ட்னர்கள் மூலம் ஏற்பாடு செய்யப்படும்.'] },
    ],
  },
  {
    id: 'areas', en: 'Areas and timings', ta: 'பகுதிகளும் நேரமும்',
    items: [
      { id: 'areas',
        en: ['Which areas do you cover?', 'We are based in Vettunimadam, Nagercoil, and we cover the whole of Kanyakumari district, including Kanyakumari, Suchindram, Thuckalay, Marthandam, Kuzhithurai, Colachel and Eraniel. We also travel to Tirunelveli, Thoothukudi, Thiruvananthapuram, Madurai, other parts of Tamil Nadu and anywhere in India on request.'],
        ta: ['எந்தெந்த பகுதிகளுக்கு வருவீர்கள்?', 'நாங்கள் நாகர்கோவில் வெட்டூர்ணிமடத்தில் இருக்கிறோம். கன்னியாகுமரி, சுசீந்திரம், தக்கலை, மார்த்தாண்டம், குழித்துறை, குளச்சல், இரணியல் உட்பட கன்னியாகுமரி மாவட்டம் முழுவதும் வருகிறோம். கேட்டால் திருநெல்வேலி, தூத்துக்குடி, திருவனந்தபுரம், மதுரை, தமிழ்நாட்டின் மற்ற பகுதிகள் மற்றும் இந்தியா முழுவதும் கேட்டால் வருவோம்.'] },
      { id: 'hours',
        en: ['What are your shop timings?', 'Our shop at 301 M.S Road, Vettunimadam, Nagercoil is open from 9:30 AM to 10:00 PM, all 7 days. You can also call or WhatsApp us at +91 99940 72435 at other times.'],
        ta: ['உங்கள் கடை எப்போது திறந்திருக்கும்?', 'நாகர்கோவில் வெட்டூர்ணிமடம், 301 M.S ரோட்டில் உள்ள எங்கள் கடை வாரத்தின் 7 நாட்களும் காலை 9:30 முதல் இரவு 10:00 வரை திறந்திருக்கும். மற்ற நேரங்களிலும் +91 99940 72435 என்ற எண்ணில் அழைக்கலாம் அல்லது WhatsApp செய்யலாம்.'] },
      { id: 'google',
        en: ['Are you on Google?', 'Yes. VRK Decor is rated 4.8 on Google from 80 reviews. You can read the reviews and get directions on our Google Business Profile.'],
        ta: ['Google-ல் உங்களைப் பார்க்க முடியுமா?', 'ஆம். Google-ல் 80 மதிப்புரைகளுடன் VRK Decor-க்கு 4.8 மதிப்பீடு உள்ளது. எங்கள் Google Business Profile-ல் மதிப்புரைகளைப் படிக்கலாம், வழியும் பார்க்கலாம்.'] },
    ],
  },
]

// Six questions for the homepage block (visible text only, no FAQPage schema, price excluded)
export const HOME_FAQ_IDS = ['what', 'quote', 'design', 'halls', 'areas', 'hours']

export const ALL_FAQ = FAQ_GROUPS.flatMap(g => g.items)
export const faqById = id => ALL_FAQ.find(f => f.id === id)
