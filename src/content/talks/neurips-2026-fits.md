:::intuition What Should a Neuron Listen For?
Eyebrow: A personal intuition
Subtitle: From biological neurons to frequency-selective temporal computation

When several instruments play together, we can still follow the low notes of a bass or the higher notes of a melody. The same sound contains different frequency components, yet we can pay attention to particular ones.

That made me wonder about the neurons in a neural network. For a spiking neuron, timing matters as well: a small change in timing can change whether the membrane voltage crosses its spiking threshold.

**What if a spiking neuron could learn both which frequency to respond to and when it should contribute?**

This is the question behind **FiTS**. We factorize temporal computation *within each neuron* into **Frequency Selectivity (FS)** and **Temporal Shaping (TS)**.
:::

# Background — From Perceptrons to Spiking Neurons

:::lead
A conventional perceptron computes a weighted sum of its inputs and applies an activation function. A biological neuron works differently: ions move through channels in its cell membrane, changing the electrical potential across that membrane. When the conditions are right, the neuron generates an *action potential* that propagates to other neurons.

**Spiking Neural Networks (SNNs)** capture some of this time-dependent behavior in simplified mathematical models. One of the most common is the **Leaky Integrate-and-Fire (LIF)** neuron. Its membrane voltage integrates incoming current, gradually leaks over time, and generates a spike when it reaches a threshold. The voltage is then reset.

![The cell membrane of a standard LIF neuron: input current I flows in, and the leak −μV pulls the membrane potential V back.](/talks/fits/membrane-lif.webp)
:::

Before a spike and reset, the membrane voltage follows a particularly simple equation:

$$
\dot V(t)=-\mu V(t)+I(t), \qquad \mu=1/\tau_m.
$$

Here, $V(t)$ is membrane voltage, $I(t)$ is input current, and $\tau_m$ is the membrane time constant. The input increases the voltage, while the leak term pulls it back down.

:::details A little signal processing: magnitude, phase, and group delay
A **Fourier transform** lets us describe a time-varying signal in terms of its frequency components. A **Laplace transform** is useful for studying differential equations like the one above through a *transfer function*. For a stable linear system, its frequency response can be written as

$$
H(j\Omega)=|H(j\Omega)|e^{j\phi(\Omega)}.
$$

- **Magnitude response**, $|H(j\Omega)|$: How strongly does the system respond to each frequency?
- **Phase response**, $\phi(\Omega)$: How does the phase of each component change?
- **Group delay**, $\tau_g(\Omega)=-d\phi(\Omega)/d\Omega$: How does that phase change affect the timing of nearby frequency components?

These are the two views that matter for FiTS: *magnitude* leads to FS, while *phase and group delay* motivate TS.
:::

# Motivation — Why Is Standard LIF a Low-Pass Filter?

If we analyze the **subthreshold** LIF equation as a linear system, its frequency response is

$$
H_{\mathrm{LIF}}(j\Omega)=\frac{1}{\mu+j\Omega},
\qquad
|H_{\mathrm{LIF}}(j\Omega)|=\frac{1}{\sqrt{\mu^2+\Omega^2}}.
$$

:::lead
The magnitude decreases as the input frequency increases. Its maximum is at **0 Hz**. In other words, the standard LIF neuron's *subthreshold membrane dynamics* act as a **low-pass filter (LPF)**.

Here, biology offers an interesting clue. Some biological neurons exhibit **intrinsic resonance**, responding more strongly to particular input frequencies because of their membrane and ion-channel dynamics. An **adaptive LIF** model captures an aspect of this behavior by introducing a voltage-dependent adaptation current, $a(t)$:

![Adaptive LIF adds a voltage-dependent adaptation current a, through a channel that opens with V.](/talks/fits/membrane-adaptive-lif.webp)
:::

$$
\dot V(t)=-\mu V(t)+I(t)-\eta a(t),
\qquad
\dot a(t)=-\rho a(t)+\gamma V(t).
$$

This feedback can move the peak of the magnitude response away from 0 Hz.

But that leads to a more useful question: **Instead of indirectly learning adaptation coefficients, could we let each neuron learn its preferred frequency directly?**

# Method — Frequency Selectivity and Temporal Shaping

:::steps
Frequency Selectivity (FS) | **Which frequency?** Make the target frequency—the peak of a neuron's subthreshold magnitude response—an explicit, learnable variable.
Temporal Shaping (TS) | **When does it contribute?** Modulate the timing of frequency components in the membrane voltage through group-delay shaping.
:::

