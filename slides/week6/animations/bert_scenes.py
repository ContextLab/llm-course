"""
Manim scenes for BERT animations in Lecture 18.

Running example: "The robot [MASK] pancakes"
With special tokens: [CLS] the robot [MASK] pancakes [SEP]

Scenes:
    1. BertVsGptAttention   - Causal vs bidirectional attention matrices
    2. BertInputRepresentation - Three embeddings summed together
    3. SegmentEmbeddings    - E_A / E_B for sentence pairs
    4. MaskedLanguageModeling - 80/10/10 masking strategy
    5. BertPredictionHead    - Predicting from [MASK] position
    6. FineTuningTransfer    - Pre-train once, fine-tune many
"""

import numpy as np
from scipy.special import softmax

from manim import *


# ── Shared infrastructure (duplicated from week5 to avoid import path issues) ──


class Title(VGroup):
    """Invisible title — titles go on slides instead."""

    def __init__(self, *args, **kwargs):
        super().__init__()

    def scale(self, *args, **kwargs):
        return self


class BaseScene(Scene):
    """Common methods for all BERT scenes."""

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

    def _make_matrix(self, embeddings, actual_h=None, actual_w=None):
        h, w = len(embeddings), len(embeddings[0])
        actual_h = actual_h or h
        actual_w = actual_w or w
        tr_input = []
        for row in embeddings:
            tr_row = [Tex(f"{e:.2f}") for e in row]
            if actual_w > w:
                tr_row = tr_row[:2] + [tr_row[-1]]
                tr_row.insert(-1, Tex("\\dots"))
            tr_input.append(tr_row)
        if actual_h > h:
            tr_input.append([Tex("\\vdots") for _ in range(len(tr_input[-1]))])
        return MobjectMatrix(tr_input)

    def _make_row_labels(self, matrix, labels, color=GREEN_E, dir=LEFT):
        rows = matrix.get_rows()
        text_objs = []
        for row, label in zip(rows, labels):
            text_objs.append(
                Text(label, font_size=24).next_to(row, dir * 3).set_color(color)
            )
        return VGroup(*text_objs)

    def _make_col_labels(self, matrix, labels, dir=DOWN, color=GREEN_E):
        cols = matrix.get_columns()
        text_objs = []
        for col, label in zip(cols, labels):
            text_objs.append(
                Text(label, font_size=24)
                .next_to(col, dir * 3)
                .set_color(color)
                .rotate(-PI / 2)
            )
        return VGroup(*text_objs)


# ── BERT-specific data ──

TOKENS = ["[CLS]", "the", "robot", "[MASK]", "pancakes", "[SEP]"]
TOKENS_UNMASKED = ["[CLS]", "the", "robot", "flipped", "pancakes", "[SEP]"]
T = len(TOKENS)  # 6

# Truncated 4-element embeddings for visualization (actual C = 768)
TOKEN_EMB = {
    "[CLS]":    [0.012, 0.234, 0.567, 0.891],
    "the":      [0.072, 0.135, 0.635, 0.234],
    "robot":    [0.814, 0.511, 0.438, 0.983],
    "[MASK]":   [0.500, 0.500, 0.500, 0.500],
    "pancakes": [0.621, 0.879, 0.341, 0.156],
    "[SEP]":    [0.023, 0.189, 0.456, 0.789],
    "flipped":  [0.743, 0.312, 0.628, 0.457],
}

SEG_EMB = {
    "A": [0.100, 0.200, 0.300, 0.400],
    "B": [0.900, 0.800, 0.700, 0.600],
}

POS_EMB = {
    "0": [0.320, 0.115, 0.882, 0.747],
    "1": [0.140, 0.071, 0.407, 0.346],
    "2": [0.074, 0.474, 0.226, 0.857],
    "3": [0.805, 0.119, 0.063, 0.238],
    "4": [0.291, 0.384, 0.712, 0.543],
    "5": [0.617, 0.295, 0.801, 0.344],
}

# Build combined input matrix X = token + segment(A) + position
X = np.array([TOKEN_EMB[t] for t in TOKENS]) + \
    np.array([SEG_EMB["A"]] * T) + \
    np.array([POS_EMB[str(i)] for i in range(T)])

