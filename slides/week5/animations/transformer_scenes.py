"""
Transformer Animation Scenes for Lecture 15
Adapted from https://github.com/prvnsmpth/animated-transformer

Renders animations as transparent GIFs for Marp slides.
Uses Avenir font to match course theme.
"""

import numpy as np
from scipy.special import softmax
from manim import *

# Configure Manim - white background (will be converted to transparent)
config.background_color = WHITE
config.pixel_width = 1920
config.pixel_height = 1080
config.frame_rate = 30

Text.set_default(color=BLACK)
Line.set_default(color=BLACK)
Arrow.set_default(color=BLACK)

# Vocabulary and embeddings (same as original)
VOCAB = {
    "the": 3206,
    "robots": 2736,
    "will": 3657,
    "bring": 400,
    "prosperity": 2532,
}

WORD_EMB = {
    "the": [0.07, 0.13, 0.63, 0.23],
    "robots": [0.81, 0.51, 0.44, 0.98],
    "will": [0.62, 0.29, 0.80, 0.34],
    "bring": [0.50, 0.16, 0.93, 0.19],
    "prosperity": [0.25, 0.41, 0.23, 0.75],
}

POS_EMB = {
    "0": [0.32, 0.12, 0.88, 0.75],
    "1": [0.14, 0.07, 0.41, 0.35],
    "2": [0.07, 0.47, 0.23, 0.86],
    "3": [0.81, 0.12, 0.06, 0.24],
}

# Weight matrices for Q, K, V
W_q = [
    [0.02, 0.21, 0.91, 0.37],
    [0.03, 0.02, 0.17, 0.05],
    [0.29, 0.07, 0.52, 0.99],
    [0.38, 0.37, 0.26, 0.28],
]

W_k = [
    [0.67, 0.21, 0.85, 0.88],
    [0.61, 0.24, 0.95, 0.99],
    [0.38, 0.68, 0.56, 0.39],
    [0.62, 0.16, 0.65, 0.03],
]

W_v = [
    [0.88, 0.87, 0.30, 0.36],
    [0.10, 0.15, 0.50, 0.72],
    [0.36, 0.95, 0.40, 0.97],
    [0.86, 0.04, 0.29, 0.20],
]

# Dartmouth color palette
DARTMOUTH_GREEN = "#00693e"
RIVER_BLUE = "#267aba"
BONFIRE_ORANGE = "#ffa00f"
SUMMER_YELLOW = "#f5dc69"


class TransparentScene(Scene):
    """Base scene with white background (post-processed to transparent)."""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.camera.background_color = WHITE

    def construct(self):
        pass


class TransformerFunc(TransparentScene):
    """What is a Transformer? Shows the function concept."""

    def construct(self):
        # Function notation
        func = Text("Transformer(X, θ) → Y", font="Avenir", font_size=42)
        func.to_edge(UP, buff=1.5)

        # Input/output examples
        input_text = Text(
            '"the robots will bring"', font="Avenir", font_size=32, color=RIVER_BLUE
        )
        output_text = Text(
            '"prosperity"', font="Avenir", font_size=32, color=DARTMOUTH_GREEN
        )

        input_text.next_to(func, DOWN, buff=0.8).shift(LEFT * 2)
        output_text.next_to(func, DOWN, buff=0.8).shift(RIGHT * 2)

        arrow = Arrow(
            input_text.get_right(), output_text.get_left(), color=BLACK, buff=0.3
        )

        # Theta explanation
        theta_text = Text("θ: model parameters", font="Avenir", font_size=28)
        theta_text.to_edge(DOWN)
        theta_box = SurroundingRectangle(theta_text, color=BLACK, buff=0.2)

        # Animations
        self.play(Write(func), run_time=1.5)
        self.wait(0.5)
        self.play(FadeIn(input_text), FadeIn(output_text), Create(arrow), run_time=1)
        self.play(FadeIn(theta_text), Create(theta_box), run_time=0.8)
        self.wait(2)


