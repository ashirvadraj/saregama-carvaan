import json

# 1. Authentic Carvaan Artists
artists_data = [
  {
    "id": "ameen-sayani",
    "name": "Ameen Sayani",
    "hindiName": "अमीन सयानी",
    "era": "1950s - 1990s",
    "imageUrl": "/artists/ameen-sayani.jpg",
    "bio": "The legendary voice of Radio Ceylon and Binaca Geetmala. 'Namaskar Bhaiyo aur Behno' captivated millions of radio listeners.",
    "birthYear": "1932",
    "deathYear": "2024",
    "notableHits": [
      "Binaca Geetmala Countdown",
      "Geetmala Flashback Commentary",
      "Interviews with Golden Era Legends"
    ],
    "category": "carvaan"
  },
  {
    "id": "kishore-kumar",
    "name": "Kishore Kumar",
    "hindiName": "किशोर कुमार",
    "era": "1950s - 1980s",
    "imageUrl": "/artists/kishore-kumar.jpg",
    "bio": "Legendary singer, actor, and yodeler. The undisputed voice of timeless romance, emotion, and joy.",
    "birthYear": "1929",
    "deathYear": "1987",
    "notableHits": [
      "Pal Pal Dil Ke Paas",
      "Roop Tera Mastana",
      "Mere Sapnon Ki Rani",
      "Yaad Aa Raha Hai"
    ],
    "category": "carvaan"
  },
  {
    "id": "lata-mangeshkar",
    "name": "Lata Mangeshkar",
    "hindiName": "लता मंगेशकर",
    "era": "1940s - 1990s",
    "imageUrl": "/artists/lata-mangeshkar.jpg",
    "bio": "The Nightingale of India. Her melodious voice defined generations of Indian cinema.",
    "birthYear": "1929",
    "deathYear": "2022",
    "notableHits": [
      "Lag Ja Gale",
      "Ajeeb Dastan Hai Yeh",
      "Aayega Aanewala",
      "Dil Deewana"
    ],
    "category": "carvaan"
  },
  {
    "id": "mohammed-rafi",
    "name": "Mohammed Rafi",
    "hindiName": "मोहम्मद रफ़ी",
    "era": "1940s - 1980s",
    "imageUrl": "/artists/mohammed-rafi.jpg",
    "bio": "Renowned for incredible vocal versatility across classical ragas, romantic melodies, and qawwalis.",
    "birthYear": "1924",
    "deathYear": "1980",
    "notableHits": [
      "Chaudhvin Ka Chand",
      "Gulabi Aankhen",
      "Likhe Jo Khat Tujhe",
      "Kya Hua Tera Wada"
    ],
    "category": "carvaan"
  },
  {
    "id": "asha-bhosle",
    "name": "Asha Bhosle",
    "hindiName": "आशा भोसले",
    "era": "1940s - 1990s",
    "imageUrl": "/artists/asha-bhosle.jpg",
    "bio": "Versatile queen of cabarets, pop, ghazals, and timeless melodies.",
    "birthYear": "1933",
    "notableHits": [
      "Chura Liya Hai Tumne",
      "Dum Maro Dum",
      "In Aankhon Ki Masti",
      "Piya Tu Ab To Aaja"
    ],
    "category": "carvaan"
  },
  {
    "id": "mukesh",
    "name": "Mukesh",
    "hindiName": "मुकेश",
    "era": "1940s - 1970s",
    "imageUrl": "/artists/mukesh.jpg",
    "bio": "The soulful voice of Raj Kapoor. Infused genuine emotion and melancholy into immortal classics.",
    "birthYear": "1923",
    "deathYear": "1976",
    "notableHits": [
      "Kabhi Kabhie Mere Dil Mein",
      "Kisi Ki Muskurahaton Pe",
      "Jeena Yahan Marna Yahan",
      "Awara Hoon"
    ],
    "category": "carvaan"
  },
  {
    "id": "manna-dey",
    "name": "Manna Dey",
    "hindiName": "मन्ना डे",
    "era": "1940s - 1980s",
    "imageUrl": "/artists/manna-dey.jpg",
    "bio": "Classical virtuoso of Indian playback music. Renowned for difficult classical melodies and ragas.",
    "birthYear": "1919",
    "deathYear": "2013",
    "notableHits": [
      "Zindagi Kaisi Hai Paheli",
      "Laaga Chunari Mein Daag",
      "Ae Meri Zohra Jabeen",
      "Kasme Wade Pyar Wafa"
    ],
    "category": "carvaan"
  },
  {
    "id": "hemant-kumar",
    "name": "Hemant Kumar",
    "hindiName": "हेमंत कुमार",
    "era": "1940s - 1980s",
    "imageUrl": "/artists/hemant-kumar.jpg",
    "bio": "Deep, rich baritone voice and master composer of timeless classics.",
    "birthYear": "1920",
    "deathYear": "1989",
    "notableHits": [
      "Yeh Raat Yeh Chandni",
      "Hai Apna Dil To Awara",
      "Yaad Kiya Dil Ne",
      "Tum Pukar Lo"
    ],
    "category": "carvaan"
  },
  {
    "id": "talat-mahmood",
    "name": "Talat Mahmood",
    "hindiName": "तलत महमूद",
    "era": "1940s - 1970s",
    "imageUrl": "/artists/talat-mahmood.jpg",
    "bio": "The King of Ghazals with his unique silky velvet vibrato voice.",
    "birthYear": "1924",
    "deathYear": "1998",
    "notableHits": [
      "Tasveer Banata Hoon",
      "Jalte Hain Jiske Liye",
      "Ae Mere Dil Kahin Aur Chal",
      "Phir Wahi Raat Hai"
    ],
    "category": "carvaan"
  },
  {
    "id": "geeta-dutt",
    "name": "Geeta Dutt",
    "hindiName": "गीता दत्त",
    "era": "1940s - 1970s",
    "imageUrl": "/artists/geeta-dutt.jpg",
    "bio": "Distinctive expressive voice that captured romance, jazz rhythms, and deep melancholia.",
    "birthYear": "1930",
    "deathYear": "1972",
    "notableHits": [
      "Babuji Dheere Chalna",
      "Waqt Ne Kiya Kya Haseen Sitam",
      "Mera Sundar Sapna Beet Gaya",
      "Tadbeer Se Bigdi Hui"
    ],
    "category": "carvaan"
  },
  {
    "id": "shamshad-begum",
    "name": "Shamshad Begum",
    "hindiName": "शमशाद बेगम",
    "era": "1930s - 1960s",
    "imageUrl": "/artists/shamshad-begum.jpg",
    "bio": "Pioneer of Hindi playback singing with clear, nasal, high-energy folk voice.",
    "birthYear": "1919",
    "deathYear": "2013",
    "notableHits": [
      "Mere Piya Gaye Rangoon",
      "Kajra Mohabbat Wala",
      "Saiyan Dil Mein Aana Re",
      "Kabhi Aar Kabhi Paar"
    ],
    "category": "carvaan"
  },
  {
    "id": "mahendra-kapoor",
    "name": "Mahendra Kapoor",
    "hindiName": "महेंद्र कपूर",
    "era": "1950s - 1990s",
    "imageUrl": "/artists/mahendra-kapoor.jpg",
    "bio": "The high-pitch powerhouse behind patriotic anthems and romantic classics.",
    "birthYear": "1934",
    "deathYear": "2008",
    "notableHits": [
      "Mere Desh Ki Dharti",
      "Neel Gagan Ke Tale",
      "Chalo Ek Baar Phir Se",
      "Hai Preet Jahan Ki Reet Sada"
    ],
    "category": "carvaan"
  },
  {
    "id": "kj-yesudas",
    "name": "K.J. Yesudas",
    "hindiName": "के. जे. येसुदास",
    "era": "1970s - 1990s",
    "imageUrl": "/artists/kj-yesudas.jpg",
    "bio": "Celestial voice of Indian classical and playback melodies.",
    "birthYear": "1940",
    "notableHits": [
      "Gori Tera Gaon Bada Pyara",
      "Aaj Se Pehle Aaj Se Jyada",
      "Dil Ke Tukde Tukde Karke",
      "Jab Deep Jale Aana"
    ],
    "category": "carvaan"
  },
  {
    "id": "sp-balasubrahmanyam",
    "name": "S.P. Balasubrahmanyam",
    "hindiName": "एस. पी. बालासुब्रमण्यम",
    "era": "1970s - 1990s",
    "imageUrl": "/artists/sp-balasubrahmanyam.jpg",
    "bio": "Iconic voice behind Salman Khan classics and timeless romantic blockbusters.",
    "birthYear": "1946",
    "deathYear": "2020",
    "notableHits": [
      "Dil Deewana",
      "Mere Rang Mein Rangne Wali",
      "Pehla Pehla Pyar",
      "Saathiya Tune Kya Kiya"
    ],
    "category": "carvaan"
  },
  {
    "id": "jagjit-singh",
    "name": "Jagjit Singh",
    "hindiName": "जगजीत सिंह",
    "era": "1970s - 1990s",
    "imageUrl": "/artists/jagjit-singh.jpg",
    "bio": "The Ghazal Maestro who brought poetry and emotional depth to every home.",
    "birthYear": "1941",
    "deathYear": "2011",
    "notableHits": [
      "Hothon Se Chhoo Lo Tum",
      "Jhuki Jhuki Si Nazar",
      "Tum Itna Jo Muskura Rahe Ho",
      "Chithi Na Koi Sandesh"
    ],
    "category": "carvaan"
  },
  {
    "id": "kumar-sanu",
    "name": "Kumar Sanu",
    "hindiName": "कुमार सानू",
    "era": "1980s - 1990s",
    "imageUrl": "/artists/kumar-sanu.jpg",
    "bio": "The undisputed King of 90s Melody. Holds the world record for recording 28 songs in a single day.",
    "birthYear": "1957",
    "notableHits": [
      "Tu Mile Dil Khile",
      "Gawah Hai Chand Tare",
      "Dheere Dheere Se",
      "Tujhe Dekha To"
    ],
    "category": "carvaan"
  },
  {
    "id": "alka-yagnik",
    "name": "Alka Yagnik",
    "hindiName": "अलका याग्निक",
    "era": "1980s - 1990s",
    "imageUrl": "/artists/alka-yagnik.jpg",
    "bio": "The leading female voice of the 80s and 90s golden melody renaissance.",
    "birthYear": "1966",
    "notableHits": [
      "Tip Tip Barsa Paani",
      "Kuch Kuch Hota Hai",
      "Choli Ke Peeche",
      "Aaye Ho Meri Zindagi Mein"
    ],
    "category": "carvaan"
  },
  {
    "id": "udit-narayan",
    "name": "Udit Narayan",
    "hindiName": "उदित नारायण",
    "era": "1980s - 1990s",
    "imageUrl": "/artists/udit-narayan.jpg",
    "bio": "The smiling voice behind Bollywood's biggest 90s musical blockbusters.",
    "birthYear": "1955",
    "notableHits": [
      "Papa Kehte Hain",
      "Pehla Nasha",
      "Jaadu Teri Nazar",
      "Tu Cheez Badi Hai Mast Mast"
    ],
    "category": "carvaan"
  },
  {
    "id": "anuradha-paudwal",
    "name": "Anuradha Paudwal",
    "hindiName": "अनुराधा पौडवाल",
    "era": "1970s - 1990s",
    "imageUrl": "/artists/anuradha-paudwal.jpg",
    "bio": "Acclaimed playback singer and queen of 90s romantic melodies and bhajans.",
    "birthYear": "1954",
    "notableHits": [
      "Dheere Dheere Se Meri Zindagi",
      "Nazar Ke Samne",
      "Bahut Pyar Karte Hain",
      "Mujhe Neend Na Aaye"
    ],
    "category": "carvaan"
  },
  {
    "id": "suresh-wadkar",
    "name": "Suresh Wadkar",
    "hindiName": "सुरेश वाडकर",
    "era": "1970s - 1990s",
    "imageUrl": "/artists/suresh-wadkar.jpg",
    "bio": "Celebrated for his soul-touching classical mastery in Bollywood cinema.",
    "birthYear": "1955",
    "notableHits": [
      "Ram Teri Ganga Maili",
      "Goron Ki Na Kalon Ki",
      "Lagi Aaj Sawan Ki",
      "Sapne Mein Milti Hai"
    ],
    "category": "carvaan"
  },
  {
    "id": "kavita-krishnamurthy",
    "name": "Kavita Krishnamurthy",
    "hindiName": "कविता कृष्णमूर्ति",
    "era": "1980s - 1990s",
    "imageUrl": "/artists/kavita-krishnamurthy.jpg",
    "bio": "Padma Shri winning vocal master of Indian classical and cinema music.",
    "birthYear": "1958",
    "notableHits": [
      "Hawa Hawai",
      "Tu Cheez Badi Hai",
      "Aaj Main Upar",
      "Pyar Hua Chupke Se"
    ],
    "category": "carvaan"
  },
  {
    "id": "kl-saigal",
    "name": "K.L. Saigal",
    "hindiName": "कुंदन लाल सहगल",
    "era": "1930s - 1940s",
    "imageUrl": "/artists/kl-saigal.jpg",
    "bio": "The first superstar and pioneer of Indian cinema and classical singing.",
    "birthYear": "1904",
    "deathYear": "1947",
    "notableHits": [
      "Jab Dil Hi Toot Gaya",
      "Ek Bangla Bane Nyara",
      "Babul Mora",
      "Dukh Ke Ab Din Beetat Nahin"
    ],
    "category": "carvaan"
  },
  {
    "id": "suraiya",
    "name": "Suraiya",
    "hindiName": "सुरैया",
    "era": "1930s - 1950s",
    "imageUrl": "/artists/suraiya.jpg",
    "bio": "The singing star and queen of 40s and 50s romance and cinema.",
    "birthYear": "1929",
    "deathYear": "2004",
    "notableHits": [
      "Man Mor Hua Matwala",
      "Yeh Mausam Aur Yeh Tanhai",
      "Woh Paas Rahe Ya Door Rahe"
    ],
    "category": "carvaan"
  }
]

