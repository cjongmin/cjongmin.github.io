# Seeing and hearing does not mean using both

:::lead
An audio-visual language model can receive a video and its soundtrack together, yet still miss information needed to answer a question. Sometimes its answer follows the visual scene while leaving out an audible event. *Providing both inputs does not ensure that both contribute where they should.*

As a diagnostic, we examined where the final question token attends in the last decoder layer of VideoLLaMA2. Vanilla decoding places substantially more attention on **video** than on **audio**. Our method, **Fork-Merge Decoding (FMD)**, has the model first read each modality on its own, with the other one zeroed out, in the early decoder layers, and only then brings the two together for joint reasoning. With FMD, the attention gap becomes much smaller.

![Attention weight analysis in VideoLLaMA2 on the AVHBench dataset.](/talks/fmd/attention-bias.webp)
:::

# A train that looks like a cable car

One example from AVQA makes the problem concrete. In the early video frames, a train could be mistaken for a cable car. The accompanying audio contains the sound of a train gradually accelerating as it leaves a station.

Asked what is driving in the video, VideoLLaMA2 with its original decoding procedure selects **"Cable car."** With FMD, the same model selects the correct answer, **"Train."**

![Figure 1. AVQA example with VideoLLaMA2. The soundtrack provides a cue that can help resolve the ambiguous early frames. Original decoding selects (A) Cable car; FMD selects (C) Train.](/talks/fmd/qual-train.webp "wide")

The model had access to both signals, yet its answer followed the visually plausible interpretation. This is the kind of failure we want FMD to reduce.

# Giving each modality a separate start

One possible source of this imbalance is the training data. Video–text pairs are much more common than aligned audio–video–text data. We treat this as a hypothesis, not as a conclusion from our experiments.

FMD changes ==when audio and video begin to interact== inside the decoder. The model weights remain unchanged.

![Figure 2. The fork and merge stages. Two masked inputs share the pretrained decoder weights and run separately through its early layers; their hidden states are merged before decoding continues. The attention-guided merge shown here is the token-wise variant.](/talks/fmd/method.webp "wide")

:::steps
Fork | Isolate each modality | We create two inputs by **zeroing out one modality** in each. One keeps the audio and zeros the video; the other keeps the video and zeros the audio. Both keep the question. Zeroing preserves the shape and positions of the input but removes its content. The two inputs then pass independently through the same early decoder layers, so the model reads each modality on its own, in the context of the question.
Merge | Bring the branches back together | We merge the two branches' hidden states and continue through the remaining decoder layers, where cross-modal interaction and joint reasoning take place.
:::

For models that keep audio and video at separate token positions (VideoLLaMA2 and Qwen2.5-Omni), the merge is **attention-guided**. We take the final token's attention in each branch, $\mathbf{a}_{\text{last}}^{v[\text{masked}]}$ and $\mathbf{a}_{\text{last}}^{a[\text{masked}]}$, and measure how much of it falls on the modality that was left unmasked:

$$
\alpha = \frac{\sum_{i \in \mathcal{A}} \mathbf{a}_{\text{last}}^{v[\text{masked}]}[i] + \sum_{i \in \mathcal{V}} \mathbf{a}_{\text{last}}^{a[\text{masked}]}[i]}{\sum_{i \in \mathcal{V} \cup \mathcal{A}} \left( \mathbf{a}_{\text{last}}^{v[\text{masked}]}[i] + \mathbf{a}_{\text{last}}^{a[\text{masked}]}[i] \right)}
$$

Here $\mathcal{V}$ and $\mathcal{A}$ are the video and audio token positions. At each modality's positions, $\alpha$ weights the branch in which that modality was visible, and $1-\alpha$ the other; the question positions are averaged. Rather than computing $\alpha$ for every input, we estimate one value per model from 100 random AVHBench examples ($\alpha = 0.8$ for VideoLLaMA2, $0.9$ for Qwen2.5-Omni) and reuse it. video-SALMONN mixes audio and video in the same channels, so there we simply add the two branches' audio-visual hidden states and average the question positions.

FMD is a {{Training-free}} and {{Plug-and-play|green}} inference strategy. It changes how the pretrained decoder is used, without retraining it or modifying its architecture. By separating the two modalities early, *it gives each one a chance to contribute before joint processing resumes.*

# Balance is not equality

The part I find most interesting is how little separation is needed, and how quickly more separation becomes a trade-off. Extending the separate processing sounds like a natural next step; the layer experiments show why that needs care.

On VideoLLaMA2, later merge points generally reduce attention to video. Audio attention stays above the original decoding baseline, but varies across merge points rather than increasing steadily. Task accuracy changes in different directions: deeper separation tends to help questions targeting audible content, while hurting questions targeting visible content and questions about whether the audio and video match.