class Tokenization(TransparentScene):
    """Shows tokenization: words to token IDs."""

    def construct(self):
        words = ["the", "robots", "will", "bring"]
        token_ids = [VOCAB[w] for w in words]

        # Word boxes
        word_group = VGroup()
        for word in words:
            box = VGroup(
                Text(f'"{word}"', font="Avenir", font_size=28),
            )
            rect = SurroundingRectangle(box, color=SUMMER_YELLOW, buff=0.15)
            word_group.add(VGroup(box, rect))
        word_group.arrange(RIGHT, buff=0.5)
        word_group.to_edge(UP, buff=1.5)

        # Arrows
        arrows = VGroup()
        for item in word_group:
            arrow = Arrow(UP * 0.3, DOWN * 0.3, color=BLACK, buff=0.1)
            arrow.next_to(item, DOWN, buff=0.3)
            arrows.add(arrow)

        # Token ID boxes
        id_group = VGroup()
        for tid in token_ids:
            box = VGroup(
                Text(str(tid), font="Avenir", font_size=28, color=BONFIRE_ORANGE),
            )
            rect = SurroundingRectangle(box, color=RIVER_BLUE, buff=0.15)
            id_group.add(VGroup(box, rect))
        id_group.arrange(RIGHT, buff=0.5)
        id_group.next_to(arrows, DOWN, buff=0.3)

        # Animations
        self.play(
            LaggedStart(*[FadeIn(w) for w in word_group], lag_ratio=0.2), run_time=1.5
        )
        self.play(LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.15), run_time=1)
        self.play(
            LaggedStart(*[FadeIn(i) for i in id_group], lag_ratio=0.2), run_time=1.5
        )
        self.wait(2)


class WordEmbeddings(TransparentScene):
    """Shows token embeddings: IDs to vectors."""

    def construct(self):
        words = ["the", "robots", "will", "bring"]

        # Create word labels on left
        word_labels = VGroup()
        for word in words:
            label = Text(f'"{word}"', font="Avenir", font_size=24)
            word_labels.add(label)
        word_labels.arrange(DOWN, buff=0.4)
        word_labels.shift(LEFT * 4)

        # Create embedding vectors (simplified visualization)
        emb_group = VGroup()
        for word in words:
            emb = WORD_EMB[word]
            # Create colored bars representing embedding values
            bars = VGroup()
            for i, val in enumerate(emb):
                bar = Rectangle(
                    width=val * 2,
                    height=0.25,
                    fill_color=RIVER_BLUE,
                    fill_opacity=0.8,
                    stroke_width=1,
                )
                bars.add(bar)
            bars.arrange(RIGHT, buff=0.05)
            emb_group.add(bars)
        emb_group.arrange(DOWN, buff=0.4)
        emb_group.shift(RIGHT * 1)

        # Arrows
        arrows = VGroup()
        for wl, eg in zip(word_labels, emb_group):
            arrow = Arrow(wl.get_right(), eg.get_left(), color=BLACK, buff=0.3)
            arrows.add(arrow)

        # Dimension label
        dim_label = Text(
            "C = 768 dimensions", font="Avenir", font_size=24, color=RIVER_BLUE
        )
        dim_label.to_edge(UP, buff=1.5)

        # T label
        t_label = Text(
            "T = 4 tokens", font="Avenir", font_size=24, color=DARTMOUTH_GREEN
        )
        t_label.next_to(word_labels, LEFT, buff=0.3)
        t_label.rotate(PI / 2)

        # Animations
        self.play(
            LaggedStart(*[FadeIn(w) for w in word_labels], lag_ratio=0.15), run_time=1
        )
        self.play(LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.15), run_time=1)
        self.play(
            LaggedStart(*[FadeIn(e) for e in emb_group], lag_ratio=0.15), run_time=1.5
        )
        self.play(FadeIn(dim_label), FadeIn(t_label), run_time=0.8)
        self.wait(2)