# Synthetic weight matrices for Q, K (4x4 for visualization)
np.random.seed(42)
W_q = np.random.rand(4, 4) * 0.5
W_k = np.random.rand(4, 4) * 0.5

Q = X @ W_q
K = X @ W_k

# GPT-style causal attention (lower triangle only)
ATTN_SCORES_RAW = Q @ K.T / np.sqrt(4)
CAUSAL_MASK = np.triu(np.ones((T, T)), k=1) * (-1e9)
ATTN_GPT = softmax(ATTN_SCORES_RAW + CAUSAL_MASK, axis=1)

# BERT-style full bidirectional attention (no mask)
ATTN_BERT = softmax(ATTN_SCORES_RAW, axis=1)


# ── Scene 1: BertVsGptAttention ──


class BertVsGptAttention(BaseScene):
    """Split-screen comparison of causal (GPT) vs bidirectional (BERT) attention."""

    def construct(self):
        self.camera.background_color = WHITE
        Text.set_default(color=BLACK)
        Tex.set_default(color=BLACK)
        MathTex.set_default(color=BLACK)

        title = Title("Causal vs Bidirectional Attention")
        self.add(title)

        scale = 0.55

        # ── Build GPT attention matrix ──
        gpt_data = ATTN_GPT.copy()
        gpt_rows = []
        for i in range(T):
            row = []
            for j in range(T):
                if j > i:
                    row.append(Tex("$-\\infty$", font_size=28).set_color(GREY_C))
                else:
                    row.append(Tex(f"{gpt_data[i, j]:.2f}", font_size=28))
            gpt_rows.append(row)
        gpt_matrix = MobjectMatrix(gpt_rows).scale(scale)

        gpt_title = Text("GPT (Causal)", font_size=28, color=MAROON_E).next_to(
            gpt_matrix, UP, buff=0.3
        )
        gpt_eq = MathTex(
            r"A = \text{softmax}\!\left(\frac{QK^T}{\sqrt{H}} + M\right)",
            font_size=28,
        ).next_to(gpt_matrix, DOWN, buff=0.3)
        gpt_row_labels = self._make_row_labels(gpt_matrix, TOKENS)
        gpt_group = VGroup(gpt_matrix, gpt_title, gpt_eq, gpt_row_labels)

        # ── Build BERT attention matrix ──
        bert_data = ATTN_BERT.copy()
        bert_rows = []
        for i in range(T):
            row = [Tex(f"{bert_data[i, j]:.2f}", font_size=28) for j in range(T)]
            bert_rows.append(row)
        bert_matrix = MobjectMatrix(bert_rows).scale(scale)

        bert_title = Text("BERT (Bidirectional)", font_size=28, color=BLUE_E).next_to(
            bert_matrix, UP, buff=0.3
        )
        bert_eq = MathTex(
            r"A = \text{softmax}\!\left(\frac{QK^T}{\sqrt{H}}\right)",
            font_size=28,
        ).next_to(bert_matrix, DOWN, buff=0.3)
        bert_row_labels = self._make_row_labels(bert_matrix, TOKENS)
        bert_group = VGroup(bert_matrix, bert_title, bert_eq, bert_row_labels)

        # ── Arrange side by side ──
        gpt_group.shift(LEFT * 3.5)
        bert_group.shift(RIGHT * 3.5)

        vs_text = Text("vs", font_size=36, color=BLACK)

        # ── Animate: GPT first ──
        self.play(FadeIn(gpt_matrix, gpt_title, gpt_row_labels))
        self.wait()

        # Highlight the causal mask (upper triangle)
        mask_highlights = []
        for i in range(T):
            for j in range(T):
                if j > i:
                    cell = gpt_matrix.get_rows()[i][j]
                    rect = SurroundingRectangle(cell, color=RED_E, buff=0.05)
                    mask_highlights.append(rect)
        self.play(*[Create(r) for r in mask_highlights], run_time=0.8)
        self.play(FadeIn(gpt_eq))
        self.wait()

        # ── Animate: "vs" and BERT ──
        self.play(FadeIn(vs_text))
        self.play(FadeIn(bert_matrix, bert_title, bert_row_labels))
        self.play(FadeIn(bert_eq))
        self.wait()

        # ── Highlight [MASK] row in BERT ──
        mask_row_idx = TOKENS.index("[MASK]")
        bert_mask_row = bert_matrix.get_rows()[mask_row_idx]

        # Highlight cells attending LEFT (before [MASK])
        left_highlights = []
        for j in range(mask_row_idx):
            rect = SurroundingRectangle(bert_mask_row[j], color=PURE_RED, buff=0.05)
            left_highlights.append(rect)

        # Highlight cells attending RIGHT (after [MASK])
        right_highlights = []
        for j in range(mask_row_idx + 1, T):
            rect = SurroundingRectangle(bert_mask_row[j], color=PURE_BLUE, buff=0.05)
            right_highlights.append(rect)

        row_label = (
            Text("[MASK] attends to ALL tokens", font_size=22, color=BLUE_E)
            .next_to(bert_matrix, RIGHT, buff=0.4)
            .shift(DOWN * 0.2)
        )

        left_label = Text("left context", font_size=18, color=PURE_RED).next_to(
            row_label, DOWN, buff=0.15
        )
        right_label = Text("right context", font_size=18, color=PURE_BLUE).next_to(
            left_label, DOWN, buff=0.1
        )

        self.play(
            *[Create(r) for r in left_highlights],
            *[Create(r) for r in right_highlights],
            Write(row_label),
            Write(left_label),
            Write(right_label),
        )

        self.wait(4)


