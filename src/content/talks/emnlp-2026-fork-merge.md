# A train that looks like a cable car

Take this clip from AVQA. In the first frames, the vehicle could pass for a cable car. The soundtrack settles it: a train slowly accelerating out of a station. Asked *"What's driving in the video?"*, VideoLLaMA2 answers **cable car**.

![AVQA with VideoLLaMA2. The early frames look like a cable car; the audio is a train leaving the station. Vanilla decoding answers (A) Cable car, FMD answers (C) Train.](/talks/fmd/qual-train.webp "wide")

The model was given both pieces of evidence and answered from one. This post is about why that happens, and about a small change at decoding time that helps: **Fork-Merge Decoding (FMD)**, which we will present at Findings of EMNLP 2026. The session details are at the end.

# Seeing and hearing is not using both

Audio-visual LLMs (AV-LLMs) read video, audio and text together. Reading them together, though, does not mean weighing them evenly. As a diagnostic, we looked at where the final question token attends in the last decoder layer of VideoLLaMA2 (100 AVHBench samples): most of that attention goes to video tokens.

![Where the final question token attends in the last decoder layer of VideoLLaMA2. Vanilla decoding leans on video; FMD lowers video attention and raises audio attention.](/talks/fmd/attention-bias.webp "figure")

Attention is not a full causal account of what a model relies on, but the pattern matches failures like the one above. We suspect part of the imbalance comes from the training data: video–text pairs are plentiful, while aligned audio–video–text data is scarce.

# When to fuse, not how

Most work on multimodal models asks *how* to combine modalities. FMD started from a different question:

:::quote
What if the problem is not how audio and video are fused, but when?
:::

In current AV-LLMs, audio and video enter the decoder together and are mixed from the first layer on. A modality the model finds easier to read can take over before the other has formed a useful representation. FMD separates the two first and brings them together later:

:::steps
Fork | For the early decoder layers, the input runs twice: once with the video masked, once with the audio masked, both with the full question. Each branch reasons over a single modality.
Merge | The two branches' hidden states are combined by attention-guided fusion, and the remaining layers reason over audio and video jointly.
:::

![Fork: the video-masked and audio-masked inputs pass through the early decoder layers separately. Merge: attention-guided fusion combines the two branches for the remaining layers.](/talks/fmd/method.webp "wide")

It needs no training and no change to the architecture, so it can be dropped into an existing AV-LLM as is.

# Balance is not equality

The result I find most interesting is what happens as the fork goes deeper. Forking for more layers keeps shifting attention from video toward audio, but accuracy does not keep improving. Deeper forks help V→A, where the answer is in the audio, and hurt A→V and AV matching, which also need the picture.

![Accuracy on AVHBench tasks as the fork layer goes deeper. Deeper forks help V→A but hurt A→V and AV matching, so FMD forks early.](/talks/fmd/fork-depth.webp "wide")

So the fix for a video-dominated model is not simply to make it look at audio more:

:::quote
The goal is not equal reliance on every modality. It is to give each modality enough room to form a useful representation before cross-modal interaction begins.
:::

That is why FMD forks early (`L_fork = 4` for VideoLLaMA2): long enough to keep video from taking over, short enough to keep what the pretrained model already does well.

# What the numbers say

We tested FMD on three AV-LLMs (VideoLLaMA2, video-SALMONN and Qwen2.5-Omni) across five audio-visual benchmarks.

:::stats
21 / 21 | comparisons improve over vanilla decoding | 3 AV-LLMs, 5 benchmarks
+5.31 pp | AV matching on video-SALMONN | 49.46% → 54.77%
1.26× | the latency of vanilla decoding | VCD and SID: about 2×
:::

The largest single gain is zero-shot: video-SALMONN was never trained on AVQA, and FMD still raises its accuracy there from 28.20% to 40.46% (+12.26 pp).

# More cases

## Describing what it sees and hears

Asked to describe a clip of a man fishing, vanilla decoding mentions only what is visible. FMD also reports the flowing stream and the occasional splash, which exist only in the audio.

![AVHBench, VideoLLaMA2. Vanilla: "A man is standing in a stream while fishing." FMD adds the sound of the stream and the occasional splash.](/talks/fmd/qual-fishing.webp "wide")

## A question about the sound

Here the answer is entirely in the audio, and vanilla decoding still gets it wrong.

![AVHBench, VideoLLaMA2. "Is the sawing wood making sound in the audio?" Vanilla decoding says no; FMD says yes.](/talks/fmd/qual-sawing.webp "wide")

# What FMD does not fix

Better integration is not the same as no hallucination. In the two descriptions below, FMD uses both modalities and still gets details wrong: it says the woman is talking *while* drying her hair, although in the audio she speaks first and the dryer follows; and it calls a glass a *cup*.

![Failure cases with VideoLLaMA2. FMD captures more of the audio and the video than vanilla decoding, but makes errors (red) in a temporal relation and an object name.](/talks/fmd/qual-failures.webp "wide")

Fine-grained temporal relations and object identity remain open problems, and FMD does not solve them.

# Come find us in Budapest

:::event
Date: Oct 26, 2026
Title: EMNLP 2026 Findings · Poster Session C
Detail: Session 5 · In-person poster
Time: 09:00–10:30, Budapest time (CET, UTC+1)
Place: Hall H, Hungexpo Budapest Congress and Exhibition Center
Calendar: /talks/fmd/emnlp-2026-fmd-poster.ics
:::

![Budapest, Hungary, the host city of EMNLP 2026](/talks/emnlp-2026-budapest.webp)

If you work on multimodal understanding, audio-visual reasoning or inference-time methods, please stop by. I would especially like to talk about:

- how modality-specific processing and cross-modal integration should be divided across decoder layers, and
- whether "separate first, integrate later" carries over to other multimodal architectures.

# After the session

> This section will be updated after the poster session: the questions people asked, and what they changed in how I think about this work.
