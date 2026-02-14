"""
Diffusion model animation scenes for Lecture 21.

10 scenes illustrating the core concepts of diffusion models.
Rendered at 1920x1080 with WHITE background, BLACK text.
Follows the same BaseScene pattern as transformer_scenes.py.
"""

import numpy as np

from manim import *


class Title(VGroup):
    """Invisible title - titles go on slides instead."""

    def __init__(self, *args, **kwargs):
        super().__init__()

    def scale(self, *args, **kwargs):
        return self


class BaseScene(Scene):
    """Capture common methods for all scenes."""

    ANIM_SPEED = 1.5

    def __init__(self):
        super().__init__()
        self.camera.background_color = WHITE
        Mobject.set_default(color=BLACK)

    def wait(self, num_secs=1):
        super().wait(num_secs * BaseScene.ANIM_SPEED)

    def play(self, *args, **kwargs):
        if "run_time" in kwargs:
            kwargs["run_time"] *= BaseScene.ANIM_SPEED
        else:
            kwargs["run_time"] = 1.2
        super().play(*args, **kwargs)


# ---------------------------------------------------------------------------
# Scene 1: ForwardDiffusion
# ---------------------------------------------------------------------------
class ForwardDiffusion(BaseScene):
    """Progressive noising: clean image -> pure noise over 5 steps."""

    def construct(self):
        np.random.seed(42)
        title = Title("Forward Diffusion")

        grid_size = 8
        cell = 0.42
        gap = 0.06

        # Create a simple smiley-face pattern on 8x8 grid
        pattern = np.zeros((grid_size, grid_size, 3))
        base_color = np.array([0.2, 0.55, 0.85])  # nice blue
        pattern[:, :] = base_color
        # eyes
        for r, c in [(2, 2), (2, 5)]:
            pattern[r, c] = np.array([0.1, 0.15, 0.3])
        # mouth
        for r, c in [(5, 2), (5, 3), (5, 4), (5, 5), (4, 1), (4, 6)]:
            if 0 <= r < grid_size and 0 <= c < grid_size:
                pattern[r, c] = np.array([0.1, 0.15, 0.3])

        num_steps = 6  # t=0 .. t=5
        betas = np.linspace(0.05, 0.35, num_steps - 1)

        all_grids = []
        all_labels = []
        current = pattern.copy()

        for step in range(num_steps):
            squares = VGroup()
            for r in range(grid_size):
                for c in range(grid_size):
                    col = current[r, c].clip(0, 1)
                    sq = Square(side_length=cell)
                    sq.set_fill(rgb_to_color(col), opacity=1)
                    sq.set_stroke(GREY_B, width=1.5)
                    sq.move_to(
                        np.array(
                            [
                                c * (cell + gap) - (grid_size - 1) * (cell + gap) / 2,
                                -(
                                    r * (cell + gap)
                                    - (grid_size - 1) * (cell + gap) / 2
                                ),
                                0,
                            ]
                        )
                    )
                    squares.add(sq)

            label = MathTex(f"t = {step}", font_size=36, color=BLACK)
            all_grids.append(squares)
            all_labels.append(label)

            if step < num_steps - 1:
                noise = np.random.randn(grid_size, grid_size, 3) * 0.15
                current = (
                    np.sqrt(1 - betas[step]) * current
                    + np.sqrt(betas[step]) * np.abs(noise)
                    + noise * 0.1
                )
                current = current.clip(0, 1)
                # blend toward grey for later steps
                grey = np.full_like(current, 0.5)
                blend = min(1.0, (step + 1) / (num_steps - 1))
                current = (1 - blend * 0.7) * current + blend * 0.7 * (
                    grey + np.random.randn(grid_size, grid_size, 3) * 0.2
                )
                current = current.clip(0, 1)

        # Layout: arrange grids horizontally
        spacing = 2.4
        total_width = (num_steps - 1) * spacing
        for i, (grid, lab) in enumerate(zip(all_grids, all_labels)):
            x_pos = -total_width / 2 + i * spacing
            grid.move_to(np.array([x_pos, 0.3, 0]))
            grid.scale(0.52)
            lab.next_to(grid, DOWN, buff=0.3)

        # Animate: show first grid, then add each subsequent with arrow
        self.play(FadeIn(all_grids[0]), FadeIn(all_labels[0]))

        for i in range(1, num_steps):
            arrow = Arrow(
                all_grids[i - 1].get_right(),
                all_grids[i].get_left(),
                buff=0.05,
                color=BLACK,
                stroke_width=5,
                tip_length=0.15,
                max_tip_length_to_length_ratio=0.5,
                max_stroke_width_to_length_ratio=15,
            )
            beta_label = MathTex(f"\\beta_{i}", font_size=36, color=BLACK)
            beta_label.next_to(arrow, UP, buff=0.15)
            self.play(
                GrowArrow(arrow),
                FadeIn(beta_label),
                FadeIn(all_grids[i]),
                FadeIn(all_labels[i]),
                run_time=0.8,
            )

        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 2: NoiseSchedule
