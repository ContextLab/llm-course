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
            axes.c2p(700, 0.50)
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
            nn_text = MathTex("\\epsilon_\\theta", font_size=28, color=TEAL_E)
            mid = (grids[i - 1].get_right() + grids[i].get_left()) / 2
            nn_text.move_to(mid + UP * 0.65)

            arrow = Arrow(
                grids[i - 1].get_right() + RIGHT * 0.05,
                grids[i].get_left() + LEFT * 0.05,
                buff=0.05,
                color=BLACK,
                stroke_width=5,
                max_tip_length_to_length_ratio=0.35,
            )
            self.play(
                GrowArrow(arrow),
                FadeIn(nn_text),
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

        # Bottleneck — connect from side of 8x8 block to bottleneck
        arr_to_bn = Arrow(
            enc_blocks[-1].get_right(),
            bottleneck.get_left(),
            buff=0.1,
            color=BLACK,
            stroke_width=4.5,
            max_tip_length_to_length_ratio=0.25,
        )
        self.play(
            GrowArrow(arr_to_bn), FadeIn(bottleneck), FadeIn(bn_label), run_time=0.5
        )

        # Connect bottleneck to decoder (side of decoder 8x8 block)
        arr_from_bn = Arrow(
            bottleneck.get_right(),
            dec_blocks[0].get_left(),
            buff=0.1,
            color=BLACK,
            stroke_width=4.5,
            max_tip_length_to_length_ratio=0.25,
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

        # Skip connections — dashed lines with small arrow tips on both ends
        for i in range(len(enc_blocks)):
            dec_i = len(dec_blocks) - 1 - i
            enc_right = enc_blocks[i].get_right()
            dec_left = dec_blocks[dec_i].get_left()
            # Use DashedLine for the skip connection
            skip_line = DashedLine(
                enc_right + RIGHT * 0.1,
                dec_left + LEFT * 0.1,
                color=skip_color,
                stroke_width=4.5,
                dash_length=0.15,
            )
            # Small triangle tips at each end
            tip_size = 0.12
            left_tip = (
                Triangle(
                    fill_color=skip_color,
                    fill_opacity=1,
                    stroke_width=0,
                )
                .scale(tip_size)
                .rotate(-PI / 2)
                .move_to(enc_right + RIGHT * 0.1)
            )
            right_tip = (
                Triangle(
                    fill_color=skip_color,
                    fill_opacity=1,
                    stroke_width=0,
                )
                .scale(tip_size)
                .rotate(PI / 2)
                .move_to(dec_left + LEFT * 0.1)
            )
            skip = VGroup(left_tip, skip_line, right_tip)
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

        # --- Left: timestep value ---
        t_val = Text("t = 500", font_size=40, color=BLACK).move_to(LEFT * 5.5)

        # Arrow from t to plot
        arr1 = Arrow(
            LEFT * 4.4,
            LEFT * 3.0,
            color=BLACK,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.25,
        )

        # --- Center: sinusoidal embedding plot ---
        d_model = 64
        t = 500
        dims = np.arange(d_model)
        freqs = 1.0 / (10000 ** (2 * (dims // 2) / d_model))
        sin_vals = np.sin(t * freqs[::2])
        cos_vals = np.cos(t * freqs[1::2])

        axes = Axes(
            x_range=[0, d_model, 32],
            y_range=[-1.1, 1.1, 1.0],
            x_length=3.6,
            y_length=2.4,
            axis_config={"color": BLACK, "include_numbers": False, "font_size": 18},
            tips=False,
        ).move_to(LEFT * 0.5 + UP * 0.6)

        # Plot sin and cos as smooth line graphs
        sin_x = list(range(0, d_model, 2))
        cos_x = list(range(1, d_model, 2))

        sin_graph = axes.plot_line_graph(
            x_values=sin_x,
            y_values=sin_vals.tolist(),
            line_color=BLUE_E,
            add_vertex_dots=False,
            stroke_width=3.5,
        )
        cos_graph = axes.plot_line_graph(
            x_values=cos_x,
            y_values=cos_vals.tolist(),
            line_color=TEAL_E,
            add_vertex_dots=False,
            stroke_width=3.5,
        )

        # Labels below the axes at fixed positions (absolute)
        x_label = Text("Dimension", font_size=20, color=BLACK).move_to(
            np.array([-0.5, -1.2, 0])
        )
        sin_label = Text("sin", font_size=22, color=BLUE_E)
        cos_label = Text("cos", font_size=22, color=TEAL_E)
        legend = VGroup(sin_label, cos_label).arrange(RIGHT, buff=0.5)
        legend.move_to(np.array([-0.2, -1.5, 0]))

        emb_label = MathTex("\\text{emb}(t)", font_size=28, color=BLACK).move_to(
            np.array([-0.2, -2.0, 0])
        )

        formula = MathTex(
            r"\sin\!\left(\frac{t}{10000^{2i/d}}\right),\;\cos\!\left(\frac{t}{10000^{2i/d}}\right)",
            font_size=22,
            color=BLACK,
        ).move_to(np.array([-0.2, 2.4, 0]))

        # --- Right: arrow to U-Net block ---
        arr2 = Arrow(
            RIGHT * 1.8,
            RIGHT * 3.2,
            color=BLACK,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.25,
        )
        arr2_label = Text("inject", font_size=22, color=BLACK).next_to(
            arr2, UP, buff=0.08
        )

        unet_block = RoundedRectangle(
            corner_radius=0.15,
            width=1.8,
            height=1.0,
            stroke_color=MAROON_E,
            fill_color=MAROON_E,
            fill_opacity=0.1,
            stroke_width=4,
        ).move_to(RIGHT * 4.6)
        unet_label = Text("U-Net Block", font_size=24, color=MAROON_E).move_to(
            unet_block.get_center()
        )

        plus = MathTex("+", font_size=34, color=GREEN_E).move_to(
            RIGHT * 3.4 + DOWN * 0.4
        )

        # --- Animate ---
        self.play(FadeIn(t_val))
        self.play(GrowArrow(arr1), run_time=0.5)
        self.play(Create(axes), FadeIn(x_label), FadeIn(formula), run_time=0.8)
        self.play(
            Create(sin_graph),
            run_time=0.8,
        )
        self.play(
            Create(cos_graph),
            run_time=0.8,
        )
        self.play(FadeIn(legend), FadeIn(emb_label))
        self.play(GrowArrow(arr2), FadeIn(arr2_label), run_time=0.5)
        self.play(FadeIn(unet_block), FadeIn(unet_label), FadeIn(plus))
        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 6: TrainingObjective
# ---------------------------------------------------------------------------
class TrainingObjective(BaseScene):
    """Training loop with matrix grids alongside equations."""

    def _make_grid(self, img_data, grid_size=6, cell=0.28, gap=0.04):
        """Create a small colored grid from img_data (grid_size x grid_size x 3)."""
        squares = VGroup()
        for r in range(grid_size):
            for c in range(grid_size):
                col = img_data[r, c].clip(0, 1)
                sq = Square(side_length=cell)
                sq.set_fill(rgb_to_color(col), opacity=1)
                sq.set_stroke(GREY_B, width=1)
                sq.move_to(
                    np.array(
                        [
                            c * (cell + gap) - (grid_size - 1) * (cell + gap) / 2,
                            -(r * (cell + gap) - (grid_size - 1) * (cell + gap) / 2),
                            0,
                        ]
                    )
                )
                squares.add(sq)
        return squares

    def construct(self):
        title = Title("Training Objective")
        np.random.seed(42)
        gs = 6

        # Build image data for each step
        clean = np.ones((gs, gs, 3)) * np.array([0.2, 0.55, 0.85])
        for r, c in [(1, 1), (1, 4)]:
            clean[r, c] = np.array([0.1, 0.15, 0.3])
        for r, c in [(4, 1), (4, 2), (4, 3), (4, 4), (3, 0), (3, 5)]:
            if r < gs and c < gs:
                clean[r, c] = np.array([0.1, 0.15, 0.3])

        noise_pure = np.random.rand(gs, gs, 3) * 0.6 + 0.2
        alpha_bar = 0.5
        noisy = np.sqrt(alpha_bar) * clean + np.sqrt(1 - alpha_bar) * noise_pure
        noisy = noisy.clip(0, 1)

        # Predicted noise (slightly different from true noise)
        pred_noise = noise_pure + np.random.randn(gs, gs, 3) * 0.08
        pred_noise = pred_noise.clip(0, 1)

        # Steps: (number, label, equation, grid_data_or_None)
        steps = [
            (
                "1",
                "Sample x\u2080",
                MathTex(
                    r"\mathbf{x}_0 \sim q(\mathbf{x}_0)",
                    font_size=28,
                    color=BLACK,
                ),
                clean,
            ),
            (
                "2",
                "Sample noise",
                MathTex(
                    r"\boldsymbol{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})",
                    font_size=28,
                    color=BLACK,
                ),
                noise_pure,
            ),
            (
                "3",
                "Add noise",
                MathTex(
                    r"\mathbf{x}_t = \sqrt{\bar{\alpha}_t}\,\mathbf{x}_0 + \sqrt{1-\bar{\alpha}_t}\,\boldsymbol{\epsilon}",
                    font_size=26,
                    color=BLACK,
                ),
                noisy,
            ),
            (
                "4",
                "Predict",
                MathTex(
                    r"\hat{\boldsymbol{\epsilon}} = \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)",
                    font_size=28,
                    color=BLACK,
                ),
                pred_noise,
            ),
            (
                "5",
                "Loss",
                MathTex(
                    r"\mathcal{L} = \| \boldsymbol{\epsilon} - \hat{\boldsymbol{\epsilon}} \|^2",
                    font_size=30,
                    color=MAROON_E,
                ),
                None,
            ),
        ]

        y_start = 2.5
        y_step = -1.15
        prev_group = None

        for i, (num, label, eq, grid_data) in enumerate(steps):
            y = y_start + i * y_step

            num_text = Text(num, font_size=26, color=BLACK).move_to(
                np.array([-6.0, y, 0])
            )
            label_text = Text(label, font_size=24, color=GREEN_E).move_to(
                np.array([-4.5, y, 0])
            )

            box_color = BLUE_E if i < 4 else MAROON_E
            box = RoundedRectangle(
                corner_radius=0.1,
                width=5.5,
                height=0.7,
                stroke_color=box_color,
                fill_color=box_color,
                fill_opacity=0.05 if i < 4 else 0.12,
                stroke_width=3,
            ).move_to(np.array([-0.3, y, 0]))
            eq.move_to(box.get_center())

            parts = [num_text, label_text, box, eq]

            if grid_data is not None:
                grid = self._make_grid(grid_data, grid_size=gs)
                grid.scale(0.38).move_to(np.array([4.5, y, 0]))
                parts.append(grid)

            group = VGroup(*parts)

            if prev_group is not None:
                arrow = Arrow(
                    prev_group[2].get_bottom() + DOWN * 0.02,
                    box.get_top() + UP * 0.02,
                    buff=0,
                    color=BLACK,
                    stroke_width=4,
                    tip_length=0.12,
                    max_tip_length_to_length_ratio=0.5,
                    max_stroke_width_to_length_ratio=20,
                )
                self.play(GrowArrow(arrow), run_time=0.2)

            self.play(FadeIn(group), run_time=0.6)
            prev_group = group

        # Insight
        insight = Text(
            '"Predict the noise that was added"', font_size=26, color=MAROON_E
        ).move_to(np.array([0, y_start + len(steps) * y_step + 0.1, 0]))
        self.play(FadeIn(insight))
        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 7: SimplifiedLoss
# ---------------------------------------------------------------------------
class SimplifiedLoss(BaseScene):
    """Visual MSE pipeline: true noise vs predicted noise -> difference -> squared -> loss."""

    def _make_grid(self, img_data, grid_size=4, cell=0.38, gap=0.05):
        """Create a small colored grid from img_data (grid_size x grid_size x 3)."""
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
                            -(r * (cell + gap) - (grid_size - 1) * (cell + gap) / 2),
                            0,
                        ]
                    )
                )
                squares.add(sq)
        return squares

    def construct(self):
        title = Title("Simplified Loss")
        np.random.seed(7)
        gs = 4

        # True noise
        eps = np.random.rand(gs, gs, 3) * 0.7 + 0.15
        # Predicted noise (close but not identical)
        eps_hat = eps + np.random.randn(gs, gs, 3) * 0.12
        eps_hat = eps_hat.clip(0, 1)
        # Difference (shift to 0.5 baseline so negative values are visible)
        diff = eps - eps_hat
        diff_vis = 0.5 + diff * 2.0
        diff_vis = diff_vis.clip(0, 1)
        # Squared difference
        sq_diff = diff**2
        sq_vis = sq_diff / sq_diff.max()  # normalize for visibility
        sq_vis = sq_vis.clip(0, 1)

        # --- Top row: equation derivation (compact) ---
        eq_simple = MathTex(
            r"\mathcal{L}_{\text{simple}} = \mathbb{E}\!\left[\,"
            r"\| \boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta \|^2"
            r"\,\right]",
            font_size=32,
            color=MAROON_E,
        ).move_to(UP * 3.0)
        eq_box = SurroundingRectangle(
            eq_simple, color=MAROON_E, buff=0.12, stroke_width=3
        )

        self.play(FadeIn(eq_simple), Create(eq_box), run_time=0.8)

        # --- Visual pipeline ---
        y_row = 0.3

        # True noise grid
        eps_grid = self._make_grid(eps, grid_size=gs).scale(0.7)
        eps_grid.move_to(np.array([-5.0, y_row, 0]))
        eps_label = MathTex(
            r"\boldsymbol{\epsilon}", font_size=30, color=BLACK
        ).next_to(eps_grid, UP, buff=0.2)
        eps_desc = Text("True noise", font_size=22, color=BLACK).next_to(
            eps_grid, DOWN, buff=0.2
        )

        # Predicted noise grid
        eps_hat_grid = self._make_grid(eps_hat, grid_size=gs).scale(0.7)
        eps_hat_grid.move_to(np.array([-2.2, y_row, 0]))
        eps_hat_label = MathTex(
            r"\boldsymbol{\epsilon}_\theta", font_size=30, color=TEAL_E
        ).next_to(eps_hat_grid, UP, buff=0.2)
        eps_hat_desc = Text("Predicted", font_size=22, color=TEAL_E).next_to(
            eps_hat_grid, DOWN, buff=0.2
        )

        # Minus sign
        minus = MathTex("-", font_size=36, color=BLACK).move_to(
            np.array([-3.6, y_row, 0])
        )

        self.play(
            FadeIn(eps_grid),
            FadeIn(eps_label),
            FadeIn(eps_desc),
            run_time=0.6,
        )
        self.play(FadeIn(minus), run_time=0.3)
        self.play(
            FadeIn(eps_hat_grid),
            FadeIn(eps_hat_label),
            FadeIn(eps_hat_desc),
            run_time=0.6,
        )

        # Arrow to difference
        arr1 = Arrow(
            np.array([-1.3, y_row, 0]),
            np.array([-0.2, y_row, 0]),
            color=BLACK,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.3,
        )
        self.play(GrowArrow(arr1), run_time=0.4)

        # Difference grid
        diff_grid = self._make_grid(diff_vis, grid_size=gs).scale(0.7)
        diff_grid.move_to(np.array([0.9, y_row, 0]))
        diff_label = MathTex(
            r"\boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta",
            font_size=26,
            color=BLACK,
        ).next_to(diff_grid, UP, buff=0.2)
        diff_desc = Text("Difference", font_size=22, color=BLACK).next_to(
            diff_grid, DOWN, buff=0.2
        )

        self.play(
            FadeIn(diff_grid),
            FadeIn(diff_label),
            FadeIn(diff_desc),
            run_time=0.6,
        )

        # Arrow to squared
        arr2 = Arrow(
            np.array([1.9, y_row, 0]),
            np.array([3.0, y_row, 0]),
            color=BLACK,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.3,
        )
        sq_symbol = MathTex("(\\cdot)^2", font_size=24, color=BLACK).next_to(
            arr2, UP, buff=0.08
        )
        self.play(GrowArrow(arr2), FadeIn(sq_symbol), run_time=0.4)

        # Squared diff grid
        sq_grid = self._make_grid(sq_vis, grid_size=gs).scale(0.7)
        sq_grid.move_to(np.array([4.1, y_row, 0]))
        sq_label = MathTex(
            r"(\boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta)^2",
            font_size=24,
            color=BLACK,
        ).next_to(sq_grid, UP, buff=0.2)
        sq_desc = Text("Squared", font_size=22, color=BLACK).next_to(
            sq_grid, DOWN, buff=0.2
        )

        self.play(
            FadeIn(sq_grid),
            FadeIn(sq_label),
            FadeIn(sq_desc),
            run_time=0.6,
        )

        # Arrow to scalar loss
        arr3 = Arrow(
            np.array([5.1, y_row, 0]),
            np.array([6.0, y_row, 0]),
            color=BLACK,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.3,
        )
        mean_sym = Text("mean", font_size=20, color=BLACK).next_to(arr3, UP, buff=0.08)
        self.play(GrowArrow(arr3), FadeIn(mean_sym), run_time=0.4)

        # Scalar loss value
        loss_val = float(np.mean(sq_diff))
        loss_text = MathTex(
            f"\\mathcal{{L}} = {loss_val:.3f}",
            font_size=34,
            color=MAROON_E,
        ).move_to(np.array([6.3, y_row, 0]))
        loss_box = SurroundingRectangle(
            loss_text, color=MAROON_E, buff=0.1, stroke_width=3
        )

        self.play(FadeIn(loss_text), Create(loss_box), run_time=0.6)

        # Bottom note
        note = Text(
            "Just MSE between true and predicted noise!",
            font_size=26,
            color=GREEN_E,
        ).move_to(DOWN * 2.5)
        self.play(FadeIn(note))
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
                magnitude = 0.45

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

        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 9: SamplingProcess
# ---------------------------------------------------------------------------
class SamplingProcess(BaseScene):
    """DDPM sampling: timeline of matrix grids from noise to clean image."""

    def _make_grid(self, img_data, grid_size=6, cell=0.3, gap=0.04):
        """Create a small colored grid."""
        squares = VGroup()
        for r in range(grid_size):
            for c in range(grid_size):
                col = img_data[r, c].clip(0, 1)
                sq = Square(side_length=cell)
                sq.set_fill(rgb_to_color(col), opacity=1)
                sq.set_stroke(GREY_B, width=1)
                sq.move_to(
                    np.array(
                        [
                            c * (cell + gap) - (grid_size - 1) * (cell + gap) / 2,
                            -(r * (cell + gap) - (grid_size - 1) * (cell + gap) / 2),
                            0,
                        ]
                    )
                )
                squares.add(sq)
        return squares

    def construct(self):
        title = Title("Sampling Process")
        np.random.seed(42)
        gs = 6

        # Clean smiley target
        clean = np.ones((gs, gs, 3)) * np.array([0.2, 0.55, 0.85])
        for r, c in [(1, 1), (1, 4)]:
            clean[r, c] = np.array([0.1, 0.15, 0.3])
        for r, c in [(4, 1), (4, 2), (4, 3), (4, 4), (3, 0), (3, 5)]:
            if r < gs and c < gs:
                clean[r, c] = np.array([0.1, 0.15, 0.3])

        # Generate images from pure noise to clean
        n_shown = 5
        step_labels = ["t = T", "t = 750", "t = 500", "t = 250", "t = 0"]
        images = []
        for i in range(n_shown):
            blend = i / (n_shown - 1)
            grey_noise = np.random.rand(gs, gs, 3) * 0.4 + 0.3
            noise = np.random.randn(gs, gs, 3) * 0.12 * (1 - blend)
            img = (1 - blend) * grey_noise + blend * clean + noise
            images.append(img.clip(0, 1))

        # --- Top: compact algorithm pseudo-code ---
        algo_lines = [
            MathTex(
                r"\text{1. Sample } \mathbf{x}_T \sim \mathcal{N}(\mathbf{0}, \mathbf{I})",
                font_size=24,
                color=BLACK,
            ),
            MathTex(
                r"\text{2. For } t = T \text{ to } 1: \quad"
                r"\hat{\boldsymbol{\epsilon}} = \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t),"
                r"\quad \mathbf{x}_{t-1} = \text{denoise}(\mathbf{x}_t, \hat{\boldsymbol{\epsilon}}, t)",
                font_size=24,
                color=TEAL_E,
            ),
            MathTex(
                r"\text{3. Return } \mathbf{x}_0",
                font_size=24,
                color=GREEN_E,
            ),
        ]

        algo_group = VGroup(*algo_lines).arrange(DOWN, aligned_edge=LEFT, buff=0.15)
        algo_group.move_to(UP * 2.8)

        for line in algo_lines:
            self.play(FadeIn(line), run_time=0.35)

        # --- Bottom: grid timeline ---
        x_positions = np.linspace(-5.0, 5.0, n_shown)
        y_row = -0.5

        grids = []
        for i, (x, img, sl) in enumerate(zip(x_positions, images, step_labels)):
            grid = self._make_grid(img, grid_size=gs).scale(0.42)
            grid.move_to(np.array([x, y_row, 0]))
            grids.append(grid)

        # Show first grid
        first_label = Text(step_labels[0], font_size=24, color=BLACK).next_to(
            grids[0], DOWN, buff=0.2
        )
        noise_tag = Text("Pure noise", font_size=22, color=MAROON_E).next_to(
            grids[0], UP, buff=0.15
        )
        self.play(FadeIn(grids[0]), FadeIn(first_label), FadeIn(noise_tag))

        # Remaining grids with arrows
        for i in range(1, n_shown):
            arrow = Arrow(
                grids[i - 1].get_right(),
                grids[i].get_left(),
                buff=0.08,
                color=BLACK,
                stroke_width=4,
                max_tip_length_to_length_ratio=0.3,
            )
            denoise_label = MathTex(
                r"\epsilon_\theta", font_size=24, color=TEAL_E
            ).next_to(arrow, UP, buff=0.06)
            sl_text = Text(step_labels[i], font_size=24, color=BLACK).next_to(
                grids[i], DOWN, buff=0.2
            )

            parts = [
                GrowArrow(arrow),
                FadeIn(denoise_label),
                FadeIn(grids[i]),
                FadeIn(sl_text),
            ]

            # Add "Clean sample" tag on last grid
            if i == n_shown - 1:
                clean_tag = Text("Clean sample", font_size=22, color=GREEN_E).next_to(
                    grids[i], UP, buff=0.15
                )
                parts.append(FadeIn(clean_tag))

            self.play(*parts, run_time=0.6)

        self.wait(1.5)


# ---------------------------------------------------------------------------
# Scene 10: DiffusionVsTransformer
# ---------------------------------------------------------------------------
class DiffusionVsTransformer(BaseScene):
    """Text diffusion (MDLM-style mask-then-unmask) vs autoregressive generation."""

    def _make_token_box(self, text, color, fill_opacity=0.1, font_size=26, width=0.85):
        """Create a rounded box with text inside."""
        box = RoundedRectangle(
            corner_radius=0.06,
            width=width,
            height=0.48,
            stroke_color=color,
            fill_color=color,
            fill_opacity=fill_opacity,
            stroke_width=3,
        )
        txt = Text(text, font_size=font_size, color=color)
        return VGroup(box, txt)

    def construct(self):
        title = Title("Diffusion vs Transformer")

        tokens = ["The", "cat", "sat", "on", "the", "mat"]
        n_tok = len(tokens)

        # Dividing line
        div_line = DashedLine(UP * 3.5, DOWN * 3.5, color=GREY_C, stroke_width=3)

        # --- Left side: Autoregressive ---
        left_title = Text("Autoregressive", font_size=32, color=BLUE_E).move_to(
            LEFT * 3.5 + UP * 2.8
        )
        left_sub = Text("Left to right", font_size=24, color=BLACK).next_to(
            left_title, DOWN, buff=0.08
        )

        # --- Right side: Text Diffusion ---
        right_title = Text("Text Diffusion", font_size=32, color=GREEN_E).move_to(
            RIGHT * 3.5 + UP * 2.8
        )
        right_sub = Text("Bidirectional", font_size=24, color=BLACK).next_to(
            right_title, DOWN, buff=0.08
        )

        self.play(
            FadeIn(div_line),
            FadeIn(left_title),
            FadeIn(left_sub),
            FadeIn(right_title),
            FadeIn(right_sub),
        )

        # ====== LEFT: Autoregressive tokens appear one at a time ======
        ar_x_start = -6.0
        ar_spacing = 0.92
        ar_y = 0.5

        # Build all token boxes positioned in a row
        ar_boxes = []
        for i, tok in enumerate(tokens):
            tb = self._make_token_box(tok, BLUE_E)
            tb.move_to(np.array([ar_x_start + i * ar_spacing, ar_y, 0]))
            ar_boxes.append(tb)

        for tb in ar_boxes:
            self.play(FadeIn(tb), run_time=0.3)

        ar_label = Text("Sequential", font_size=24, color=BLUE_E).move_to(
            np.array([-3.5, ar_y - 0.8, 0])
        )
        self.play(FadeIn(ar_label), run_time=0.4)

        # ====== RIGHT: Text Diffusion — mask then unmask ======
        diff_x_start = 1.2
        diff_spacing = 0.92
        mask_color = GREY_C

        # Unmask order (indices): bidirectional — grammar first, nouns last
        # Step 0: all masked
        # Step 1: unmask "The"(0) and "on"(3) — articles/prepositions
        # Step 2: unmask "sat"(2) and "the"(4) — verb and article
        # Step 3: unmask "cat"(1) and "mat"(5) — nouns last
        unmask_steps = [
            [],  # step 0: all masked
            [0, 3],  # step 1
            [2, 4],  # step 2
            [1, 5],  # step 3
        ]

        step_y_positions = [1.5, 0.5, -0.5, -1.5]
        step_labels_text = ["Start", "Step 1", "Step 2", "Step 3"]

        revealed = set()
        diff_rows = []

        for step_idx, (unmask_ids, y, sl) in enumerate(
            zip(unmask_steps, step_y_positions, step_labels_text)
        ):
            revealed.update(unmask_ids)

            row_boxes = VGroup()
            for i, tok in enumerate(tokens):
                if i in revealed:
                    tb = self._make_token_box(tok, GREEN_E, fill_opacity=0.15)
                else:
                    tb = self._make_token_box(
                        "?", mask_color, fill_opacity=0.25, font_size=24
                    )
                tb.move_to(np.array([diff_x_start + i * diff_spacing, y, 0]))
                row_boxes.add(tb)

            step_label = Text(sl, font_size=20, color=BLACK).next_to(
                row_boxes, LEFT, buff=0.2
            )

            parts = [FadeIn(row_boxes), FadeIn(step_label)]

            # Arrow from previous row
            if step_idx > 0:
                arr = Arrow(
                    np.array(
                        [diff_x_start + 2.3, step_y_positions[step_idx - 1] - 0.35, 0]
                    ),
                    np.array([diff_x_start + 2.3, y + 0.35, 0]),
                    color=GREEN_E,
                    stroke_width=4,
                    max_tip_length_to_length_ratio=0.3,
                )
                parts.insert(0, GrowArrow(arr))

            self.play(*parts, run_time=0.6)
            diff_rows.append(row_boxes)

        diff_label = Text("All positions at once", font_size=24, color=GREEN_E).move_to(
            np.array([3.5, -2.5, 0])
        )
        self.play(FadeIn(diff_label))
        self.wait(1.5)
