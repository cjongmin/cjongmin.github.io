# Heading to EMNLP 2026

I'm excited to share that I'll be presenting our paper, **"Fork-Merge Decoding: Enhancing Multimodal Understanding in Audio-Visual Large Language Models,"** at EMNLP 2026 Findings in Budapest, Hungary.

![Budapest, Hungary, the host city of EMNLP 2026](/talks/emnlp-2026-budapest.webp)

Our work explores a fundamental challenge in audio-visual large language models (AV-LLMs): how can we encourage models to use both audio and visual information, rather than relying too heavily on one dominant modality?

Before the conference, I'd like to briefly introduce the motivation behind our work, the key idea of Fork-Merge Decoding (FMD), and some of our main findings.

# Poster presentation

:::event
Date: Oct 2026
Title: EMNLP 2026 Findings
Detail: In-person poster presentation
Place: Budapest, Hungary
Note: Session and time to be announced
:::

# Motivation: modality bias in AV-LLMs

Audio-visual large language models integrate video, audio, and text to understand complex multimodal information. However, processing audio and visual inputs simultaneously does not necessarily mean that the model uses both modalities equally.

In our analysis of VideoLLaMA2, we observed a clear **modality bias toward visual inputs**: the final decoder layer assigned substantially more attention to video tokens than to audio tokens.

![Where the final question token attends in the last decoder layer of VideoLLaMA2 (100 AVHBench samples). Vanilla decoding leans on video; FMD lowers video attention and raises audio attention.](/talks/fmd/attention-bias.webp "figure")

We hypothesize that this behavior may be related to imbalances in pretraining data, where video–text pairs are far more abundant than aligned audio–video–text pairs. This raises an important question:

:::quote
Can we encourage an AV-LLM to process each modality independently before integrating them for joint reasoning?
:::

# Key idea: separate first, integrate later

To address this challenge, we propose **Fork-Merge Decoding (FMD)**, a training-free inference strategy that changes how audio and visual information is processed across decoder layers. The idea is simple: separate audio and video in the early decoder layers, then merge their representations for joint reasoning.

:::steps
Fork | We construct two input variants by masking either the video or the audio while preserving the text question. Each branch is processed independently through the early decoder layers, encouraging modality-specific reasoning.
Merge | The resulting hidden representations are combined, allowing the remaining decoder layers to perform cross-modal interaction and joint reasoning.
:::

![Fork: the video-masked and audio-masked inputs pass through the early decoder layers separately. Merge: attention-guided fusion combines the two branches for the remaining layers.](/talks/fmd/method.webp "wide")

Importantly, FMD requires **no additional training and no architectural modifications**, which makes it applicable to different AV-LLMs.

# Key findings

We evaluate FMD on three representative AV-LLMs (VideoLLaMA2, video-SALMONN, and Qwen2.5-Omni) across five audio-visual benchmarks.

:::stats
21 / 21 | comparisons improve over vanilla decoding | 3 AV-LLMs, 5 benchmarks
+5.31 pp | AV matching on video-SALMONN | 49.46% → 54.77%
1.26× | inference latency vs. vanilla decoding | VideoLLaMA2
:::

## FMD mitigates visual attention bias

By encouraging modality-specific processing in the early layers, FMD reduces the attention imbalance between video and audio that we observed with vanilla decoding.

## FMD consistently improves audio-visual understanding

All 21 reported comparisons show improvements over vanilla decoding. The gains are especially notable on **audio-visual matching**, a task that requires understanding audio and video jointly: on video-SALMONN, FMD improves AV matching accuracy from 49.46% to 54.77% (+5.31 percentage points).

## FMD remains computationally efficient

FMD runs two branches only in the early decoder layers. On VideoLLaMA2, it achieves these improvements at 1.26× the inference latency of vanilla decoding, while other test-time decoding methods such as VCD and SID take about 2×.

# What I'd like to discuss at the poster

One interesting observation from our experiments is that **more balanced attention does not necessarily mean perfectly equal attention**.

Increasing the fork depth generally shifts attention from video toward audio. However, excessively deep forking can reduce performance on tasks that depend heavily on visual information.

![Accuracy on AVHBench tasks as the fork layer goes deeper. Deeper forks help V→A but hurt A→V and AV matching, so FMD forks early.](/talks/fmd/fork-depth.webp "wide")

This suggests that mitigating modality bias is not simply about maximizing attention to the underused modality. Instead, it is about finding an appropriate balance while preserving the useful representations learned by the pretrained model.

I'm particularly interested in discussing:

- how modality-specific processing and cross-modal integration should be coordinated across decoder layers, and
- how such strategies might extend to other multimodal architectures.

# Looking ahead

I'm looking forward to presenting this work at EMNLP 2026 and exchanging ideas with researchers working on multimodal understanding, audio-visual reasoning, and inference-time methods.

After the conference, I plan to update this page with questions from the poster session, discussions with other researchers, and personal takeaways.

If you're attending EMNLP 2026, I'd be happy to meet and discuss our work!
