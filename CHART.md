CHART: Coarse-to-Fine Transformer Traversal for Embedding Search

(D3 placeholders included — no graphics yet)

1. Introduction — Two Priors

This project rests on two priors that, when combined, point to a very natural architectural idea.

1. Embeddings contain real semantic information.
Models like BERT, OpenAI’s text-embeddings, and all modern vector systems give us dense vectors that encode meaning surprisingly well.

But a problem remains:
➡️ Embeddings do not tell you how concepts relate, only how far apart they are.
There is no hierarchy, no paths, no structure. Only distances.

2. Transformers learn relationships.
Self-attention is fundamentally a learned relational operator — a dynamic, content-based graph over tokens.

These two ideas collide:

If embeddings hold meaning, and attention learns relationships,
can a transformer learn to traverse embedding space?

That is the seed of CHART.

2. The Obvious Problem With Applying Attention to a Corpus

You cannot simply run attention directly over your entire embedding database.

A corpus might have 10M–100M embeddings.

Self-attention is O(N²).

Even prop-sparse attention cannot help when you need global relational reasoning.

So the naive idea — “just run a transformer over the embeddings” — is impossible.

We need a way to:

Work at coarse scales first

Narrow into fine scales

Keep the sequence length bounded

This leads to the structural insight.

3. Organizing the Embedding Space Into a Tree

If we pre-organize the corpus into a tree, we can traverse coarse-to-fine without ever loading the full dataset.

The tree is built very simply:

Run recursive clustering (IE. kMeans, in the below visualizations our tree is built with k=2).

Leaves contain chunks/documents.

Parents contain centroid embeddings (means of children).

Higher parents contain means of means, recursively.

This gives a natural multiscale structure.

D3 VISUAL (1): UMAP + depth slider

INSERT VISUAL HERE
A UMAP plot of the corpus with clusters highlighted, and a slider that shows depth 0 → depth D.

4. Traversal: How the Transformer Maintains Sequence Length

This is the missing piece people usually ignore.

We must keep the transformer’s context fixed — e.g., 128 tokens — regardless of corpus size.

CHART does this by maintaining a fixed-size active set:

Start with K₀ top-level nodes (K₀ ~ 64–128).

Run one transformer step.

Compute attention scores over these nodes.

Expand only the top α fraction (α ~ 0.25).

Replace each expanded node with its children.

Trim back to a fixed size K for the next step.

This creates a bounded attention window, e.g.:

Step 0: 64 top nodes
Step 1: Expand 16 → replace with ≈ 64 children
Step 2: Expand 16 → replace with ≈ 64 children
...


Structure is never fully loaded — only the frontier.

This is CHART’s core computational trick.

D3 VISUAL (2): animated expansion

INSERT VISUAL HERE
A simple tree where high-attention nodes expand and low-attention nodes fade out.

5. How Training Works

To train a transformer to traverse the tree, you need interlinks — known relationships.

Two forms are easy to get:

Explicit links

Wikipedia outlinks

Citation networks

Email reply chains

Hyperlinks

Thread structures

Implicit links

Pairs retrieved together by an agentic retrieval pipeline

Multi-hop RAG retrievals

Co-occurring documents

Training objective:

Given an anchor document A and a linked document B:

Encode A

Seed the transformer at the root

Train it to walk the tree until it reaches B

Optimizing a traversal-aware InfoNCE loss

This teaches the transformer:

Given this semantic context, these are the paths through the hierarchy that matter.

In effect, traversal becomes a learned routing policy.

6. Making the Tree Less Naive (Dynamic Refinement)

A naive tree is fine to start — but embeddings shift during training.

CHART incorporates dynamic self-refinement:

Compute coherence inside each node
(mean pairwise cosine similarity)

If coherence too low → split the node

If coherence too high and node too small → merge

Update centroids

Propagate updates upward

Leave the rest of the tree untouched

This gives you a living hierarchy, constantly adjusting itself to the evolving embedding space.

It also avoids full re-clustering — only local nodes update.

D3 VISUAL (3): merge/split animation

INSERT VISUAL HERE

7. Now We Put It All Together — CHART

By this point, the system has all the necessary ingredients:

1. A hierarchical semantic tree

built from clustering, storing centroids and summaries.

2. A transformer that reasons over a fixed-size frontier

stepping coarse → medium → fine.

3. A training loop that uses real relational structure

to teach traversal.

4. A dynamic maintenance loop

that keeps the hierarchy coherent without expensive rebuilds.

The result:

A transformer that performs query-time traversal over meaning,
in roughly constant time, with relational understanding built-in.

This is the CHART architecture.

8. Why This Matters

Traditional vector search does:

Query → ANN → Top-k → Rerank with cross-encoder.

CHART does:

Query → Traverse hierarchy → Land on leaf → Retrieve relational neighbors.

Where ANN is distance-based,
CHART is relationship-based.

Where ANN is flat,
CHART is topological.

Where ANN retrieves nearest neighbors,
CHART retrieves meaningful connections.

This offers a path toward:

multi-hop search

relational representations

constant-time retrieval

semantic routing

dynamic knowledge graphs