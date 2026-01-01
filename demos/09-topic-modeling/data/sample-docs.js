/**
 * Sample datasets for topic modeling
 * Now includes real Wikipedia corpus with 3000 articles
 */

// Wikipedia dataset - loaded dynamically from JSON file
let wikipediaDataset = null;
let isLoadingWikipedia = false;

/**
 * Load Wikipedia corpus from JSON file
 */
async function loadWikipediaCorpus() {
    if (wikipediaDataset) {
        return wikipediaDataset;
    }

    if (isLoadingWikipedia) {
        // Wait for existing load to complete
        while (isLoadingWikipedia) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return wikipediaDataset;
    }

    isLoadingWikipedia = true;

    try {
        const response = await fetch('./data/wikipedia-corpus.json');
        if (!response.ok) {
            throw new Error(`Failed to load Wikipedia corpus: ${response.status}`);
        }

        const articles = await response.json();

        // Transform to the format expected by the LDA model
        wikipediaDataset = {
            name: 'Wikipedia Articles (3000 real articles)',
            description: 'Real Wikipedia articles covering diverse topics from history, science, sports, entertainment, and more',
            documents: articles.map(article => article.text),
            titles: articles.map(article => article.title),
            ids: articles.map(article => article.id)
        };

        console.log(`Loaded ${wikipediaDataset.documents.length} Wikipedia articles`);
        return wikipediaDataset;
    } catch (error) {
        console.error('Error loading Wikipedia corpus:', error);
        throw error;
    } finally {
        isLoadingWikipedia = false;
    }
}

