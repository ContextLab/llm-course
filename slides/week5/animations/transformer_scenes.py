import numpy as np
from scipy.special import softmax

from manim import *


class Title(VGroup):
    """Invisible title - titles go on slides instead."""

    def __init__(self, *args, **kwargs):
        super().__init__()

    def scale(self, *args, **kwargs):
        return self


VOCAB = {
    "the": 3206,
    "robots": 2736,
    "will": 3657,
    "bring": 400,
    "prosperity": 2532,
    "aardvark": 14,
    "apple": 177,
    "box": 392,
    "cardboard": 477,
}

WORD_EMB = {
    "the": [0.07213349, 0.13476127, 0.63486506, 0.234234],
    "robots": [0.8144936, 0.51136212, 0.43797063, 0.9834],
    "will": [0.61763848, 0.29474857, 0.80120351, 0.3444],
    "bring": [0.5001875, 0.15730688, 0.93133526, 0.19484],
    "prosperity": [0.2479659, 0.41104862, 0.23145515, 0.74674],
}

POS_EMB = {
    "0": [0.3204288, 0.11540252, 0.88234465, 0.74674],
    "1": [0.14030786, 0.07085044, 0.40712213, 0.3458],
    "2": [0.07433667, 0.47350997, 0.22633834, 0.85674],
    "3": [0.80512473, 0.1189765, 0.0632117, 0.2377],
}


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
            tr_input.append([Tex("\\vdots") for i in range(len(tr_input[-1]))])
        return MobjectMatrix(tr_input)

    def _make_row_labels(self, matrix, labels, color=GREEN_E, dir=LEFT):
        rows = matrix.get_rows()
        text_objs = []
        for row, label in zip(rows, labels):
            text_objs.append(
                Text(label, font_size=24).next_to(row, dir * 3).set_color(color)
            )
        # self.add(*text_objs)
        return VGroup(*text_objs)


class TwoColumnMapping(BaseScene):
    def __init__(
        self,
        text="robots",
        embeddings=WORD_EMB,
        xlabel=None,
        ylabel=None,
        quote_tokens=True,
        show_dot_row=False,
    ):
        self.text = text
        self.vectors = [embeddings[t] for t in text.split(" ")]
        self.xlabel = xlabel
        self.ylabel = ylabel
        self.quote_tokens = quote_tokens
        self.show_dot_row = show_dot_row
        super().__init__()

    def construct(self):
        self.camera.background_color = WHITE
        Text.set_default(color=BLACK)
        Tex.set_default(color=BLACK)
        MathTex.set_default(color=BLACK)
        Arrow.set_default(color=BLACK)
        BraceLabel.set_default(color=BLACK)

        self.show_embeddings()

    def show_embeddings(self):
        words = self.text.split(" ")

        grid = VGroup()
        word_group = VGroup()
        vector_group = VGroup()
        arrow_group = VGroup()

        for i, word in enumerate(words):
            word_obj = Text(f'"{word}"') if self.quote_tokens else Text(word)
            arrow_obj = Arrow(start=LEFT, end=RIGHT)
            word_value = self.vectors[i]
            if not isinstance(word_value, list):
                word_value = [word_value]
            embedding = [
                Tex(f"{x:.2f}") if isinstance(x, float) else Tex(x) for x in word_value
            ]
            if len(embedding) > 1:
                embedding.insert(-1, Tex("\\dots"))

            vector_obj = VGroup(*list(embedding))
            vector_obj.arrange()

            grid += word_obj
            grid += arrow_obj
            grid += vector_obj

            word_group += word_obj
            vector_group += vector_obj
            arrow_group += arrow_obj

        if self.show_dot_row:
            word_dots = Tex("\\vdots")
            grid += word_dots
            word_group += word_dots
            dot_arrow = Arrow(start=LEFT, end=RIGHT)
            arrow_group += dot_arrow
            grid += dot_arrow
            vector_dots = Tex("\\vdots")
            vector_group += vector_dots
            grid += vector_dots

        grid.arrange_in_grid(
            len(words) if not self.show_dot_row else len(words) + 1, 3, buff=0.4
        )

        if self.xlabel:
            word_brace = BraceLabel(grid, self.xlabel, brace_direction=LEFT).set_color(
                GREEN_E
            )
            word_brace.label.rotate(np.pi / 2).set_color(GREEN_E).shift(RIGHT * 0.5)

        if self.ylabel:
            dim_brace = BraceLabel(
                vector_group, self.ylabel, brace_direction=UP
            ).set_color(BLUE_E)
            # dim_label = dim_brace.get_text(self.ylabel).set_color(BLUE)

        self.add(word_group)
        if self.xlabel:
            self.play(FadeIn(word_brace))
        self.play(FadeIn(arrow_group))
        if self.ylabel:
            self.play(FadeIn(vector_group, dim_brace))
        else:
            self.play(FadeIn(vector_group))

        self.wait(4)


class TransformerFunc(BaseScene):
    def __init__(self, show_tokenization=True):
        super().__init__()
        self.show_tokenization = show_tokenization

        # Light mode
        self.camera.background_color = WHITE
        Text.set_default(color=BLACK)
        Tex.set_default(color=BLACK)
        MathTex.set_default(color=BLACK)
        Line.set_default(color=BLACK)
        Rectangle.set_default(color=BLACK)

    def construct(self):
        title1 = Title("The Transformer function", match_underline_width_to_text=True)
        title2 = Title(
            "Given word sequence, return next word", match_underline_width_to_text=True
        )
        title3 = Text("...with tokenization").move_to(UP * 2).scale(0.6)
        subtext = Tex("$\\theta$: model parameters").move_to(DOWN * 2).scale(0.8)
        subtext_box = SurroundingRectangle(subtext).set_color(BLACK)

        p1 = Tex("Transformer$($")
        p2 = Tex("$X$").set_color(BLUE_E)
        p3 = Tex("$,\\theta\\;) \\rightarrow$")
        p4 = Tex("$Y$").set_color(GREEN_E)
        eq_group = VGroup(p1, p2, p3, p4)
        eq_group.arrange()

        sentence = "the robots will bring prosperity".split(" ")
        prompt = sentence[:-1]
        answer = sentence[-1]
        p2_words = (
            MathTex("``" + "\\;".join(prompt) + '"').shift(LEFT).set_color(BLUE_E)
        )
        p4_word = (
            MathTex(f'``{answer}"').next_to(p2_words, RIGHT * 5).set_color(GREEN_E)
        )

        prompt_token_ids = [VOCAB[word] for word in prompt]
        p2_ids = MathTex(str(prompt_token_ids)).set_color(BLUE_E)
        p4_id = (
            MathTex(str(VOCAB[answer])).next_to(p2_ids, RIGHT * 5).set_color(GREEN_E)
        )

        self.play(
            LaggedStart(
                Write(title1),
                FadeIn(eq_group),
                FadeIn(subtext),
                Create(subtext_box),
                lag_ratio=0.3,
                run_time=3,
            )
        )
        self.wait(2)
        eq_group = VGroup(p1, p2_words, p3, p4_word)
        self.play(
            FadeOut(title1),
            Write(title2),
            FadeOut(p2, p4),
            FadeIn(p2_words, p4_word),
            eq_group.animate.arrange(),
        )
        self.wait(2)

        if self.show_tokenization:
            eq_group = VGroup(p1, p2_ids, p3, p4_id)
            self.play(
                Write(title3),
                FadeOut(p2_words, p4_word),
                FadeIn(p2_ids, p4_id),
                eq_group.animate.arrange(),
            )

        self.wait(4)