class PositionEmbeddings(TransparentScene):
    """Shows positional encoding with sinusoidal waves."""

    def construct(self):
        # Formula
        formula = Text(
            "PE(pos, 2i) = sin(pos / 10000^(2i/d))", font="Avenir", font_size=32
        )
        formula.to_edge(UP, buff=1.5)

        # Position labels
        pos_labels = VGroup()
        for i in range(4):
            label = Text(f"pos={i}", font="Avenir", font_size=24)
            pos_labels.add(label)
        pos_labels.arrange(DOWN, buff=0.5)
        pos_labels.shift(LEFT * 4 + DOWN * 0.5)

        # Position embedding bars (similar to word embeddings)
        pos_emb_group = VGroup()
        for i in range(4):
            emb = POS_EMB[str(i)]
            bars = VGroup()
            for val in emb:
                bar = Rectangle(
                    width=val * 2,
                    height=0.25,
                    fill_color=DARTMOUTH_GREEN,
                    fill_opacity=0.8,
                    stroke_width=1,
                )
                bars.add(bar)
            bars.arrange(RIGHT, buff=0.05)
            pos_emb_group.add(bars)
        pos_emb_group.arrange(DOWN, buff=0.5)
        pos_emb_group.shift(RIGHT * 1 + DOWN * 0.5)

        # Arrows
        arrows = VGroup()
        for pl, pe in zip(pos_labels, pos_emb_group):
            arrow = Arrow(pl.get_right(), pe.get_left(), color=BLACK, buff=0.3)
            arrows.add(arrow)

        # Animations
        self.play(Write(formula), run_time=1)
        self.play(
            LaggedStart(*[FadeIn(p) for p in pos_labels], lag_ratio=0.15), run_time=1
        )
        self.play(LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.15), run_time=1)
        self.play(
            LaggedStart(*[FadeIn(e) for e in pos_emb_group], lag_ratio=0.15),
            run_time=1.5,
        )
        self.wait(2)


class PreparingEmbeddings(TransparentScene):
    """Shows token + position embeddings being added."""

    def construct(self):
        # Token embedding matrix (left)
        token_label = Text("Token\nEmbeddings", font="Avenir", font_size=24)
        token_matrix = self._create_matrix(WORD_EMB, RIVER_BLUE)
        token_group = VGroup(token_label, token_matrix).arrange(DOWN, buff=0.3)
        token_group.shift(LEFT * 4)

        # Plus sign
        plus = Text("+", font="Avenir", font_size=48)

        # Position embedding matrix (middle)
        pos_label = Text("Position\nEmbeddings", font="Avenir", font_size=24)
        pos_matrix = self._create_matrix(POS_EMB, DARTMOUTH_GREEN)
        pos_group = VGroup(pos_label, pos_matrix).arrange(DOWN, buff=0.3)

        # Equals sign
        equals = Text("=", font="Avenir", font_size=48)

        # Result matrix (right)
        result_label = Text("Input to\nTransformer", font="Avenir", font_size=24)
        result_matrix = self._create_result_matrix(BONFIRE_ORANGE)
        result_group = VGroup(result_label, result_matrix).arrange(DOWN, buff=0.3)
        result_group.shift(RIGHT * 4)

        # Arrange
        VGroup(token_group, plus, pos_group, equals, result_group).arrange(
            RIGHT, buff=0.5
        )
        VGroup(token_group, plus, pos_group, equals, result_group).to_edge(UP, buff=1.5)

        # Animations
        self.play(FadeIn(token_group), run_time=1)
        self.play(FadeIn(plus), run_time=0.3)
        self.play(FadeIn(pos_group), run_time=1)
        self.play(FadeIn(equals), run_time=0.3)
        self.play(FadeIn(result_group), run_time=1)
        self.wait(2)

    def _create_matrix(self, data, color):
        """Create a simple matrix visualization."""
        rows = VGroup()
        for key in list(data.keys())[:4]:
            row = VGroup()
            for val in data[key]:
                cell = Rectangle(
                    width=0.4,
                    height=0.3,
                    fill_color=color,
                    fill_opacity=val,
                    stroke_width=0.5,
                )
                row.add(cell)
            row.arrange(RIGHT, buff=0.02)
            rows.add(row)
        rows.arrange(DOWN, buff=0.02)
        return rows

    def _create_result_matrix(self, color):
        """Create result matrix (sum of embeddings)."""
        rows = VGroup()
        words = ["the", "robots", "will", "bring"]
        for i, word in enumerate(words):
            row = VGroup()
            for j in range(4):
                val = min(1.0, WORD_EMB[word][j] + POS_EMB[str(i)][j])
                cell = Rectangle(
                    width=0.4,
                    height=0.3,
                    fill_color=color,
                    fill_opacity=val,
                    stroke_width=0.5,
                )
                row.add(cell)
            row.arrange(RIGHT, buff=0.02)
            rows.add(row)
        rows.arrange(DOWN, buff=0.02)
        return rows


