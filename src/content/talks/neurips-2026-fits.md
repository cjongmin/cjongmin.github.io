# Heading to NeurIPS 2026

FiTS has been accepted to NeurIPS 2026 as a Spotlight paper, and as the first author I will be in Sydney in early December to present it at the poster session.

![Sydney, Australia, the host city of NeurIPS 2026](/talks/neurips-2026-sydney.webp)

# Spotlight presentation

:::event
Date: Dec 2026
Title: NeurIPS 2026
Detail: Spotlight paper, presented at the poster session
Place: Sydney, Australia
Note: Session and time to be announced
:::

# At a glance

- **Temporal computation, inside each neuron.** FiTS is a spiking neuron that factorizes the temporal computation within each neuron into **Frequency Selectivity (FS)** and **Temporal Shaping (TS)**.
- **No extra network machinery.** On auditory benchmarks, FiTS consistently improves over a plain Leaky Integrate-and-Fire (LIF) baseline in simple feedforward SNNs, without recurrence or network-level delays, while remaining competitive with strong temporal SNN baselines.
- **Interpretable by design.** The learned target frequencies and group-delay shifts summarize, neuron by neuron, the frequency and timing organization the network has learned.

# Motivation

Spiking Neural Networks (SNNs) are a promising framework for event-driven temporal processing. Prior work has improved their temporal modeling through richer neuron dynamics and network-level mechanisms such as recurrence and delays. What remains unclear is how individual spiking neurons should specialize within a network.

:::quote
How should a single spiking neuron specialize in time: which frequency it responds to, and when those frequency components contribute to its membrane voltage?
:::

# Key idea: frequency selectivity and temporal shaping

:::steps
Frequency Selectivity (FS) | Parameterizes each neuron's target frequency as the maximizer of its subthreshold magnitude response.
Temporal Shaping (TS) | Reshapes when frequency components contribute to membrane voltage accumulation, through group-delay modulation.
:::

![The Temporal Shaping (TS) module from the paper: the voltage passes through a chain of AP blocks, and the intermediate outputs are mixed with weights λ.](/publications/fits-figure1-ts-module.webp "wide")

# Key findings

We evaluate FiTS on auditory benchmarks, where frequency selectivity and timing are central to the structure of the input. In simple feedforward SNNs without recurrence or network-level delays, FiTS consistently improves over the LIF baseline while remaining competitive with strong temporal SNN baselines.

Beyond accuracy, the learned target frequencies and group-delay shifts provide interpretable, neuron-level summaries of how the network organizes frequency and timing.

# Looking ahead

If you are attending, please come say hello. I would love to talk about spiking neurons, frequency selectivity, and what biology can still teach us about network design. After the conference, I will update this page with questions from the session, key discussion points, and personal takeaways. See you in Sydney!