class WordEmbeddings(BaseScene):
    def __init__(self):
        self.sentence = "the robots will bring"
        self.sentence_tokens = self.sentence.split(" ")
        super().__init__()

    def add_pos_labels(self, token_objs):
        labels = VGroup()
        for i, obj in enumerate(token_objs):
            label = Tex(f"{i}", font_size=36)
            label.next_to(obj, UP, SMALL_BUFF)
            obj.add(label)
            labels.add(label)
        return labels

    def make_sentence_tokens(self):
        token_objs = Tex(*self.sentence_tokens)
        boxes = [SurroundingRectangle(t).set_color(YELLOW_E) for t in token_objs]
        token_boxes = [VGroup(t, b) for (t, b) in zip(token_objs, boxes)]
        group = VGroup(*token_boxes)
        group.arrange(RIGHT, buff=0.5)
        return group

    def animate_sentence_tokens(self):
        token_group = self.make_sentence_tokens()
        num_tokens = len(token_group)
        token_boxes = [t[1] for t in token_group]
        self.play(*[FadeIn(t[0]) for t in token_group], run_time=1)

        self.play(*[Create(b) for b in token_boxes], run_time=1)
        self.play(
            token_group.animate.arrange_in_grid(num_tokens, 1, cell_alignment=RIGHT)
            .shift(LEFT * 5)
            .shift(DOWN),
            run_time=1,
        )

        return token_group

    def animate_embeddings(self, prev_col, keys, embd_map):
        emb_arrows = [
            Arrow(start=LEFT, end=RIGHT).next_to(i, RIGHT, buff=MED_LARGE_BUFF)
            for i in prev_col
        ]
        emb_rows = [
            [Tex(f"{x:.2f}") for x in embd_map[t]] for (i, t) in enumerate(keys)
        ]
        # Add ... to embedding vectors
        for row in emb_rows:
            row.insert(-1, MathTex("\\dots"))
        embs = [
            VGroup(
                *[
                    VGroup(
                        t,
                        SurroundingRectangle(t).set_stroke(
                            BLACK, opacity=0 if i == len(row) - 2 else 1
                        ),
                    )
                    for (i, t) in enumerate(row)
                ]
            )
            .arrange(RIGHT, buff=0)
            .next_to(emb_arrows[i], buff=MED_LARGE_BUFF)
            for (i, row) in enumerate(emb_rows)
        ]
        embs_label = BraceLabel(embs[0], "C = 768", brace_direction=UP).set_color(
            BLUE_E
        )

        self.play(*[Create(a) for a in emb_arrows])
        self.play(*[FadeIn(a) for a in embs], FadeIn(embs_label))

        return VGroup(*embs)

    def construct(self):
        title = Title("Token embeddings", match_underline_width_to_text=True)
        self.add(title)

        token_group = self.animate_sentence_tokens()
        token_objs = [t[0] for t in token_group]

        id_arrows = [
            Arrow(start=LEFT, end=RIGHT).next_to(t, RIGHT, buff=MED_LARGE_BUFF)
            for t in token_objs
        ]
        ids = [
            Tex(str(VOCAB[t])).next_to(id_arrows[i], RIGHT, buff=MED_LARGE_BUFF)
            for (i, t) in enumerate(self.sentence_tokens)
        ]
        ids_right_idx = np.argmax([id.get_right()[0] for id in ids])
        for id in ids:
            id.align_to(ids[ids_right_idx], RIGHT)

        self.play(*[Create(a) for a in id_arrows])
        self.play(
            *[FadeIn(a) for a in ids],
            FadeIn(BraceLabel(ids[0], "ID", UP).set_color(GREEN_E)),
        )

        embedding_obj = self.animate_embeddings(ids, self.sentence_tokens, WORD_EMB)
        emb_matrix = self._make_matrix(
            [WORD_EMB[w] for w in self.sentence_tokens], actual_w=786
        )
        emb_matrix.shift(DOWN * 0.5)

        self.wait(2)
        self.clear()
        title2 = Title("Token embedding matrix", match_underline_width_to_text=True)
        self.play(embedding_obj.animate.center().shift(DOWN * 0.5), Write(title2))
        self.wait()
        self.play(
            FadeOut(embedding_obj),
            FadeIn(emb_matrix),
            FadeIn(BraceLabel(emb_matrix, "C = 768", UP).set_color(BLUE_E)),
            FadeIn(
                BraceLabel(
                    emb_matrix, f"T = {len(self.sentence_tokens)}", LEFT
                ).set_color(GREEN_E)
            ),
        )

        self.wait(3)


class PositionEmbeddings(WordEmbeddings):
    def __init__(self):
        self.sentence = "the robots will bring"
        self.sentence_tokens = self.sentence.split(" ")
        super().__init__()

    def animate_sentence_tokens(self):
        token_group = self.make_sentence_tokens()
        num_tokens = len(token_group)
        token_boxes = [t[1] for t in token_group]
        self.play(*[FadeIn(t[0]) for t in token_group], run_time=1)

        token_labels = self.add_pos_labels(token_group)
        self.play(
            *[Create(b) for b in token_boxes],
            *[FadeIn(p) for p in token_labels],
            run_time=1,
        )
        vert_labels = token_labels.copy()
        for l in vert_labels:
            l.set_color(BLUE_E)
        vert_group = VGroup(
            *[
                VGroup(
                    l, SurroundingRectangle(l, buff=MED_SMALL_BUFF).set_color(YELLOW_E)
                )
                for l in vert_labels
            ]
        )
        vert_group.arrange_in_grid(num_tokens, 1, cell_alignment=RIGHT).shift(
            LEFT * 3
        ).shift(DOWN * 1)

        self.play(
            *[TransformMatchingShapes(g, t) for (g, t) in zip(token_group, vert_group)],
            run_time=1,
        )

        return vert_group

    def construct(self):
        title = Title("Position embeddings", match_underline_width_to_text=True)
        self.add(title)

        token_group = self.animate_sentence_tokens()
        emb_obj = self.animate_embeddings(
            token_group, [str(x) for x in range(len(self.sentence_tokens))], POS_EMB
        )
        emb_matrix = self._make_matrix(
            [POS_EMB[str(i)] for i in range(len(self.sentence_tokens))], actual_w=768
        )
        emb_matrix.shift(DOWN * 0.5)

        self.wait()
        self.clear()
        title2 = Title("Position embedding matrix", match_underline_width_to_text=True)
        self.play(emb_obj.animate.move_to(emb_matrix.get_center()), Write(title2))
        self.wait()
        self.play(
            FadeOut(emb_obj),
            FadeIn(emb_matrix),
            FadeIn(BraceLabel(emb_matrix, "C = 786", UP).set_color(BLUE_E)),
            FadeIn(
                BraceLabel(
                    emb_matrix, f"T = {len(self.sentence_tokens)}", LEFT
                ).set_color(GREEN_E)
            ),
        )

        self.wait(3)