class QueryKeyValue(TransparentScene):
    """Shows Q, K, V projection from input embeddings."""

    def construct(self):
        # Input X
        x_label = Text("X", font="Avenir", font_size=36)
        x_rect = SurroundingRectangle(x_label, color=BLACK, buff=0.2)
        x_group = VGroup(x_label, x_rect)
        x_group.shift(LEFT * 5)

        # Q, K, V boxes
        qkv_colors = [RIVER_BLUE, DARTMOUTH_GREEN, BONFIRE_ORANGE]
        qkv_labels = ["Q", "K", "V"]
        qkv_names = ["query", "key", "value"]

        qkv_groups = VGroup()
        for i, (label, name, color) in enumerate(
            zip(qkv_labels, qkv_names, qkv_colors)
        ):
            main_label = Text(label, font="Avenir", font_size=36)
            sub_label = Text(name, font="Avenir", font_size=20)
            rect = SurroundingRectangle(main_label, color=color, buff=0.2)
            group = VGroup(VGroup(main_label, rect), sub_label).arrange(DOWN, buff=0.2)
            qkv_groups.add(group)

        qkv_groups.arrange(DOWN, buff=0.8)
        qkv_groups.to_edge(UP, buff=1.5)

        # Weight matrix labels
        w_labels = VGroup()
        for i, label in enumerate(["Wq", "Wₖ", "Wᵥ"]):
            w = Text(label, font="Avenir", font_size=24, color=qkv_colors[i])
            w_labels.add(w)

        # Arrows from X to Q, K, V
        arrows = VGroup()
        for i, qkv in enumerate(qkv_groups):
            arrow = Arrow(
                x_group.get_right(), qkv.get_left(), color=qkv_colors[i], buff=0.2
            )
            arrows.add(arrow)
            w_labels[i].move_to(arrow.get_center() + UP * 0.3)

        # Animations
        self.play(FadeIn(x_group), run_time=0.5)
        self.wait(0.3)

        for i in range(3):
            self.play(
                Create(arrows[i]),
                FadeIn(w_labels[i]),
                FadeIn(qkv_groups[i]),
                run_time=0.8,
            )

        self.wait(2)


class SplittingHeads(TransparentScene):
    """Shows splitting into multiple attention heads."""

    def construct(self):
        # Q matrix
        q_label = Text("Q (T × C)", font="Avenir", font_size=28, color=RIVER_BLUE)
        q_rect = Rectangle(width=3, height=1.5, color=RIVER_BLUE, stroke_width=2)
        q_group = VGroup(q_label, q_rect).arrange(DOWN, buff=0.2)
        q_group.shift(LEFT * 4)

        # Arrow
        arrow = Arrow(LEFT, RIGHT, color=BLACK, buff=0.3)
        arrow.next_to(q_group, RIGHT, buff=0.5)

        # Split heads
        heads = VGroup()
        for i in range(4):
            head_label = Text(
                f"Q_{i + 1}", font="Avenir", font_size=20, color=RIVER_BLUE
            )
            head_rect = Rectangle(
                width=0.5, height=1.2, color=RIVER_BLUE, stroke_width=1.5
            )
            head = VGroup(head_rect, head_label.next_to(head_rect, UP, buff=0.1))
            heads.add(head)

        dots = Text("...", font="Avenir", font_size=24)

        head_12 = VGroup(
            Rectangle(width=0.5, height=1.2, color=RIVER_BLUE, stroke_width=1.5),
            Text("Q_12", font="Avenir", font_size=20, color=RIVER_BLUE),
        )
        head_12[1].next_to(head_12[0], UP, buff=0.1)

        all_heads = VGroup(*heads, dots, head_12)
        all_heads.arrange(RIGHT, buff=0.15)
        all_heads.next_to(arrow, RIGHT, buff=0.5)

        # Explanation
        explain = Text("Each head: T × H (H = 64)", font="Avenir", font_size=24)
        explain.to_edge(DOWN)

        # Animations
        self.play(FadeIn(q_group), run_time=0.8)
        self.play(Create(arrow), run_time=0.5)
        self.play(
            LaggedStart(*[FadeIn(h) for h in all_heads], lag_ratio=0.1), run_time=1.5
        )
        self.play(FadeIn(explain), run_time=0.5)
        self.wait(2)