# ---------------------------------------------------------------------------
class NoiseSchedule(BaseScene):
    """Linear vs cosine noise schedules plotted on axes."""

    def construct(self):
        title = Title("Noise Schedules")

        T = 1000
        ts = np.arange(T)

        # Linear schedule
        beta_linear = np.linspace(1e-4, 0.02, T)
        alpha_bar_linear = np.cumprod(1 - beta_linear)

        # Cosine schedule
        s = 0.008
        f_t = np.cos(((ts / T + s) / (1 + s)) * np.pi / 2) ** 2
        f_0 = f_t[0]
        alpha_bar_cosine = f_t / f_0
        alpha_bar_cosine = np.clip(alpha_bar_cosine, 1e-6, 1.0)

        # Plot alpha_bar (signal remaining)
        axes = Axes(
            x_range=[0, 1000, 200],
            y_range=[0, 1.05, 0.2],
            x_length=9,
            y_length=4.5,
            axis_config={"color": BLACK, "include_numbers": True, "font_size": 32},
            tips=False,
        ).shift(DOWN * 0.2)

        x_label = Text("Timestep t", font_size=36, color=BLACK).next_to(
            axes.x_axis, DOWN, buff=0.4
        )
        y_label = MathTex("\\bar{\\alpha}_t", font_size=36, color=BLACK).next_to(
            axes.y_axis, LEFT, buff=0.3
        )

        linear_graph = axes.plot_line_graph(
            x_values=ts[::20].tolist(),
            y_values=alpha_bar_linear[::20].tolist(),
            line_color=BLUE_E,
            add_vertex_dots=False,
            stroke_width=5,
        )
        cosine_graph = axes.plot_line_graph(
            x_values=ts[::20].tolist(),
            y_values=alpha_bar_cosine[::20].tolist(),
            line_color=GREEN_E,
            add_vertex_dots=False,
            stroke_width=5,
        )

        linear_label = Text("Linear", font_size=34, color=BLUE_E).move_to(
            axes.c2p(500, 0.22)
        )
        cosine_label = Text("Cosine", font_size=34, color=GREEN_E).move_to(
            axes.c2p(700, 0.65)
        )

        definition = MathTex(
            r"\bar{\alpha}_t = \prod_{s=1}^{t}(1 - \beta_s)",
            font_size=36,
            color=BLACK,
        ).next_to(axes, UP, buff=0.3)

        note = Text("Signal remaining", font_size=32, color=BLACK).next_to(
            definition, UP, buff=0.15
        )

        self.play(
            Create(axes),
            FadeIn(x_label),
            FadeIn(y_label),
            FadeIn(note),
            FadeIn(definition),
        )
        self.play(Create(linear_graph), FadeIn(linear_label), run_time=1.0)
        self.play(Create(cosine_graph), FadeIn(cosine_label), run_time=1.0)
        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 3: ReverseProcess