class Vocabulary(TwoColumnMapping):
    def __init__(self):
        sentence = "aardvark apple box cardboard"
        super().__init__(
            sentence,
            VOCAB,
            xlabel="All\\; words",
            ylabel="Unique\\; ID",
            show_dot_row=True,
        )


class PreparingEmbeddings(BaseScene):
    def construct(self):
        self.camera.background_color = WHITE
        Mobject.set_default(color=BLACK)

        input_sentence = "the robots will bring"
        input_tokens = input_sentence.split(" ")
        token_embeddings = [WORD_EMB[word] for word in input_tokens]
        pos_embeddings = [POS_EMB[str(x)] for x in range(len(token_embeddings))]

        self.show_summation(input_sentence.split(" "), token_embeddings, pos_embeddings)

    def show_summation(self, tokens, token_emb, pos_emb):
        token_matrix = self._make_matrix(token_emb)
        pos_matrix = self._make_matrix(pos_emb)
        token_labels = self._make_row_labels(token_matrix, tokens)
        self.add(token_labels)
        pos_labels = self._make_row_labels(
            pos_matrix, [str(x) for x in list(range(len(tokens)))], BLUE_E
        )
        self.add(pos_labels)
        plus_sign = MathTex("+")
        matrix_group = VGroup()
        matrix_group += VGroup(token_matrix, token_labels)
        matrix_group += plus_sign
        matrix_group += VGroup(pos_matrix, pos_labels)
        matrix_group.arrange(RIGHT, buff=1).scale(0.7)
        self.add(matrix_group)

        token_matrix_title = VGroup()
        token_matrix_title += Tex("Token embedding matrix")
        token_matrix_title += MathTex("T \\times C")
        token_matrix_title.arrange(DOWN).next_to(token_matrix, UP)
        self.add(token_matrix_title.scale(0.7))

        pos_matrix_title = VGroup()
        pos_matrix_title += Tex("Position embedding matrix")
        pos_matrix_title += MathTex("T \\times C")
        pos_matrix_title.arrange(DOWN).next_to(pos_matrix, UP)
        self.add(pos_matrix_title.scale(0.7))

        result_tensor = np.array(token_emb) + np.array(pos_emb)
        result_matrix = self._make_matrix(result_tensor)

        self.wait(2)
        self.play(
            Transform(token_matrix, result_matrix),
            Transform(pos_matrix, result_matrix),
            FadeOut(token_matrix_title),
            FadeOut(token_labels),
            FadeOut(pos_labels),
            FadeOut(plus_sign),
            FadeOut(pos_matrix_title),
            FadeIn(
                Title(
                    "Token embeddings with positional information",
                    match_underline_width_to_text=True,
                ).scale(0.7)
            ),
            FadeIn(
                Tex("$T \\times C$ \\; matrix").next_to(result_matrix, UP).scale(0.7)
            ),
        )

        self.wait(4)

    def _make_matrix(self, embeddings):
        tr_input = []
        for row in embeddings:
            tr_row = [Tex(f"{e:.2f}") for e in row]
            tr_row.insert(-1, Tex("\\dots"))
            tr_input.append(tr_row)
        return MobjectMatrix(tr_input)

    def show_embedding_matrix(self, title, input_els, embeddings):
        input_matrix = self._make_matrix(embeddings).shift(UP)
        word_brace = Brace(input_matrix, direction=LEFT).set_color(GREEN)
        word_label = (
            word_brace.get_text(f"T = {len(embeddings)}")
            .rotate(np.pi / 2)
            .set_color(GREEN)
        )
        dim_brace = Brace(input_matrix, direction=UP).set_color(BLUE)
        dim_label = dim_brace.get_text("C = 786").set_color(BLUE)

        token_embed = VGroup(input_matrix, word_brace, word_label, dim_brace, dim_label)

        self.play(
            Write(Text(title).scale(0.7).shift(UP * 3.5), run_time=1.0),
            FadeIn(token_embed.scale(0.9).shift(DOWN)),
        )
        self.add(
            Text(f"T = Number of input tokens").next_to(token_embed, DOWN).scale(0.6),
            Text("C = Embedding size").next_to(token_embed, DOWN * 3).scale(0.6),
        )

        boxes = []
        arrows = []
        tex_words = []
        tokens = input_els.split(" ")
        for row, token in zip(input_matrix.get_rows(), tokens):
            box = SurroundingRectangle(row)
            boxes.append(box)

            right = box.get_right()
            arrow_start = right + UP + 2 * RIGHT
            arrow = Arrow(arrow_start, right, color=GOLD)
            arrows.append(arrow)

            tex_word = (
                Tex(f"{token}").set_color(YELLOW_E).move_to(arrow_start + UP * 0.2)
            )
            tex_words.append(tex_word.scale(0.8))

        self.play(Create(boxes[0]), Create(arrows[0]), Write(tex_words[0]))
        for i in range(1, len(boxes)):
            self.play(
                ReplacementTransform(boxes[i - 1], boxes[i]),
                ReplacementTransform(arrows[i - 1], arrows[i]),
                ReplacementTransform(tex_words[i - 1], tex_words[i]),
            )

        self.wait(2)
        l = len(boxes) - 1
        self.remove(boxes[l], arrows[l], tex_words[l])


W_q = [
    [0.01709965, 0.20559682, 0.90766753, 0.36548788],
    [0.02768106, 0.01542399, 0.16847536, 0.04647367],
    [0.29419629, 0.07176163, 0.52280922, 0.98845474],
    [0.38029319, 0.37204369, 0.26050348, 0.27888336],
]

W_k = [
    [0.67383858, 0.21002631, 0.8482494, 0.87675781],
    [0.61418084, 0.23613776, 0.95156319, 0.98638726],
    [0.37521633, 0.68420714, 0.56015166, 0.39119616],
    [0.62398383, 0.16486183, 0.64840995, 0.02869917],
]

W_v = [
    [0.88331375, 0.87184928, 0.30323276, 0.36260797],
    [0.1037309, 0.14941837, 0.50365278, 0.72002583],
    [0.35869758, 0.94882774, 0.39777354, 0.97171923],
    [0.85706455, 0.0422039, 0.29162834, 0.20452469],
]


class BaseSelfAttn(BaseScene):
    def __init__(self):
        super().__init__()
        self.sentence = "the robots will bring"
        self.sentence_tokens = self.sentence.split(" ")
        self.token_emb = [WORD_EMB[word] for word in self.sentence_tokens]
        self.pos_emb = [POS_EMB[str(x)] for x in range(len(self.sentence_tokens))]
        self.X = np.array(self.token_emb) + np.array(self.pos_emb)
        self.n_embd = 768
        self.n_head = 12