export const DATASETS = {
    wikipedia: {
        name: 'Wikipedia Articles',
        description: '3000 real Wikipedia articles',
        async load() {
            return await loadWikipediaCorpus();
        },
        // Placeholder until loaded
        documents: []
    },

    news: {
        name: 'News Articles',
        description: '100 sample news articles across 10 topics',
        async load() {
            return this;
        },
        documents: [
            // Technology (Topic 1)
            "Apple released its latest iPhone model with advanced artificial intelligence features and improved camera technology. The new device includes machine learning capabilities.",
            "Google announced a major update to its cloud computing platform, focusing on artificial intelligence and machine learning tools for developers.",
            "Microsoft's quantum computing research team made a breakthrough in error correction, bringing practical quantum computers closer to reality.",
            "The tech industry is racing to develop better batteries for electric vehicles and smartphones using new lithium-ion technology.",
            "Software engineers are increasingly using artificial intelligence to automate code reviews and detect bugs in large applications.",
            "Cybersecurity experts warn of new ransomware attacks targeting cloud infrastructure and recommend enhanced encryption methods.",
            "Virtual reality headsets are becoming more affordable as companies compete to dominate the metaverse market with new technology.",
            "Semiconductor manufacturers struggle with chip shortages affecting everything from gaming consoles to automotive production.",
            "Open source developers collaborate on new frameworks for building scalable web applications with improved performance.",
            "Data scientists leverage neural networks and deep learning to improve natural language processing capabilities.",

            // Sports (Topic 2)
            "The championship basketball game went into overtime as both teams fought for the title. The final score was extremely close.",
            "Olympic athletes prepare for the upcoming winter games with intense training regimens focused on strength and endurance.",
            "The soccer team secured its position in the playoffs after a stunning victory against their rivals in the final match.",
            "Tennis star wins grand slam tournament after defeating top-ranked opponent in an intense five-set match.",
            "Football coach announces retirement after leading the team to three consecutive championship victories over the years.",
            "Marathon runners from around the world compete in the annual city race with record-breaking times and performances.",
            "Baseball team celebrates world series victory with parade through downtown as thousands of fans cheer and celebrate.",
            "Hockey players face tough competition in the playoffs as teams battle for spots in the championship finals.",
            "Golf tournament sees unexpected winner as young player defeats veterans with impressive performance on the course.",
            "Swimming records fall at national championships as athletes push the boundaries of human performance in the pool.",

            // Health & Medicine (Topic 3)
            "Medical researchers discover new treatment for autoimmune diseases using targeted immunotherapy and precision medicine approaches.",
            "Studies show that regular exercise and healthy diet can significantly reduce the risk of cardiovascular disease and diabetes.",
            "Hospitals implement new telemedicine programs to provide remote healthcare services to patients in rural areas.",
            "Breakthrough in cancer research as scientists develop innovative therapy that targets specific tumor cells without harming healthy tissue.",
            "Mental health awareness campaigns encourage people to seek professional help for depression and anxiety disorders.",
            "Vaccination rates increase as public health officials work to combat misinformation and educate communities about vaccine safety.",
            "New surgical techniques using robotic assistance improve outcomes for patients undergoing complex procedures.",
            "Pharmaceutical companies invest billions in developing medications for rare diseases affecting small patient populations.",
            "Nutritionists recommend Mediterranean diet for its proven benefits in reducing inflammation and improving overall health.",
            "Sleep research reveals importance of consistent sleep schedule for cognitive function and emotional wellbeing.",

            // Business & Finance (Topic 4)
            "Stock market reaches new highs as investors show confidence in economic recovery and corporate earnings growth.",
            "Cryptocurrency market experiences volatility as regulations and adoption rates fluctuate across different countries.",
            "Central bank announces interest rate changes to combat inflation and stabilize the economy amid global uncertainty.",
            "Startup companies secure venture capital funding for innovative products in the technology and healthcare sectors.",
            "Corporate mergers reshape industry landscape as companies consolidate to compete in global markets.",
            "Real estate prices continue to rise in major cities driven by low inventory and high demand from buyers.",
            "Economists predict moderate growth for the year ahead based on employment data and consumer spending patterns.",
            "Small businesses struggle with supply chain disruptions and labor shortages affecting production and services.",
            "Financial advisors recommend diversified investment portfolios to minimize risk and maximize long-term returns.",
            "E-commerce sales surge as more consumers prefer online shopping convenience over traditional retail experiences.",

            // Environment & Climate (Topic 5)
            "Climate scientists warn that global temperatures continue to rise, leading to more frequent extreme weather events worldwide.",
            "Renewable energy sources like solar and wind power are becoming more cost-effective alternatives to fossil fuels.",
            "Deforestation in tropical rainforests threatens biodiversity and accelerates climate change by reducing carbon absorption.",
            "Ocean pollution from plastic waste endangers marine life and ecosystems across the world's seas and oceans.",
            "Environmental activists push for stricter regulations on industrial emissions to reduce air pollution in urban areas.",
            "Conservation efforts help endangered species populations recover through habitat protection and breeding programs.",
            "Electric vehicles gain popularity as consumers and governments prioritize reducing carbon emissions from transportation.",
            "Scientists study coral reef bleaching caused by rising ocean temperatures and develop restoration techniques.",
            "Sustainable agriculture practices help farmers reduce water usage and chemical fertilizers while maintaining crop yields.",
            "Wildlife photography raises awareness about endangered animals and the importance of preserving natural habitats.",

            // Politics & Government (Topic 6)
            "Congressional leaders debate new legislation on healthcare reform and infrastructure spending in heated sessions.",
            "Diplomatic negotiations continue between nations to address trade disputes and strengthen international cooperation.",
            "Election results show shifting political landscape as voters express concerns about economy and social issues.",
            "Supreme court ruling sets precedent on constitutional rights and has far-reaching implications for future cases.",
            "Local government officials announce plans for urban development projects aimed at improving transportation and housing.",
            "International summit brings world leaders together to discuss climate policy and economic recovery strategies.",
            "Voter turnout reaches record levels in midterm elections as citizens engage in democratic process.",
            "Political campaigns utilize social media platforms to reach younger voters and mobilize grassroots support.",
            "Immigration policy reform remains contentious issue as lawmakers struggle to find bipartisan solutions.",
            "Foreign policy experts analyze implications of recent diplomatic tensions between major world powers.",

            // Education & Science (Topic 7)
            "Universities develop new online learning platforms to provide accessible education to students worldwide.",
            "Scientific breakthrough in physics challenges existing theories about the nature of dark matter and energy.",
            "Education reform initiatives focus on improving teacher training and updating curriculum for modern workforce needs.",
            "Astronomers discover potentially habitable exoplanets orbiting distant stars in our galaxy using advanced telescopes.",
            "STEM education programs aim to inspire young students to pursue careers in science and technology fields.",
            "Research funding increases for projects studying climate change, renewable energy, and sustainable development.",
            "Academic institutions collaborate on interdisciplinary studies combining biology, computer science, and engineering.",
            "Archaeologists uncover ancient civilization artifacts that provide new insights into human history and culture.",
            "Mathematics competition attracts talented students from around the world to solve complex problems.",
            "Laboratory experiments reveal new properties of materials that could revolutionize electronics and manufacturing.",

            // Arts & Culture (Topic 8)
            "Art museum opens new exhibition featuring contemporary paintings and sculptures from emerging artists.",
            "Music festival brings together diverse performers for weekend celebration of different genres and styles.",
            "Film director's latest movie receives critical acclaim and multiple awards at international cinema festival.",
            "Theater production of classic play draws audiences with innovative staging and powerful performances.",
            "Literary prize winner's novel explores themes of identity and belonging in changing society.",
            "Dance company premieres original choreography blending traditional and modern movement techniques.",
            "Photography exhibition showcases stunning images capturing everyday life in cities around the world.",
            "Opera performance sells out as audiences embrace classical music and dramatic storytelling.",
            "Street art transforms urban neighborhoods into outdoor galleries featuring colorful murals and graffiti.",
            "Cultural festival celebrates heritage with traditional food, music, and customs from different communities.",

            // Food & Lifestyle (Topic 9)
            "Celebrity chef opens new restaurant featuring farm-to-table cuisine and locally sourced ingredients.",
            "Food trends emphasize plant-based diets and sustainable eating habits for health and environmental benefits.",
            "Home cooking becomes popular hobby as people experiment with international recipes and new ingredients.",
            "Wine experts rate recent vintage as exceptional year for production in major grape-growing regions.",
            "Farmers markets connect consumers directly with local producers selling fresh fruits and vegetables.",
            "Culinary school graduates bring innovative techniques to restaurant industry and food service sector.",
            "Coffee culture continues to grow with specialty roasters and artisanal brewing methods gaining popularity.",
            "Nutrition labels help consumers make informed choices about processed foods and dietary supplements.",
            "Food delivery services expand offerings to include meal kits and prepared dishes from local restaurants.",
            "Baking shows inspire home cooks to try new recipes and improve their skills with pastries and breads.",

            // Travel & Tourism (Topic 10)
            "Tourism industry slowly recovers as travel restrictions ease and people plan vacations to exotic destinations.",
            "Historical landmarks attract visitors interested in learning about ancient civilizations and cultural heritage.",
            "Adventure travel packages offer thrilling experiences like mountain climbing and scuba diving in remote locations.",
            "Cruise lines introduce new ships with modern amenities and itineraries exploring tropical islands.",
            "Eco-tourism promotes sustainable travel practices that minimize environmental impact and support local communities.",
            "Travel bloggers share tips and recommendations for budget-friendly trips to popular tourist destinations.",
            "National parks see increased visitors as families seek outdoor recreation and natural beauty.",
            "Hotel industry adapts to changing preferences with boutique accommodations and unique local experiences.",
            "Flight prices fluctuate based on seasonal demand and fuel costs affecting travel planning decisions.",
            "Cultural exchanges allow students to study abroad and immerse themselves in different languages and customs."
        ]
    },

    scientific: {
        name: 'Scientific Papers',
        description: '50 sample scientific abstracts',
        async load() {
            return this;
        },
        documents: [
            // Neuroscience
            "Recent studies in neuroscience reveal how synaptic plasticity underlies learning and memory formation in the hippocampus through long-term potentiation mechanisms.",
            "Functional magnetic resonance imaging shows activation patterns in the prefrontal cortex during decision-making tasks and cognitive control processes.",
            "Neurotransmitter systems including dopamine and serotonin play crucial roles in regulating mood, motivation, and reward processing in the brain.",
            "Neural networks in the visual cortex process information hierarchically from simple edges to complex object recognition and scene understanding.",
            "Neuroplasticity allows the brain to reorganize and adapt following injury through formation of new synaptic connections and neural pathways.",

            // Genetics & Molecular Biology
            "CRISPR gene editing technology enables precise modifications to DNA sequences with applications in treating genetic disorders and diseases.",
            "Genome sequencing projects reveal genetic variations across populations and identify risk factors for hereditary conditions and complex traits.",
            "Protein folding mechanisms determine molecular structure and function with implications for understanding neurodegenerative diseases like Alzheimer's.",
            "Epigenetic modifications including DNA methylation regulate gene expression without changing the underlying genetic sequence.",
            "RNA interference pathways control gene expression post-transcriptionally through small RNA molecules and complementary binding mechanisms.",

            // Physics & Cosmology
            "Gravitational wave detections from merging black holes provide evidence supporting Einstein's general theory of relativity predictions.",
            "Quantum entanglement demonstrates non-local correlations between particles that challenge classical physics understanding of causality and information.",
            "Dark matter comprises most of the universe's mass but remains undetected directly, inferred only through gravitational effects on visible matter.",
            "Particle accelerators probe fundamental forces and discover new subatomic particles expanding the standard model of particle physics.",
            "String theory proposes extra spatial dimensions and unification of quantum mechanics with general relativity at Planck scale energies.",

            // Climate Science
            "Global climate models simulate atmospheric dynamics and predict temperature changes under different greenhouse gas emission scenarios.",
            "Ice core samples from Antarctica provide historical climate data spanning hundreds of thousands of years of Earth's climate history.",
            "Ocean circulation patterns transport heat globally and influence regional climate through currents like the Gulf Stream and El Niño.",
            "Carbon cycle dynamics involve exchanges between atmosphere, oceans, and biosphere affecting atmospheric CO2 concentrations over time.",
            "Climate feedback mechanisms can amplify or dampen warming trends through processes like ice-albedo effect and water vapor feedback.",

            // Chemistry
            "Catalytic reactions accelerate chemical transformations by lowering activation energy barriers through stabilization of transition states.",
            "Molecular spectroscopy techniques identify chemical compounds and study molecular structure through interaction with electromagnetic radiation.",
            "Organic synthesis methods enable construction of complex molecules for pharmaceutical development and materials science applications.",
            "Electrochemistry investigates electron transfer reactions at interfaces with applications in batteries and fuel cell technologies.",
            "Computational chemistry uses quantum mechanical calculations to predict molecular properties and reaction mechanisms accurately.",

            // Ecology & Evolution
            "Natural selection drives evolutionary change through differential reproduction of individuals with advantageous genetic traits.",
            "Ecosystem dynamics involve energy flow and nutrient cycling through trophic levels from producers to consumers and decomposers.",
            "Population ecology models predict species abundance and distribution patterns based on birth rates, death rates, and migration.",
            "Symbiotic relationships between organisms including mutualism and parasitism shape community structure and coevolution.",
            "Biodiversity hotspots contain high concentrations of endemic species facing threats from habitat loss and climate change.",

            // Medicine & Immunology
            "Immune system cells including T lymphocytes and B lymphocytes recognize and eliminate pathogens through adaptive immune responses.",
            "Vaccine development stimulates protective immunity against infectious diseases through presentation of antigens to immune cells.",
            "Autoimmune disorders occur when immune system mistakenly attacks self-tissues leading to chronic inflammatory conditions.",
            "Antibody therapies target specific disease molecules with applications in cancer treatment and infectious disease management.",
            "Innate immunity provides immediate defense against pathogens through barriers, phagocytes, and inflammatory responses.",

            // Computer Science & AI
            "Machine learning algorithms learn patterns from data without explicit programming through statistical optimization techniques.",
            "Deep neural networks with multiple layers extract hierarchical features for tasks like image recognition and natural language processing.",
            "Reinforcement learning agents learn optimal behaviors through trial and error interactions with environments and reward signals.",
            "Natural language models like transformers process sequential data using attention mechanisms for language understanding and generation.",
            "Computer vision systems analyze visual information for applications including autonomous vehicles and medical image diagnosis.",

            // Materials Science
            "Nanomaterials exhibit unique properties at molecular scale with applications in electronics, medicine, and energy storage.",
            "Crystalline structures determine material properties through atomic arrangements and bonding configurations in solid state.",
            "Polymers consist of long chain molecules with tunable properties for applications ranging from plastics to biomedical devices.",
            "Semiconductor materials enable electronic devices through control of electrical conductivity via doping and band gap engineering.",
            "Biomaterials interface with biological systems for medical implants and tissue engineering applications requiring biocompatibility.",

            // Astronomy
            "Exoplanet detection methods including transit photometry and radial velocity reveal thousands of planets orbiting distant stars.",
            "Stellar evolution follows predictable pathways from stellar nurseries through main sequence to eventual supernova or white dwarf.",
            "Galaxy formation simulations model how dark matter halos and gas dynamics lead to structure we observe in the universe.",
            "Cosmic microwave background radiation provides snapshot of early universe shortly after Big Bang and tests cosmological theories.",
            "Black hole physics explores extreme gravitational environments where spacetime curvature becomes significant and information paradoxes arise."
        ]
    },

    reviews: {
        name: 'Product Reviews',
        description: '75 sample product reviews',
        async load() {
            return this;
        },
        documents: [
            // Positive Electronics Reviews
            "This smartphone exceeded my expectations with its amazing camera quality and long battery life. Highly recommend for photography enthusiasts.",
            "The laptop is incredibly fast and handles all my work applications smoothly. Build quality is excellent and keyboard is comfortable.",
            "Best wireless headphones I've ever owned. Sound quality is superb and noise cancellation works perfectly even in busy environments.",
            "Smart watch features are fantastic for fitness tracking. Battery lasts for days and the interface is intuitive and easy to use.",
            "This tablet is perfect for reading and watching movies. Screen is bright and sharp, performance is smooth for all apps.",

            // Negative Electronics Reviews
            "Disappointed with this phone. Battery drains quickly and camera quality is poor in low light conditions. Not worth the price.",
            "Laptop overheats constantly and fan noise is extremely loud. Customer service was unhelpful with resolving the issues.",
            "Headphones broke after just two months of normal use. Sound quality was mediocre at best, very uncomfortable to wear.",
            "Smartwatch constantly disconnects from phone and fitness tracking is inaccurate. Software has many bugs and crashes frequently.",
            "Tablet is sluggish and freezes often. Screen has dead pixels and battery life is terrible compared to other models.",

            // Positive Appliance Reviews
            "This coffee maker brews perfect coffee every morning. Easy to clean and programmable timer is very convenient feature.",
            "Vacuum cleaner has amazing suction power and works great on both carpets and hardwood floors. Highly recommended purchase.",
            "Air purifier made noticeable difference in air quality. Quiet operation and filters are easy to replace when needed.",
            "Blender is powerful enough to crush ice and frozen fruits smoothly. Very durable construction and easy to clean.",
            "Microwave heats food evenly and has useful preset functions. Compact size fits perfectly in my small kitchen space.",

            // Negative Appliance Reviews
            "Coffee maker stopped working after three weeks. Leaked water everywhere and customer support was very unhelpful.",
            "Vacuum loses suction quickly and is difficult to maneuver. Cheap plastic construction feels like it will break soon.",
            "Air purifier is extremely loud even on lowest setting. Filters are expensive and need replacing too frequently.",
            "Blender motor burned out after minimal use. Blades are dull and could not handle basic tasks like crushing ice.",
            "Microwave door doesn't close properly and makes loud buzzing noises. Control panel is confusing and unintuitive.",

            // Positive Clothing Reviews
            "These jeans fit perfectly and are very comfortable. Quality denim and stitching looks like they will last for years.",
            "Jacket is stylish and keeps me warm in cold weather. Water resistant material and pockets are perfectly sized.",
            "Shoes are incredibly comfortable for all day wear. Great arch support and breathable material prevents foot odor.",
            "Dress fits beautifully and fabric quality is excellent. Color is vibrant and matches product photos accurately.",
            "Running shorts are lightweight and moisture wicking. Perfect length and waistband stays in place during exercise.",

            // Negative Clothing Reviews
            "Jeans shrank significantly after first wash despite following care instructions. Uncomfortable and poor quality material.",
            "Jacket zipper broke immediately and seams are coming apart. Sizing is completely off from what was advertised.",
            "Shoes are extremely uncomfortable and caused blisters. Cheap materials and poor construction, returned immediately.",
            "Dress fabric is very thin and see-through. Color is completely different from pictures and fits terribly.",
            "Running shorts chafe badly and waistband is too tight. Material is not breathable and retains odors.",

            // Positive Food Reviews
            "This organic coffee has rich flavor and smooth taste. Fair trade certified and packaging keeps beans fresh.",
            "Protein powder mixes easily and tastes great. Good ingredients and helps with post workout recovery.",
            "Olive oil has excellent flavor perfect for salads and cooking. High quality extra virgin cold pressed product.",
            "Dark chocolate is delicious with perfect balance of sweetness and cocoa intensity. Ethically sourced ingredients.",
            "Granola bars are healthy and satisfying snack. Natural ingredients and good variety of flavors in pack.",

            // Negative Food Reviews
            "Coffee beans were stale and tasted bitter. Packaging was damaged and arrived well past expiration date.",
            "Protein powder has chalky texture and artificial taste. Difficult to mix and causes stomach discomfort.",
            "Olive oil tastes rancid and smells off. Bottle was leaking when delivered and quality is very poor.",
            "Chocolate has waxy texture and strange aftertaste. Contains many artificial ingredients despite premium price.",
            "Granola bars are too sweet and have no nutritional value. Ingredients list is full of preservatives.",

            // Positive Book Reviews
            "Captivating story with well developed characters and unexpected plot twists. Could not put this book down.",
            "Informative and well researched. Author presents complex topics in accessible way that is easy to understand.",
            "Beautiful writing style and thought provoking themes. This book stayed with me long after finishing it.",
            "Page turner from start to finish. Perfect pacing and satisfying conclusion to the series.",
            "Excellent character development and world building. Highly recommend for fans of the fantasy genre.",

            // Negative Book Reviews
            "Plot was predictable and characters were one dimensional. Writing style was boring and repetitive throughout.",
            "Book contains many factual errors and poor research. Author's bias is obvious and arguments are weak.",
            "Confusing narrative structure and pretentious writing. Struggled to finish and felt like waste of time.",
            "Ending was rushed and disappointing after slow beginning. Too many loose ends left unresolved.",
            "Poor world building and inconsistent magic system. Characters make illogical decisions constantly.",

            // Positive Home Reviews
            "Bed frame is sturdy and looks elegant in bedroom. Easy to assemble and excellent value for the price.",
            "Curtains are high quality fabric and block light perfectly. Beautiful color and easy to install on rods.",
            "Kitchen knives are incredibly sharp and well balanced. Comfortable handles and come in useful gift set.",
            "Rug adds perfect touch to living room decor. Soft material and colors are exactly as shown in pictures.",
            "Lamp provides nice ambient lighting and modern design fits any room. Bulb is included and easy to replace.",

            // Negative Home Reviews
            "Bed frame was damaged during shipping and difficult to assemble. Screws don't fit properly in holes.",
            "Curtains are thin material that doesn't block any light. Color faded after one wash, very disappointing.",
            "Kitchen knives are dull out of box and handles feel cheap. Set is missing pieces that were advertised.",
            "Rug sheds constantly and colors are much darker than pictures. Material feels rough and synthetic.",
            "Lamp arrived broken and replacement took weeks. Wiring seems unsafe and switch doesn't work properly.",

            // Positive Service Reviews
            "Excellent customer service experience. Representative was helpful and resolved my issue quickly.",
            "Delivery was fast and package arrived in perfect condition. Tracking information was accurate throughout.",
            "Installation team was professional and efficient. They cleaned up afterward and explained everything clearly.",
            "Great value for money subscription service. Content is high quality and cancellation process is simple.",
            "Technical support was knowledgeable and patient. Problem was fixed remotely in less than ten minutes.",

            // Negative Service Reviews
            "Terrible customer service. Waited on hold for hours and representative was rude and unhelpful.",
            "Delivery was weeks late and package was damaged. No communication about delays or compensation offered.",
            "Installation was sloppy and crew left mess everywhere. Had to hire someone else to fix mistakes.",
            "Subscription is impossible to cancel and charges keep appearing. Content quality is poor and outdated.",
            "Technical support could not solve simple problem. Multiple calls required and still not resolved properly."
        ]
    }
};

// Export the load function for easy access
export { loadWikipediaCorpus };