# ---------------------------------------------------------------------------
class ReverseProcess(BaseScene):
    """Denoising from noise to clean image with neural network icons."""

    def construct(self):
        np.random.seed(123)
        title = Title("Reverse Process")

        grid_size = 8
        cell = 0.42
        gap = 0.06

        # Target clean image (same smiley as ForwardDiffusion)
        clean = np.zeros((grid_size, grid_size, 3))
        base_color = np.array([0.2, 0.55, 0.85])
        clean[:, :] = base_color
        for r, c in [(2, 2), (2, 5)]:
            clean[r, c] = np.array([0.1, 0.15, 0.3])
        for r, c in [(5, 2), (5, 3), (5, 4), (5, 5), (4, 1), (4, 6)]:
            if 0 <= r < grid_size and 0 <= c < grid_size:
                clean[r, c] = np.array([0.1, 0.15, 0.3])

        num_steps = 5
        # Generate images from noisy to clean
        images = []
        for step in range(num_steps):
            blend = step / (num_steps - 1)
            noise = np.random.randn(grid_size, grid_size, 3) * 0.15 * (1 - blend)
            grey_noise = np.random.rand(grid_size, grid_size, 3) * 0.4 + 0.3
            img = (1 - blend) * grey_noise + blend * clean + noise
            images.append(img.clip(0, 1))

        # Reverse order: noise first, clean last
        images = images[::-1]
        step_labels = [f"t = {num_steps - 1 - i}" for i in range(num_steps)]

        def make_grid(img_data):
            squares = VGroup()
            for r in range(grid_size):
                for c in range(grid_size):
                    col = img_data[r, c].clip(0, 1)
                    sq = Square(side_length=cell)
                    sq.set_fill(rgb_to_color(col), opacity=1)
                    sq.set_stroke(GREY_B, width=1.5)
                    sq.move_to(
                        np.array(
                            [
                                c * (cell + gap) - (grid_size - 1) * (cell + gap) / 2,
                                -(
                                    r * (cell + gap)
                                    - (grid_size - 1) * (cell + gap) / 2
                                ),
                                0,
                            ]
                        )
                    )
                    squares.add(sq)
            return squares

        grids = [make_grid(img) for img in images]
        labels = [MathTex(sl, font_size=36, color=BLACK) for sl in step_labels]

        spacing = 2.8
        total_w = (num_steps - 1) * spacing
        for i, (g, l) in enumerate(zip(grids, labels)):
            x = -total_w / 2 + i * spacing
            g.move_to(np.array([x, 0.3, 0])).scale(0.58)
            l.next_to(g, DOWN, buff=0.3)

        self.play(FadeIn(grids[0]), FadeIn(labels[0]))

        for i in range(1, num_steps):
            # Neural net icon between grids
            nn_box = RoundedRectangle(
                corner_radius=0.1,
                width=0.9,
                height=0.5,
                stroke_color=TEAL_E,
                fill_color=TEAL_E,
                fill_opacity=0.15,
                stroke_width=3,
            )
            nn_text = MathTex("\\epsilon_\\theta", font_size=34, color=TEAL_E)
            nn_icon = VGroup(nn_box, nn_text)
            mid = (grids[i - 1].get_right() + grids[i].get_left()) / 2
            nn_icon.move_to(mid + UP * 0.4)

            arrow = Arrow(
                grids[i - 1].get_right() + RIGHT * 0.05,
                grids[i].get_left() + LEFT * 0.05,
                buff=0.05,
                color=GREEN_E,
                stroke_width=5,
                max_tip_length_to_length_ratio=0.35,
            )
            self.play(
                GrowArrow(arrow),
                FadeIn(nn_icon),
                FadeIn(grids[i]),
                FadeIn(labels[i]),
                run_time=0.8,
            )

        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 4: UNetArchitecture