# Write src/data/artists.ts
artists_ts = """import { Artist } from '../types';

export const ARTISTS: Artist[] = """ + json.dumps(artists_data, indent=2, ensure_ascii=False) + """;
export const artists = ARTISTS;
export default ARTISTS;
"""

with open('src/data/artists.ts', 'wb') as f:
    f.write(artists_ts.encode('utf-8'))

print("Saved clean src/data/artists.ts with 23 authentic Carvaan legends!")

# 2. Authentic Carvaan Decades (Strictly 50s, 60s, 70s, 80s, 90s, and Geetmala - NO 2000s)
decades_data = [
  {
    "id": "geetmala",
    "title": "Binaca Geetmala",
    "hindiTitle": "बिनाका गीतमाला",
    "years": "1952 - 1994",
    "description": "Ameen Sayani historic countdowns, flashback commentary & legend interviews",
    "coverUrl": "/artists/ameen-sayani.jpg",
    "color": "from-amber-600 to-yellow-800"
  },
  {
    "id": "50s",
    "title": "1950s Classics",
    "hindiTitle": "1950 का स्वर्ण युग",
    "years": "1950 - 1959",
    "description": "Lata, Rafi, Mukesh, Hemant, Geeta Dutt & Talat Mahmood foundations",
    "coverUrl": "/artists/lata-mangeshkar.jpg",
    "color": "from-amber-700 to-orange-900"
  },
  {
    "id": "60s",
    "title": "1960s Evergreen",
    "hindiTitle": "1960 के सदाबहार नग़मे",
    "years": "1960 - 1969",
    "description": "Rafi, Lata, Mukesh, Shamshad Begum & Manna Dey immortal melodies",
    "coverUrl": "/artists/mohammed-rafi.jpg",
    "color": "from-purple-800 to-indigo-950"
  },
  {
    "id": "70s",
    "title": "1970s Retro Magic",
    "hindiTitle": "1970 का रेट्रो जादू",
    "years": "1970 - 1979",
    "description": "Kishore Kumar, R.D. Burman, Asha Bhosle & Yesudas revolution",
    "coverUrl": "/artists/kishore-kumar.jpg",
    "color": "from-red-800 to-rose-950"
  },
  {
    "id": "80s",
    "title": "1980s Melodies",
    "hindiTitle": "1980 का सुरीला दौर",
    "years": "1980 - 1989",
    "description": "Disco, Ghazals, S.P. Balasubrahmanyam & Jagjit Singh soul",
    "coverUrl": "/artists/asha-bhosle.jpg",
    "color": "from-emerald-800 to-teal-950"
  },
  {
    "id": "90s",
    "title": "1990s Golden Wave",
    "hindiTitle": "1990 की सुनहरी लहर",
    "years": "1990 - 1999",
    "description": "Kumar Sanu, Alka Yagnik, Udit Narayan & Anuradha Paudwal blockbusters",
    "coverUrl": "/artists/kumar-sanu.jpg",
    "color": "from-blue-800 to-cyan-950"
  }
]

decades_ts = """import { Decade } from '../types';

export const DECADES: Decade[] = """ + json.dumps(decades_data, indent=2, ensure_ascii=False) + """;
export const decades = DECADES;
export default DECADES;
"""

with open('src/data/decades.ts', 'wb') as f:
    f.write(decades_ts.encode('utf-8'))

print("Saved clean src/data/decades.ts!")