![Figure 3. Changing the merge point changes the trade-off. On AVHBench, A→V tests video-targeted understanding, V→A tests audio-targeted understanding, and AV matching tests their correspondence. Deep separation favors the audio-targeted task at the expense of the other two. VideoLLaMA2, 200 AVHBench samples per task.](/talks/fmd/fork-depth.webp "wide")

That is the result I would put at the center of the story.

:::quote
Useful multimodal processing depends on the evidence a question requires. Equal attention to both modalities is not an objective in itself.
:::

Our early merge settings offer a useful compromise in the tested models. They should not be read as a universal rule that every audio-visual decoder ought to merge at the fourth layer, or after a fixed fraction of its depth.

# What improved, and what it cost

We evaluated FMD on VideoLLaMA2, video-SALMONN, and Qwen2.5-Omni across five datasets: AVHBench, AVQA, MUSIC-AVQA, AVUT, and WorldSense. All 21 reported model–task comparisons in the main results table improved over original decoding.

:::stats
21 / 21 | reported model–task comparisons improve | 3 AV-LLMs, 5 datasets
+12.26 pp | largest gain: video-SALMONN on AVQA, zero-shot | smallest: +0.12 pp, Qwen2.5-Omni on AVQA
1.26× | latency per generated token | VideoLLaMA2, vs. original decoding
:::

The improvements vary considerably. On video-SALMONN, AV matching accuracy rose from 49.46% to 54.77%, a gain of 5.31 percentage points. Its AVQA score rose from 28.20% to 40.46%, or 12.26 points, even though the model had not been trained on AVQA. Other gains were small: Qwen2.5-Omni's AVQA score increased from 86.49% to 86.61%.

I read these results as evidence that changing the inference procedure can improve how the tested models use their inputs. The size of that benefit depends on the model and task.

There is also a computational cost. In our VideoLLaMA2 timing experiment on 100 AVHBench examples, FMD took 0.43 seconds per generated token, compared with 0.34 seconds for original decoding: 1.26 times the latency, or about 26% more. VCD and SID took 2.03 and 2.09 times the baseline latency in the same comparison. FMD duplicates the early decoder computation while sharing the remaining layers after the merge.

> A note on scope: the 21 comparisons count the available model–task results in the main table. Three Qwen2.5-Omni dataset evaluations were unavailable because of memory constraints, and AVUT and WorldSense were restricted to videos under 60 seconds. These numbers follow the EMNLP 2026 version of the paper; the current arXiv version (v2) reports AVHBench, AVQA and MUSIC-AVQA. The timing figures come from a single RTX A6000 setup and are not a general latency guarantee.

# More complete descriptions still need checking

The train example concerns a discrete answer. A fishing clip from AVHBench shows another kind of change.

The prompt asks the model to describe what it sees and hears. Original decoding describes a man standing in a stream while fishing. FMD also mentions the sound of the stream and occasional splashes, matching the acoustic context described in the example.

![Figure 4. Fishing example with VideoLLaMA2. FMD includes auditory details omitted by the original response, alongside the visible activity.](/talks/fmd/qual-fishing.webp "wide")

What matters here is the inclusion of relevant evidence. A longer description would be of little value if its extra details were unsupported, and the failure cases make that distinction clear.

In one example, FMD mentions a woman speaking and drying her hair, but describes the events as simultaneous; the audio has speech followed by the hair dryer. In another, it includes the sound of talking while someone washes a glass, but incorrectly names the object as a cup.

![Figure 5. Two remaining errors with VideoLLaMA2: an incorrect temporal relation and an incorrect object reference (red). Incorporating more of the scene's audio does not ensure that every detail is accurate.](/talks/fmd/qual-failures.webp "wide")

These examples set a useful boundary on the result. FMD can improve the use of multimodal information while still producing errors in timing and object identity. More complete descriptions and more accurate descriptions need to be evaluated separately.

# Questions I am bringing to EMNLP

I will be presenting this work at Findings of EMNLP 2026 in Budapest.

:::event
Date: Oct 26, 2026
Title: EMNLP 2026 Findings · Poster Session C
Detail: Session 5 · In-person poster
Time: 09:00–10:30, Budapest time (CET, UTC+1)
Place: Hall H, Hungexpo Budapest Congress and Exhibition Center
Calendar: /talks/fmd/emnlp-2026-fmd-poster.ics
:::

The layer trade-off is what I most want to discuss: how should we decide how much separate processing a model needs, and what evidence would show that a better answer comes from using the appropriate modality?

I am also interested in whether the same approach helps when the input conditions change, for example when audio is unreliable or the two streams conflict. The current results give us a starting point, while leaving room for more systematic tests.

If these questions overlap with your work, I would be glad to talk at the poster. The full conference schedule is in the [EMNLP 2026 program](https://2026.emnlp.org/program/).

# After the session

> I will update this section after EMNLP with the questions that sharpened the discussion, what the current experiments can answer, and what still needs testing. If a conversation changes how I interpret a result, I will revise the relevant section above and note the change here.