# ---------------------------------------------------------------------------
class UNetArchitecture(BaseScene):
    """U-Net encoder-bottleneck-decoder with skip connections."""

    def construct(self):
        title = Title("U-Net Architecture")

        block_color = BLUE_E
        skip_color = GREEN_E
        bottleneck_color = MAROON_E

        # Encoder blocks (left side, going down)
        enc_sizes = [(1.4, 0.7), (1.1, 0.7), (1.0, 0.7), (0.85, 0.7)]
        enc_labels = ["64 x 64", "32 x 32", "16 x 16", "8 x 8"]
        enc_blocks = []
        enc_label_objs = []

        y_positions = [2.0, 0.7, -0.6, -1.9]
        x_enc = -3.5

        for i, ((w, h), lbl, y) in enumerate(zip(enc_sizes, enc_labels, y_positions)):
            rect = RoundedRectangle(
                corner_radius=0.08,
                width=w,
                height=h,
                stroke_color=block_color,
                fill_color=block_color,
                fill_opacity=0.15,
                stroke_width=3,
            ).move_to(np.array([x_enc, y, 0]))
            label = Text(lbl, font_size=24, color=block_color).next_to(
                rect, LEFT, buff=0.15
            )
            enc_blocks.append(rect)
            enc_label_objs.append(label)

        # Bottleneck
        bottleneck = RoundedRectangle(
            corner_radius=0.08,
            width=0.7,
            height=0.7,
            stroke_color=bottleneck_color,
            fill_color=bottleneck_color,
            fill_opacity=0.15,
            stroke_width=3,
        ).move_to(np.array([0, -2.5, 0]))
        bn_label = Text("4 x 4", font_size=24, color=bottleneck_color).next_to(
            bottleneck, DOWN, buff=0.12
        )

        # Decoder blocks (right side, going up)
        dec_sizes = list(reversed(enc_sizes))
        dec_labels = list(reversed(enc_labels))
        x_dec = 3.5
        dec_blocks = []
        dec_label_objs = []

        for i, ((w, h), lbl, y) in enumerate(
            zip(dec_sizes, dec_labels, reversed(y_positions))
        ):
            rect = RoundedRectangle(
                corner_radius=0.08,
                width=w,
                height=h,
                stroke_color=block_color,
                fill_color=block_color,
                fill_opacity=0.15,
                stroke_width=3,
            ).move_to(np.array([x_dec, y, 0]))
            label = Text(lbl, font_size=24, color=block_color).next_to(
                rect, RIGHT, buff=0.15
            )
            dec_blocks.append(rect)
            dec_label_objs.append(label)

        # Side labels
        enc_title = Text("Encoder", font_size=36, color=BLACK).move_to(
            np.array([x_enc, 3.0, 0])
        )
        dec_title = Text("Decoder", font_size=36, color=BLACK).move_to(
            np.array([x_dec, 3.0, 0])
        )

        # Animate encoder top-to-bottom
        self.play(FadeIn(enc_title))
        for i in range(len(enc_blocks)):
            self.play(FadeIn(enc_blocks[i]), FadeIn(enc_label_objs[i]), run_time=0.5)
            if i < len(enc_blocks) - 1:
                down_arrow = Arrow(
                    enc_blocks[i].get_bottom(),
                    enc_blocks[i + 1].get_top(),
                    buff=0.1,
                    color=BLACK,
                    stroke_width=4.5,
                    max_tip_length_to_length_ratio=0.25,
                )
                self.play(GrowArrow(down_arrow), run_time=0.3)

        # Bottleneck — connect via bottom path
        arr_to_bn = Arrow(
            enc_blocks[-1].get_bottom(),
            bottleneck.get_left(),
            buff=0.1,
            color=BLACK,
            stroke_width=4,
            tip_length=0.15,
            max_tip_length_to_length_ratio=0.15,
        )
        self.play(
            GrowArrow(arr_to_bn), FadeIn(bottleneck), FadeIn(bn_label), run_time=0.5
        )

        # Connect bottleneck to decoder
        arr_from_bn = Arrow(
            bottleneck.get_right(),
            dec_blocks[0].get_bottom(),
            buff=0.1,
            color=BLACK,
            stroke_width=4,
            tip_length=0.15,
            max_tip_length_to_length_ratio=0.15,
        )
        self.play(GrowArrow(arr_from_bn), run_time=0.3)

        # Animate decoder bottom-to-top
        self.play(FadeIn(dec_title))
        for i in range(len(dec_blocks)):
            self.play(FadeIn(dec_blocks[i]), FadeIn(dec_label_objs[i]), run_time=0.5)
            if i < len(dec_blocks) - 1:
                up_arrow = Arrow(
                    dec_blocks[i].get_top(),
                    dec_blocks[i + 1].get_bottom(),
                    buff=0.1,
                    color=BLACK,
                    stroke_width=4.5,
                    max_tip_length_to_length_ratio=0.25,
                )
                self.play(GrowArrow(up_arrow), run_time=0.3)

        # Skip connections — dashed lines above the boxes
        # Offset above box top so lines never cross labels
        for i in range(len(enc_blocks)):
            dec_i = len(dec_blocks) - 1 - i
            enc_tr = enc_blocks[i].get_corner(UR) + RIGHT * 0.1 + UP * 0.2
            dec_tl = dec_blocks[dec_i].get_corner(UL) + LEFT * 0.1 + UP * 0.2
            skip = DashedLine(
                enc_tr,
                dec_tl,
                color=skip_color,
                stroke_width=4.5,
                dash_length=0.15,
            )
            self.play(Create(skip), run_time=0.4)

        skip_label = Text("Skip connections", font_size=32, color=skip_color).move_to(
            np.array([0, 3.3, 0])
        )
        self.play(FadeIn(skip_label))
        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 5: TimestepEmbedding
