/**
 * Corpus Loader
 * Loads and manages document corpora for search demos
 */

export class CorpusLoader {
    constructor() {
        this.corpora = {
            'research-papers': {
                name: 'AI/ML Research Papers',
                description: 'Abstracts from recent AI and machine learning papers',
                url: 'data/research-papers.json'
            },
            'news-articles': {
                name: 'News Articles',
                description: 'Technology news articles',
                url: 'data/news-articles.json'
            },
            'product-reviews': {
                name: 'Product Reviews',
                description: 'User reviews of various products',
                url: 'data/product-reviews.json'
            },
            'wikipedia': {
                name: 'Wikipedia Samples',
                description: 'Sample Wikipedia articles on various topics',
                url: 'data/wikipedia.json'
            },
            'medical': {
                name: 'Medical Articles',
                description: 'Medical and health-related articles',
                url: 'data/medical.json'
            }
        };

        this.currentCorpus = null;
        this.currentDocuments = [];
    }

    /**
     * Load a corpus by ID
     */
    async loadCorpus(corpusId) {
        if (!this.corpora[corpusId]) {
            throw new Error(`Unknown corpus: ${corpusId}`);
        }

        try {
            // Try to load from file
            const response = await fetch(this.corpora[corpusId].url);
            if (response.ok) {
                const data = await response.json();
                this.currentCorpus = corpusId;
                this.currentDocuments = data.documents || data;
                return this.currentDocuments;
            }
        } catch (error) {
            console.warn('Could not load corpus from file, using generated data:', error);
        }

        // Fallback to generated corpus
        this.currentDocuments = this.generateCorpus(corpusId);
        this.currentCorpus = corpusId;
        return this.currentDocuments;
    }

    /**
     * Generate a sample corpus (fallback when data files don't exist)
     */
    generateCorpus(corpusId) {
        const generators = {
            'research-papers': this.generateResearchPapers,
            'news-articles': this.generateNewsArticles,
            'product-reviews': this.generateProductReviews,
            'wikipedia': this.generateWikipedia,
            'medical': this.generateMedical
        };

        const generator = generators[corpusId] || generators['research-papers'];
        return generator.call(this);
    }

