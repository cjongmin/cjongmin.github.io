:::intuition When Do We Close Our Eyes or Cover Our Ears?
Eyebrow: A personal intuition
Subtitle: From an intuition about human perception to Fork-Merge Decoding
Note: An analogy, not a biological claim.

![Illustration generated with ChatGPT.](/talks/fmd/eyes-and-ears.webp)

Our eyes and ears convert physical signals—light and sound—into neural signals that the brain can process. In a similar sense, video and audio encoders serve as the eyes and ears of multimodal language models, transforming raw sensory inputs into meaningful representations.

The human brain does not simply process these signals in a single forward pass. Information flows through multiple stages, with top-down feedback influencing how sensory inputs are interpreted. While this is not directly equivalent to how Transformers operate, both involve progressively processing and integrating information.

Interestingly, we do not always pay equal attention to every sense. In a noisy environment, we might cover our ears to focus on what we see. When trying to catch a faint sound, we might close our eyes and listen more carefully.

**What if multimodal language models could benefit from a similar principle?**

Rather than processing audio and visual information jointly from the beginning, perhaps we should let the model focus on each modality separately before combining them.

This simple intuition motivates **Fork-Merge Decoding (FMD)**: first developing modality-specific representations through separate decoding branches, then merging them for joint reasoning.
:::

# Motivation

## Seeing and hearing does not mean using both

:::lead
An audio-visual language model can receive a video and its soundtrack together, yet still miss information needed to answer a question. Sometimes its answer follows the visual scene while leaving out an audible event. Providing both inputs does not guarantee that the model uses *the evidence needed to answer the question*.

As a diagnostic, we examined where the final question token attends in the last decoder layer of VideoLLaMA2. Vanilla decoding places substantially more attention on **video** than on **audio**. Our method, **Fork-Merge Decoding (FMD)**, lets the model read each modality on its own in the early decoder layers by zeroing out the other one. Only then does it bring the two together for joint reasoning. With FMD, this attention gap narrows.

![Figure 1. Attention weight analysis in VideoLLaMA2 on the AVHBench dataset.](/talks/fmd/attention-bias.webp)
:::

## A train that looks like a cable car

Figure 2 makes the problem concrete with an example from AVQA.

![Figure 2. AVQA example: original decoding predicts Cable car, while FMD predicts Train.](/talks/fmd/qual-train.webp "wide")

In the early frames, the train could be mistaken for a cable car. The soundtrack contains the sound of a train gradually accelerating as it leaves a station. Asked what is driving in the video, VideoLLaMA2 with its original decoding procedure selects “**Cable car**”. With FMD, the same model selects the correct answer, “**Train**”.

The model had access to both signals, yet its answer followed the visually plausible interpretation. This is the kind of failure we want FMD to reduce.

One possible source of this imbalance is the training data. Video–text pairs are much more common than aligned audio–video–text data. We treat this as a hypothesis, not as a conclusion from our experiments.

# Method — Giving each modality a separate start

FMD changes ==when audio and video begin to interact== inside the decoder. The model weights remain unchanged.

![Figure 3. Overview of the Fork-Merge Decoding pipeline.](/talks/fmd/method.webp "wide")

:::steps
Fork | Isolate each modality | We create two inputs by **zeroing out one modality** in each. One keeps the audio and zeros the video. The other keeps the video and zeros the audio. Both keep the question. Zeroing preserves the shape and positions of the input but removes its content. The two inputs then pass independently through the same early decoder layers, so the model reads each modality on its own in the context of the question.
Merge | Bring the branches back together | We merge the two branches' hidden states and continue through the remaining decoder layers, where cross-modal interaction and joint reasoning take place.
:::

For models that keep audio and video at separate token positions (VideoLLaMA2 and Qwen2.5-Omni), the merge is **attention-guided**. We take the final token's attention in each branch and measure how much of it falls on the modality that was left unmasked.

$$
\alpha = \frac{\sum_{i \in \mathcal{A}} \mathbf{a}_{\text{last}}^{v[\text{masked}]}[i] + \sum_{i \in \mathcal{V}} \mathbf{a}_{\text{last}}^{a[\text{masked}]}[i]}{\sum_{i \in \mathcal{V} \cup \mathcal{A}} \left( \mathbf{a}_{\text{last}}^{v[\text{masked}]}[i] + \mathbf{a}_{\text{last}}^{a[\text{masked}]}[i] \right)}
$$

The two attention terms come from the video-masked and audio-masked branches, and $\mathcal{V}$ and $\mathcal{A}$ are the video and audio token positions. At each modality's positions, $\alpha$ weights the branch in which that modality was visible and $1-\alpha$ weights the other. The question positions are averaged. $\alpha$ is not computed for each input. We estimate one fixed value per model and reuse it.

:::details How α is estimated, and how video-SALMONN differs
We estimate $\alpha$ from 100 random AVHBench examples. It is 0.8 for VideoLLaMA2 and 0.9 for Qwen2.5-Omni.

video-SALMONN combines audio and video features along the channel dimension at shared token positions, so there is no separate audio or video position to weight. For it, we simply add the two branches' audio-visual hidden states and average the question positions.
:::