class QueryKeyValue(BaseSelfAttn):
    def __init__(self):
        super().__init__()

    def _animate_matmul(
        self,
        emb_matrix: MobjectMatrix,
        w_matrix: MobjectMatrix,
        res_matrix: MobjectMatrix,
    ):
        row_boxes = []
        for row in emb_matrix.get_rows():
            row_boxes.append(SurroundingRectangle(row))

        res_boxes = []
        for row in res_matrix.get_rows():
            res_boxes.append(SurroundingRectangle(row))
        w_box = SurroundingRectangle(w_matrix)
        self.play(Create(row_boxes[0]), Create(w_box))
        self.play(
            Create(res_boxes[0]), res_matrix.get_rows()[0].animate.set_opacity(1.0)
        )
        for i in range(len(emb_matrix.get_rows()) - 1):
            self.play(
                ReplacementTransform(row_boxes[i], row_boxes[i + 1]),
                res_matrix.get_rows()[i + 1].animate.set_opacity(1.0),
                ReplacementTransform(res_boxes[i], res_boxes[i + 1]),
            )
            self.wait()

        self.play(FadeOut(row_boxes[-1], res_boxes[-1], w_box))

    def construct(self):
        input_tensor = np.array(self.token_emb) + np.array(self.pos_emb)

        lhs1 = VGroup()
        input_matrix = self._make_matrix(input_tensor, actual_w=self.n_embd)
        W_q_matrix = self._make_matrix(W_q, actual_h=self.n_embd, actual_w=self.n_embd)
        lhs1.add(
            VGroup(
                input_matrix,
                MathTex("T \\times C").next_to(input_matrix, UP).scale(0.7),
            )
        )
        lhs1.add(MathTex("\\times"))
        lhs1.add(
            VGroup(
                W_q_matrix,
                MathTex("W_q \\; (C \\times C)").next_to(W_q_matrix, UP).scale(0.7),
            )
        )
        lhs1.add(MathTex("="))
        lhs1.arrange().scale(0.7)
        in_row_labels = self._make_row_labels(input_matrix, self.sentence_tokens)

        title1 = Title(
            "Query, key, value vectors for each word",
            match_underline_width_to_text=True,
        )
        self.add(title1)

        Q_matrix = (
            self._make_matrix(np.matmul(input_tensor, W_q), actual_w=self.n_embd)
            .scale(0.9)
            .shift(DOWN * 1.2)
        )
        for row in Q_matrix.get_rows():
            for el in row:
                el.set_opacity(0.0)
        q_row_labels = self._make_row_labels(Q_matrix, self.sentence_tokens)

        self.add(lhs1)
        self.add(in_row_labels)

        self.wait()

        explain_msg = Text("Query\nmatrix (Q)").next_to(Q_matrix, RIGHT).scale(0.7)
        explain_msg_pos = explain_msg.get_left()
        self.play(
            lhs1.animate.scale(0.9).to_edge(UP),
            FadeIn(Q_matrix),
            FadeOut(title1, shift=UP),
            Write(explain_msg),
            *[
                TransformMatchingShapes(i, q)
                for (i, q) in zip(in_row_labels, q_row_labels)
            ],
        )
        self.wait()
        self._animate_matmul(input_matrix, W_q_matrix, Q_matrix)
        self.wait()

        self.remove(explain_msg)
        explain_msg = (
            Text("Repeat\nto get Key\nand Value\nmatrices.")
            .move_to(explain_msg_pos, aligned_edge=LEFT)
            .shift(LEFT)
            .scale(0.7)
        )
        self.play(Write(explain_msg))

        self.wait()

        scale_factor = 0.7 * 0.9

        K_matrix = (
            self._make_matrix(np.matmul(input_tensor, W_k), actual_w=self.n_embd)
            .scale(0.9)
            .shift(DOWN * 1.2)
        )
        W_k_matrix = (
            self._make_matrix(W_k, actual_h=self.n_embd, actual_w=self.n_embd)
            .scale(scale_factor)
            .move_to(W_q_matrix.get_center())
        )
        W_k_matrix_group = VGroup(
            W_k_matrix,
            MathTex("W_k \\; (C \\times C)")
            .next_to(W_k_matrix, UP)
            .scale(scale_factor),
        )
        K_label = (
            Text("Key\nmatrix (K)")
            .move_to(explain_msg_pos, aligned_edge=LEFT)
            .shift(LEFT)
            .scale(0.7)
        )
        self.play(
            FadeOut(lhs1[2], Q_matrix, explain_msg, shift=UP),
            FadeIn(W_k_matrix_group, K_matrix, K_label, shift=UP),
        )
        self.wait(2)

        V_matrix = (
            self._make_matrix(np.matmul(input_tensor, W_v), actual_w=self.n_embd)
            .scale(0.9)
            .shift(DOWN * 1.2)
        )
        W_v_matrix = (
            self._make_matrix(W_v, actual_h=self.n_embd, actual_w=self.n_embd)
            .scale(scale_factor)
            .move_to(W_q_matrix.get_center())
        )
        W_v_matrix_group = VGroup(
            W_v_matrix,
            MathTex("W_v \\; (C \\times C)")
            .next_to(W_v_matrix, UP)
            .scale(scale_factor),
        )
        V_label = (
            Text("Value\nmatrix (V)")
            .move_to(explain_msg_pos, aligned_edge=LEFT)
            .shift(LEFT)
            .scale(0.7)
        )
        self.play(
            FadeOut(W_k_matrix_group, K_matrix, K_label, shift=UP),
            FadeIn(W_v_matrix_group, V_matrix, V_label, shift=UP),
        )

        self.wait(2)


class SplittingHeads(BaseSelfAttn):
    def __init__(self):
        super().__init__()

        self.q = softmax(np.matmul(self.X, W_q) / 0.5, axis=1)
        self.q_obj = self._make_matrix(self.q, actual_w=self.n_embd)
        self.head_sz = self.n_embd // self.n_head

        self.q_heads = self._make_heads(self.q)

    def _make_heads(self, matrix):
        """Generate dummy attention head matrices using the given matrix."""
        heads = [matrix.copy(), matrix.copy()]
        tmp = (
            matrix + 0.1
        ) * 1.234  # random operation to always generate the same matrix
        heads.insert(1, softmax(tmp, axis=1))
        heads[-1] += 0.2
        heads[-1][:, -1] = matrix[:, -1]
        return [self._make_matrix(h, actual_w=self.head_sz) for h in heads]

    def construct(self):
        title = Title(
            'Split Q, K and V matrices into ``heads"',
            match_underline_width_to_text=True,
        ).scale(0.7)
        self.add(title)

        eq1 = VGroup()
        eq1.add(self.q_obj)
        eq1_title = (
            MathTex(f"Q\\; (T \\times C)")
            .next_to(self.q_obj, UP, buff=SMALL_BUFF)
            .scale(0.6)
        )
        self.add(eq1_title)
        self.add(eq1.scale(0.8))

        self.wait()
        explain_msgs = (
            VGroup(
                VGroup(
                    Tex(f"No. of words (T) = {len(self.sentence_tokens)}"),
                    Tex(f"Embedding size (C) = {self.n_embd}"),
                ).arrange(DOWN),
                VGroup(
                    Tex(f"No. of heads = {self.n_head}"),
                    Tex(f"Head size (H) = $C / {self.n_head} = {self.head_sz}$"),
                ).arrange(DOWN),
            )
            .arrange(buff=LARGE_BUFF)
            .next_to(eq1, DOWN, buff=LARGE_BUFF)
            .scale(0.6)
        )
        self.play(Write(explain_msgs), run_time=2)
        self.wait()

        head_group = (
            VGroup(*self.q_heads[:-1], Tex("\\dots"), self.q_heads[-1])
            .arrange()
            .scale(0.7)
        )

        self.play(
            *[TransformMatchingShapes(eq1.copy(), h) for h in head_group],
            FadeIn(
                BraceLabel(
                    head_group,
                    f"{self.n_head} heads of size {self.head_sz} each",
                    label_constructor=Tex,
                    brace_direction=DOWN,
                    font_size=32,
                ).set_color(BLUE_E)
            ),
            FadeOut(eq1, eq1_title),
            FadeIn(
                *[
                    BraceLabel(
                        h,
                        f"Q_{{{i + 1 if i < 2 else self.n_head}}}\\; (T \\times H)",
                        UP,
                        font_size=32,
                        color=GREEN_E,
                    )
                    for (i, h) in enumerate(head_group)
                    if isinstance(h, MobjectMatrix)
                ]
            ),
            run_time=1,
        )
        self.wait(3)