# ── Scene 2: BertInputRepresentation ──


class BertInputRepresentation(BaseScene):
    """Three embeddings (token + segment + position) summed into BERT input."""

    def construct(self):
        self.camera.background_color = WHITE
        Text.set_default(color=BLACK)
        Tex.set_default(color=BLACK)
        MathTex.set_default(color=BLACK)

        title = Title("BERT Input Representation")
        self.add(title)

        scale = 0.55

        # ── Show tokens as boxed words ──
        token_objs = VGroup()
        for t in TOKENS:
            txt = Text(t, font_size=24)
            box = SurroundingRectangle(txt, color=YELLOW_E, buff=0.1)
            token_objs.add(VGroup(txt, box))
        token_objs.arrange(RIGHT, buff=0.3).to_edge(UP, buff=0.8)

        self.play(*[FadeIn(t) for t in token_objs])
        self.wait()

        # ── Build three embedding matrices ──
        tok_embs = [TOKEN_EMB[t] for t in TOKENS]
        seg_embs = [SEG_EMB["A"]] * T
        pos_embs = [POS_EMB[str(i)] for i in range(T)]

        tok_matrix = self._make_matrix(tok_embs, actual_w=768)
        seg_matrix = self._make_matrix(seg_embs, actual_w=768)
        pos_matrix = self._make_matrix(pos_embs, actual_w=768)

        tok_row_labels = self._make_row_labels(tok_matrix, TOKENS, color=GREEN_E)
        seg_row_labels = self._make_row_labels(seg_matrix, ["A"] * T, color=BLUE_E)
        pos_row_labels = self._make_row_labels(
            pos_matrix, [str(i) for i in range(T)], color=GOLD
        )

        tok_title = VGroup(
            Tex("Token embeddings", font_size=24).set_color(GREEN_E),
            MathTex("T \\times C", font_size=22),
        ).arrange(DOWN, buff=0.05)

        seg_title = VGroup(
            Tex("Segment embeddings", font_size=24).set_color(BLUE_E),
            MathTex("T \\times C", font_size=22),
        ).arrange(DOWN, buff=0.05)

        pos_title = VGroup(
            Tex("Position embeddings", font_size=24).set_color(GOLD),
            MathTex("T \\times C", font_size=22),
        ).arrange(DOWN, buff=0.05)

        plus1 = MathTex("+", font_size=36)
        plus2 = MathTex("+", font_size=36)

        # Arrange: [tok_matrix] + [seg_matrix] + [pos_matrix]
        matrix_group = VGroup(
            VGroup(tok_matrix, tok_row_labels),
            plus1,
            VGroup(seg_matrix, seg_row_labels),
            plus2,
            VGroup(pos_matrix, pos_row_labels),
        )
        matrix_group.arrange(RIGHT, buff=0.4).scale(scale).shift(DOWN * 0.3)

        tok_title.next_to(tok_matrix, UP, buff=0.2).scale(scale)
        seg_title.next_to(seg_matrix, UP, buff=0.2).scale(scale)
        pos_title.next_to(pos_matrix, UP, buff=0.2).scale(scale)

        # Animate token embeddings first
        self.play(
            token_objs.animate.scale(0.7).to_edge(UP, buff=0.3),
            FadeIn(tok_matrix, tok_row_labels, tok_title),
        )
        self.wait()

        # Add segment embeddings
        self.play(FadeIn(plus1, seg_matrix, seg_row_labels, seg_title))
        self.wait()

        # Add position embeddings
        self.play(FadeIn(plus2, pos_matrix, pos_row_labels, pos_title))
        self.wait()

        # ── Sum into combined matrix ──
        combined = np.array(tok_embs) + np.array(seg_embs) + np.array(pos_embs)
        combined_matrix = self._make_matrix(combined, actual_w=768)
        combined_title = VGroup(
            Tex("Combined input", font_size=28),
            MathTex("E_{\\text{input}} = E_{\\text{token}} + E_{\\text{segment}} + E_{\\text{position}}", font_size=22),
        ).arrange(DOWN, buff=0.05)

        combined_row_labels = self._make_row_labels(combined_matrix, TOKENS, color=GREEN_E)
        combined_group = VGroup(combined_matrix, combined_row_labels).scale(0.7)
        combined_title.next_to(combined_matrix, UP, buff=0.3).scale(0.7)

        dim_brace = BraceLabel(
            combined_matrix, "C = 768", brace_direction=UP
        ).set_color(BLUE_E).scale(0.7)
        t_brace = BraceLabel(
            combined_matrix, f"T = {T}", brace_direction=LEFT
        ).set_color(GREEN_E).scale(0.7)

        self.play(
            FadeOut(matrix_group, token_objs, tok_title, seg_title, pos_title),
            FadeIn(combined_group, combined_title, dim_brace, t_brace),
        )

        self.wait(4)