FMD is a ==training-free== and ==plug-and-play== inference strategy. It changes how the pretrained decoder is used, without retraining it or modifying its architecture. By separating the two modalities early, *it gives each one a chance to contribute before joint processing resumes.*

# Results

## Balance is not equality

The part I find most interesting is how few layers of separate processing are needed, and how extending it helps some tasks while hurting others. In our experiments the fork covers only the first 4 of 28 decoder layers (6 of 40 for video-SALMONN). Extending the separate processing sounds like a natural next step. The layer experiments show why that needs care.

On VideoLLaMA2, later merge points generally reduce attention to video. Audio attention stays above the original decoding baseline, but varies across merge points rather than increasing steadily. Task accuracy changes in different directions. In Figure 4, A→V asks about visible content, V→A about audible content, and AV matching about whether the two correspond (VideoLLaMA2, 200 AVHBench samples per task). Deeper separation tends to help V→A and hurt the other two.

![Figure 4. AVHBench accuracy of VideoLLaMA2 as the merge point moves deeper.](/talks/fmd/fork-depth.webp "wide")

For me, this trade-off is the most informative result.

:::quote
Useful multimodal processing depends on the evidence a question requires. Equal attention to both modalities is not an objective in itself.
:::

Our early merge settings offer a useful compromise in the tested models. They should not be read as a universal rule that every audio-visual decoder ought to merge at the fourth layer, or after a fixed fraction of its depth.

## What improved, and what it cost

We evaluated FMD on VideoLLaMA2, video-SALMONN, and Qwen2.5-Omni across five datasets: AVHBench, AVQA, MUSIC-AVQA, AVUT, and WorldSense. All 21 reported model–task comparisons in the main results table improved over original decoding.

:::stats
21 / 21 | reported model–task comparisons improve | 3 AV-LLMs, 5 datasets
+12.26 pp | largest gain | video-SALMONN · AVQA · zero-shot
1.26× | latency per generated token | VideoLLaMA2, vs. original decoding
:::

The improvements vary considerably. On video-SALMONN, AV matching accuracy rose from 49.46% to 54.77%, a gain of 5.31 percentage points. Its AVQA score rose from 28.20% to 40.46%, or 12.26 points, even though the model had not been trained on AVQA. Other gains were small: Qwen2.5-Omni's AVQA score increased from 86.49% to 86.61%.

I read these results as evidence that changing the inference procedure can improve how the tested models use their inputs. The size of that benefit depends on the model and task.

There is also a computational cost. In our VideoLLaMA2 timing experiment on 100 AVHBench examples, FMD took 0.43 seconds per generated token, compared with 0.34 seconds for original decoding: 1.26 times the latency, or about 26% more. VCD and SID took 2.03 and 2.09 times the baseline latency in the same comparison. FMD duplicates the early decoder computation while sharing the remaining layers after the merge.

:::details Scope and evaluation notes
The 21 comparisons count the available model–task results in the main table. Three Qwen2.5-Omni dataset evaluations were unavailable because of memory constraints, and AVUT and WorldSense were restricted to videos under 60 seconds. The timing figures come from a single RTX A6000 setup and are not a general latency guarantee.
:::

## More complete descriptions still need checking

The train example involves choosing an answer from a fixed set of options. A fishing clip from AVHBench shows another kind of change.

The prompt asks the model to describe what it sees and hears. Original decoding describes a man standing in a stream while fishing. FMD also mentions the sound of the stream and occasional splashes, matching the acoustic context described in the example.

![Figure 5. FMD adds auditory details omitted by original decoding.](/talks/fmd/qual-fishing.webp "wide")

The point is not that FMD says more. It is whether what it adds is actually supported by the input.

In one example, FMD mentions a woman speaking and drying her hair, but describes the events as simultaneous. In the audio, the speech comes first and the hair dryer follows. In another, it includes the sound of talking while someone washes a glass, but incorrectly names the object as a cup.

![Figure 6. Remaining FMD errors: temporal relation and object identity.](/talks/fmd/qual-failures.webp "wide")

These examples show the kinds of errors that remain. FMD can improve the use of multimodal information while still producing errors in timing and object identity. More complete descriptions and more accurate descriptions need to be evaluated separately.

# At EMNLP 2026

I will be presenting this work at Findings of EMNLP 2026 in Budapest.

:::event
Date: Oct 26, 2026
Title: EMNLP 2026 Findings · Poster Session C
Detail: Session 5 · In-person poster
Time: 09:00–10:30, Budapest time (CET, UTC+1)
Place: Hall H, Hungexpo Budapest Congress and Exhibition Center
Calendar: /talks/fmd/emnlp-2026-fmd-poster.ics
:::

The full conference schedule is in the [EMNLP 2026 program](https://2026.emnlp.org/program/).

## What I'd like to discuss

Beyond the performance gains, I am curious about what actually takes shape inside the LLM decoder. What information does each layer build up as the model reasons, and is that processing hierarchical? If it is, that might explain why processing each modality on its own before merging works. I would love to hear your thoughts on this at the poster.

## After the session

> I will update this section after EMNLP with the questions that sharpened the discussion, what the current experiments can answer, and what still needs testing. If a conversation changes how I interpret a result, I will revise the relevant section above and note the change here.
