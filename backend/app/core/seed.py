import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import Deck, Card, StudyProgress, utc_now

logger = logging.getLogger("lexora.seed")

CORE_47_WORDS = [
    {
        "term_en": "beyond",
        "meaning_uz": "tashqarisida, chegarasidan narida, undan ham ortiq",
        "synonyms": "exceeding, further than, past",
        "example_en": "The long-term impact of ethical business extends far beyond quarterly profit margins."
    },
    {
        "term_en": "restrict",
        "meaning_uz": "cheklamoq, chegaralamoq, monelik qilmoq",
        "synonyms": "limit, constrain, curb, confine",
        "example_en": "Stringent anti-monopoly laws seek to restrict tech conglomerates from suppressing rivals."
    },
    {
        "term_en": "broader role",
        "meaning_uz": "kengroq rol, keng ko'lamli vazifa",
        "synonyms": "expanded function, wider responsibility",
        "example_en": "Modern educational institutions must embrace a broader role in regional civic development."
    },
    {
        "term_en": "proposal",
        "meaning_uz": "taklif, rasmiy loyiha taklifi",
        "synonyms": "proposition, suggestion, scheme",
        "example_en": "The municipal committee approved the proposal to transform derelict rail yards into green parks."
    },
    {
        "term_en": "glance",
        "meaning_uz": "bir qarash, qisqa nazar solish",
        "synonyms": "brief look, glimpse, peek",
        "example_en": "At first glance, the corporate restructuring appeared entirely advantageous to junior staff."
    },
    {
        "term_en": "pay dividends",
        "meaning_uz": "katta foyda keltirmoq, vaqt o'tib o'z mevasini bermoq",
        "synonyms": "yield rewards, bring benefits, pay off",
        "example_en": "Consistent investments in academic research invariably pay dividends for national productivity."
    },
    {
        "term_en": "shareholders",
        "meaning_uz": "aksiyadorlar, hissadarlar",
        "synonyms": "investors, stockholders, equity holders",
        "example_en": "The chief executive answered tough inquiries from institutional shareholders regarding ethical governance."
    },
    {
        "term_en": "crises",
        "meaning_uz": "inqirozlar, og'ir tangliklar",
        "synonyms": "emergencies, catastrophes, downturns",
        "example_en": "Societies that cultivate resilient civil institutions weather economic crises with greater stability."
    },
    {
        "term_en": "window dressing",
        "meaning_uz": "ko'zbo'yamachilik, kamchiliklarni yashirish uchun qilingan soxta bezak",
        "synonyms": "superficial display, facade, pretense",
        "example_en": "Advocates dismissed the corporation's carbon pledge as mere window dressing to distract regulators."
    },
    {
        "term_en": "overlooks the symbiotic",
        "meaning_uz": "o'zaro manfaatli (simbiotik) bog'liqlikni e'tibordan chetda qoldirmoq",
        "synonyms": "ignores mutual dependence, neglects reciprocity",
        "example_en": "An aggressive cost-cutting regime overlooks the symbiotic relationship between employee welfare and innovation."
    },
    {
        "term_en": "thrive",
        "meaning_uz": "gullab-yashnamoq, ravnaq topmoq",
        "synonyms": "flourish, prosper, burgeon",
        "example_en": "Independent bookstores can thrive when they offer curated cultural events and communal warmth."
    },
    {
        "term_en": "social cohesion",
        "meaning_uz": "ijtimoiy jipslik, jamiyat a'zolarining o'zaro birdamligi",
        "synonyms": "societal unity, communal solidarity, social harmony",
        "example_en": "Equitable access to quality healthcare is a cornerstone for sustaining social cohesion."
    },
    {
        "term_en": "sprawling campuses",
        "meaning_uz": "keng yoyilgan (katta maydonni egallagan) korporativ yoki universitet majmualari",
        "synonyms": "expansive complexes, vast grounds",
        "example_en": "Silicon Valley giants are famous for their sprawling campuses featuring gourmet cafeterias and sports clubs."
    },
    {
        "term_en": "extended benefits",
        "meaning_uz": "kengaytirilgan imtiyozlar, qo'shimcha rag'batlar",
        "synonyms": "supplementary perks, comprehensive coverage",
        "example_en": "To retain elite software architects, the company granted extended benefits such as sabbaticals."
    },
    {
        "term_en": "ripple effect",
        "meaning_uz": "zanjirsimon ta'sir, kaskadli oqibat",
        "synonyms": "domino effect, chain reaction, collateral impact",
        "example_en": "A collapse in the supply chain caused a destructive ripple effect across retail manufacturing worldwide."
    },
    {
        "term_en": "goodwill toward",
        "meaning_uz": "xayrixohlik, samimiy iliq munosabat",
        "synonyms": "benevolence toward, favor, positive sentiment",
        "example_en": "Targeted philanthropic donations help build sustainable goodwill toward multinational brands."
    },
    {
        "term_en": "tech behemoth",
        "meaning_uz": "texnologiya giganti, ulkan IT konglomerati",
        "synonyms": "technology giant, corporate colossus, tech titan",
        "example_en": "The emerging antitrust lawsuit threatened to dismantle the dominance of the global tech behemoth."
    },
    {
        "term_en": "gathering spots",
        "meaning_uz": "jamoat to'planish maskanlari, uchrashuv joylari",
        "synonyms": "meeting places, communal hubs, social venues",
        "example_en": "Urban planners designed shaded public plazas to serve as vibrant gathering spots for citizens."
    },
    {
        "term_en": "benefactor",
        "meaning_uz": "homiy, saxiy yordamchi, xayriyachi",
        "synonyms": "patron, sponsor, donor, philanthropist",
        "example_en": "A generous benefactor funded the construction of the university's cutting-edge nanotechnology laboratory."
    },
    {
        "term_en": "detached",
        "meaning_uz": "begonalashgan, ajralib qolgan, beparvo",
        "synonyms": "disconnected, aloof, disengaged, indifferent",
        "example_en": "Lawmakers who never visit grassroots communities frequently remain detached from everyday struggles."
    },
    {
        "term_en": "recreational",
        "meaning_uz": "dam olish va hordiq chiqarishga oid",
        "synonyms": "leisure, sporting, restorative, amusement",
        "example_en": "The city converted an abandoned reservoir into a recreational lake for kayaking and walking trails."
    },
    {
        "term_en": "foster",
        "meaning_uz": "rivojlantirmoq, rag'batlantirmoq, parvarishlamoq",
        "synonyms": "cultivate, encourage, nurture, stimulate",
        "example_en": "Collaborative study circles foster critical thinking and mutual intellectual respect among peers."
    },
    {
        "term_en": "knit",
        "meaning_uz": "jipslashtirmoq, mustahkam biriktirmoq",
        "synonyms": "bind, unite, intertwine, stitch together",
        "example_en": "Shared historical traditions continue to knit diverse immigrant groups into a unified community."
    },
    {
        "term_en": "balm",
        "meaning_uz": "malham, taskin beruvchi vosita, yupanch",
        "synonyms": "soothing remedy, solace, palliative, comfort",
        "example_en": "Robust social safety nets act as an indispensable balm during periods of hyperinflation."
    },
    {
        "term_en": "fractured communities",
        "meaning_uz": "bo'lingan, parchalangan jamoalar",
        "synonyms": "divided societies, fragmented neighborhoods",
        "example_en": "Deep income inequality predictably leads to fractured communities lacking mutual trust."
    },
    {
        "term_en": "overreach",
        "meaning_uz": "vakolatini suiiste'mol qilish, haddidan oshish",
        "synonyms": "overstepping, encroachment, excess",
        "example_en": "Judicial review exists precisely to curb legislative overreach and uphold constitutional liberties."
    },
    {
        "term_en": "philanthropy",
        "meaning_uz": "xayriya faoliyati, insonparvarlik saxiyligi",
        "synonyms": "charity, humanitarianism, civic benevolence",
        "example_en": "Billionaire philanthropy often faces criticism when it overshadows democratically funded public goods."
    },
    {
        "term_en": "recruitment",
        "meaning_uz": "xodimlarni ishga yollash, kadrlarni jalb qilish",
        "synonyms": "hiring, talent acquisition, staffing",
        "example_en": "The aerospace institute refined its recruitment drives to attract promising STEM graduates."
    },
    {
        "term_en": "underserved",
        "meaning_uz": "e'tibordan chetda qolgan, yetarli xizmat ko'rsatilmagan",
        "synonyms": "disadvantaged, underprivileged, neglected",
        "example_en": "Subsidized telemedicine initiatives bridge essential gaps for historically underserved remote hamlets."
    },
    {
        "term_en": "fulfilling",
        "meaning_uz": "qoniqish hissini beruvchi, mazmunli",
        "synonyms": "rewarding, satisfying, enriching, gratifying",
        "example_en": "Teaching in public academies can be exhausting, yet teachers describe it as deeply fulfilling."
    },
    {
        "term_en": "altruism blurs",
        "meaning_uz": "beg'araz yaxshilik va shaxsiy manfaat o'rtasidagi chegara noaniqlashmoqda",
        "synonyms": "generosity overlaps with self-interest",
        "example_en": "When companies turn charity into promotional campaigns, genuine altruism blurs with brand marketing."
    },
    {
        "term_en": "fringe ideas",
        "meaning_uz": "chetki (radikal, ko'pchilik tan olmagan) g'oyalar",
        "synonyms": "marginal concepts, unorthodox theories, radical thoughts",
        "example_en": "Ideas once derided as fringe ideas about renewable energy now underpin mainstream economic policy."
    },
    {
        "term_en": "scrutinize",
        "meaning_uz": "sinchiklab o'rganmoq, qattiq tekshiruvdan o'tkazmoq",
        "synonyms": "examine minutely, inspect thoroughly, audit",
        "example_en": "Independent investigative journalists rigorously scrutinize political donation disclosures."
    },
    {
        "term_en": "pushback",
        "meaning_uz": "qarshilik, keskin e'tiroz",
        "synonyms": "resistance, opposition, protest, backlash",
        "example_en": "The board met fierce pushback from faculty members over proposed cuts to liberal arts departments."
    },
    {
        "term_en": "trump card",
        "meaning_uz": "ko'zir qarta, hal qiluvchi ustunlik",
        "synonyms": "decisive advantage, clincher, ace in the hole",
        "example_en": "In modern geopolitical diplomacy, control over rare-earth minerals acts as an unbeatable trump card."
    },
    {
        "term_en": "tilts public opinion",
        "meaning_uz": "jamoatchilik fikrini o'z tomoniga og'dirmoq / siljitmoq",
        "synonyms": "sways popular sentiment, biases public perception",
        "example_en": "A viral documentary can tilt public opinion against predatory lending within days."
    },
    {
        "term_en": "some risk becoming white elephants",
        "meaning_uz": "ayrimlari behuda xarajatli va foydasiz yukka aylanish xavfi bor",
        "synonyms": "costly useless burdens, financial drains",
        "example_en": "Without long-term urban utility, lavish mega-stadiums risk becoming white elephants after championships end."
    },
    {
        "term_en": "cynical attempts",
        "meaning_uz": "samimiyatsiz (manfaatchi) urinishlar",
        "synonyms": "insincere endeavors, manipulative efforts",
        "example_en": "Voters grow weary of cynical attempts by politicians to exploit religious sentiments before elections."
    },
    {
        "term_en": "exploitative labor practices",
        "meaning_uz": "ekspluatatsion (zulmkor va adolatsiz) mehnat usullari",
        "synonyms": "sweatshop conditions, abusive employment, unfair labor",
        "example_en": "Consumer boycotts pressured the retailer to cease reliance on exploitative labor practices abroad."
    },
    {
        "term_en": "legitimacy",
        "meaning_uz": "qonuniylik, jamiyat tomonidan e'tirof etilganlik, legitimlik",
        "synonyms": "validity, credibility, authenticity, lawfulness",
        "example_en": "Unfair electoral procedures irreparably damage the legitimacy of governing bodies."
    },
    {
        "term_en": "prosperity",
        "meaning_uz": "to'kin-sochinlik, farovonlik, boylik",
        "synonyms": "affluence, economic well-being, wealth, flourishing",
        "example_en": "True national prosperity cannot be gauged merely by GDP while poverty rates remain elevated."
    },
    {
        "term_en": "hoarded",
        "meaning_uz": "yashirincha jamg'arilgan, ochko'zlik bilan to'plab qo'yilgan",
        "synonyms": "stockpiled, accumulated excessively, stored up",
        "example_en": "Vaccines hoarded by affluent nations during global pandemics drew severe ethical condemnation."
    },
    {
        "term_en": "polarization",
        "meaning_uz": "qutblashuv, qarama-qarshi oqimlarga bo'linish",
        "synonyms": "division, ideological separation, dichotomy",
        "example_en": "Echo-chamber algorithms dramatically heighten political polarization across democratic nations."
    },
    {
        "term_en": "social fragmentation",
        "meaning_uz": "ijtimoiy parchalanish, insonlararo aloqaning uzilishi",
        "synonyms": "societal atomization, breakdown of solidarity",
        "example_en": "The decline of neighborhood associations has precipitated alarming social fragmentation."
    },
    {
        "term_en": "wield outsized",
        "meaning_uz": "beqiyos darajada katta ta'sirga ega bo'lmoq",
        "synonyms": "exercise disproportionate power, hold massive sway",
        "example_en": "Credit rating agencies wield outsized influence over emerging market sovereign debt costs."
    },
    {
        "term_en": "merely",
        "meaning_uz": "shunchaki, faqatgina, xolos",
        "synonyms": "simply, solely, purely, only",
        "example_en": "Language learning is not merely about memorizing vocabulary; it is about grasping cultural thought patterns."
    },
    {
        "term_en": "to pad balance sheets",
        "meaning_uz": "moliyaviy hisobotni sun'iy ravishda bo'rttirish (chiroyli ko'rsatish)",
        "synonyms": "inflate balance sheets, boost paper profits artificially",
        "example_en": "The firm deferred capital infrastructure repairs merely to pad balance sheets prior to going public."
    }
]