    generateResearchPapers() {
        return [
            "Deep learning models have revolutionized computer vision tasks, achieving human-level performance on image classification, object detection, and semantic segmentation through convolutional neural networks and attention mechanisms.",
            "Natural language processing has been transformed by transformer architectures, enabling models to understand context and generate coherent text through self-attention and massive pre-training on diverse corpora.",
            "Reinforcement learning algorithms enable agents to learn optimal policies through trial and error, with applications in robotics, game playing, and autonomous systems using deep Q-networks and policy gradient methods.",
            "Transfer learning allows models pre-trained on large datasets to be fine-tuned for specific tasks with limited data, significantly reducing training time and computational requirements while maintaining high performance.",
            "Generative adversarial networks consist of generator and discriminator networks that compete to create realistic synthetic data, with applications in image synthesis, data augmentation, and creative content generation.",
            "Attention mechanisms in neural networks allow models to focus on relevant parts of input sequences, improving performance on tasks like machine translation, text summarization, and question answering.",
            "Graph neural networks extend deep learning to graph-structured data, enabling applications in social network analysis, molecular property prediction, and recommendation systems.",
            "Few-shot learning aims to train models that can adapt to new tasks with minimal examples, using meta-learning and metric learning approaches to improve sample efficiency.",
            "Explainable AI techniques help interpret black-box machine learning models through attention visualization, feature importance, and counterfactual explanations, increasing trust and transparency.",
            "Self-supervised learning leverages unlabeled data by creating pretext tasks, allowing models to learn useful representations without expensive manual annotation.",
            "Multi-modal learning integrates information from different modalities like vision, language, and audio to create more comprehensive understanding and enable applications like image captioning and visual question answering.",
            "Neural architecture search automates the design of neural network architectures using evolutionary algorithms and reinforcement learning, discovering novel designs that outperform hand-crafted models.",
            "Continual learning addresses the challenge of catastrophic forgetting by enabling models to learn new tasks while retaining knowledge from previous tasks through regularization and memory mechanisms.",
            "Federated learning enables training machine learning models across distributed devices while preserving privacy, without centralizing sensitive data, using techniques like differential privacy and secure aggregation.",
            "Knowledge distillation transfers knowledge from large teacher models to smaller student models, creating compact models suitable for deployment on resource-constrained devices while maintaining accuracy.",
            "Active learning strategies select the most informative samples for labeling, reducing annotation costs by focusing human effort on examples that improve model performance the most.",
            "Meta-learning or learning to learn enables models to quickly adapt to new tasks by learning optimization strategies and prior knowledge from experience across multiple related tasks.",
            "Adversarial training improves model robustness by training on adversarial examples designed to fool the model, creating more reliable systems resistant to perturbations and attacks.",
            "Curriculum learning organizes training examples from simple to complex, mimicking human learning processes and often leading to faster convergence and better final performance.",
            "Zero-shot learning enables models to recognize classes never seen during training by leveraging semantic relationships and auxiliary information about class attributes.",
            "Neural machine translation uses encoder-decoder architectures with attention to translate between languages, achieving fluent and accurate translations by modeling complex linguistic patterns.",
            "Emotion recognition in text uses natural language processing to identify emotional states from written content, with applications in sentiment analysis, mental health monitoring, and customer service.",
            "Time series forecasting with deep learning uses recurrent networks and transformers to predict future values, with applications in finance, weather prediction, and demand forecasting.",
            "Object detection algorithms like YOLO and Faster R-CNN localize and classify multiple objects in images in real-time, enabling autonomous driving, surveillance, and industrial automation.",
            "Speech recognition systems convert spoken language to text using deep neural networks trained on large audio datasets, powering virtual assistants and transcription services.",
            "Recommender systems use collaborative filtering and deep learning to personalize content suggestions based on user preferences and behavior patterns.",
            "Anomaly detection identifies unusual patterns in data using autoencoders and one-class classification, with applications in fraud detection, network security, and predictive maintenance.",
            "Neural style transfer applies artistic styles to images by separating and recombining content and style representations learned by convolutional neural networks.",
            "Question answering systems extract or generate answers from text using reading comprehension models trained on large QA datasets like SQuAD.",
            "Named entity recognition identifies and classifies named entities in text into categories like person, organization, and location using sequence labeling models.",
            "Semantic segmentation assigns class labels to every pixel in an image, enabling precise understanding of visual scenes for applications like medical imaging and autonomous navigation.",
            "Text generation models create coherent and contextually relevant text using language models based on transformers, enabling applications like creative writing and dialogue systems.",
            "Pose estimation determines the position and orientation of objects or human body parts in images and videos using deep learning for applications in augmented reality and sports analysis.",
            "Domain adaptation techniques transfer knowledge from source domains with labeled data to target domains with different distributions, reducing the need for target domain labels.",
            "Variational autoencoders learn latent representations of data by encoding inputs to distributions and sampling for reconstruction, enabling generation and interpolation of data.",
            "Multi-task learning trains models to perform multiple related tasks simultaneously, sharing representations and improving generalization through transfer of knowledge between tasks.",
            "Imbalanced learning addresses datasets where some classes are underrepresented using techniques like oversampling, undersampling, and cost-sensitive learning.",
            "Privacy-preserving machine learning uses techniques like homomorphic encryption and secure multi-party computation to train models on sensitive data without exposing it.",
            "Uncertainty quantification in neural networks estimates prediction confidence using Bayesian approaches and ensemble methods, important for safety-critical applications.",
            "Cross-lingual transfer enables models trained on high-resource languages to work on low-resource languages using multilingual embeddings and translation-based approaches."
        ];
    }

    generateNewsArticles() {
        return [
            "Tech companies announce major advances in quantum computing, bringing us closer to solving previously intractable computational problems in chemistry and cryptography.",
            "New renewable energy projects break efficiency records, with solar panels achieving unprecedented conversion rates and wind turbines generating power at lower costs.",
            "Scientists discover potential treatment for neurodegenerative diseases using gene therapy and CRISPR technology to target underlying genetic causes.",
            "Autonomous vehicle fleets begin operating in major cities after successful safety trials and regulatory approvals demonstrate reliability and accident reduction.",
            "Climate change research reveals urgent need for carbon capture technology as atmospheric CO2 levels continue to rise despite renewable energy adoption.",
            "Breakthrough in battery technology promises electric vehicles with 1000-mile range and faster charging times using solid-state electrolytes.",
            "Artificial intelligence assists doctors in early cancer detection, analyzing medical images with accuracy exceeding human experts in controlled studies.",
            "Space exploration advances with successful Mars sample return mission bringing geological specimens for analysis and search for ancient life.",
            "Cybersecurity threats evolve as hackers use AI to create sophisticated attacks, prompting development of AI-powered defense systems.",
            "Global supply chain disruptions ease as companies invest in automation and diversification to improve resilience against future shocks.",
            "Education technology platforms show promise in personalized learning, adapting content to individual student needs and learning styles.",
            "Mental health apps gain popularity for stress management and therapy support, though experts emphasize they complement rather than replace professional care.",
            "5G network expansion continues worldwide, enabling new applications in telemedicine, remote work, and Internet of Things devices.",
            "Biotechnology firms develop synthetic proteins for sustainable food production, offering alternatives to traditional agriculture with lower environmental impact.",
            "Financial technology innovations democratize investing through fractional shares and algorithmic trading accessible to retail investors.",
            "Ocean cleanup initiatives deploy new technologies to remove plastic waste and prevent marine ecosystem damage from pollution.",
            "Virtual reality adoption grows in training and education, providing immersive experiences for skills development and remote collaboration.",
            "Agricultural drones and sensors enable precision farming, optimizing crop yields while reducing water and fertilizer use.",
            "Neurotechnology advances toward brain-computer interfaces that could help paralyzed patients communicate and control devices.",
            "Satellite internet constellations bring connectivity to remote areas, bridging the digital divide in underserved regions."
        ];
    }

