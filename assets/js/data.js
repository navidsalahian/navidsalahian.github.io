/*
 * Data for the papers-by-topics matrix.
 * To add a paper: add one line to `papers` (its `id` must match the id of its
 * entry in publications.html) and list its topics using the keys in `topics`.
 */
var SITE_DATA = {
  topics: [
    { key: 'clustering',        label: 'Clustering' },
    { key: 'semi-supervised',   label: 'Semi-supervised learning' },
    { key: 'self-supervised',   label: 'Self-supervised learning' },
    { key: 'deep',              label: 'Deep models' },
    { key: 'adversarial',       label: 'Adversarial training' },
    { key: 'robust',            label: 'Robustness' },
    { key: 'completion',        label: 'Matrix completion' },
    { key: 'graph',             label: 'Graph-based learning' },
    { key: 'feature-selection', label: 'Feature selection' },
    { key: 'multi-view',        label: 'Multi-view & multi-label' }
  ],
  papers: [
    { id: 'danmf-crfr',  short: 'DANMF-CRFR',               topics: ['clustering', 'self-supervised', 'deep'] },
    { id: 's4nmf',       short: 'S\u2074NMF',               topics: ['clustering', 'semi-supervised', 'self-supervised'] },
    { id: 'eadnmf',      short: 'EADNMF',                   topics: ['deep', 'adversarial', 'robust', 'completion'] },
    { id: 'senmf',       short: 'SENMF',                    topics: ['clustering', 'robust'] },
    { id: 'entropy-nmf', short: 'Entropy-weighted NMF',     topics: ['clustering', 'graph'] },
    { id: 'mvml-fs',     short: 'Multi-view FS',            topics: ['feature-selection', 'multi-view'] }
  ]
};
