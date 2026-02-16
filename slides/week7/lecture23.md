---
marp: true
theme: cdl-theme
math: katex
transition: fade 0.25s
author: Contextual Dynamics Lab
---

# Lecture 23: Diffusion applications and ethics
### PSYC 51.17: Models of language and communication

Jeremy R. Manning
Dartmouth College
Winter 2026

---

# Learning objectives

<div class="note-box" data-title="By the end of this lecture, you will be able to...">

1. Compare text-to-image architectures: **DALL-E 2**, **Stable Diffusion**, and **Imagen**
2. Explain how **Sora** extends diffusion to video via spacetime patches
3. Describe **discrete diffusion** for text generation and its connection to BERT
4. Evaluate ethical implications: **deepfakes**, consent, bias, and regulation
5. Connect diffusion models back to the course themes of language and communication

</div>

---

# Roadmap and companion notebook

<div class="warning-box" data-title="Week 8: no classes">

There are **no classes February 23–27** (instructor away). Use this time to work on your **final project** and the optional Assignment 5 (Build GPT).

</div>

<div class="tip-box" data-title="Companion notebook">

📓 [Companion Notebook](https://colab.research.google.com/github/ContextLab/llm-course/blob/main/slides/week7/diffusion_demo.ipynb) — generate images with Stable Diffusion, experiment with guidance scales, and explore discrete diffusion for text.

</div>

---

# Text-to-image: the big picture

<div class="definition-box" data-title="Three architectures, one goal">

Text-to-image systems combine a **language model** (to understand the prompt) with a **diffusion model** (to generate the image). The three landmark systems each took a different approach:

| System | Text encoder | Image generation | Organization |
|--------|-------------|-----------------|-------------|
| [DALL-E 2](https://arxiv.org/abs/2204.06125) | CLIP | Prior + diffusion decoder | OpenAI (Apr 2022) |
| [Imagen](https://arxiv.org/abs/2205.11487) | T5-XXL | Cascaded pixel diffusion | Google (May 2022) |
| Stable Diffusion | CLIP | Latent diffusion | Stability AI (Aug 2022) |

</div>

<div class="definition-box" data-title="Remember...">

- **[CLIP](https://arxiv.org/abs/2103.00020)**: Contrastive Language-Image Pre-training ([Radford et al., 2021](https://arxiv.org/abs/2103.00020)) — learns a shared embedding space for images and text, used as the text encoder in DALL-E 2 and Stable Diffusion (see Lecture 22)
- **[T5](https://arxiv.org/abs/1910.10683)**: A text-to-text transformer (Google, 2020) — Imagen uses the largest variant (T5-XXL, 4.6B parameters) as its text encoder

</div>

<div class="important-box" data-title="The key question">

Which component matters more — the language understanding (text encoder) or the image generation (diffusion model)? Imagen's surprising finding: **scaling the text encoder helps more than scaling the diffusion model**.

</div>

---

# DALL-E 2

<div class="definition-box" data-title="Ramesh et al. (2022): CLIP + Prior + Decoder">

[DALL-E 2](https://arxiv.org/abs/2204.06125) uses a three-stage pipeline:

1. **CLIP text encoder**: Converts the text prompt to a CLIP text embedding
2. **Prior**: A diffusion model that maps the CLIP *text* embedding to a CLIP *image* embedding
3. **Decoder**: A diffusion model that generates a 1024×1024 image conditioned on the CLIP image embedding

</div>

```flow
[Text prompt] --> [CLIP Text Encoder] --> [Text Embedding] --> [Prior (Diffusion)] --> [Image Embedding] --> [Decoder (Diffusion)] --> [1024×1024 Image]
```

<div class="note-box" data-title="Why the prior?">

CLIP's text and image embeddings live in a shared space but aren't identical. The prior bridges this gap — it translates "what the text means" into "what the image should look like" in CLIP's visual space. This two-step approach allows DALL-E 2 to produce diverse images from the same prompt.

</div>

---

# Imagen

<div class="definition-box" data-title="Saharia et al. (2022): language model + cascaded diffusion">

[Imagen](https://arxiv.org/abs/2205.11487) takes a simpler approach:

1. **T5-XXL text encoder** (4.6B parameters): Encodes the prompt into rich text embeddings
2. **Base diffusion model**: Generates a 64×64 image conditioned on text embeddings
3. **Super-resolution models**: Two cascaded diffusion models upscale 64→256→1024

</div>

<div class="important-box" data-title="Imagen's key finding">

Scaling the text encoder from T5-Small (60M) to T5-XXL (4.6B) improved image quality **more** than scaling the diffusion model. This suggests that the bottleneck in text-to-image generation is *understanding the prompt*, not *generating pixels*. Language models matter even in vision!

</div>

---

# Stable Diffusion

<div class="note-box" data-title="Open-source democratization">

[Stable Diffusion](https://arxiv.org/abs/2112.10752) ([Rombach et al., 2022](https://arxiv.org/abs/2112.10752)) is the open-source implementation of latent diffusion (Lecture 22):

| Property | Value |
|----------|-------|
| Text encoder | CLIP ViT-L/14 |
| Diffusion backbone | U-Net in 64×64×4 latent space |
| Training data | [LAION-5B](https://laion.ai/blog/laion-5b/) (5 billion image-text pairs) |
| Parameters | ~890M (U-Net) + 123M (text encoder) |
| Generation time | ~5 seconds on consumer GPU |
| License | Open-source (CreativeML Open RAIL-M) |

</div>

<div class="tip-box" data-title="Why open matters">

Stable Diffusion's open release in August 2022 transformed the field. Within months, the community created ControlNet (pose-guided generation), LoRA fine-tuning (custom styles in minutes), and inpainting tools. Open weights enabled innovation at a pace no closed model could match.

</div>

---
<!-- _class: scale-90 -->

# Text-to-video: Sora

<div class="definition-box" data-title="OpenAI (2024): video generation as world simulation">

[Sora](https://openai.com/research/video-generation-models-as-world-simulators) extends diffusion to video by treating videos as sequences of **spacetime patches**:

1. **Compress**: Encode video frames into a latent space using a video VAE
2. **Patchify**: Divide the 3D latent (height × width × time) into spacetime patches
3. **Generate**: Apply a DiT-like transformer to denoise the entire spacetime volume
4. **Decode**: VAE decoder reconstructs the video frames

</div>

<div class="note-box" data-title="Emergent capabilities">

Sora exhibits surprising behaviors not explicitly trained:
- **3D consistency**: Objects maintain shape when the camera moves
- **Long-range coherence**: Characters persist across scene changes
- **Physics simulation**: Water flows, reflections update, objects interact plausibly

OpenAI describes Sora as a "world simulator" — raising questions about whether diffusion models are learning something deeper than pixel patterns.

</div>

---

# Text-to-audio

<div class="definition-box" data-title="Diffusion in the spectral domain">

Audio generation applies diffusion to **spectrograms** (time-frequency representations of sound):

1. Convert audio to a [mel-spectrogram](https://en.wikipedia.org/wiki/Mel-frequency_cepstrum) (a visual representation of sound frequencies over time, weighted to match human hearing)
2. Run diffusion in spectrogram space (or a latent compression of it)
3. Convert the generated spectrogram back to audio using a **vocoder** (a neural network that reconstructs audio waveforms from spectrograms)

</div>

<div class="note-box" data-title="Notable systems">

| System | Modality | Approach |
|--------|----------|----------|
| AudioLDM 2 | Music + speech + effects | Latent diffusion on audio |
| MusicGen (Meta) | Music | Autoregressive (not diffusion) |
| Stable Audio (Stability AI) | Music + effects | Latent diffusion with timing control |
| Bark (Suno) | Speech | Autoregressive + diffusion |

Diffusion and autoregressive approaches are **converging** in audio — many systems use hybrid architectures.

</div>

---

# Discrete diffusion for text

<div class="definition-box" data-title="Sahoo et al. (2024, NeurIPS): Masked Diffusion Language Models (MDLM)">

Standard diffusion adds Gaussian noise to continuous data. For discrete data like text, [MDLM](https://arxiv.org/abs/2406.07524) replaces "adding noise" with **masking tokens**:

- **Forward process**: Randomly replace tokens with [MASK], increasing the masking rate over time
- **Reverse process**: A transformer predicts the masked tokens, gradually unmasking the sequence
- At $t = T$: all tokens are masked. At $t = 0$: the full text is revealed.

</div>

<div class="important-box" data-title="Connection to BERT">

This should sound familiar! BERT (Lecture 18) also predicts masked tokens. The key difference: BERT masks a fixed 15% of tokens and predicts them in one shot. MDLM uses a **continuous masking schedule** and iteratively unmasks over multiple steps — bridging masked language modeling and diffusion.

</div>

---

# Why discrete diffusion matters for NLP

<div class="note-box" data-title="Advantages over autoregressive generation">

| Property | Autoregressive (GPT) | Discrete diffusion (MDLM) |
|----------|---------------------|--------------------------|
| Generation order | Left to right only | Any order (parallel) |
| Editing | Must regenerate from edit point | Re-mask and re-denoise locally |
| Speed | $O(N)$ sequential steps | Can trade steps for parallelism |
| Controllability | Prompt engineering | Direct guidance at any position |

</div>

<div class="tip-box" data-title="The bigger picture">

Discrete diffusion suggests that autoregressive generation isn't the only way to produce text. Just as image diffusion generates all pixels simultaneously through refinement, text diffusion could generate all tokens simultaneously — more like how humans revise a draft than how they speak word-by-word.

</div>

---

# What diffusion teaches us about language

<div class="definition-box" data-title="Connecting back to course themes">

Diffusion models offer a new lens on language and communication:

- **Iterative refinement** mirrors how humans write: rough draft → revision → polished text. MDLM formalizes this as a denoising process.
- **Compression**: Latent diffusion shows that perceptually important information can be compressed dramatically (48× for images). Is language itself a compression of thought (Delétang et al., 2024, Lecture 20)?
- **Multimodal communication**: Text-to-image systems prove that language can guide visual generation. Speaker-listener neural coupling (Lecture 20) suggests human brains do something similar — using language to reconstruct visual experiences.

</div>

<div class="tip-box" data-title="Full circle">

From ELIZA's pattern matching (Week 1) to diffusion's iterative refinement (Week 7), we've seen that generation is fundamentally about **transforming noise into signal**. Whether that noise is random tokens, random pixels, or the ambiguity of human communication, the core challenge is the same.

</div>

---

# Ethics: deepfakes and consent

<div class="warning-box" data-title="The dark side of realistic generation">

Diffusion models can generate photorealistic images of people who never consented to being depicted. This has led to:

- **Non-consensual intimate imagery**: Deepfake tools targeting individuals (predominantly women), with devastating personal consequences
- **Political disinformation**: Fabricated images of public figures in compromising situations, weaponized during elections
- **Identity fraud**: Generated faces used for fake accounts, scam operations, and social engineering

</div>

<div class="important-box" data-title="Scale of the problem">

A [2019 Sensity AI (Deeptrace) report](https://sensity.ai/blog/deepfake-detection/mapping-the-deepfake-landscape/) found that **96% of deepfake videos online are non-consensual intimate imagery**, and the number of deepfake videos doubled in just 9 months. By 2023, [Sumsub reported](https://sumsub.com/blog/deepfake-statistics/) a 10× increase in detected deepfakes year-over-year. The democratization of generation tools has far outpaced legal and technical protections.

</div>

---

# Ethics: bias in generated content

<div class="warning-box" data-title="What diffusion models learn from training data">

Diffusion models trained on internet-scale datasets inherit (and sometimes amplify) societal biases:

- **Gender stereotypes**: "CEO" generates predominantly white male faces; "nurse" generates predominantly female faces
- **Racial bias**: Prompts for "beautiful person" over-represent light-skinned individuals
- **Cultural erasure**: Non-Western artistic styles, architectural traditions, and cultural contexts are underrepresented
- **Homogenization**: Generated images converge toward a narrow aesthetic — the "AI look" — reducing visual diversity

</div>

<div class="note-box" data-title="Why this is hard to fix">

Bias exists at every level: in the training data (internet images skew Western/male/young), in the text encoder (CLIP's training data has similar biases), and in the evaluation metrics (FID scores reward realism of common scenes over diverse representation).

</div>

---

# Ethics: copyright and training data

<div class="note-box" data-title="The legal landscape">

| Case | Status | Key issue |
|------|--------|-----------|
| Getty Images v. Stability AI | Ongoing (2023–) | Training on copyrighted stock photos |
| Andersen v. Stability AI | Class action (2023–) | Artists' styles replicated without consent |
| NYT v. OpenAI | Filed Dec 2023 | Verbatim reproduction of articles |
| Thomson Reuters v. Ross | Ruled 2025 | Training on proprietary legal database |

</div>

<div class="important-box" data-title="The core tension">

Training data is scraped from the internet without explicit consent. Artists argue this constitutes copyright infringement — their styles are being replicated without compensation. Companies argue this is "fair use" and transformative. Courts are still deciding, but the outcome will shape the future of all generative AI, not just diffusion models.

</div>

---

# Ethics: regulation and provenance

<div class="definition-box" data-title="Emerging regulatory frameworks">

- **EU AI Act (2024)**: Requires labeling of AI-generated content, transparency about training data, risk classification for generative systems
- **[C2PA](https://c2pa.org/) (Coalition for Content Provenance and Authenticity)**: Technical standard for embedding provenance metadata in images and videos — "nutrition labels" for digital content
- **US Executive Order (Oct 2023)**: Requires watermarking of AI-generated content from government contractors
- **China's deep synthesis regulations (2023)**: Mandatory labeling and registration of deepfake services

</div>

<div class="tip-box" data-title="Technical vs legal solutions">

Regulation works when enforced. But technical solutions (watermarking, detection models) face an arms race: as detectors improve, generators adapt. The most promising approach may be **provenance** — embedding an unforgeable record of how content was created, rather than trying to detect fakes after the fact.

</div>

---

# Discussion

<div class="tip-box" data-title="Questions to consider">

1. **Consent and creation**: If a model trained on millions of artists' work can generate art "in the style of" a specific artist, is that theft, homage, or something new? Should artists be able to opt out of training data?

2. **The world simulator question**: Sora generates videos with plausible physics. Does this mean it has learned a model of the physical world, or is it pattern-matching at a scale we find convincing? How would we tell the difference?

3. **Discrete diffusion and writing**: If MDLM can generate text by iterative refinement (all tokens at once, gradually unmasking), does this better capture how humans write than GPT's left-to-right generation? What about poetry, where the end is often written before the middle?

4. **Regulation tradeoffs**: Strict regulation of generative AI could slow harmful applications but also impede beneficial research. How should society balance these? Is open-source part of the problem or part of the solution?

5. **The compression connection**: Language compresses thought (Lecture 20). VAEs compress images. Diffusion generates by decompressing noise. Is there a deep connection between communication, compression, and generation?

</div>

---

# Take-home messages

<div class="note-box" data-title="Think about it...">

- The same diffusion framework scales across modalities — images (DALL-E 2, Stable Diffusion), video (Sora), audio, and text (MDLM) — suggesting **iterative refinement from noise** is a general-purpose generation principle.
- Imagen's key finding — that **scaling the text encoder matters more than scaling the image generator** — reveals that understanding the prompt is the bottleneck, not producing pixels. Language models are central even in vision.
- The power of open-source: Stable Diffusion's release enabled an explosion of community innovation (ControlNet, LoRA, inpainting) that no closed model could match — but also democratized the tools for deepfakes and misuse.

</div>

---
<!-- _class: scale-85 -->

# Further reading

<div class="note-box" data-title="Further reading">

[**Ramesh et al. (2022, *arXiv*)**](https://arxiv.org/abs/2204.06125) "Hierarchical Text-Conditional Image Generation with CLIP Latents" — DALL-E 2: CLIP prior + diffusion decoder.

[**Saharia et al. (2022, *NeurIPS*)**](https://arxiv.org/abs/2205.11487) "Photorealistic Text-to-Image Diffusion Models with Deep Language Understanding" — Imagen: scaling text encoders matters most.

[**OpenAI (2024)**](https://openai.com/research/video-generation-models-as-world-simulators) "Video Generation Models as World Simulators" — Sora: spacetime patches and emergent physics.

[**Sahoo et al. (2024, *NeurIPS*)**](https://arxiv.org/abs/2406.07524) "Simple and Effective Masked Diffusion Language Models" — MDLM: bridging BERT and diffusion for text.

[**Yang et al. (2024, *ACM Computing Surveys*)**](https://arxiv.org/abs/2409.00587) "Diffusion Models: A Comprehensive Survey of Methods and Applications" — Broad overview of diffusion across modalities.

</div>

---

# Questions?

<div class="emoji-figure">
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-navy">&#x1F4E7;</span>
    <span class="label"><a href="mailto:jeremy@dartmouth.edu">Email</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-purple">&#x1F4AC;</span>
    <span class="label"><a href="https://discord.gg/sftEk9Ygdw">Discord</a></span>
  </div>
  <div class="emoji-col">
    <span class="emoji emoji-xl emoji-bg emoji-bg-green">&#x1F481;</span>
    <span class="label"><a href="https://context-lab.youcanbook.me">Office hours</a></span>
  </div>
</div>

<div class="tip-box" data-title="Up next...">

Week 9 (after break): Agents and tool use — giving language models the ability to act in the world

</div>
