export const journeySteps = [
  {
    id: "eligibility",
    title: "Eligibility",
    short: "Who can become a voter.",
    meaning: "Eligibility decides whether a person can be enrolled as a voter.",
    matters: "It keeps the voter list accurate and helps people know when they can register.",
    beginner: "In India, a citizen who is 18 or older on the qualifying date can usually apply to be registered as a voter."
  },
  {
    id: "registration",
    title: "Voter Registration",
    short: "Applying to be added to the voter list.",
    meaning: "Registration is the process of applying for your name to be included in the electoral roll.",
    matters: "A person generally needs their name in the electoral roll to vote at an assigned polling station.",
    beginner: "Think of registration as asking to be added to the official voter list for your area."
  },
  {
    id: "roll",
    title: "Electoral Roll",
    short: "The official list of voters.",
    meaning: "The electoral roll lists eligible voters for each polling area.",
    matters: "Polling officials use it to verify whether a person can vote at that station.",
    beginner: "Before polling day, voters should check whether their name and details appear correctly."
  },
  {
    id: "nomination",
    title: "Candidate Nomination",
    short: "How candidates formally enter an election.",
    meaning: "Nomination is the official process where candidates submit required documents to contest an election.",
    matters: "It creates a verified list of candidates before voting begins.",
    beginner: "This is the paperwork stage for candidates, not voters."
  },
  {
    id: "campaigning",
    title: "Campaigning",
    short: "Information and outreach before voting.",
    meaning: "Campaigning is the period when candidates share their messages with voters under election rules.",
    matters: "Rules help keep the contest orderly and protect voters from unfair practices.",
    beginner: "Voters should compare credible information and avoid misinformation."
  },
  {
    id: "polling",
    title: "Polling Day",
    short: "The day voters cast their vote.",
    meaning: "Polling day is when enrolled voters go to their assigned station and vote.",
    matters: "It is the main public participation moment in an election.",
    beginner: "Officials verify the voter, mark participation, and guide the voter to the voting compartment."
  },
  {
    id: "evm",
    title: "EVM/VVPAT",
    short: "The voting machine and verification slip.",
    meaning: "An EVM records votes, while VVPAT briefly displays a paper slip showing the selected option.",
    matters: "VVPAT helps voters visually verify that their selection was recorded as intended.",
    beginner: "The slip is for verification inside the machine; it is not a receipt to take home."
  },
  {
    id: "counting",
    title: "Counting",
    short: "Votes are counted under supervision.",
    meaning: "Counting is the controlled process of totaling votes after polling is complete.",
    matters: "Transparent counting procedures help build trust in the result.",
    beginner: "Counting happens after voting ends and follows official rules and supervision."
  },
  {
    id: "results",
    title: "Results",
    short: "The final declared outcome.",
    meaning: "Results communicate which candidate has won according to the counted votes.",
    matters: "Result declaration completes the election cycle for that contest.",
    beginner: "Results are the end of a longer process that started well before polling day."
  }
];

export const pathways = {
  under18: {
    label: "Under 18",
    title: "Start early, be ready later",
    summary: "You may not be eligible to register yet, but you can learn the process now and prepare to become an informed voter.",
    steps: ["Eligibility", "Electoral Roll", "EVM/VVPAT", "Myth vs Fact", "Quiz"]
  },
  firstTime: {
    label: "First-time voter",
    title: "Your first VoteReady pathway",
    summary: "Focus on eligibility, registration, electoral roll checks, polling day flow, and EVM/VVPAT verification.",
    steps: ["Eligibility", "Voter Registration", "Electoral Roll", "Polling Day", "EVM/VVPAT", "Quiz"]
  },
  registered: {
    label: "Already registered",
    title: "Confirm and refresh",
    summary: "You likely need a quick refresh: verify your details, understand polling day, and test your knowledge.",
    steps: ["Electoral Roll", "Polling Day", "EVM/VVPAT", "Counting", "Quiz"]
  },
  moved: {
    label: "Moved address",
    title: "Update before polling",
    summary: "Learn how address changes can affect the electoral roll and assigned polling station.",
    steps: ["Voter Registration", "Electoral Roll", "Polling Day", "AI Guide"]
  },
  pwd: {
    label: "Person with disability",
    title: "Learn with accessibility in mind",
    summary: "Review the voting journey and use accessibility settings in this app to learn in the format that works best for you.",
    steps: ["Eligibility", "Electoral Roll", "Polling Day", "EVM/VVPAT", "Accessibility Options"]
  },
  classroom: {
    label: "Teacher/student classroom mode",
    title: "Teach the process through activities",
    summary: "Use the journey cards, mock vote, myths, and quiz as a classroom sequence for civic education.",
    steps: ["Election Journey", "Mock Voting Simulator", "Myth vs Fact", "Quiz", "Discussion"]
  }
};