class SelfAttention(TransparentScene):
    """Shows attention score computation: Q @ K^T."""

    def construct(self):
        # Formula
        formula = Text("A = (Q · Kᵀ) / √dₖ", font="Avenir", font_size=36)
        formula.to_edge(UP, buff=1.5)

        # Q matrix
        q_label = Text("Q₁", font="Avenir", font_size=28, color=RIVER_BLUE)
        q_matrix = self._create_matrix(4, 3, RIVER_BLUE)
        q_group = VGroup(q_label, q_matrix).arrange(DOWN, buff=0.2)

        # Times
        times = Text("×", font="Avenir", font_size=36)

        # K^T matrix
        k_label = Text("K₁ᵀ", font="Avenir", font_size=28, color=DARTMOUTH_GREEN)
        k_matrix = self._create_matrix(3, 4, DARTMOUTH_GREEN)
        k_group = VGroup(k_label, k_matrix).arrange(DOWN, buff=0.2)

        # Equals
        equals = Text("=", font="Avenir", font_size=36)

        # Attention matrix
        a_label = Text("A₁", font="Avenir", font_size=28, color=BONFIRE_ORANGE)
        a_matrix = self._create_attn_matrix()
        a_group = VGroup(a_label, a_matrix).arrange(DOWN, buff=0.2)

        # Arrange
        eq = VGroup(q_group, times, k_group, equals, a_group)
        eq.arrange(RIGHT, buff=0.4)
        eq.shift(DOWN * 0.5)

        # Animations
        self.play(Write(formula), run_time=1)
        self.play(FadeIn(q_group), run_time=0.8)
        self.play(FadeIn(times), run_time=0.3)
        self.play(FadeIn(k_group), run_time=0.8)
        self.play(FadeIn(equals), run_time=0.3)
        self.play(FadeIn(a_group), run_time=1)
        self.wait(2)

    def _create_matrix(self, rows, cols, color):
        matrix = VGroup()
        for i in range(rows):
            row = VGroup()
            for j in range(cols):
                cell = Rectangle(
                    width=0.4,
                    height=0.35,
                    fill_color=color,
                    fill_opacity=0.3 + 0.2 * np.random.random(),
                    stroke_width=0.5,
                )
                row.add(cell)
            row.arrange(RIGHT, buff=0.02)
            matrix.add(row)
        matrix.arrange(DOWN, buff=0.02)
        return matrix

    def _create_attn_matrix(self):
        """Create attention score matrix (4x4)."""
        np.random.seed(42)
        matrix = VGroup()
        for i in range(4):
            row = VGroup()
            for j in range(4):
                # Lower triangle has higher values (causal masking later)
                val = 0.3 + 0.5 * np.random.random() if j <= i else 0.1
                cell = Rectangle(
                    width=0.4,
                    height=0.35,
                    fill_color=BONFIRE_ORANGE,
                    fill_opacity=val,
                    stroke_width=0.5,
                )
                row.add(cell)
            row.arrange(RIGHT, buff=0.02)
            matrix.add(row)
        matrix.arrange(DOWN, buff=0.02)
        return matrix