class SelfAttn(SplittingHeads):
    def __init__(self):
        super().__init__()

        self.k = softmax(np.matmul(self.X, W_k) / 0.5, axis=1)
        self.k_heads = self._make_heads(self.k)

        self.attn = softmax(np.matmul(self.q, np.transpose(self.k)) / 0.1, axis=1)
        self.attn_obj = self._make_matrix(self.attn)

    def _make_col_labels(
        self, matrix: MobjectMatrix, labels: list[str], dir=DOWN, color=GREEN_E
    ):
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

    def _animate_self_attn(self, q_matrix, k_matrix, res_matrix: MobjectMatrix):
        q_rows = q_matrix.get_rows()
        k_cols = k_matrix.get_columns()
        res_rows = res_matrix.get_rows()

        row_boxes = []
        for r in q_rows:
            row_boxes.append(SurroundingRectangle(r))

        col_boxes = []
        for c in k_cols:
            col_boxes.append(SurroundingRectangle(c))

        self.play(Create(row_boxes[0]), Create(col_boxes[0]))

        # Only show two rows of matrix mult
        for i in range(min(2, len(row_boxes))):
            for j in range(len(col_boxes) - 1):
                self.play(
                    ReplacementTransform(col_boxes[j], col_boxes[j + 1]),
                    res_rows[i][j].animate.set_opacity(1.0),
                    run_time=0.7,
                )
                self.wait(0.5)

            last_col_box = col_boxes[-1]

            for j, c in enumerate(k_cols):
                col_boxes[j] = SurroundingRectangle(c)

            if i < len(row_boxes) - 1:
                self.play(
                    ReplacementTransform(row_boxes[i], row_boxes[i + 1]),
                    ReplacementTransform(last_col_box, col_boxes[0]),
                    res_rows[i][-1].animate.set_opacity(1.0),
                )
                self.wait(0.5)
        self.play(
            FadeOut(row_boxes[i + 1], col_boxes[0]),
            # show remaining values in the result matrix
            *[val.animate.set_opacity(1.0) for row in res_rows[2:] for val in row],
        )

    def construct(self):
        title = Title("Self Attention", match_underline_width_to_text=True)
        self.add(title)

        k0_title = MathTex("K_1\\; (T \\times H)", font_size=32).next_to(
            self.k_heads[0], UP
        )
        q0_grp = VGroup(
            MathTex("Q_1\\; (T \\times H)", font_size=32).next_to(self.q_heads[0], UP),
            self.q_heads[0],
        )
        k0_grp = VGroup(k0_title, self.k_heads[0])

        k_rows = self.k_heads[0].get_rows()
        k_num_rows = len(k_rows)
        k_num_cols = len(k_rows[0])
        for row in k_rows:
            for val in row:
                val.generate_target()

        scale = 0.7
        eq_lhs = VGroup()
        eq_lhs.add(
            q0_grp.scale(scale), MathTex("\\times"), k0_grp.scale(scale)
        ).arrange(buff=MED_LARGE_BUFF)

        k0_labels = self._make_row_labels(
            self.k_heads[0], self.sentence_tokens, dir=RIGHT, color=BLUE_E
        )
        q0_labels = self._make_row_labels(self.q_heads[0], self.sentence_tokens)

        eq_lhs.add(q0_labels, k0_labels)
        self.add(eq_lhs)

        # Transposed target matrix
        k0_tr = MobjectMatrix(
            [
                [k_rows[j][i].target for j in range(k_num_rows)]
                for i in range(k_num_cols)
            ],
        )

        k0_tr.move_to(self.k_heads[0].get_center()).scale(scale)
        k0_tr_cols = k0_tr.get_columns()

        for l, col in zip(k0_labels, k0_tr_cols):
            l.generate_target()
            l.target.rotate(-PI / 2).next_to(col, DOWN)

        self.wait()

        k0_tr_title = (
            MathTex("K_1^T\\; (H \\times T)", font_size=32)
            .move_to(k0_title)
            .scale(scale)
        )
        self.play(
            *[MoveToTarget(x) for row in k_rows for x in row],
            *[MoveToTarget(l) for l in k0_labels],
            TransformMatchingShapes(k0_title, k0_tr_title),
        )

        k0_grp.remove(k0_title)
        k0_grp.add(k0_tr_title)

        self.wait()

        self.attn_obj.scale(scale).shift(DOWN * 1.5)
        attn_row_labels = self._make_row_labels(self.attn_obj, self.sentence_tokens)
        attn_col_labels = self._make_col_labels(
            self.attn_obj, self.sentence_tokens, color=BLUE_E
        )
        attn_label = MathTex("A_1\\; (T \\times T)", font_size=32).next_to(
            self.attn_obj, UP
        )
        attn_grp = VGroup(self.attn_obj, attn_row_labels, attn_col_labels, attn_label)

        for row in self.attn_obj:
            for val in row:
                if isinstance(val, Tex):
                    val.set_opacity(0.0)

        self.play(
            title.animate.scale(0.5).to_edge(UP + LEFT),
            eq_lhs.animate.scale(0.8).to_edge(UP),
            FadeIn(self.attn_obj, attn_row_labels, attn_col_labels, attn_label),
        )

        k0_tr.move_to(self.k_heads[0].get_center()).scale_to_fit_height(
            self.k_heads[0].height
        )
        self._animate_self_attn(self.q_heads[0], k0_tr, self.attn_obj)

        self.play(
            FadeOut(eq_lhs, title, shift=UP),
            attn_grp.animate.scale(1 / scale).center().shift(LEFT + DOWN * 0.5),
        )

        # Mask upper triangle in attn matrix
        # mask_anims = []
        # for (i, row) in enumerate(self.attn_obj.get_rows()):
        #     for (j, val) in enumerate(row):
        #         if j > i:
        #             mask_anims.append(val.animate.set_opacity(0.1))

        expl = Title("Pair-wise attention scores", match_underline_width_to_text=True)
        self.play(Write(expl))
        # self.wait()
        # self.play(*mask_anims)

        self.wait(2)