export const mythFacts = [
  {
    myth: "Voting happens only on one day.",
    fact: "Elections include registration, nomination, campaigning, polling, counting, and result declaration."
  },
  {
    myth: "You can vote anywhere.",
    fact: "Voters usually vote at their assigned polling station where their name appears in the electoral roll."
  },
  {
    myth: "VVPAT gives you a receipt to take home.",
    fact: "VVPAT lets voters visually verify their selection; it is not a take-home receipt."
  },
  {
    myth: "NOTA means the election is cancelled.",
    fact: "NOTA lets voters choose None of the Above; it does not automatically cancel the election."
  },
  {
    myth: "AI can tell me which party is best.",
    fact: "VoteWise India only explains election processes and does not provide political recommendations."
  }
];

export const quizQuestions = [
  {
    id: "q1",
    topic: "Eligibility",
    question: "What is the main purpose of voter eligibility rules?",
    options: ["To decide who can be enrolled as a voter", "To choose the winner", "To count votes faster", "To create campaign slogans"],
    answer: 0,
    explanation: "Eligibility rules help decide who can be included in the voter list."
  },
  {
    id: "q2",
    topic: "Registration",
    question: "What does voter registration usually help you do?",
    options: ["Join a campaign team", "Apply to be included in the electoral roll", "Skip polling station checks", "Vote without identification"],
    answer: 1,
    explanation: "Registration is the application process for inclusion in the electoral roll."
  },
  {
    id: "q3",
    topic: "Electoral Roll",
    question: "Why should voters check the electoral roll before polling day?",
    options: ["To see campaign posters", "To verify that their name and details are listed", "To choose a party", "To cancel an election"],
    answer: 1,
    explanation: "The electoral roll is used to confirm whether a voter is listed for a polling area."
  },
  {
    id: "q4",
    topic: "Nomination",
    question: "Candidate nomination is mainly about:",
    options: ["Voters selecting a polling station", "Candidates formally entering the election", "Counting votes", "Printing a take-home receipt"],
    answer: 1,
    explanation: "Nomination is the official process for candidates to contest an election."
  },
  {
    id: "q5",
    topic: "Campaigning",
    question: "A healthy voter habit during campaigning is to:",
    options: ["Trust every forwarded message", "Compare credible information and watch for misinformation", "Ask AI who to vote for", "Ignore election rules"],
    answer: 1,
    explanation: "Voters should evaluate information carefully and avoid misinformation."
  },
  {
    id: "q6",
    topic: "Polling Day",
    question: "Where do voters usually cast their vote?",
    options: ["At any station in the country", "At their assigned polling station", "Only online", "At a candidate office"],
    answer: 1,
    explanation: "Voters usually vote at the assigned station where their name appears in the roll."
  },
  {
    id: "q7",
    topic: "EVM/VVPAT",
    question: "What does VVPAT help a voter do?",
    options: ["Take a receipt home", "Visually verify the selected option briefly", "Change votes after polling", "See all voters' choices"],
    answer: 1,
    explanation: "VVPAT displays a slip briefly so the voter can verify the selection."
  },
  {
    id: "q8",
    topic: "NOTA",
    question: "What does NOTA mean in this learning context?",
    options: ["None of the Above", "New Online Turnout App", "Nomination Over Time Act", "National Official Tally Authority"],
    answer: 0,
    explanation: "NOTA stands for None of the Above."
  },
  {
    id: "q9",
    topic: "Counting",
    question: "Counting happens:",
    options: ["Before nomination", "After polling is complete", "Before voters register", "Only during campaigning"],
    answer: 1,
    explanation: "Votes are counted after polling is complete under official procedures."
  },
  {
    id: "q10",
    topic: "AI Safety",
    question: "What should VoteWise India do if asked which party is best?",
    options: ["Recommend the most popular option", "Oppose a candidate", "Refuse recommendations and explain the election process", "Guess based on the user's city"],
    answer: 2,
    explanation: "The app is non-partisan and must not recommend or oppose parties or candidates."
  }
];