class ApplyingAttention(TransparentScene):
    """Shows masking, softmax, and multiplication with V."""

    def construct(self):
        # Step 1: Mask
        step1 = Text("1. Mask future tokens", font="Avenir", font_size=28)
        step1.to_edge(UP, buff=1.5).shift(LEFT * 3)

        mask_matrix = self._create_masked_matrix()
        mask_matrix.next_to(step1, DOWN, buff=0.3)

        # Step 2: Softmax
        step2 = Text("2. Softmax (rows sum to 1)", font="Avenir", font_size=28)
        step2.next_to(step1, RIGHT, buff=2)

        softmax_matrix = self._create_softmax_matrix()
        softmax_matrix.next_to(step2, DOWN, buff=0.3)

        # Step 3: Multiply V
        step3 = Text("3. Weighted sum of V", font="Avenir", font_size=28)
        step3.to_edge(DOWN, buff=1.5)

        formula = Text("Y = softmax(A) · V", font="Avenir", font_size=32)
        formula.next_to(step3, DOWN, buff=0.3)

        # Animations
        self.play(Write(step1), run_time=0.5)
        self.play(FadeIn(mask_matrix), run_time=1)
        self.wait(0.5)
        self.play(Write(step2), run_time=0.5)
        self.play(FadeIn(softmax_matrix), run_time=1)
        self.wait(0.5)
        self.play(Write(step3), Write(formula), run_time=1)
        self.wait(2)

    def _create_masked_matrix(self):
        matrix = VGroup()
        for i in range(4):
            row = VGroup()
            for j in range(4):
                if j > i:
                    # Masked (future tokens)
                    cell = Rectangle(
                        width=0.4,
                        height=0.35,
                        fill_color=GREY,
                        fill_opacity=0.2,
                        stroke_width=0.5,
                    )
                    cross = VGroup(
                        Line(
                            cell.get_corner(UL),
                            cell.get_corner(DR),
                            color=RED,
                            stroke_width=1,
                        ),
                        Line(
                            cell.get_corner(UR),
                            cell.get_corner(DL),
                            color=RED,
                            stroke_width=1,
                        ),
                    )
                    cell = VGroup(cell, cross)
                else:
                    cell = Rectangle(
                        width=0.4,
                        height=0.35,
                        fill_color=BONFIRE_ORANGE,
                        fill_opacity=0.3 + 0.4 * np.random.random(),
                        stroke_width=0.5,
                    )
                row.add(cell)
            row.arrange(RIGHT, buff=0.02)
            matrix.add(row)
        matrix.arrange(DOWN, buff=0.02)
        return matrix

    def _create_softmax_matrix(self):
        np.random.seed(42)
        matrix = VGroup()
        for i in range(4):
            row = VGroup()
            # Generate values that sum to 1 for each row (only up to position i)
            vals = np.random.random(i + 1)
            vals = vals / vals.sum()
            for j in range(4):
                if j > i:
                    val = 0
                else:
                    val = vals[j]
                cell = Rectangle(
                    width=0.4,
                    height=0.35,
                    fill_color=DARTMOUTH_GREEN,
                    fill_opacity=val,
                    stroke_width=0.5,
                )
                row.add(cell)
            row.arrange(RIGHT, buff=0.02)
            matrix.add(row)
        matrix.arrange(DOWN, buff=0.02)
        return matrix


class ConcatHeads(TransparentScene):
    """Shows concatenating all attention heads."""

    def construct(self):
        # Individual head outputs
        heads = VGroup()
        colors = [RIVER_BLUE, DARTMOUTH_GREEN, BONFIRE_ORANGE, "#8a6996"]
        for i in range(4):
            head_rect = Rectangle(
                width=0.6,
                height=1.5,
                fill_color=colors[i % len(colors)],
                fill_opacity=0.5,
                stroke_width=1.5,
            )
            head_label = Text(f"Y_{i + 1}", font="Avenir", font_size=20)
            head_label.next_to(head_rect, UP, buff=0.1)
            heads.add(VGroup(head_rect, head_label))

        dots = Text("...", font="Avenir", font_size=24)

        head_12 = VGroup(
            Rectangle(
                width=0.6,
                height=1.5,
                fill_color="#8a6996",
                fill_opacity=0.5,
                stroke_width=1.5,
            ),
            Text("Y₁₂", font="Avenir", font_size=20),
        )
        head_12[1].next_to(head_12[0], UP, buff=0.1)

        all_heads = VGroup(*heads, dots, head_12)
        all_heads.arrange(RIGHT, buff=0.1)
        all_heads.to_edge(UP, buff=1.5).shift(LEFT * 2)

        # Arrow
        arrow = Arrow(LEFT, RIGHT, color=BLACK, buff=0.3)
        arrow.next_to(all_heads, RIGHT, buff=0.5)

        # Concatenated output
        concat_rect = Rectangle(
            width=3,
            height=1.5,
            fill_color=SUMMER_YELLOW,
            fill_opacity=0.5,
            stroke_width=2,
        )
        concat_label = Text("Concat (T × C)", font="Avenir", font_size=24)
        concat_label.next_to(concat_rect, UP, buff=0.2)
        concat_group = VGroup(concat_rect, concat_label)
        concat_group.next_to(arrow, RIGHT, buff=0.5)

        # Explanation
        explain = Text("64 × 12 = 768 = C", font="Avenir", font_size=28)
        explain.to_edge(DOWN)

        # Animations
        self.play(
            LaggedStart(*[FadeIn(h) for h in all_heads], lag_ratio=0.1), run_time=1.5
        )
        self.play(Create(arrow), run_time=0.5)
        self.play(FadeIn(concat_group), run_time=1)
        self.play(Write(explain), run_time=0.8)
        self.wait(2)