    generateProductReviews() {
        return [
            "This laptop has excellent build quality and battery life, perfect for programming and video editing with its powerful processor and dedicated graphics card.",
            "The wireless headphones offer impressive noise cancellation and sound quality, though the battery could last longer during extended listening sessions.",
            "Great smartphone with amazing camera capabilities and smooth performance, but the price is quite high compared to competitors with similar features.",
            "The smart watch accurately tracks fitness metrics and integrates well with my phone, making it indispensable for health monitoring and notifications.",
            "This coffee maker brews excellent coffee with customizable strength settings, though it takes up significant counter space in smaller kitchens.",
            "The standing desk is sturdy and easy to adjust, greatly improving my posture and comfort during long work sessions at home.",
            "Excellent mechanical keyboard with satisfying tactile feedback and customizable RGB lighting, perfect for both gaming and typing.",
            "The robot vacuum does a thorough job on hardwood floors and carpets, though it occasionally gets stuck on cables and struggles with thick rugs.",
            "This monitor has vibrant colors and high refresh rate ideal for gaming, but the stand lacks height adjustment options.",
            "The smart thermostat helps reduce energy costs with learning algorithms and remote control, though initial setup was somewhat complicated."
        ];
    }

    generateWikipedia() {
        return [
            "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed, using algorithms that build models from sample data.",
            "The transformer architecture revolutionized natural language processing by introducing self-attention mechanisms that process sequences in parallel rather than sequentially.",
            "Python is a high-level programming language known for its clear syntax and readability, widely used in web development, data science, and machine learning applications.",
            "Neural networks are computing systems inspired by biological neural networks in animal brains, consisting of interconnected nodes that process information.",
            "Computer vision enables machines to derive meaningful information from digital images and videos, with applications in facial recognition, autonomous vehicles, and medical imaging.",
            "Data science combines statistics, mathematics, and computer science to extract insights and knowledge from structured and unstructured data.",
            "Cloud computing delivers computing services over the internet, including servers, storage, databases, networking, software, and analytics.",
            "Blockchain is a distributed ledger technology that maintains a secure and decentralized record of transactions across multiple computers.",
            "Quantum computing uses quantum-mechanical phenomena like superposition and entanglement to perform computations exponentially faster for certain problems.",
            "The Internet of Things refers to the network of physical devices embedded with sensors and software that connect and exchange data."
        ];
    }

    generateMedical() {
        return [
            "Cardiovascular disease remains the leading cause of death globally, with risk factors including hypertension, high cholesterol, smoking, and sedentary lifestyle.",
            "Type 2 diabetes management requires combination of medication, diet modification, regular exercise, and blood glucose monitoring to prevent complications.",
            "Immunotherapy treatments harness the body's immune system to fight cancer, showing promising results in melanoma, lung cancer, and other malignancies.",
            "Mental health disorders like depression and anxiety affect millions worldwide, requiring integrated treatment approaches including therapy and medication.",
            "Vaccine development has accelerated with new mRNA technology, demonstrating high efficacy and rapid deployment during public health emergencies.",
            "Alzheimer's disease research focuses on early detection biomarkers and treatments targeting amyloid plaques and tau proteins in the brain.",
            "Telemedicine adoption has expanded access to healthcare services, particularly in rural areas and during situations requiring social distancing.",
            "Antibiotic resistance poses growing threat to public health, necessitating development of new antimicrobial agents and stewardship programs.",
            "Gene therapy shows potential for treating genetic disorders by correcting defective genes responsible for disease development.",
            "Precision medicine tailors treatment to individual patient characteristics using genetic information and biomarkers for more effective care."
        ];
    }

    /**
     * Get corpus metadata
     */
    getCorpusInfo(corpusId) {
        return this.corpora[corpusId] || null;
    }

    /**
     * Get statistics about current corpus
     */
    getStatistics() {
        if (this.currentDocuments.length === 0) {
            return null;
        }

        const lengths = this.currentDocuments.map(doc => doc.split(/\s+/).length);
        const totalWords = lengths.reduce((a, b) => a + b, 0);
        const avgLength = Math.round(totalWords / this.currentDocuments.length);

        const allWords = this.currentDocuments
            .join(' ')
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);

        const vocabulary = new Set(allWords);

        return {
            numDocuments: this.currentDocuments.length,
            avgLength,
            minLength: Math.min(...lengths),
            maxLength: Math.max(...lengths),
            vocabularySize: vocabulary.size,
            totalWords
        };
    }

    /**
     * Get list of available corpora
     */
    getAvailableCorpora() {
        return Object.entries(this.corpora).map(([id, info]) => ({
            id,
            ...info
        }));
    }
}