# ── Scene 3: SegmentEmbeddings ──


class SegmentEmbeddings(BaseScene):
    """How BERT handles sentence pairs with segment embeddings."""

    def construct(self):
        self.camera.background_color = WHITE
        Text.set_default(color=BLACK)
        Tex.set_default(color=BLACK)
        MathTex.set_default(color=BLACK)

        title = Title("Segment Embeddings for Sentence Pairs")
        self.add(title)

        # ── Two sentences ──
        sent_a_tokens = ["[CLS]", "the", "robot", "flipped", "pancakes"]
        sent_b_tokens = ["[SEP]", "they", "were", "delicious", "[SEP]"]
        all_tokens = sent_a_tokens + sent_b_tokens
        segments = ["A"] * len(sent_a_tokens) + ["B"] * len(sent_b_tokens)

        # ── Build token boxes with segment coloring ──
        token_boxes = VGroup()
        for i, token in enumerate(all_tokens):
            color = BLUE_E if segments[i] == "A" else ORANGE
            txt = Text(token, font_size=20, color=color)
            box = SurroundingRectangle(txt, color=color, buff=0.08)
            token_boxes.add(VGroup(txt, box))
        token_boxes.arrange(RIGHT, buff=0.15).to_edge(UP, buff=0.6).scale(0.85)

        # Sentence labels
        sent_a_label = Text("Sentence A", font_size=22, color=BLUE_E)
        sent_b_label = Text("Sentence B", font_size=22, color=ORANGE)

        a_group = VGroup(*token_boxes[:len(sent_a_tokens)])
        b_group = VGroup(*token_boxes[len(sent_a_tokens):])

        a_brace = Brace(a_group, DOWN, buff=0.1).set_color(BLUE_E)
        b_brace = Brace(b_group, DOWN, buff=0.1).set_color(ORANGE)
        sent_a_label.next_to(a_brace, DOWN, buff=0.1)
        sent_b_label.next_to(b_brace, DOWN, buff=0.1)

        self.play(*[FadeIn(t) for t in token_boxes])
        self.play(
            FadeIn(a_brace, sent_a_label),
            FadeIn(b_brace, sent_b_label),
        )
        self.wait()

        # ── Show segment embedding vectors ──
        e_a_vec = VGroup(
            MathTex("E_A", font_size=28, color=BLUE_E),
            Tex("= [0.10, 0.20, ... 0.30, 0.40]", font_size=22),
        ).arrange(RIGHT, buff=0.1)

        e_b_vec = VGroup(
            MathTex("E_B", font_size=28, color=ORANGE),
            Tex("= [0.90, 0.80, ... 0.70, 0.60]", font_size=22),
        ).arrange(RIGHT, buff=0.1)

        seg_vecs = VGroup(e_a_vec, e_b_vec).arrange(DOWN, buff=0.2).shift(DOWN * 0.5)
        note = Text("Only 2 learned vectors — one per segment", font_size=20).next_to(
            seg_vecs, DOWN, buff=0.3
        )

        self.play(FadeIn(seg_vecs))
        self.play(Write(note))
        self.wait()

        # ── Show segment assignment ──
        assignment_rows = VGroup()
        for i, token in enumerate(all_tokens):
            seg = segments[i]
            color = BLUE_E if seg == "A" else ORANGE
            row = VGroup(
                Text(token, font_size=18, color=color),
                MathTex("\\rightarrow", font_size=22),
                MathTex(f"E_{seg}", font_size=22, color=color),
            ).arrange(RIGHT, buff=0.15)
            assignment_rows.add(row)

        assignment_rows.arrange_in_grid(
            2, 5, buff=(0.3, 0.15), cell_alignment=LEFT
        ).shift(DOWN * 1.5).scale(0.85)

        self.play(
            FadeOut(seg_vecs, note),
            LaggedStart(*[FadeIn(r) for r in assignment_rows], lag_ratio=0.1),
        )
        self.wait()

        # ── NSP head from [CLS] ──
        nsp_box = VGroup(
            Text("[CLS] output", font_size=22),
            MathTex("\\rightarrow", font_size=28),
            VGroup(
                Text("IsNext?", font_size=22),
                SurroundingRectangle(
                    Text("IsNext?", font_size=22), color=MAROON_E, buff=0.1
                ),
            ),
        ).arrange(RIGHT, buff=0.2).to_edge(DOWN, buff=0.5)

        self.play(FadeIn(nsp_box))
        self.wait(3)