ACADEMIC_55_WORDS = [
    # 1-20: Academic Vocabulary
    {
        "term_en": "Allocate",
        "meaning_uz": "taqsimlamoq, ajratmoq",
        "synonyms": "distribute, assign, allot, apportion",
        "example_en": "Governments must allocate adequate financial resources to scientific research and public education."
    },
    {
        "term_en": "Tangible",
        "meaning_uz": "moddiy, sezilarli, aniq",
        "synonyms": "palpable, concrete, perceptible, discernible",
        "example_en": "The community development program produced tangible improvements in local living standards."
    },
    {
        "term_en": "Breakthrough",
        "meaning_uz": "yirik yutuq, ulkan ilmiy kashfiyot",
        "synonyms": "quantum leap, major advance, milestone, innovation",
        "example_en": "The discovery of gene-editing techniques represents a monumental breakthrough in modern medicine."
    },
    {
        "term_en": "Confining",
        "meaning_uz": "cheklash, tor doirada saqlash",
        "synonyms": "restricting, constraining, limiting, circumscribing",
        "example_en": "Confining academic inquiry to immediate commercial applications stifles foundational discovery."
    },
    {
        "term_en": "Oversight",
        "meaning_uz": "nazorat, kuzatuv, tekshiruv",
        "synonyms": "supervision, surveillance, scrutiny, management",
        "example_en": "Independent regulatory oversight ensures that clinical pharmaceutical trials adhere to ethical standards."
    },
    {
        "term_en": "Safeguard",
        "meaning_uz": "himoya vositasi, kafolatlovchi chora",
        "synonyms": "protection, buffer, defense, shield",
        "example_en": "Strict legal safeguards are necessary to protect whistleblowers from corporate retaliation."
    },
    {
        "term_en": "Critic",
        "meaning_uz": "tanqidchi, xolis baholovchi",
        "synonyms": "reviewer, commentator, evaluator, analyst",
        "example_en": "The prominent literary critic analyzed how social class structures were depicted in nineteenth-century novels."
    },
    {
        "term_en": "Heritage",
        "meaning_uz": "meros, madaniy va tarixiy boylik",
        "synonyms": "legacy, patrimony, inheritance, tradition",
        "example_en": "Preserving historical architectural heritage strengthens communal identity and cultural pride."
    },
    {
        "term_en": "Sustainable",
        "meaning_uz": "barqaror, davomiy, tabiatga mos",
        "synonyms": "viable, enduring, maintainable, ecologically sound",
        "example_en": "Urban planners must implement sustainable transportation solutions to reduce carbon emissions."
    },
    {
        "term_en": "Empathy",
        "meaning_uz": "hamdardlik, boshqalarning his-tuyg'ularini tushunish",
        "synonyms": "compassion, understanding, emotional affinity, fellow-feeling",
        "example_en": "Effective diplomatic leadership requires both strategic firmness and genuine intercultural empathy."
    },
    {
        "term_en": "Beneficiary",
        "meaning_uz": "foyda oluvchi, manfaatdor tomon",
        "synonyms": "recipient, heir, receiver, grantee",
        "example_en": "Marginalized rural communities were the primary beneficiary of the newly expanded healthcare initiative."
    },
    {
        "term_en": "Collaboration",
        "meaning_uz": "hamkorlik, birgalikda ishlash",
        "synonyms": "cooperation, partnership, alliance, synergy",
        "example_en": "International scientific collaboration is paramount when addressing cross-border ecological challenges."
    },
    {
        "term_en": "Practical",
        "meaning_uz": "amaliy, hayotiy qo'llaniluvchi",
        "synonyms": "pragmatic, applied, functional, actionable",
        "example_en": "Vocational schools bridge abstract academic concepts with practical industrial expertise."
    },
    {
        "term_en": "Equitable",
        "meaning_uz": "adolatli, teng huquqli, xolis",
        "synonyms": "fair, just, egalitarian, impartial",
        "example_en": "Ensuring equitable access to high-speed digital networks reduces the socioeconomic divide."
    },
    {
        "term_en": "Porous",
        "meaning_uz": "o'tkazuvchan, bo'shliqlari bor, beqaror",
        "synonyms": "permeable, penetrable, leaky, unsealed",
        "example_en": "Traditional disciplinary boundaries have become increasingly porous as researchers collaborate globally."
    },
    {
        "term_en": "Discipline",
        "meaning_uz": "fan sohasi, ilmiy yo'nalish",
        "synonyms": "branch of knowledge, field of study, domain, specialty",
        "example_en": "Cognitive science is an integrative discipline drawing on neuroscience, psychology, and philosophy."
    },
    {
        "term_en": "Interplay",
        "meaning_uz": "o'zaro ta'sir, bog'liqlik",
        "synonyms": "interaction, reciprocity, dynamic relationship, interconnectedness",
        "example_en": "The essay explores the complex interplay between cultural traditions and technological globalization."
    },
    {
        "term_en": "Informed",
        "meaning_uz": "xabardor, asosli, ma'lumotga ega",
        "synonyms": "knowledgeable, evidence-based, educated, well-grounded",
        "example_en": "Citizens require transparent information to make informed voting decisions in general elections."
    },
    {
        "term_en": "Resilient",
        "meaning_uz": "bardoshli, chidamli, tez tiklanadigan",
        "synonyms": "hardy, robust, tough, adaptable",
        "example_en": "Developing climate-resilient agricultural crops is critical to sustaining global food security."
    },
    {
        "term_en": "Trust",
        "meaning_uz": "ishonch, e'tiqod",
        "synonyms": "confidence, reliance, faith, credibility",
        "example_en": "Public trust in scientific institutions can be severely eroded by poorly communicated evidence."
    },
    # 21-40: C1 Vocabulary
    {
        "term_en": "Perennial dilemma",
        "meaning_uz": "doimiy muammo, har doim mavjud bo'lgan ziddiyat",
        "synonyms": "persistent problem, recurring paradox, endless conundrum",
        "example_en": "Balancing state surveillance with personal privacy remains a perennial dilemma for democratic lawmakers."
    },
    {
        "term_en": "Indispensable",
        "meaning_uz": "ajralmas, juda zarur, muhim",
        "synonyms": "vital, essential, indispensable, crucial, requisite",
        "example_en": "Peer-reviewed scientific scrutiny is an indispensable pillar of rigorous academic discovery."
    },
    {
        "term_en": "Mobilization",
        "meaning_uz": "safarbarlik, kuchlarni birlashtirish",
        "synonyms": "rallying, activation, organization, marshaling",
        "example_en": "Grassroots mobilization was instrumental in passing comprehensive environmental protection bills."
    },
    {
        "term_en": "Triumph",
        "meaning_uz": "g'alaba, yirik yutuq, tantana",
        "synonyms": "victory, crowning achievement, conquest, masterstroke",
        "example_en": "The successful launch of the deep space telescope was hailed as a monumental technological triumph."
    },
    {
        "term_en": "Exacerbate",
        "meaning_uz": "kuchaytirib yubormoq, yomonlashtirmoq, keskinlashtirmoq",
        "synonyms": "aggravate, worsen, intensify, inflame",
        "example_en": "Prolonged droughts threaten to exacerbate existing regional water scarcity disputes."
    },
    {
        "term_en": "Erode",
        "meaning_uz": "yemirmoq, zaiflashtirmoq, asta-sekin yemirib bitirmoq",
        "synonyms": "wear down, deteriorate, undermine, weaken",
        "example_en": "Widespread financial corruption can rapidly erode democratic norms and civic engagement."
    },
    {
        "term_en": "Cautionary tale",
        "meaning_uz": "ogohlantiruvchi voqea, ibratli saboq",
        "synonyms": "warning story, moral lesson, salutary warning",
        "example_en": "The historical collapse of the over-leveraged bank stands as a cautionary tale for modern hedge funds."
    },
    {
        "term_en": "Dismissed",
        "meaning_uz": "rad etilgan, e'tiborsiz qoldirilgan",
        "synonyms": "rejected, brushed aside, discounted, disregarded",
        "example_en": "Innovative cosmological hypotheses were frequently dismissed by traditional academia before gaining empirical backing."
    },
    {
        "term_en": "Interdisciplinary",
        "meaning_uz": "fanlararo, bir nechta sohalarni qamrab oluvchi",
        "synonyms": "cross-disciplinary, multidisciplinary, transdisciplinary",
        "example_en": "Addressing complex climate patterns requires interdisciplinary research involving physicists, geographers, and data scientists."
    },
    {
        "term_en": "Quarterly profits",
        "meaning_uz": "choraklik foyda, uch oylik moliyaviy daromad",
        "synonyms": "quarterly earnings, three-month fiscal yield, short-term returns",
        "example_en": "Corporate executives who fixate solely on quarterly profits often underfund speculative long-term research."
    },
    {
        "term_en": "Anthropological",
        "meaning_uz": "antropologik, insoniyat madaniyati va kelib chiqishiga oid",
        "synonyms": "ethnographic, human-historical, culturological",
        "example_en": "Anthropological studies reveal fascinating parallels in folklore traditions across isolated nomadic societies."
    },
    {
        "term_en": "Linguistics",
        "meaning_uz": "tilshunoslik, til qonuniyatlarini o'rganuvchi fan",
        "synonyms": "philology, language science, glottology",
        "example_en": "Contemporary linguistics blends historical grammatical analysis with advanced computational language models."
    },
    {
        "term_en": "Holistic",
        "meaning_uz": "yaxlit, umumiy, barcha omillarni hisobga oluvchi",
        "synonyms": "comprehensive, integrated, all-embracing, total",
        "example_en": "Educators recommend a holistic curriculum that cultivates creative artistry alongside mathematical logic."
    },
    {
        "term_en": "Welfare policy",
        "meaning_uz": "ijtimoiy ta'minot siyosati",
        "synonyms": "social assistance framework, public welfare system, safety net strategy",
        "example_en": "A robust welfare policy cushions vulnerable demographics during severe macroeconomic fluctuations."
    },
    {
        "term_en": "Short-sighted",
        "meaning_uz": "qisqa qarashli, tor fikrli, kelajakni ko'ra bilmaydigan",
        "synonyms": "myopic, improvident, narrow-minded, ill-considered",
        "example_en": "Slashing environmental conservation budgets is a short-sighted measure that invites future ecological disasters."
    },
    {
        "term_en": "Misinformation",
        "meaning_uz": "noto'g'ri ma'lumot, yanglish axborot",
        "synonyms": "false data, erroneous information, deceptive claims",
        "example_en": "The rampant circulation of health misinformation online undermines public immunization campaigns."
    },
    {
        "term_en": "Incentivize",
        "meaning_uz": "rag'batlantirmoq, motivatsiya bermoq",
        "synonyms": "encourage, stimulate, motivate, spur",
        "example_en": "Tax credits can effectively incentivize commercial businesses to adopt renewable wind and solar energy."
    },
    {
        "term_en": "Resilience",
        "meaning_uz": "barqarorlik, chidamlilik, bardoshlilik",
        "synonyms": "endurance, fortitude, adaptability, toughness",
        "example_en": "Psychological resilience enables individuals to recover and grow following severe adversity."
    },
    {
        "term_en": "Culturally acceptable",
        "meaning_uz": "madaniy jihatdan maqbul, an'analarga mos",
        "synonyms": "socially appropriate, normative, culturally compliant, permissible",
        "example_en": "International aid programs succeed only when their outreach strategies are culturally acceptable to the local populace."
    },
    {
        "term_en": "Historically informed",
        "meaning_uz": "tarixiy tajribaga asoslangan, tarixdan saboq olgan",
        "synonyms": "historically grounded, contextually grounded, retrospective-conscious",
        "example_en": "Diplomats must craft historically informed treaties that acknowledge long-standing territorial grievances."
    },
    # 41-55: C2 Vocabulary
    {
        "term_en": "Soaring expectations",
        "meaning_uz": "yuksak kutishlar, haddan ziyod baland umidlar",
        "synonyms": "sky-high expectations, escalating hopes, towering demands",
        "example_en": "The revolutionary software release triggered soaring expectations among both investors and consumers."
    },
    {
        "term_en": "Intellectual landscape",
        "meaning_uz": "intellektual manzara, ilmiy-falsafiy muhit",
        "synonyms": "scholarly terrain, realm of thought, intellectual milieu",
        "example_en": "The advent of the Enlightenment fundamentally reconfigured the European intellectual landscape."
    },
    {
        "term_en": "Exist in a vacuum",
        "meaning_uz": "alohida mavjud bo'lmoq, tashqi ta'sirlardan uzilgan holda yashamoq",
        "synonyms": "be isolated from context, stand in total detachment",
        "example_en": "Scientific inventions never exist in a vacuum; they inevitably reflect the socioeconomic conditions of their epoch."
    },
    {
        "term_en": "Exacerbating inequality",
        "meaning_uz": "tengsizlikni kuchaytirish, tabaqalanishni chuqurlashtirish",
        "synonyms": "widening wealth gaps, deepening societal divides, worsening disparity",
        "example_en": "Unregulated housing speculation runs the distinct risk of exacerbating inequality in urban centers."
    },
    {
        "term_en": "Reshaped geopolitics",
        "meaning_uz": "geosiyosatni qayta shakllantirdi, xalqaro munosabatlarni o'zgartirdi",
        "synonyms": "reconfigured world order, transformed global diplomacy",
        "example_en": "The collapse of maritime trade monopolies fundamentally reshaped geopolitics across the Indian Ocean."
    },
    {
        "term_en": "Zero-sum game",
        "meaning_uz": "nol natijali o'yin (biri yutsa, ikkinchisi yutqazadi)",
        "synonyms": "win-lose situation, strictly competitive conflict",
        "example_en": "Diplomats cautioned that perceiving bilateral trade as a zero-sum game would derail cooperative agreements."
    },
    {
        "term_en": "New Frontiers in Research Fund",
        "meaning_uz": "Kanada ilmiy loyihalar jamg'armasi (innovatsion va fanlararo tadqiqot fondi)",
        "synonyms": "high-risk research grant, interdisciplinary innovation endowment",
        "example_en": "Groundbreaking exploratory studies into bioengineering were underwritten by the New Frontiers in Research Fund."
    },
    {
        "term_en": "Technologically sound",
        "meaning_uz": "texnik jihatdan mustahkam, texnologik puxta",
        "synonyms": "technically robust, viable, methodologically rigorous",
        "example_en": "The panel approved the renewable power grid because its transmission design was technologically sound."
    },
    {
        "term_en": "Subtler problems",
        "meaning_uz": "nozikroq muammolar, darhol ko'rinmaydigan murakkabliklar",
        "synonyms": "nuanced dilemmas, less obvious intricacies, underlying complications",
        "example_en": "As algorithmic engines grow faster, developers encounter subtler problems concerning fairness and transparency."
    },
    {
        "term_en": "Race for practicality",
        "meaning_uz": "amaliyot uchun poyga, darhol foyda keltirishga shoshilish",
        "synonyms": "pursuit of immediate application, rush for pragmatic results",
        "example_en": "The feverish race for practicality in tech ventures can marginalize exploratory foundational science."
    },
    {
        "term_en": "Bankroll innovation",
        "meaning_uz": "innovatsiyani moliyalashtirish, yangi g'oyalarga sarmoya kiritish",
        "synonyms": "fund breakthroughs, subsidize invention, finance pioneering ventures",
        "example_en": "Venture capitalists compete vigorously to bankroll innovation across artificial intelligence and clean energy."
    },
    {
        "term_en": "Ecosystem of inquiry",
        "meaning_uz": "ilmiy izlanish ekotizimi, akademik tadqiqot muhiti",
        "synonyms": "research ecosystem, intellectual infrastructure, scholarly environment",
        "example_en": "A flourishing university maintains an open ecosystem of inquiry that welcomes radical hypothesis testing."
    },
    {
        "term_en": "The microscope and the manuscript",
        "meaning_uz": "fan va gumanitar bilim ramzi sifatida (aniq fanlar va adabiyot/gumanitar sohalar uyg'unligi)",
        "synonyms": "empirical science and the humanities, synthesis of STEM and liberal arts",
        "example_en": "True cultural advancement occurs when society honors both the microscope and the manuscript equally."
    },
    {
        "term_en": "Threads in the same fabric",
        "meaning_uz": "bir to'qimadagi iplar (bir butunning ajralmas, uzviy qismlari - metafora)",
        "synonyms": "interconnected elements, intertwined strands of a whole",
        "example_en": "Freedom of speech and judicial independence are complementary threads in the same fabric of democracy."
    },
    {
        "term_en": "Unraveling",
        "meaning_uz": "so'kilish, parchalanish, inqiroz",
        "synonyms": "disintegration, undoing, breakdown, fragmentation",
        "example_en": "Without constant diplomatic vigilance, the fragile peace agreement risked complete unraveling."
    }
]