export const suggestedQuestions = [
  "What is the electoral roll?",
  "What is VVPAT?",
  "What happens on polling day?",
  "What is NOTA?",
  "Can you tell me who to vote for?"
];

export const glossaryTerms = [
  {
    term: "Election",
    explanation: "A formal process where voters choose representatives or decide an issue.",
    matters: "Elections let citizens participate in democracy through a structured process.",
    example: "A general election chooses representatives for a full legislative body.",
    related: ["Democracy", "Voter", "Candidate"]
  },
  {
    term: "Democracy",
    explanation: "A system where people participate in choosing leaders and shaping public decisions.",
    matters: "Democracy depends on informed participation, fair procedures, and voter trust.",
    example: "Voting in an election is one way citizens participate in democracy.",
    related: ["Election", "Voter", "Constituency"]
  },
  {
    term: "Voter",
    explanation: "A person who is eligible and enrolled to vote in an election.",
    matters: "Voters are the people who participate in choosing representatives.",
    example: "A first-time voter checks their name in the electoral roll before polling day.",
    related: ["Electoral Roll", "Voter ID/EPIC", "Polling Station"]
  },
  {
    term: "Candidate",
    explanation: "A person who formally contests an election.",
    matters: "Voters choose from the list of validly nominated candidates and NOTA.",
    example: "In this educational simulator, Candidate A, Candidate B, and Candidate C are fictional.",
    related: ["Nomination", "Campaigning", "Ballot"]
  },
  {
    term: "Constituency",
    explanation: "A defined area whose voters elect a representative.",
    matters: "Your constituency helps determine which contest and candidates appear for you.",
    example: "Two students in different constituencies may see different candidate lists.",
    related: ["Voter", "Candidate", "Lok Sabha"]
  },
  {
    term: "Electoral Roll",
    explanation: "The official list of voters for a polling area.",
    matters: "Your name usually needs to be on the electoral roll to vote at your assigned polling station.",
    example: "A voter checks the electoral roll before polling day to confirm their details.",
    related: ["Voter", "Voter ID/EPIC", "Polling Station"]
  },
  {
    term: "Voter ID/EPIC",
    explanation: "EPIC is an elector photo identity card used to help identify voters.",
    matters: "Identity checking helps polling officials verify voters correctly.",
    example: "A voter may carry their EPIC or another accepted identification document as instructed.",
    related: ["Voter", "Electoral Roll", "Polling Booth"]
  },
  {
    term: "Polling Booth",
    explanation: "The private area inside a polling station where a voter casts their vote.",
    matters: "It protects the secrecy of the vote.",
    example: "After verification, a voter goes to the polling booth to use the EVM.",
    related: ["Polling Station", "EVM", "VVPAT"]
  },
  {
    term: "Polling Station",
    explanation: "The assigned place where listed voters go to cast their vote.",
    matters: "Voters usually vote where their name appears in the electoral roll.",
    example: "A school building may be used as a polling station during an election.",
    related: ["Electoral Roll", "Polling Booth", "Presiding Officer"]
  },
  {
    term: "Presiding Officer",
    explanation: "The official in charge of a polling station on polling day.",
    matters: "This role helps keep polling orderly and follows election procedure.",
    example: "The presiding officer manages polling station procedures and officials.",
    related: ["Polling Station", "Polling Booth", "EVM"]
  },
  {
    term: "Ballot",
    explanation: "The list or method through which voters make their choice.",
    matters: "The ballot is how voter choice is presented and recorded.",
    example: "On an EVM, the ballot display shows fictional options in this simulator.",
    related: ["Candidate", "EVM", "NOTA"]
  },
  {
    term: "EVM",
    explanation: "Electronic Voting Machine; a device used to record votes.",
    matters: "It is central to the polling day voting flow in many Indian elections.",
    example: "A voter presses the button next to their selected option on the EVM.",
    related: ["VVPAT", "Polling Booth", "Ballot"]
  },
  {
    term: "VVPAT",
    explanation: "Voter Verifiable Paper Audit Trail; it briefly shows a paper slip with the selected option.",
    matters: "It lets voters visually verify that the EVM recorded the intended selection.",
    example: "The VVPAT slip is visible briefly and is not a take-home receipt.",
    related: ["EVM", "Polling Booth", "Ballot"]
  },
  {
    term: "NOTA",
    explanation: "None of the Above; an option for voters who do not choose any listed candidate.",
    matters: "It lets voters record that choice without selecting a candidate.",
    example: "NOTA does not automatically cancel the election.",
    related: ["Ballot", "Candidate", "EVM"]
  },
  {
    term: "Model Code of Conduct",
    explanation: "A set of guidelines for parties, candidates, and officials during elections.",
    matters: "It supports fair conduct and orderly campaigning.",
    example: "Campaigning must follow rules once the Model Code of Conduct is in force.",
    related: ["Campaigning", "Candidate", "Election Commission"]
  },
  {
    term: "Nomination",
    explanation: "The formal process through which candidates enter an election contest.",
    matters: "It creates the verified list of candidates before polling.",
    example: "A candidate submits required papers during nomination.",
    related: ["Candidate", "Campaigning", "Election"]
  },
  {
    term: "Campaigning",
    explanation: "The period when candidates share messages with voters under election rules.",
    matters: "Voters should compare credible information and avoid misinformation.",
    example: "A voter checks multiple reliable sources instead of trusting every forwarded message.",
    related: ["Model Code of Conduct", "Candidate", "Misinformation"]
  },
  {
    term: "Counting",
    explanation: "The process of totaling votes after polling is complete.",
    matters: "Counting determines the result under official supervision.",
    example: "Counting happens after voting ends, not during campaign speeches.",
    related: ["Result Declaration", "EVM", "Election"]
  },
  {
    term: "Result Declaration",
    explanation: "The official announcement of the election outcome.",
    matters: "It completes the election cycle for that contest.",
    example: "Results are declared after counting is completed according to procedure.",
    related: ["Counting", "Election", "Candidate"]
  },
  {
    term: "First-time Voter",
    explanation: "A person preparing to vote for the first time.",
    matters: "First-time voters benefit from learning registration, roll checks, and polling day flow.",
    example: "A first-time voter practices with a fictional EVM/VVPAT simulator.",
    related: ["Voter", "Electoral Roll", "EVM"]
  },
  {
    term: "By-election",
    explanation: "An election held to fill a seat that becomes vacant between regular elections.",
    matters: "It keeps representation active when a vacancy occurs.",
    example: "A by-election may happen in one constituency rather than the whole country.",
    related: ["Constituency", "Election", "Candidate"]
  },
  {
    term: "General Election",
    explanation: "A regular election held for an entire legislative body.",
    matters: "It is a major election cycle involving many constituencies.",
    example: "A general election can involve voters across many regions.",
    related: ["Election", "Lok Sabha", "Constituency"]
  },
  {
    term: "Lok Sabha",
    explanation: "The House of the People in India's Parliament.",
    matters: "Lok Sabha elections are national-level representative elections.",
    example: "Voters in constituencies elect representatives to the Lok Sabha.",
    related: ["General Election", "Constituency", "Voter"]
  },
  {
    term: "Vidhan Sabha",
    explanation: "A State Legislative Assembly.",
    matters: "Vidhan Sabha elections choose representatives at the state level.",
    example: "A voter may participate in Vidhan Sabha elections for their state constituency.",
    related: ["Constituency", "Election", "Voter"]
  },
  {
    term: "Election Commission",
    explanation: "The constitutional body responsible for administering elections in India.",
    matters: "It manages election procedures and helps protect fairness and trust.",
    example: "VoteWise India is educational and is not an official Election Commission website.",
    related: ["Election", "Model Code of Conduct", "Counting"]
  },
  {
    term: "Booth Level Officer",
    explanation: "A local election official who helps with voter list and polling area work.",
    matters: "This role supports accurate voter information at the local level.",
    example: "A voter may receive local guidance related to roll details through official channels.",
    related: ["Electoral Roll", "Polling Station", "Voter"]
  }
];