class SelfAttnPt2(SelfAttn):
    def __init__(self):
        super().__init__()
        T = len(self.sentence_tokens)
        masked_attn_arr = np.ma.array(self.attn, mask=(np.tril(np.ones((T, T))) == 0))
        masked_attn_arr = np.ma.filled(masked_attn_arr, fill_value=-np.inf)
        self.attn_norm = softmax(masked_attn_arr, axis=1)
        self.attn_norm_obj = self._make_matrix(self.attn_norm)

        self.v = softmax(np.matmul(self.X, W_v) / 0.5, axis=1)
        self.v_heads = self._make_heads(self.v)

        self.y = softmax(np.matmul(self.attn_norm, self.v), axis=1)
        self.y_obj = self._make_matrix(self.y, actual_w=self.head_sz)

    def construct(self):
        title = Title("Self Attention", match_underline_width_to_text=True)
        self.add(title)

        scale = 0.7

        self.attn_obj.scale(scale)
        self.attn_norm_obj.scale(scale)
        attn_row_labels = self._make_row_labels(self.attn_obj, self.sentence_tokens)
        attn_col_labels = self._make_col_labels(
            self.attn_obj, self.sentence_tokens, color=BLUE_E
        )
        attn_label = MathTex("A_1\\; (T \\times T)", font_size=32).next_to(
            self.attn_obj, UP
        )

        attn_grp = VGroup(self.attn_obj, attn_row_labels, attn_col_labels, attn_label)
        self.add(attn_grp)

        mask_anims = []
        norm_anims = []
        attn_norm_rows = self.attn_norm_obj.get_rows()
        for i, row in enumerate(self.attn_obj.get_rows()):
            for j, val in enumerate(row):
                norm_anims.append(ReplacementTransform(val, attn_norm_rows[i][j]))
                if j > i:
                    mask_anims.append(val.animate.set_opacity(0.2))

        mask_expl = Text(
            "Mask attention scores\nfor words that occur\nearlier in the sentence",
            font_size=24,
        ).next_to(attn_grp, RIGHT)
        self.play(Write(mask_expl))

        self.play(*mask_anims)
        self.wait(2)

        mask_expl_2 = Text(
            "Normalize each row\nto make it a\nprobability distribution.", font_size=24
        ).next_to(attn_grp, RIGHT)
        self.remove(mask_expl)
        self.play(Write(mask_expl_2))
        self.wait(2)

        self.play(*norm_anims)
        self.wait()

        self.remove(mask_expl_2)

        self.play(attn_grp.animate.shift(LEFT * 2.5))

        v0 = self.v_heads[0].shift(RIGHT * 2.5).scale(scale)
        v0_title = MathTex("V_1\\; (T \\times H)", font_size=32).next_to(v0, UP)
        v0_labels = self._make_row_labels(
            v0, self.sentence_tokens, dir=RIGHT, color=BLUE_E
        )

        self.play(FadeIn(MathTex("\\times"), v0, v0_title, v0_labels))
        self.wait()

        focus_idx = 1
        ex_msg = Text(
            f'Output embedding for one word, e.g., "{self.sentence_tokens[focus_idx]}"',
            font_size=32,
        ).to_edge(UP)
        self.remove(title)
        self.play(Write(ex_msg))
        self.play(
            *[
                r.animate.set_opacity(0.2)
                for (i, r) in enumerate(self.attn_norm_obj.get_rows())
                if i != focus_idx
            ],
            *[
                l.animate.set_opacity(0.2)
                for (i, l) in enumerate(attn_row_labels)
                if i != focus_idx
            ],
        )

        box_colors = [PURE_RED, PURE_BLUE, GREY_E, GREY_E]
        for i in range(len(self.sentence_tokens)):
            self.play(
                Create(
                    SurroundingRectangle(
                        self.attn_norm_obj.get_rows()[focus_idx][i]
                    ).set_color(box_colors[i])
                ),
                Create(SurroundingRectangle(v0.get_rows()[i]).set_color(box_colors[i])),
            )
            self.wait()

        eq1 = MathTex(
            "Y_1(",
            self.sentence_tokens[focus_idx] + ") = ",
            f"{self.attn_norm[focus_idx, 0]:.2f} \\cdot ",
            f"V_1({self.sentence_tokens[0]})",
            f"+ {self.attn_norm[focus_idx, 1]:.2f} \\cdot ",
            f"V_1({self.sentence_tokens[1]})",
            font_size=32,
        )
        eq1[3].set_color(box_colors[0])
        eq1[5].set_color(box_colors[1])
        eq1.to_edge(DOWN)

        self.play(Write(VGroup(*eq1[:3], eq1[4])))
        self.wait()

        self.play(FadeTransform(v0.get_rows()[0], eq1[3]))
        self.wait()
        self.play(FadeTransform(v0.get_rows()[1], eq1[5]))
        self.wait(3)


class SelfAttnPt3(SelfAttnPt2):
    def construct(self):
        title = Title("Compute output matrix $Y_1$", match_underline_width_to_text=True)
        self.play(Write(title), run_time=0.8)

        scale = 0.7
        attn = self.attn_norm_obj.scale(scale)
        v0 = self.v_heads[0].scale(scale)
        times = MathTex("\\times")
        eq2 = VGroup(attn, times, v0).arrange()

        attn_row_labels = self._make_row_labels(
            self.attn_norm_obj, self.sentence_tokens
        )
        attn_col_labels = self._make_col_labels(
            self.attn_norm_obj, self.sentence_tokens, color=BLUE_E
        )
        attn_title = MathTex("A_1\\; (T \\times T)", font_size=32).next_to(
            self.attn_norm_obj, UP
        )
        attn_grp = VGroup(
            self.attn_norm_obj, attn_row_labels, attn_col_labels, attn_title
        )

        v0_title = MathTex("V_1\\; (T \\times H)", font_size=32).next_to(v0, UP)
        v0_labels = self._make_row_labels(
            v0, self.sentence_tokens, dir=RIGHT, color=BLUE_E
        )
        v0_grp = VGroup(v0, v0_title, v0_labels)

        self.play(
            FadeIn(
                eq2, attn_row_labels, attn_title, attn_col_labels, v0_labels, v0_title
            )
        )

        self.wait()

        y0 = self.y_obj
        y0_title = MathTex("Y_1\\; (T \\times H)", font_size=32).next_to(y0, UP)
        y0_labels = self._make_row_labels(
            y0, self.sentence_tokens, dir=LEFT, color=BLUE_E
        )
        y0_grp = VGroup(y0, y0_title, y0_labels)

        self.play(FadeTransform(VGroup(attn_grp, v0_grp), y0_grp), FadeOut(times))

        self.wait()

        # Show all head outputs
        title2 = Title(
            f"Compute output for all {self.n_head} heads",
            match_underline_width_to_text=True,
        )
        self.remove(title)
        self.play(Write(title2), run_time=0.8)

        y_heads = self._make_heads(self.y)
        all_head_outs = (
            VGroup(*y_heads[:-1], Tex("\\dots"), y_heads[-1]).arrange().scale(scale)
        )
        head_titles = [
            BraceLabel(
                h,
                f"Y_{{{i + 1 if i < len(all_head_outs) - 1 else self.n_head}}}\\; (T \\times H)",
                brace_direction=UP,
                color=BLUE_E,
                font_size=36,
            )
            for (i, h) in enumerate(all_head_outs)
            if isinstance(h, MobjectMatrix)
        ]
        bottom_brace = BraceLabel(
            all_head_outs,
            f"12 heads of size H = {self.head_sz}",
            brace_direction=DOWN,
            color=GREEN_E,
            label_constructor=Text,
            font_size=24,
        )

        # first_head = all_head_outs[0]
        # first_head_rows = first_head.get_rows()
        # for (i, row) in enumerate(y0.get_rows()):
        #     for (j, val) in enumerate(row):
        #         val.target = first_head_rows[i][j]

        y0.target = all_head_outs[0]

        self.wait(0.5)
        self.play(
            # TransformMatchingShapes(y0_grp, all_head_outs[0]),
            # *[MoveToTarget(v) for row in y0.get_rows() for v in row]
            ReplacementTransform(y0, y0.target),
            FadeOut(y0_grp[1], y0_grp[2]),
        )

        self.wait(0.5)
        self.play(
            FadeIn(*all_head_outs[1:]), FadeIn(*head_titles), FadeIn(bottom_brace)
        )

        self.wait()
        title3 = Title(
            "Combine all heads into a single $T \\times C$ matrix",
            match_underline_width_to_text=True,
        )
        self.remove(title2)
        self.play(Write(title3), run_time=0.8)

        y_combined = (
            y_heads[0].copy().center().scale(1 / scale)
        )  # Just use the first head
        y_combined_title = MathTex("Y\\; (T \\times C)", font_size=32).next_to(
            y_combined, UP
        )
        y_cmb_grp = VGroup(y_combined, y_combined_title)

        self.wait(0.5)
        self.play(
            FadeTransform(VGroup(all_head_outs, *head_titles), y_cmb_grp),
            FadeOut(bottom_brace),
        )

        self.wait(3)