# ── Scene 4: MaskedLanguageModeling ──


class MaskedLanguageModeling(BaseScene):
    """The MLM 80/10/10 masking strategy animated step by step."""

    def construct(self):
        self.camera.background_color = WHITE
        Text.set_default(color=BLACK)
        Tex.set_default(color=BLACK)
        MathTex.set_default(color=BLACK)

        title = Title("Masked Language Modeling")
        self.add(title)

        # ── Step 1: Show original sentence ──
        original_tokens = TOKENS_UNMASKED  # [CLS] the robot flipped pancakes [SEP]
        token_boxes = VGroup()
        for token in original_tokens:
            txt = Text(token, font_size=26)
            box = SurroundingRectangle(txt, color=BLACK, buff=0.12)
            token_boxes.add(VGroup(txt, box))
        token_boxes.arrange(RIGHT, buff=0.25).to_edge(UP, buff=0.8)

        step1 = Text("Step 1: Original sentence", font_size=22, color=GREEN_E).next_to(
            token_boxes, UP, buff=0.2
        )

        self.play(Write(step1), *[FadeIn(t) for t in token_boxes])
        self.wait()

        # ── Step 2: Select 15% for prediction ──
        # Select "flipped" (idx 3) — in the [MASK] position
        select_idx = 3  # "flipped"
        select_rect = SurroundingRectangle(
            token_boxes[select_idx], color=YELLOW_E, buff=0.05
        )
        step2 = Text(
            "Step 2: Select 15% of tokens", font_size=22, color=GREEN_E
        ).next_to(token_boxes, DOWN, buff=0.3)
        pct_label = Text("(1 of 6 ≈ 15%)", font_size=18).next_to(step2, DOWN, buff=0.1)

        self.play(Write(step2), Write(pct_label), Create(select_rect))
        self.wait()

        # ── Step 3: Apply 80/10/10 strategy ──
        step3 = Text(
            "Step 3: Apply 80/10/10 strategy", font_size=22, color=GREEN_E
        ).move_to(step2)

        # Show the three branches
        branch_80 = VGroup(
            Text("80%", font_size=20, color=MAROON_E),
            MathTex("\\rightarrow", font_size=22),
            Text("[MASK]", font_size=20, color=MAROON_E),
        ).arrange(RIGHT, buff=0.1)

        branch_10a = VGroup(
            Text("10%", font_size=20, color=TEAL_E),
            MathTex("\\rightarrow", font_size=22),
            Text("random word", font_size=20, color=TEAL_E),
        ).arrange(RIGHT, buff=0.1)

        branch_10b = VGroup(
            Text("10%", font_size=20, color=GREY_E),
            MathTex("\\rightarrow", font_size=22),
            Text("keep original", font_size=20, color=GREY_E),
        ).arrange(RIGHT, buff=0.1)

        branches = VGroup(branch_80, branch_10a, branch_10b).arrange(
            DOWN, buff=0.15, aligned_edge=LEFT
        ).next_to(step3, DOWN, buff=0.2)

        self.play(FadeOut(step2, pct_label), Write(step3))
        self.play(LaggedStart(*[FadeIn(b) for b in branches], lag_ratio=0.3))
        self.wait()

        # ── Animate the replacement: "flipped" → [MASK] ──
        highlight_rect = SurroundingRectangle(branch_80, color=MAROON_E, buff=0.05)
        self.play(Create(highlight_rect))

        old_token = token_boxes[select_idx][0]
        old_box = token_boxes[select_idx][1]
        new_token = Text("[MASK]", font_size=26, color=MAROON_E).move_to(old_token)
        new_box = SurroundingRectangle(new_token, color=MAROON_E, buff=0.12)

        self.play(
            FadeOut(old_token), FadeIn(new_token),
            FadeOut(old_box), FadeIn(new_box),
            FadeOut(select_rect),
        )
        self.wait()

        # ── Step 4: Show training target ──
        self.play(FadeOut(step3, branches, highlight_rect))

        step4 = Text(
            "Step 4: Model predicts original token", font_size=22, color=GREEN_E
        ).shift(DOWN * 0.2)

        # Show target labels
        labels = ["-1", "-1", "-1", '"flipped"', "-1", "-1"]
        label_objs = VGroup()
        for i, (label, tbox) in enumerate(zip(labels, token_boxes)):
            color = MAROON_E if i == select_idx else GREY_C
            lbl = Text(label, font_size=18, color=color).next_to(tbox, DOWN, buff=0.6)
            label_objs.add(lbl)

        target_label = Text(
            "labels (only compute loss at masked positions)", font_size=18
        ).next_to(label_objs, DOWN, buff=0.15)

        self.play(Write(step4))
        self.play(
            LaggedStart(*[FadeIn(l) for l in label_objs], lag_ratio=0.1),
            FadeIn(target_label),
        )
        self.wait()

        # ── Show prediction arrow from [MASK] ──
        pred_arrow = Arrow(
            start=label_objs[select_idx].get_bottom(),
            end=label_objs[select_idx].get_bottom() + DOWN * 0.8,
            color=MAROON_E,
        )
        pred_text = VGroup(
            Text("P(", font_size=20),
            Text('"flipped"', font_size=20, color=MAROON_E),
            Text(" | context) → high!", font_size=20),
        ).arrange(RIGHT, buff=0.05).next_to(pred_arrow, DOWN, buff=0.1)

        self.play(Create(pred_arrow), Write(pred_text))

        self.wait(4)