async def seed_initial_deck(session: AsyncSession) -> None:
    """
    Seeds the database with our flagship 47 Core Words deck and the 55 Academic Words deck if they do not exist.
    """
    now = utc_now()

    # 1. Flagship 47 Core Words deck
    stmt_47 = select(Deck).where(Deck.title == "IELTS Reading Advanced — 47 Core Words")
    res_47 = await session.execute(stmt_47)
    deck_47 = res_47.scalar_one_or_none()
    if not deck_47:
        logger.info("Seeding flagship deck: 'IELTS Reading Advanced — 47 Core Words'...")
        deck_47 = Deck(
            title="IELTS Reading Advanced — 47 Core Words",
            description="IELTS Reading C1/C2 darajasidagi eng muhim va kontekstual 47 ta akademik so'z va iboralar to'plami. Har bir so'z o'zbekcha tarjima, sinonimlar va kontekstual namunalar bilan boyitilgan.",
            level="C1",
            is_public=True,
            created_at=now
        )
        session.add(deck_47)
        await session.flush()

        for item in CORE_47_WORDS:
            card = Card(
                deck_id=deck_47.id,
                term_en=item["term_en"],
                meaning_uz=item["meaning_uz"],
                synonyms=item.get("synonyms"),
                example_en=item.get("example_en"),
            )
            session.add(card)
            await session.flush()

            progress = StudyProgress(
                card_id=card.id,
                user_id=None,
                box_level=0,
                next_review_at=now,
                correct_streak=0,
                wrong_count=0
            )
            session.add(progress)
        logger.info(f"Successfully seeded deck ID {deck_47.id} with {len(CORE_47_WORDS)} cards and SRS progress.")
    else:
        logger.info("Deck 'IELTS Reading Advanced — 47 Core Words' already exists.")

    # 2. Academic 55 Core Words deck
    deck_55_title = "IELTS & Academic Mastery — 55 Core Words (C1–C2)"
    stmt_55 = select(Deck).where(Deck.title == deck_55_title)
    res_55 = await session.execute(stmt_55)
    deck_55 = res_55.scalar_one_or_none()
    if not deck_55:
        logger.info(f"Seeding academic deck: '{deck_55_title}'...")
        deck_55 = Deck(
            title=deck_55_title,
            description="IELTS va ilmiy-akademik matnlarda eng ko'p uchraydigan 55 ta muhim so'z va iboralar to'plami (B2, C1, C2). Har bir so'z aniq o'zbekcha ma'no, sinonimlar va boy kontekstual namunalar bilan jihozlangan.",
            level="C1-C2",
            is_public=True,
            created_at=now
        )
        session.add(deck_55)
        await session.flush()

        for item in ACADEMIC_55_WORDS:
            card = Card(
                deck_id=deck_55.id,
                term_en=item["term_en"],
                meaning_uz=item["meaning_uz"],
                synonyms=item.get("synonyms"),
                example_en=item.get("example_en"),
            )
            session.add(card)
            await session.flush()

            progress = StudyProgress(
                card_id=card.id,
                user_id=None,
                box_level=0,
                next_review_at=now,
                correct_streak=0,
                wrong_count=0
            )
            session.add(progress)
        logger.info(f"Successfully seeded deck ID {deck_55.id} with {len(ACADEMIC_55_WORDS)} cards and SRS progress.")
    else:
        logger.info(f"Deck '{deck_55_title}' already exists.")

    await session.commit()