class FeedFwd(SelfAttnPt3):
    def __init__(self):
        super().__init__()

        # The first hidden layer activations, cheat and just use y * y
        self.yh = np.matmul(self.y, self.y)
        self.yh_obj = self._make_matrix(self.yh, actual_w=4 * self.n_embd)
        self.yh_title = MathTex("Y_h\\; (T \\times 4C)", font_size=36).next_to(
            self.yh_obj, UP
        )
        self.yh_labels = self._make_row_labels(self.yh_obj, self.sentence_tokens)
        self.yh_grp = VGroup(self.yh_obj, self.yh_title, self.yh_labels)

        self.yf = np.matmul(self.y, self.y * 2) * np.transpose(self.y)  # Random op
        self.yf_obj = self._make_matrix(self.yf, actual_w=self.n_embd)
        self.yf_title = MathTex("Y_{final}\\; (T \\times C)", font_size=36).next_to(
            self.yf_obj, UP
        )
        self.yf_labels = self._make_row_labels(self.yf_obj, self.sentence_tokens)
        self.yf_grp = VGroup(self.yf_obj, self.yf_title, self.yf_labels)

    def construct(self):
        title = Title(
            "Single hidden layer neural network on Y",
            match_underline_width_to_text=True,
        )
        self.play(Write(title), run_time=1)

        y_labels = self._make_row_labels(self.y_obj, self.sentence_tokens, dir=LEFT)
        y_title = MathTex("Y\\; (T \\times C)", font_size=36).next_to(self.y_obj, UP)
        y_expl = Text(
            "The output of \nself attention: \none vector of size C \nper input word",
            font_size=24,
        ).next_to(self.y_obj, RIGHT)
        y_grp = VGroup(self.y_obj, y_labels, y_title)
        self.play(LaggedStart(FadeIn(y_grp), Write(y_expl), lag_ratio=0.3), run_time=2)
        self.wait(2)

        scale = 0.7
        self.play(FadeOut(y_expl), y_grp.animate.scale(scale).shift(LEFT * 2))
        self.wait(0.5)

        # Cheat and use W_v because I'm lazy
        w_obj = (
            self._make_matrix(W_v, actual_h=self.n_embd, actual_w=self.n_embd * 4)
            .scale(scale)
            .shift(RIGHT * 2)
        )
        w_title = MathTex("W_{nn}\\; (C \\times 4C)", font_size=36).next_to(w_obj, UP)
        y_expl_2 = Text(
            "Linear transform each row: \nfrom word vectors of \nsize C to 4C",
            font_size=24,
        ).to_edge(DOWN)
        self.play(
            LaggedStart(FadeIn(w_obj, w_title), Write(y_expl_2), lag_ratio=0.5),
            run_time=2,
        )
        self.wait(1.5)

        y_rows = self.y_obj.get_rows()
        y_row_boxes = [SurroundingRectangle(r) for r in y_rows]
        w_box = SurroundingRectangle(w_obj)
        self.play(Create(y_row_boxes[0]), Create(w_box))
        for i in range(len(y_rows) - 1):
            self.play(ReplacementTransform(y_row_boxes[i], y_row_boxes[i + 1]))

        expl3 = Text("Hidden layer", font_size=24).to_edge(DOWN)
        self.remove(y_expl_2)
        self.play(
            FadeOut(y_row_boxes[-1], w_box),
            FadeOut(y_grp, w_obj, w_title, shift=UP),
            FadeIn(self.yh_grp, shift=UP),
            Write(expl3),
            run_time=1.5,
        )
        self.wait()

        expl4 = Text(
            "Repeat linear transform \nfrom 4C to C \nafter applying non-linearity (ReLU)",
            font_size=24,
        ).to_edge(DOWN)
        self.remove(expl3)
        self.play(
            FadeOut(self.yh_grp, shift=UP),
            FadeIn(self.yf_grp, shift=UP),
            Write(expl4),
            run_time=2,
        )
        self.wait(3)


class GoingDeeper(BaseScene):
    def _make_block(self, label: str, color=BLACK):
        block = VGroup()
        label_obj = Text(label, font_size=28).set_color(color)
        box = SurroundingRectangle(
            label_obj, buff=MED_SMALL_BUFF, corner_radius=0.1
        ).set_color(color)
        block.add(label_obj, box)
        return block

    def _make_block_grp(self):
        block = VGroup()
        self_attn_block = self._make_block("Self\nattention", color=MAROON_E)
        ff_block = self._make_block("Feed\nforward", color=TEAL_E)
        block.add(self_attn_block, ff_block).arrange(buff=LARGE_BUFF)
        block.add(
            Arrow(buff=0, start=self_attn_block.get_right(), end=ff_block.get_left())
        )
        block_box = SurroundingRectangle(
            block, buff=MED_SMALL_BUFF, corner_radius=0.1
        ).set_color(BLACK)
        return VGroup(block, block_box).scale(0.6)

    def construct(self):
        title = Title("A Transformer block", match_underline_width_to_text=True)
        self.add(title)

        block1 = self._make_block_grp()
        block_title = Tex(f"Transformer block", font_size=32).next_to(block1, UP)
        block_in = VGroup(
            Tex("X", font_size=32), Tex("($T \\times C$ matrix)", font_size=24)
        ).arrange(DOWN)
        block_out = VGroup(
            Tex("Y", font_size=32), Tex("($T \\times C$ matrix)", font_size=24)
        ).arrange(DOWN)
        self.add(
            block_title, VGroup(block_in, block1, block_out).arrange(buff=LARGE_BUFF)
        )
        arrow1 = Arrow(buff=0, start=block_in.get_right(), end=block1[1].get_left())
        arrow2 = Arrow(buff=0, start=block1[1].get_right(), end=block_out.get_left())
        self.add(arrow1, arrow2)
        expl1 = Tex(
            "A block takes input $(T \\times C)$ and produces output $(T \\times C)$",
            font_size=32,
        ).to_edge(DOWN)
        self.play(Write(expl1))
        self.wait(2)

        block2 = self._make_block_grp()
        block50 = self._make_block_grp()

        block1.generate_target()

        block_chain = VGroup(
            block1.target, block2, MathTex("\\cdots"), block50
        ).arrange(buff=MED_LARGE_BUFF)
        arrow3 = Arrow(
            buff=0, start=block1.target[1].get_right(), end=block2[1].get_left()
        )
        block1_title = Tex(f"Block 1", font_size=32).next_to(block1.target, UP)
        block2_title = Tex(f"Block 2", font_size=32).next_to(block2, UP)
        block50_title = Tex(f"Block 50", font_size=32).next_to(block50, UP)

        title2 = Title(
            "Multiple layers of self-attention and feed-forward",
            match_underline_width_to_text=True,
        )

        self.remove(title)
        self.play(
            Write(title2),
            FadeOut(block_title, block_in, block_out, arrow1, arrow2),
            MoveToTarget(block1),
            FadeIn(*block_chain[1:], block1_title, block2_title, block50_title, arrow3),
        )
        self.wait(3)