# ---------------------------------------------------------------------------
class TimestepEmbedding(BaseScene):
    """Scalar timestep -> sinusoidal embedding -> injection into U-Net block."""

    def construct(self):
        title = Title("Timestep Embedding")

        # Timestep value
        t_val = Text("t = 500", font_size=36, color=BLACK).move_to(LEFT * 4.5)

        # Arrow to embedding
        arr1 = Arrow(
            LEFT * 3.3,
            LEFT * 1.5,
            color=BLACK,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.25,
        )
        arr1_label = Text("sinusoidal\nembedding", font_size=28, color=BLACK).next_to(
            arr1, UP, buff=0.2
        )

        # Embedding bars (sin/cos pattern)
        np.random.seed(7)
        d = 8
        t = 500
        embed_vals = []
        for i in range(d):
            freq = 1.0 / (10000 ** (2 * (i // 2) / d))
            if i % 2 == 0:
                embed_vals.append(np.sin(t * freq))
            else:
                embed_vals.append(np.cos(t * freq))

        bars = VGroup()
        bar_w = 0.4
        bar_max_h = 1.8
        for i, v in enumerate(embed_vals):
            h = abs(v) * bar_max_h
            rect = Rectangle(
                width=bar_w,
                height=max(h, 0.05),
                fill_color=BLUE_E if i % 2 == 0 else TEAL_E,
                fill_opacity=0.7,
                stroke_color=BLUE_E if i % 2 == 0 else TEAL_E,
                stroke_width=3,
            )
            rect.move_to(
                np.array(
                    [-0.5 + i * (bar_w + 0.06), 0 + (h / 2 if v >= 0 else -h / 2), 0]
                )
            )
            bars.add(rect)
        bars.move_to(ORIGIN)
        emb_label = MathTex("\\text{emb}(t)", font_size=34, color=BLACK).next_to(
            bars, DOWN, buff=0.35
        )
        sin_lab = Text("sin", font_size=26, color=BLUE_E).move_to(
            bars.get_corner(UL) + UP * 0.35 + LEFT * 0.2
        )
        cos_lab = Text("cos", font_size=26, color=TEAL_E).move_to(
            bars.get_corner(UR) + UP * 0.35 + RIGHT * 0.2
        )

        # U-Net block
        arr2 = Arrow(
            RIGHT * 2.0,
            RIGHT * 3.5,
            color=BLACK,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.25,
        )
        arr2_label = Text(
            "inject into\nU-Net block", font_size=28, color=BLACK
        ).next_to(arr2, UP, buff=0.2)

        unet_block = RoundedRectangle(
            corner_radius=0.15,
            width=1.8,
            height=1.2,
            stroke_color=MAROON_E,
            fill_color=MAROON_E,
            fill_opacity=0.1,
            stroke_width=4,
        ).move_to(RIGHT * 4.8)
        unet_label = Text("U-Net\nBlock", font_size=30, color=MAROON_E).move_to(
            unet_block.get_center()
        )

        plus = MathTex("+", font_size=42, color=GREEN_E).move_to(
            RIGHT * 3.7 + DOWN * 0.5
        )

        self.play(FadeIn(t_val))
        self.play(GrowArrow(arr1), FadeIn(arr1_label), run_time=0.6)
        self.play(FadeIn(bars), FadeIn(emb_label), FadeIn(sin_lab), FadeIn(cos_lab))
        self.play(GrowArrow(arr2), FadeIn(arr2_label), run_time=0.6)
        self.play(FadeIn(unet_block), FadeIn(unet_label), FadeIn(plus))
        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 6: TrainingObjective
# ---------------------------------------------------------------------------
class TrainingObjective(BaseScene):
    """Flowchart of the DDPM training loop."""

    def construct(self):
        title = Title("Training Objective")

        steps = [
            (
                "1.",
                "Sample",
                MathTex(
                    "\\mathbf{x}_0 \\sim q(\\mathbf{x}_0)", font_size=32, color=BLACK
                ),
            ),
            (
                "2.",
                "Sample",
                MathTex("t \\sim \\text{Uniform}(1, T)", font_size=30, color=BLACK),
            ),
            (
                "3.",
                "Sample",
                MathTex(
                    "\\boldsymbol{\\epsilon} \\sim \\mathcal{N}(\\mathbf{0}, \\mathbf{I})",
                    font_size=30,
                    color=BLACK,
                ),
            ),
            (
                "4.",
                "Noise",
                MathTex(
                    "\\mathbf{x}_t = \\sqrt{\\bar{\\alpha}_t}\\,\\mathbf{x}_0 + \\sqrt{1 - \\bar{\\alpha}_t}\\,\\boldsymbol{\\epsilon}",
                    font_size=30,
                    color=BLACK,
                ),
            ),
            (
                "5.",
                "Predict",
                MathTex(
                    "\\hat{\\boldsymbol{\\epsilon}} = \\boldsymbol{\\epsilon}_\\theta(\\mathbf{x}_t, t)",
                    font_size=30,
                    color=BLACK,
                ),
            ),
            (
                "6.",
                "Loss",
                MathTex(
                    "\\mathcal{L} = \\| \\boldsymbol{\\epsilon} - \\hat{\\boldsymbol{\\epsilon}} \\|^2",
                    font_size=32,
                    color=MAROON_E,
                ),
            ),
        ]

        y_start = 2.5
        y_step = -0.95
        boxes = []

        for i, (num, action, eq) in enumerate(steps):
            y = y_start + i * y_step

            num_text = Text(num, font_size=28, color=BLACK).move_to(
                np.array([-5.5, y, 0])
            )
            action_text = Text(action, font_size=28, color=GREEN_E).move_to(
                np.array([-4.2, y, 0])
            )

            box = RoundedRectangle(
                corner_radius=0.1,
                width=7.0,
                height=0.65,
                stroke_color=BLUE_E if i < 5 else MAROON_E,
                fill_color=BLUE_E if i < 5 else MAROON_E,
                fill_opacity=0.05 if i < 5 else 0.12,
                stroke_width=3.5,
            ).move_to(np.array([0.5, y, 0]))
            eq.move_to(box.get_center())

            group = VGroup(num_text, action_text, box, eq)
            boxes.append(group)

        # Animate step by step
        for i, group in enumerate(boxes):
            self.play(FadeIn(group), run_time=0.6)
            if i < len(boxes) - 1:
                arrow = Arrow(
                    group[2].get_bottom() + DOWN * 0.02,
                    np.array([0.5, y_start + (i + 1) * y_step + 0.35, 0]),
                    buff=0,
                    color=BLACK,
                    stroke_width=5,
                    tip_length=0.15,
                    max_tip_length_to_length_ratio=0.6,
                    max_stroke_width_to_length_ratio=20,
                )
                self.play(GrowArrow(arrow), run_time=0.25)

        # Highlight key insight
        insight = Text(
            '"Predict the noise that was added"', font_size=28, color=MAROON_E
        )
        insight.next_to(boxes[-1][2], DOWN, buff=0.5)
        self.play(FadeIn(insight))
        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 7: SimplifiedLoss
# ---------------------------------------------------------------------------
class SimplifiedLoss(BaseScene):
    """Step-by-step simplification from ELBO to simple MSE loss."""

    def construct(self):
        title = Title("Simplified Loss")

        eq1 = MathTex(
            r"\mathcal{L}_{\text{ELBO}} = \sum_{t=1}^{T} \mathbb{E}_q \left[ D_{\text{KL}}(q(\mathbf{x}_{t-1} | \mathbf{x}_t, \mathbf{x}_0) \| p_\theta(\mathbf{x}_{t-1} | \mathbf{x}_t)) \right]",
            font_size=30,
            color=BLACK,
        ).move_to(UP * 2)

        label1 = Text("Full ELBO (complex)", font_size=28, color=BLACK).next_to(
            eq1, RIGHT, buff=0.3
        )

        eq2 = MathTex(
            r"\propto \sum_{t=1}^{T} \mathbb{E} \left[ \| \boldsymbol{\mu}_t - \boldsymbol{\mu}_\theta(\mathbf{x}_t, t) \|^2 \right]",
            font_size=30,
            color=BLACK,
        ).move_to(UP * 0.5)

        label2 = Text("Reparameterize means", font_size=28, color=BLACK).next_to(
            eq2, RIGHT, buff=0.3
        )

        eq3 = MathTex(
            r"= \sum_{t=1}^{T} \gamma_t \, \mathbb{E} \left[ \| \boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t) \|^2 \right]",
            font_size=30,
            color=BLACK,
        ).move_to(DOWN * 1.0)

        label3 = Text("Predict noise instead", font_size=28, color=BLACK).next_to(
            eq3, RIGHT, buff=0.3
        )

        eq4 = MathTex(
            r"\mathcal{L}_{\text{simple}} = \mathbb{E}_{t, \mathbf{x}_0, \boldsymbol{\epsilon}} \left[ \| \boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t) \|^2 \right]",
            font_size=34,
            color=MAROON_E,
        ).move_to(DOWN * 2.5)

        label4 = Text("Drop weights (Ho et al.)", font_size=28, color=MAROON_E).next_to(
            eq4, RIGHT, buff=0.3
        )

        box = SurroundingRectangle(eq4, color=MAROON_E, buff=0.15, stroke_width=4)

        # Arrows between steps
        self.play(FadeIn(eq1), FadeIn(label1))
        self.wait(0.5)

        arr1 = Arrow(
            eq1.get_bottom(),
            eq2.get_top(),
            buff=0.15,
            color=BLACK,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.3,
        )
        self.play(GrowArrow(arr1), FadeIn(eq2), FadeIn(label2), run_time=0.8)
        self.wait(0.3)

        arr2 = Arrow(
            eq2.get_bottom(),
            eq3.get_top(),
            buff=0.15,
            color=BLACK,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.3,
        )
        self.play(GrowArrow(arr2), FadeIn(eq3), FadeIn(label3), run_time=0.8)
        self.wait(0.3)

        arr3 = Arrow(
            eq3.get_bottom(),
            eq4.get_top(),
            buff=0.15,
            color=BLACK,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.3,
        )
        self.play(
            GrowArrow(arr3), FadeIn(eq4), FadeIn(label4), Create(box), run_time=0.8
        )

        final_note = Text(
            "Just MSE between true and predicted noise!", font_size=28, color=GREEN_E
        )
        final_note.next_to(box, DOWN, buff=0.3)
        self.play(FadeIn(final_note))
        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 8: ScoreMatching
# ---------------------------------------------------------------------------
class ScoreMatching(BaseScene):
    """2D vector field pointing toward a Gaussian mode (score function)."""

    def construct(self):
        np.random.seed(42)
        title = Title("Score Matching")

        # Draw a subtle Gaussian density
        center = np.array([0.0, 0.0])
        sigma = 1.5

        # Background dots representing density
        dots = VGroup()
        for _ in range(200):
            x, y = np.random.randn(2) * sigma * 0.7
            r = np.sqrt(x**2 + y**2)
            opacity = max(0.08, np.exp(-(r**2) / (2 * sigma**2)) * 0.5)
            dot = Dot(
                point=np.array([x, y, 0]),
                radius=0.06,
                color=BLUE_E,
                fill_opacity=opacity,
            )
            dots.add(dot)

        self.play(FadeIn(dots), run_time=0.8)

        # Vector field: arrows pointing toward center (score = grad log p)
        arrows = VGroup()
        for gx in np.linspace(-3.5, 3.5, 9):
            for gy in np.linspace(-2.5, 2.5, 7):
                if abs(gx) < 0.5 and abs(gy) < 0.5:
                    continue
                pt = np.array([gx, gy, 0])
                direction = center - pt[:2]
                dist = np.linalg.norm(direction)
                if dist < 0.1:
                    continue
                direction = direction / dist
                magnitude = min(0.6, 1.0 / (dist + 0.3))

                arrow = Arrow(
                    start=pt,
                    end=pt + np.array([direction[0], direction[1], 0]) * magnitude,
                    buff=0,
                    color=MAROON_E,
                    stroke_width=3.5,
                    max_tip_length_to_length_ratio=0.35,
                    max_stroke_width_to_length_ratio=12,
                )
                arrows.add(arrow)

        # Animate arrows appearing from outside in
        outer = [a for a in arrows if np.linalg.norm(a.get_start()[:2]) > 2.0]
        inner = [a for a in arrows if np.linalg.norm(a.get_start()[:2]) <= 2.0]

        if outer:
            self.play(*[GrowArrow(a) for a in outer], run_time=0.8)
        if inner:
            self.play(*[GrowArrow(a) for a in inner], run_time=0.8)

        # Label
        score_label = MathTex(
            r"\nabla_{\mathbf{x}} \log p(\mathbf{x})",
            font_size=36,
            color=MAROON_E,
        ).move_to(UP * 3.2)
        subtitle = Text(
            "Score function: points toward high-probability regions",
            font_size=26,
            color=BLACK,
        )
        subtitle.next_to(score_label, DOWN, buff=0.2)

        self.play(FadeIn(score_label), FadeIn(subtitle))
        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 9: SamplingProcess
# ---------------------------------------------------------------------------
class SamplingProcess(BaseScene):
    """DDPM sampling algorithm as a step-by-step timeline."""

    def construct(self):
        title = Title("Sampling Process")

        # Timeline
        n_shown = 5  # Show 5 representative steps
        step_labels = ["t = T", "t = 750", "t = 500", "t = 250", "t = 0"]
        x_positions = np.linspace(-5.0, 5.0, n_shown)

        # Progress circles with color gradient from red (noise) to green (clean)
        circles = []
        labels = []
        for i, (x, sl) in enumerate(zip(x_positions, step_labels)):
            blend = i / (n_shown - 1)
            col = interpolate_color(MAROON_E, GREEN_E, blend)
            circ = Circle(
                radius=0.55,
                stroke_color=col,
                fill_color=col,
                fill_opacity=0.15,
                stroke_width=3,
            ).move_to(np.array([x, 0.5, 0]))

            inner_label = MathTex(f"\\mathbf{{x}}", font_size=32, color=col).move_to(
                circ.get_center()
            )
            step_text = Text(sl, font_size=28, color=BLACK).next_to(
                circ, DOWN, buff=0.25
            )

            circles.append(circ)
            labels.append(VGroup(inner_label, step_text))

        # Top: algorithm steps
        algo_lines = [
            MathTex(
                r"\text{1. Sample } \mathbf{x}_T \sim \mathcal{N}(\mathbf{0}, \mathbf{I})",
                font_size=28,
                color=BLACK,
            ),
            MathTex(r"\text{2. For } t = T \text{ to } 1:", font_size=26, color=BLACK),
            MathTex(
                r"\quad \hat{\boldsymbol{\epsilon}} = \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)",
                font_size=28,
                color=TEAL_E,
            ),
            MathTex(
                r"\quad \mathbf{x}_{t-1} = \text{denoise}(\mathbf{x}_t, \hat{\boldsymbol{\epsilon}}, t)",
                font_size=28,
                color=TEAL_E,
            ),
            MathTex(r"\text{3. Return } \mathbf{x}_0", font_size=28, color=GREEN_E),
        ]

        algo_group = VGroup(*algo_lines).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        algo_group.move_to(UP * 2.5)

        for line in algo_lines:
            self.play(FadeIn(line), run_time=0.4)

        self.wait(0.3)

        # Show timeline
        self.play(FadeIn(circles[0]), FadeIn(labels[0]))
        for i in range(1, n_shown):
            arrow = Arrow(
                circles[i - 1].get_right(),
                circles[i].get_left(),
                buff=0.1,
                color=BLACK,
                stroke_width=5,
                max_tip_length_to_length_ratio=0.3,
            )
            denoise_label = MathTex(
                "\\epsilon_\\theta", font_size=28, color=TEAL_E
            ).next_to(arrow, UP, buff=0.1)
            self.play(
                GrowArrow(arrow),
                FadeIn(denoise_label),
                FadeIn(circles[i]),
                FadeIn(labels[i]),
                run_time=0.6,
            )

        # Final label
        noise_label = Text("Pure noise", font_size=28, color=MAROON_E).next_to(
            circles[0], UP, buff=0.25
        )
        clean_label = Text("Clean sample", font_size=28, color=GREEN_E).next_to(
            circles[-1], UP, buff=0.25
        )
        self.play(FadeIn(noise_label), FadeIn(clean_label))
        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 10: DiffusionVsTransformer
# ---------------------------------------------------------------------------
class DiffusionVsTransformer(BaseScene):
    """Side-by-side comparison of autoregressive vs diffusion generation."""

    def construct(self):
        title = Title("Diffusion vs Transformer")

        # Dividing line
        div_line = DashedLine(UP * 3.5, DOWN * 3.5, color=GREY_C, stroke_width=3.5)

        # Left: Autoregressive
        left_title = Text("Autoregressive", font_size=34, color=BLUE_E).move_to(
            LEFT * 3.5 + UP * 2.8
        )
        left_sub = Text("(Transformer)", font_size=28, color=BLACK).next_to(
            left_title, DOWN, buff=0.1
        )

        # Token boxes appearing one at a time
        tokens = ["The", "cat", "sat", "on", "the", "mat"]
        token_boxes = VGroup()
        for i, tok in enumerate(tokens):
            box = RoundedRectangle(
                corner_radius=0.06,
                width=0.85,
                height=0.5,
                stroke_color=BLUE_E,
                fill_color=BLUE_E,
                fill_opacity=0.1,
                stroke_width=3.5,
            )
            txt = Text(tok, font_size=28, color=BLUE_E)
            grp = VGroup(box, txt)
            grp.move_to(LEFT * 5.2 + RIGHT * i * 0.95 + UP * 0.5)
            token_boxes.add(grp)

        left_arrow_label = Text(
            "Sequential (left to right)", font_size=28, color=BLUE_E
        )
        left_arrow_label.move_to(LEFT * 3.5 + DOWN * 0.5)

        # Right: Diffusion
        right_title = Text("Diffusion", font_size=34, color=GREEN_E).move_to(
            RIGHT * 3.5 + UP * 2.8
        )
        right_sub = Text("(Iterative refinement)", font_size=28, color=BLACK).next_to(
            right_title, DOWN, buff=0.1
        )

        # Grid that denoises all at once
        np.random.seed(99)
        grid_size = 4
        cell = 0.5
        gap = 0.05

        def make_noise_grid(noise_level):
            squares = VGroup()
            for r in range(grid_size):
                for c in range(grid_size):
                    target_color = np.array([0.2, 0.55, 0.85])
                    noise = np.random.randn(3) * noise_level * 0.3
                    grey = np.array([0.5, 0.5, 0.5])
                    col = (1 - noise_level) * target_color + noise_level * grey + noise
                    col = col.clip(0, 1)
                    sq = Square(side_length=cell)
                    sq.set_fill(rgb_to_color(col), opacity=1)
                    sq.set_stroke(GREY_B, width=1.5)
                    sq.move_to(
                        np.array(
                            [
                                c * (cell + gap) - (grid_size - 1) * (cell + gap) / 2,
                                -(
                                    r * (cell + gap)
                                    - (grid_size - 1) * (cell + gap) / 2
                                ),
                                0,
                            ]
                        )
                    )
                    squares.add(sq)
            return squares

        noise_levels = [1.0, 0.6, 0.3, 0.0]
        diff_grids = []
        for nl in noise_levels:
            g = make_noise_grid(nl)
            g.scale(0.7)
            diff_grids.append(g)

        # Position diffusion grids vertically
        diff_x = RIGHT * 3.5
        for i, g in enumerate(diff_grids):
            g.move_to(diff_x + DOWN * (i * 1.1 - 0.8))

        right_arrow_label = Text("All at once (iterative)", font_size=28, color=GREEN_E)
        right_arrow_label.next_to(diff_grids[-1], DOWN, buff=0.35)

        # Animate
        self.play(
            FadeIn(div_line),
            FadeIn(left_title),
            FadeIn(left_sub),
            FadeIn(right_title),
            FadeIn(right_sub),
        )

        # Left: tokens one at a time
        for i, tb in enumerate(token_boxes):
            self.play(FadeIn(tb), run_time=0.35)

        self.play(FadeIn(left_arrow_label))

        # Right: grids refining
        for i, g in enumerate(diff_grids):
            self.play(FadeIn(g), run_time=0.5)
            if i < len(diff_grids) - 1:
                arr = Arrow(
                    g.get_bottom(),
                    diff_grids[i + 1].get_top(),
                    buff=0.08,
                    color=GREEN_E,
                    stroke_width=5,
                    max_tip_length_to_length_ratio=0.3,
                )
                self.play(GrowArrow(arr), run_time=0.3)

        self.play(FadeIn(right_arrow_label))
        self.wait(1.5)