export const faqItems = [
  {
    question: "What is VVPAT?",
    answer: "VVPAT stands for Voter Verifiable Paper Audit Trail. It briefly shows a paper slip with the selected option so the voter can visually verify the choice."
  },
  {
    question: "What is NOTA?",
    answer: "NOTA means None of the Above. It lets voters choose not to select any listed candidate. It does not automatically cancel an election."
  },
  {
    question: "What is the electoral roll?",
    answer: "The electoral roll is the official list of voters for a polling area. Voters should check that their name and details are listed correctly."
  },
  {
    question: "Can I vote if my name is not on the electoral roll?",
    answer: "Generally, a voter needs their name on the electoral roll for the assigned polling area. Use official election sources for exact eligibility and correction steps."
  },
  {
    question: "Can I vote anywhere?",
    answer: "Voters usually vote at their assigned polling station where their name appears in the electoral roll."
  },
  {
    question: "What happens after voting ends?",
    answer: "After polling is complete, votes are counted under official procedures and then results are declared."
  },
  {
    question: "What is the difference between EVM and VVPAT?",
    answer: "The EVM records the vote. VVPAT briefly displays a paper slip so the voter can visually verify the selected option."
  },
  {
    question: "Is VoteWise India an official election website?",
    answer: "No. VoteWise India is an educational, non-partisan simulation and is not an official Election Commission website."
  },
  {
    question: "Can the AI tell me who to vote for?",
    answer: "No. The AI guide can explain the election process, but it cannot recommend or oppose any party or candidate."
  },
  {
    question: "What should a first-time voter learn first?",
    answer: "Start with eligibility, voter registration, the electoral roll, polling day, EVM/VVPAT, and NOTA."
  }
];