class Prediction(FeedFwd):
    def construct(self):
        title = Title("Predicting the next token", match_underline_width_to_text=True)
        self.play(Write(title), run_time=1)

        last_output_vec = self.yf_grp[0].get_rows()[-1].copy()
        last_word_label = self.yf_labels[-1].copy()
        lt_box = SurroundingRectangle(last_output_vec)
        expl = Tex(
            "Take the last $T \\times C$ output from the last block", font_size=36
        ).to_edge(DOWN)
        self.play(FadeIn(self.yf_grp), Write(expl))
        self.play(Create(lt_box))
        self.wait()

        expl2 = Tex(
            f'The output for ``{self.sentence_tokens[-1]}" represents the next word',
            font_size=36,
        ).to_edge(DOWN)
        self.remove(expl)
        self.play(Write(expl2))

        self.wait()

        lt_vec = []
        for val in last_output_vec:
            val.generate_target()
            lt_vec.append([val.target])
        lt_vec_obj = MobjectMatrix(lt_vec)
        lt_vec_obj.center()

        last_word_label.generate_target()
        last_word_label.target.next_to(lt_vec_obj, LEFT)

        lt_vec_label = MathTex("C \\times 1", font_size=32).next_to(lt_vec_obj, UP)

        self.play(
            FadeOut(self.yf_grp, lt_box),
            *[MoveToTarget(v) for v in last_output_vec],
            MoveToTarget(last_word_label),
            # FadeIn(lt_vec_obj),
            FadeIn(lt_vec_label),
        )

        self.play(FadeIn(lt_vec_obj))
        self.remove(*[v for v in last_output_vec])

        self.wait()

        expl3 = Tex(
            f"Linear transform and normalize to vector of size V (vocabulary size)",
            font_size=36,
        ).to_edge(DOWN)
        logits = self._make_matrix([[0.92], [0.2], [0.1], [0.008]], actual_h=100)
        logits_label = MathTex("V \\times 1", font_size=32).next_to(logits, UP)
        self.remove(*[x.target for x in last_output_vec])
        self.remove(expl2)
        self.play(
            FadeTransform(lt_vec_obj, logits),
            TransformMatchingTex(lt_vec_label, logits_label),
            Write(expl3),
        )

        self.wait(2)

        expl4 = Tex(
            f"Each value represents probability of the next word", font_size=36
        ).to_edge(DOWN)
        logit_words = self._make_row_labels(
            logits,
            ["prosperity", "suffering", "destruction", "death"],
            dir=RIGHT,
            color=BLUE_E,
        )
        self.remove(expl3)
        self.play(
            LaggedStart(*[FadeIn(l, shift=DOWN) for l in logit_words], lag_ratio=0.2),
            Write(expl4),
        )

        self.wait(3)


class GeneratingText(BaseSelfAttn):
    def _make_tokens(self, tokens: list[str], color=BLUE_E) -> VGroup:
        grp = VGroup()
        for t in tokens:
            label = Tex(t)
            box = SurroundingRectangle(label, color=color)
            grp.add(VGroup(label, box))
        return grp

    def construct(self):
        title = Title("Generating text", match_underline_width_to_text=True)
        self.add(title)

        tf_label = Tex("Transformer")
        tf_box = SurroundingRectangle(tf_label, buff=MED_LARGE_BUFF).set_color(BLACK)
        tf_grp = VGroup(tf_label, tf_box).shift(DOWN)
        self.add(tf_grp)

        input_tokens = self._make_tokens(self.sentence_tokens)
        input_tokens.arrange(buff=MED_SMALL_BUFF)
        input_tokens.next_to(tf_grp, UP * 3)
        input_window = SurroundingRectangle(input_tokens).set_color(BLACK)
        input_window_label = (
            Tex("Max prompt length = 5", font_size=28)
            .next_to(input_window, UP, buff=SMALL_BUFF)
            .align_to(input_window, LEFT)
        )

        in_arrow = Arrow(buff=0, start=input_window.get_bottom(), end=tf_grp.get_top())
        out_arrow = Arrow(
            buff=0, start=tf_grp.get_bottom(), end=tf_grp.get_bottom() + DOWN * 0.7
        )
        self.add(in_arrow, out_arrow, input_tokens, input_window, input_window_label)

        max_window_sz = 5

        self.wait(1)
        for i in ["prosperity", "to", "humans", "jk", "lol"]:
            input_copy = input_tokens.copy()[
                max(0, len(input_tokens) - max_window_sz) :
            ]
            for b in input_copy:
                b.generate_target()
                b.target.move_to(tf_grp.get_center())
                b.target.shift(IN)
                b.target.width = 0
                b.target.height = 0

            self.play(*[MoveToTarget(b) for b in input_copy])

            out_token = self._make_tokens([i], color=GREEN_E)[0]
            out_token.generate_target()
            out_token.move_to(tf_grp.get_center())
            out_token.width = 0
            out_token.height = 0
            out_token.target.next_to(tf_grp, DOWN * 4)

            self.play(ReplacementTransform(out_token, out_token.target))
            self.wait()
            out_token = out_token.target
            out_token.generate_target()
            for t in input_tokens:
                t.generate_target()
            new_input_tokens = (
                VGroup(*[t.target for t in input_tokens], out_token.target)
                .arrange(buff=MED_SMALL_BUFF)
                .move_to(input_tokens)
            )
            num_new_tokens = len(new_input_tokens)
            new_input_window = SurroundingRectangle(
                VGroup(*new_input_tokens[max(0, num_new_tokens - max_window_sz) :])
            ).set_color(BLACK)
            self.play(
                *[ReplacementTransform(t, t.target) for t in input_tokens],
                ReplacementTransform(out_token, out_token.target),
                ReplacementTransform(input_window, new_input_window),
                input_window_label.animate.next_to(
                    new_input_window, UP, buff=SMALL_BUFF
                ).align_to(new_input_window, LEFT),
            )
            input_tokens = new_input_tokens
            input_window = new_input_window
            self.wait()

        self.wait(3)