## Frequency Selectivity (FS)

For the adaptive LIF model, let $\kappa=\eta\gamma$. Its subthreshold frequency response becomes

$$
H(j\Omega)=\frac{\rho+j\Omega}{(\mu\rho+\kappa-\Omega^2)+j(\mu+\rho)\Omega}.
$$

Under the conditions derived in the paper, this response has a **unique nonzero global maximum** at a target frequency $\Omega^\star$. The key step in FiTS is to **invert** that relationship: instead of learning $\kappa$ and discovering the resulting peak afterward, we specify $\Omega^\star$ and calculate the $\kappa^\star$ that produces it.

$$
\boxed{\Omega^\star\;\text{(learnable)}\ \longrightarrow\ \kappa^\star\ \longrightarrow\ H(j\Omega)}
$$

Now each neuron can learn *where* it responds most strongly. Its initialization, optimization, and interpretation can all be expressed in the same frequency coordinate, rather than through an indirect adaptation parameter.

:::details The closed-form inverse (Theorem 1)
For a desired $\Omega^\star>0$, the continuous-time analysis gives a unique adaptation strength that places the magnitude-response peak at that frequency:

$$
\kappa^\star=\rho(\rho+\mu)\left[\sqrt{1+\frac{\left(1+(\Omega^\star/\rho)^2\right)^2}{(1+\mu/\rho)^2}}-1\right].
$$
:::

:::fits-frequency-demo
Title: From a fixed low-pass peak to a learnable target frequency
Description: Move the target-frequency slider to compare the normalized subthreshold magnitude responses of standard LIF and FS.
:::

## Temporal Shaping (TS)

Choosing a frequency is only part of the problem. **When** frequency components contribute to the membrane voltage can also change when—or whether—the voltage crosses its spiking threshold.

Once the FS parameters are set, their associated phase and group-delay responses are determined too. To give a neuron more control over its timing, TS combines an **all-pass filter cascade** with **$\lambda$-mixing**.

An individual all-pass stage changes phase while preserving magnitude:

$$
A_m(z)=\frac{z^{-1}-\beta_m}{1-\beta_m z^{-1}},\qquad |\beta_m|<1.
$$

The $\lambda$-mixing operation then blends outputs from the cascade:

$$
\widetilde V_m[k+1]=(1-\lambda_m)\widetilde V_{m-1}[k+1]+\lambda_m V_m[k+1].
$$

![The TS module: a cascade of all-pass stages with λ-mixing of intermediate outputs.](/publications/fits-figure1-ts-module.webp "wide")

A cascade of stable first-order all-pass stages contributes positive group delay. With $\lambda$-mixing, however, **both positive and negative group-delay shifts relative to the FS-only response** become possible.

FS and TS thus give each neuron complementary controls over **frequency preference and temporal response**, without adding recurrence or delays at the *network level*.

# What We Found

We evaluated FiTS on auditory benchmarks, using simple feedforward SNNs without network-level recurrence or delays. FiTS consistently outperformed the plain LIF baseline in these experiments and remained competitive with stronger temporal SNN baselines.

:::stats
+13.57 pp | SHD vs. plain LIF | 81.74% → 95.31%
+9.06 pp | SSC vs. plain LIF | 69.17% → 78.23%
+14.46 pp | GSC vs. plain LIF | 80.02% → 94.48%
:::

Beyond accuracy, I find the learned representations particularly interesting. We can inspect each neuron's **target frequency** and **group-delay shifts**, giving us a more interpretable view of how the network organizes frequency and timing.

# At NeurIPS 2026

FiTS has been accepted to **NeurIPS 2026 as a Spotlight paper**. I'll be presenting it in Sydney this December, and I'd love to discuss what biological neuron dynamics might teach us about designing more interpretable temporal computation.

:::event
Date: Dec 10, 2026
Title: NeurIPS 2026 · Poster Session 6
Detail: Spotlight paper, presented at the poster session
Time: Thu 17:00, Sydney time (AEDT, UTC+11)
Place: Hall 1-4, Sydney, Australia
Calendar: /talks/fits/neurips-2026-fits-poster.ics
:::

## What I'd like to discuss

We often begin by asking **how neurons should be connected**. Working on FiTS also made me interested in a different question: **what should each neuron learn to compute over time?** I'd love to hear other perspectives on that at the poster session.