# ── Scene 5: BertPredictionHead ──


class BertPredictionHead(BaseScene):
    """BERT predicts from each masked position, not just the last token."""

    def construct(self):
        self.camera.background_color = WHITE
        Text.set_default(color=BLACK)
        Tex.set_default(color=BLACK)
        MathTex.set_default(color=BLACK)

        title = Title("BERT Prediction Head")
        self.add(title)

        scale = 0.6

        # ── Show output matrix (T x C) ──
        # Use X as the "output" for visualization
        output_data = X.copy()
        output_matrix = self._make_matrix(output_data, actual_w=768).scale(scale)
        output_row_labels = self._make_row_labels(output_matrix, TOKENS, color=GREEN_E)
        output_title = MathTex(
            "\\text{BERT output}\\; (T \\times C)", font_size=28
        ).next_to(output_matrix, UP, buff=0.3)

        output_group = VGroup(output_matrix, output_row_labels, output_title)
        output_group.shift(LEFT * 2.5)

        self.play(FadeIn(output_group))
        self.wait()

        # ── Highlight [MASK] row (idx 3) — NOT the last row ──
        mask_row_idx = TOKENS.index("[MASK]")
        last_row_idx = T - 1

        # Dim all rows except [MASK]
        dim_anims = []
        for i, row in enumerate(output_matrix.get_rows()):
            if i != mask_row_idx:
                for val in row:
                    dim_anims.append(val.animate.set_opacity(0.2))
        for i, label in enumerate(output_row_labels):
            if i != mask_row_idx:
                dim_anims.append(label.animate.set_opacity(0.2))

        mask_row_rect = SurroundingRectangle(
            output_matrix.get_rows()[mask_row_idx], color=MAROON_E, buff=0.05
        )

        contrast_note = Text(
            "GPT: uses last token's row\nBERT: uses [MASK] token's row",
            font_size=18,
        ).next_to(output_matrix, DOWN, buff=0.5)

        self.play(*dim_anims, Create(mask_row_rect), Write(contrast_note))
        self.wait()

        # ── Extract [MASK] row as 1 x C vector ──
        mask_vec_label = MathTex(
            "\\mathbf{h}_{[\\text{MASK}]}\\;(1 \\times C)", font_size=26, color=MAROON_E
        ).shift(RIGHT * 2 + UP * 2)

        extract_arrow = Arrow(
            start=mask_row_rect.get_right(),
            end=mask_vec_label.get_left(),
            color=MAROON_E,
            buff=0.15,
        )

        self.play(Create(extract_arrow), Write(mask_vec_label))
        self.wait()

        # ── Multiply by vocab weight matrix → softmax ──
        operation = MathTex(
            r"\times W_{\text{vocab}}\;(C \times V)",
            font_size=24,
        ).next_to(mask_vec_label, DOWN, buff=0.2)

        softmax_label = MathTex(
            r"\xrightarrow{\text{softmax}}",
            font_size=24,
        ).next_to(operation, DOWN, buff=0.2)

        self.play(Write(operation))
        self.play(Write(softmax_label))
        self.wait()

        # ── Show probability distribution ──
        vocab_words = ["flipped", "cooked", "ate", "dropped", "..."]
        vocab_probs = ["92%", "5%", "2%", "0.5%", ""]
        prob_colors = [MAROON_E, GREY_E, GREY_E, GREY_E, GREY_E]

        prob_bars = VGroup()
        for word, prob, color in zip(vocab_words, vocab_probs, prob_colors):
            word_text = Text(word, font_size=18, color=color)
            # Pad word labels to consistent width
            word_text.width = max(word_text.width, 1.0)
            bar_width = float(prob.replace("%", "")) / 30 if prob else 0.1
            bar_row = VGroup(
                word_text,
                Rectangle(
                    width=bar_width,
                    height=0.2,
                    fill_color=color,
                    fill_opacity=0.7,
                    stroke_color=color,
                ),
                Text(prob, font_size=16, color=color),
            ).arrange(RIGHT, buff=0.1)
            prob_bars.add(bar_row)

        prob_bars.arrange(DOWN, buff=0.1, aligned_edge=LEFT).next_to(
            softmax_label, DOWN, buff=0.2
        )

        self.play(LaggedStart(*[FadeIn(b) for b in prob_bars], lag_ratio=0.15))

        # Highlight winner
        winner_rect = SurroundingRectangle(prob_bars[0], color=MAROON_E, buff=0.05)
        self.play(Create(winner_rect))

        self.wait(4)