class FeedForward(TransparentScene):
    """Shows the feed-forward network."""

    def construct(self):
        # Formula
        formula = Text("FFN(x) = ReLU(xW₁ + b₁)W₂ + b₂", font="Avenir", font_size=32)
        formula.to_edge(UP, buff=1.5)

        # Network diagram
        # Input layer (C = 768)
        input_layer = self._create_layer(4, RIVER_BLUE, "C = 768")

        # Hidden layer (4C = 3072)
        hidden_layer = self._create_layer(6, DARTMOUTH_GREEN, "4C = 3072")

        # Output layer (C = 768)
        output_layer = self._create_layer(4, BONFIRE_ORANGE, "C = 768")

        layers = VGroup(input_layer, hidden_layer, output_layer)
        layers.arrange(RIGHT, buff=1.5)
        layers.shift(DOWN * 0.5)

        # Arrows between layers
        arrow1 = Arrow(
            input_layer[0].get_right(),
            hidden_layer[0].get_left(),
            color=BLACK,
            buff=0.2,
        )
        arrow2 = Arrow(
            hidden_layer[0].get_right(),
            output_layer[0].get_left(),
            color=BLACK,
            buff=0.2,
        )

        # ReLU label
        relu = Text("ReLU", font="Avenir", font_size=24, color=DARTMOUTH_GREEN)
        relu.next_to(arrow1, UP, buff=0.1)

        # Animations
        self.play(Write(formula), run_time=1)
        self.play(FadeIn(input_layer), run_time=0.8)
        self.play(Create(arrow1), FadeIn(relu), run_time=0.5)
        self.play(FadeIn(hidden_layer), run_time=0.8)
        self.play(Create(arrow2), run_time=0.5)
        self.play(FadeIn(output_layer), run_time=0.8)
        self.wait(2)

    def _create_layer(self, n_nodes, color, label_text):
        nodes = VGroup()
        for i in range(n_nodes):
            node = Circle(
                radius=0.15, fill_color=color, fill_opacity=0.7, stroke_width=1
            )
            nodes.add(node)
        nodes.arrange(DOWN, buff=0.15)

        label = Text(label_text, font="Avenir", font_size=20)
        label.next_to(nodes, DOWN, buff=0.3)

        return VGroup(nodes, label)


class GoingDeeper(TransparentScene):
    """Shows stacking transformer blocks."""

    def construct(self):
        # Create blocks
        blocks = VGroup()
        colors = [RIVER_BLUE, "#267aba", "#1a5a8a", "#0d3a5a", "#052030", "#8a6996"]

        for i in range(6):
            block = Rectangle(
                width=4,
                height=0.5,
                fill_color=colors[i],
                fill_opacity=0.7,
                stroke_width=1.5,
            )
            label = Text(f"Block {i + 1}", font="Avenir", font_size=20, color=BLACK)
            label.move_to(block)
            blocks.add(VGroup(block, label))

        blocks.arrange(DOWN, buff=0.15)
        blocks.to_edge(UP, buff=1.5)

        # Arrows between blocks
        arrows = VGroup()
        for i in range(len(blocks) - 1):
            arrow = Arrow(
                blocks[i].get_bottom() + DOWN * 0.05,
                blocks[i + 1].get_top() + UP * 0.05,
                color=BLACK,
                buff=0,
                stroke_width=2,
            )
            arrows.add(arrow)

        # Input/Output labels
        input_label = Text("Input embeddings", font="Avenir", font_size=24)
        input_label.next_to(blocks[0], UP, buff=0.4)

        output_label = Text("Final representations", font="Avenir", font_size=24)
        output_label.next_to(blocks[-1], DOWN, buff=0.4)

        # Animations
        self.play(FadeIn(input_label), run_time=0.5)

        for i, block in enumerate(blocks):
            self.play(FadeIn(block), run_time=0.3)
            if i < len(arrows):
                self.play(Create(arrows[i]), run_time=0.2)

        self.play(FadeIn(output_label), run_time=0.5)
        self.wait(2)