export const scenarios = {
  turned18: {
    label: "I just turned 18",
    explanation: "Start with eligibility and registration basics so you know how a person becomes ready to vote.",
    path: ["Eligibility", "Voter Registration", "Electoral Roll", "FAQ"],
    next: ["#journey", "#glossary", "#quiz"]
  },
  firstTimeVoter: {
    label: "I am a first-time voter",
    explanation: "Focus on the voter journey from roll checking to polling day and EVM/VVPAT verification.",
    path: ["Electoral Roll", "Polling Station", "EVM", "VVPAT", "NOTA"],
    next: ["#timeline", "#simulator", "#quiz"]
  },
  movedCity: {
    label: "I moved to a new city",
    explanation: "Learn how constituency, electoral roll, and assigned polling station can affect where a person votes.",
    path: ["Constituency", "Electoral Roll", "Polling Station", "Booth Level Officer"],
    next: ["#glossary", "#faq", "#ai-guide"]
  },
  evmConfused: {
    label: "I am confused about EVM/VVPAT",
    explanation: "Use the simulator and glossary to understand how vote recording and visual verification differ.",
    path: ["EVM", "VVPAT", "Ballot", "Mock Voting Simulator"],
    next: ["#simulator", "#glossary", "#myths"]
  },
  classroom: {
    label: "I am teaching this in class",
    explanation: "Use the journey, scenarios, misinformation game, and quiz as a classroom activity sequence.",
    path: ["Timeline", "Scenario Cards", "Misinformation Check", "VoteReady Quiz"],
    next: ["#timeline", "#misinformation", "#quiz"]
  },
  misinformation: {
    label: "I want to avoid election misinformation",
    explanation: "Practice spotting false claims and learn process facts that reduce confusion.",
    path: ["Myth vs Fact", "Misinformation Check", "Model Code of Conduct", "AI Safety"],
    next: ["#misinformation", "#myths", "#ai-guide"]
  }
};

export const misinformationClaims = [
  {
    id: "poll-anywhere",
    claim: "You can vote from any polling booth.",
    answer: false,
    explanation: "Voters usually vote at their assigned polling station where their name appears in the electoral roll."
  },
  {
    id: "vvpat-receipt",
    claim: "VVPAT gives you a receipt to take home.",
    answer: false,
    explanation: "VVPAT lets voters visually verify their selection briefly; it is not a take-home receipt."
  },
  {
    id: "nota-cancel",
    claim: "NOTA automatically cancels the election.",
    answer: false,
    explanation: "NOTA means None of the Above. It does not automatically cancel an election."
  },
  {
    id: "more-than-polling",
    claim: "Elections include more than just polling day.",
    answer: true,
    explanation: "Elections include eligibility, registration, nomination, campaigning, polling, counting, and results."
  },
  {
    id: "ai-recommend",
    claim: "An AI tool should tell you which party to vote for.",
    answer: false,
    explanation: "A non-partisan election education tool should explain processes, not recommend or oppose parties or candidates."
  }
];

export const electionTimeline = [
  {
    phase: "Before election",
    summary: "People prepare, voter lists are checked, and candidates enter the contest.",
    steps: ["Eligibility", "Registration", "Electoral Roll", "Nomination", "Campaigning"]
  },
  {
    phase: "During election",
    summary: "Voters go to their assigned polling station and cast a vote using the official process.",
    steps: ["Polling Station", "EVM", "VVPAT", "NOTA"]
  },
  {
    phase: "After election",
    summary: "Votes are counted, results are declared, and representation continues through official procedures.",
    steps: ["Counting", "Result Declaration", "What Happens Next"]
  }
];