# ── Scene 6: FineTuningTransfer ──


class FineTuningTransfer(BaseScene):
    """The pre-train once, fine-tune many paradigm as a flow diagram."""

    def _make_block(self, label, color=BLACK, font_size=22):
        label_obj = Text(label, font_size=font_size).set_color(color)
        box = SurroundingRectangle(
            label_obj, buff=MED_SMALL_BUFF, corner_radius=0.1
        ).set_color(color)
        return VGroup(label_obj, box)

    def construct(self):
        self.camera.background_color = WHITE
        Text.set_default(color=BLACK)
        Tex.set_default(color=BLACK)
        MathTex.set_default(color=BLACK)

        title = Title("Pre-train Once, Fine-tune Many")
        self.add(title)

        # ── Pre-training section (left) ──
        corpus_block = self._make_block("BooksCorpus +\nWikipedia\n(3.3B words)", color=GREY_E, font_size=18)
        corpus_block.shift(LEFT * 4.5 + UP * 1)

        bert_block = self._make_block("BERT\n(12 layers)", color=BLUE_E, font_size=20)
        bert_block.shift(LEFT * 1.5 + UP * 1)

        arrow1 = Arrow(
            corpus_block.get_right(), bert_block.get_left(), color=BLACK, buff=0.15
        )

        # Objectives
        mlm_label = Text("MLM + NSP", font_size=16, color=MAROON_E).next_to(
            arrow1, UP, buff=0.05
        )

        # Time label
        time_label = Text("~4 days on TPUs", font_size=16, color=GREY_E).next_to(
            bert_block, DOWN, buff=0.2
        )

        pretrain_group = VGroup(corpus_block, arrow1, bert_block, mlm_label, time_label)

        # Pre-training label
        pretrain_title = Text(
            "Pre-training (done once)", font_size=20, color=BLUE_E
        ).next_to(pretrain_group, UP, buff=0.3)

        pretrain_brace = Brace(pretrain_group, UP, buff=0.1).set_color(BLUE_E)
        pretrain_title.next_to(pretrain_brace, UP, buff=0.1)

        self.play(
            LaggedStart(
                FadeIn(corpus_block),
                Create(arrow1),
                FadeIn(mlm_label),
                FadeIn(bert_block),
                FadeIn(time_label),
                lag_ratio=0.3,
            ),
        )
        self.play(FadeIn(pretrain_brace, pretrain_title))
        self.wait()

        # ── Fine-tuning branches (right) ──
        task_data = [
            ("Sentiment\nclassification", MAROON_E),
            ("Question\nanswering", TEAL_E),
            ("Named entity\nrecognition", GOLD_E),
        ]

        ft_blocks = VGroup()
        ft_arrows = VGroup()
        ft_labels = VGroup()

        for i, (task_name, color) in enumerate(task_data):
            block = self._make_block(task_name, color=color, font_size=16)
            y_offset = (i - 1) * 1.8  # Spread vertically
            block.shift(RIGHT * 3.5 + DOWN * y_offset)
            ft_blocks.add(block)

            arrow = Arrow(
                bert_block.get_right(), block.get_left(), color=color, buff=0.15
            )
            ft_arrows.add(arrow)

            label = Text("hours on 1 GPU", font_size=14, color=GREY_E).next_to(
                block, DOWN, buff=0.1
            )
            ft_labels.add(label)

        # Fine-tuning label
        ft_brace = Brace(
            VGroup(ft_blocks, ft_labels), RIGHT, buff=0.2
        ).set_color(GREEN_E)
        ft_title = Text(
            "Fine-tuning\n(per task)", font_size=18, color=GREEN_E
        ).next_to(ft_brace, RIGHT, buff=0.1)

        # Animate branches emerging
        self.play(
            LaggedStart(
                *[
                    AnimationGroup(Create(arrow), FadeIn(block), FadeIn(label))
                    for arrow, block, label in zip(ft_arrows, ft_blocks, ft_labels)
                ],
                lag_ratio=0.4,
            ),
        )
        self.play(FadeIn(ft_brace, ft_title))
        self.wait()

        # ── Highlight the key insight ──
        insight = Text(
            "Same pre-trained model → 3 different tasks",
            font_size=22,
            color=BLUE_E,
        ).to_edge(DOWN, buff=0.5)

        self.play(Write(insight))

        self.wait(4)