class MakingPrediction(TransparentScene):
    """Shows the final prediction step."""

    def construct(self):
        # Last token output
        last_output = Rectangle(
            width=1.5,
            height=0.8,
            fill_color=RIVER_BLUE,
            fill_opacity=0.7,
            stroke_width=1.5,
        )
        last_label = Text('"bring"', font="Avenir", font_size=20)
        last_label.next_to(last_output, UP, buff=0.2)
        last_group = VGroup(last_output, last_label)
        last_group.to_edge(UP, buff=1.5).shift(LEFT * 4)

        # Arrow to linear layer
        arrow1 = Arrow(LEFT, RIGHT, color=BLACK, buff=0.2)
        arrow1.next_to(last_output, RIGHT, buff=0.3)

        # Linear layer (V x C)
        linear = Rectangle(
            width=1.2,
            height=1.5,
            fill_color=DARTMOUTH_GREEN,
            fill_opacity=0.5,
            stroke_width=1.5,
        )
        linear_label = Text("Linear\n(V × C)", font="Avenir", font_size=18)
        linear_label.move_to(linear)
        linear_group = VGroup(linear, linear_label)
        linear_group.next_to(arrow1, RIGHT, buff=0.3)

        # Arrow to softmax
        arrow2 = Arrow(LEFT, RIGHT, color=BLACK, buff=0.2)
        arrow2.next_to(linear_group, RIGHT, buff=0.3)

        # Softmax output (probability distribution)
        probs = VGroup()
        words = ["prosperity", "destruction", "peace", "..."]
        prob_vals = [0.92, 0.05, 0.02, 0.01]

        for word, prob in zip(words, prob_vals):
            bar = Rectangle(
                width=prob * 2,
                height=0.3,
                fill_color=BONFIRE_ORANGE if prob > 0.5 else GREY,
                fill_opacity=0.8,
                stroke_width=0.5,
            )
            word_text = Text(f"{word}: {prob:.0%}", font="Avenir", font_size=16)
            word_text.next_to(bar, RIGHT, buff=0.1)
            probs.add(VGroup(bar, word_text))

        probs.arrange(DOWN, buff=0.15, aligned_edge=LEFT)
        probs.next_to(arrow2, RIGHT, buff=0.3)

        # Animations
        self.play(FadeIn(last_group), run_time=0.8)
        self.play(Create(arrow1), run_time=0.5)
        self.play(FadeIn(linear_group), run_time=0.8)
        self.play(Create(arrow2), run_time=0.5)
        self.play(LaggedStart(*[FadeIn(p) for p in probs], lag_ratio=0.2), run_time=1.5)
        self.wait(2)


class GeneratingText(TransparentScene):
    """Shows autoregressive text generation."""

    def construct(self):
        # Starting prompt
        prompt = Text(
            '"the robots will bring"', font="Avenir", font_size=28, color=RIVER_BLUE
        )
        prompt.to_edge(UP, buff=1.5)

        # Generation steps
        steps = [
            '"the robots will bring prosperity"',
            '"the robots will bring prosperity to"',
            '"the robots will bring prosperity to humanity"',
        ]

        step_texts = VGroup()
        for step in steps:
            t = Text(step, font="Avenir", font_size=28, color=DARTMOUTH_GREEN)
            step_texts.add(t)
        step_texts.arrange(DOWN, buff=0.6)
        step_texts.shift(DOWN * 0.5)

        # Arrows
        arrows = VGroup()
        positions = [prompt] + list(step_texts[:-1])
        for i, pos in enumerate(positions):
            arrow = Arrow(
                pos.get_bottom(), step_texts[i].get_top(), color=BLACK, buff=0.15
            )
            arrows.add(arrow)

        # Explanation
        explain = Text("Feed output back as input", font="Avenir", font_size=24)
        explain.to_edge(DOWN)

        # Animations
        self.play(FadeIn(prompt), run_time=0.8)

        for i, (arrow, step) in enumerate(zip(arrows, step_texts)):
            self.play(Create(arrow), run_time=0.3)
            self.play(FadeIn(step), run_time=0.8)
            self.wait(0.3)

        self.play(FadeIn(explain), run_time=0.5)
        self.wait(2)


# Scene list for rendering
SCENES = [
    TransformerFunc,
    Tokenization,
    WordEmbeddings,
    PositionEmbeddings,
    PreparingEmbeddings,
    QueryKeyValue,
    SplittingHeads,
    SelfAttention,
    ApplyingAttention,
    ConcatHeads,
    FeedForward,
    GoingDeeper,
    MakingPrediction,
    GeneratingText,
]
