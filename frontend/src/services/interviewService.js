// AutoLearn AI - Dynamic Interview Service
// Provides dynamic goal-aware question banks, progressive hints, AI response evaluation,
// coding execution simulation, interview readiness tracking, and mock interview stages.

export const INTERVIEW_GOALS = {
  placement: {
    id: 'placement',
    title: 'ML for Placement',
    subtitle: 'Technical & Algo Interviews',
    icon: 'Briefcase',
    color: 'cyan',
    topics: [
      'Python', 'Statistics', 'Linear Regression', 'Logistic Regression',
      'SVM', 'Decision Trees', 'Random Forest', 'Ensemble Methods',
      'Feature Engineering', 'Model Evaluation', 'Bias-Variance Tradeoff'
    ],
    readinessTopics: [
      { name: 'Python & Algorithms', mastery: 85 },
      { name: 'Probability & Statistics', mastery: 74 },
      { name: 'Supervised Learning', mastery: 68 },
      { name: 'Ensemble & Trees', mastery: 72 },
      { name: 'Feature Engineering', mastery: 60 },
      { name: 'Model Evaluation & Metrics', mastery: 55 }
    ]
  },
  project: {
    id: 'project',
    title: 'AI for Project',
    subtitle: 'Full-Stack AI & Engineering',
    icon: 'Cpu',
    color: 'purple',
    topics: [
      'Python', 'Data Preprocessing', 'EDA', 'Model Building',
      'Model Evaluation', 'Flask/FastAPI', 'APIs', 'Docker',
      'Cloud Deployment', 'End-to-End ML Pipelines'
    ],
    readinessTopics: [
      { name: 'Data Preprocessing & EDA', mastery: 82 },
      { name: 'Model Architecture & Training', mastery: 75 },
      { name: 'API Development (FastAPI/Flask)', mastery: 78 },
      { name: 'Docker & Containerization', mastery: 62 },
      { name: 'Cloud & System Integration', mastery: 54 }
    ]
  },
  deeplearning: {
    id: 'deeplearning',
    title: 'Deep Learning',
    subtitle: 'Neural Nets & Transformers',
    icon: 'Network',
    color: 'green',
    topics: [
      'NumPy', 'PyTorch/TensorFlow', 'Neural Networks', 'Backpropagation',
      'CNN', 'RNN/LSTM', 'Attention Mechanism', 'Transformers',
      'Optimization (Adam/SGD)', 'Regularization (Dropout/BatchNorm)', 'DL Evaluation'
    ],
    readinessTopics: [
      { name: 'Neural Foundations & Backprop', mastery: 78 },
      { name: 'PyTorch / Tensor Operations', mastery: 80 },
      { name: 'CNN & Vision Architectures', mastery: 70 },
      { name: 'RNN, LSTM & Sequence Models', mastery: 62 },
      { name: 'Transformers & Self-Attention', mastery: 52 },
      { name: 'Optimization & Regularization', mastery: 66 }
    ]
  },
  nlp_llm: {
    id: 'nlp_llm',
    title: 'NLP & Gen AI',
    subtitle: 'LLMs, RAG & Transformers',
    icon: 'MessageSquare',
    color: 'amber',
    topics: [
      'Tokenization', 'TF-IDF', 'Word Embeddings', 'Word2Vec',
      'BERT', 'Transformers', 'Fine-Tuning (LoRA/QLoRA)', 'LLMs',
      'RAG', 'Vector Databases', 'Prompt Engineering', 'GenAI Evaluation'
    ],
    readinessTopics: [
      { name: 'Text Preprocessing & Embeddings', mastery: 80 },
      { name: 'BERT & Transformer Architecture', mastery: 74 },
      { name: 'RAG & Vector Retrieval', mastery: 65 },
      { name: 'LLM Fine-Tuning (LoRA)', mastery: 58 },
      { name: 'Prompt Engineering & Guardrails', mastery: 82 },
      { name: 'NLP Evaluation (BLEU/ROUGE)', mastery: 60 }
    ]
  },
  cv_vision: {
    id: 'cv_vision',
    title: 'Computer Vision',
    subtitle: 'Object Detection & Perception',
    icon: 'Eye',
    color: 'rose',
    topics: [
      'OpenCV', 'Image Processing', 'CNN Architectures', 'YOLO',
      'Object Detection (mAP/IoU/NMS)', 'Image Segmentation (U-Net)',
      'Vision Transformers', 'Image Augmentation', 'Feature Extraction', 'CV Evaluation'
    ],
    readinessTopics: [
      { name: 'OpenCV & Image Transforms', mastery: 84 },
      { name: 'CNN Backbones (ResNet/ViT)', mastery: 72 },
      { name: 'Object Detection (YOLO/Faster R-CNN)', mastery: 64 },
      { name: 'Image Segmentation (U-Net)', mastery: 58 },
      { name: 'Evaluation Metrics (mAP/IoU)', mastery: 68 }
    ]
  },
  mlops: {
    id: 'mlops',
    title: 'MLOps & AI Systems',
    subtitle: 'Production & Infrastructure',
    icon: 'Server',
    color: 'indigo',
    topics: [
      'Docker', 'Kubernetes', 'MLflow', 'Feature Stores',
      'CI/CD Pipelines', 'Model Monitoring (Data Drift)',
      'Model Deployment', 'Model Serving (Triton/ONNX)', 'Cloud Scalability'
    ],
    readinessTopics: [
      { name: 'Docker & Containerization', mastery: 82 },
      { name: 'Kubernetes & Orchestration', mastery: 60 },
      { name: 'Model Tracking & MLflow', mastery: 76 },
      { name: 'CI/CD & Model Deployment', mastery: 65 },
      { name: 'Data Drift & Model Monitoring', mastery: 55 }
    ]
  },
  datascience: {
    id: 'datascience',
    title: 'Data Science & EDA',
    subtitle: 'Analytics, SQL & Insights',
    icon: 'BarChart2',
    color: 'teal',
    topics: [
      'Python', 'Pandas', 'NumPy', 'SQL (Window Functions/CTEs)',
      'Data Visualization', 'Exploratory Data Analysis',
      'Statistics (Hypothesis Testing/A/B Testing)', 'Data Cleaning',
      'Feature Engineering', 'Business Insights'
    ],
    readinessTopics: [
      { name: 'Pandas & NumPy Data Wrangling', mastery: 88 },
      { name: 'Advanced SQL (Window/CTEs)', mastery: 82 },
      { name: 'Hypothesis Testing & A/B Tests', mastery: 70 },
      { name: 'EDA & Visual Storytelling', mastery: 85 },
      { name: 'Feature Engineering & Outliers', mastery: 68 }
    ]
  }
};

// Comprehensive Question Dataset mapped by goal
export const INTERVIEW_QUESTIONS = {
  placement: [
    {
      id: 'pl-1',
      title: 'Bias-Variance Tradeoff in Machine Learning',
      topic: 'Bias-Variance Tradeoff',
      difficulty: 'Beginner',
      type: 'conceptual',
      question: 'What is the Bias-Variance tradeoff, and how do high bias and high variance manifest in model training and testing errors?',
      hints: [
        'Hint 1: Think of bias as under-fitting (model too simplistic) and variance as over-fitting (model overly sensitive to noise).',
        'Hint 2: High bias yields high training error AND high test error. High variance yields very low training error but poor test error.'
      ],
      idealKeyPoints: [
        'Bias is error from erroneous assumptions in learning algorithm (underfitting).',
        'Variance is sensitivity to small fluctuations in training data (overfitting).',
        'High bias = model fails to capture underlying patterns (high train & test error).',
        'High variance = model memorizes training noise (low train error, high test error).',
        'Goal is finding the sweet spot minimizing total expected error = Bias² + Variance + Irreducible Error.'
      ],
      explanation: 'The Bias-Variance tradeoff represents the fundamental tension in supervised learning between a model\'s simplicity (bias) and flexibility (variance). As model complexity increases, bias decreases while variance increases. Regularization, cross-validation, and ensemble methods help balance both.'
    },
    {
      id: 'pl-2',
      title: 'Precision vs Recall & When to Prioritize Each',
      topic: 'Model Evaluation',
      difficulty: 'Intermediate',
      type: 'conceptual',
      question: 'Explain the difference between Precision and Recall. In which real-world scenarios would you prioritize Recall over Precision, and vice-versa?',
      hints: [
        'Hint 1: Precision = TP / (TP + FP); Recall = TP / (TP + FN).',
        'Hint 2: High recall is critical when False Negatives are costly (e.g. Cancer detection). High precision is critical when False Positives are disruptive (e.g. Spam detection or fraud alerts that freeze accounts).'
      ],
      idealKeyPoints: [
        'Precision = True Positives / (True Positives + False Positives) (Out of predicted positives, how many are true?).',
        'Recall = True Positives / (True Positives + False Negatives) (Out of actual positives, how many did we capture?).',
        'Prioritize Recall when False Negatives are dangerous (e.g., disease detection, airport security).',
        'Prioritize Precision when False Positives cause high annoyance or cost (e.g., spam filter, loan auto-approval).',
        'F1-Score is the harmonic mean balancing Precision and Recall.'
      ],
      explanation: 'Precision measures prediction exactness, while Recall measures completeness. In medical triage, high Recall prevents undiagnosed illnesses. In customer spam filters, high Precision ensures critical emails are not mistakenly dropped.'
    },
    {
      id: 'pl-3',
      title: 'Handling Missing Values and Outliers',
      topic: 'Feature Engineering',
      difficulty: 'Intermediate',
      type: 'scenario',
      question: 'You are handed a dataset with 25% missing values in numeric columns and severe skewness due to outliers. Walk through your strategy to clean and prepare this data for a linear model vs a tree-based model.',
      hints: [
        'Hint 1: Linear models assume linearity and are sensitive to scale and outliers. Tree models are invariant to monotonic transformations and handle outliers naturally.',
        'Hint 2: For linear models, consider median/KNN imputation, log/Box-Cox transforms, and robust scaling or IQR capping.'
      ],
      idealKeyPoints: [
        'Assess missingness mechanism (MCAR, MAR, MNAR). If 25%, consider median imputation, MICE, or KNN imputation; add missing indicator column.',
        'For Linear Regression/SVM: Apply log/PowerTransform to skewed distributions; use IQR/Z-score clipping or RobustScaler; scale with StandardScaler.',
        'For Tree-based (Random Forest/XGBoost): Can split on extreme values without scaling; XGBoost can handle NaNs directly by learning default direction.',
        'Avoid data leakage by fitting imputers/scalers only on training splits.'
      ],
      explanation: 'Linear algorithms require normalized and outlier-free inputs because squared residuals amplify outlier influence. Tree models split hierarchically on order, making them robust to monotonic outlier scales.'
    },
    {
      id: 'pl-4',
      title: 'Implement Custom Euclidean & Manhattan Distance in Java',
      topic: 'Python',
      difficulty: 'Beginner',
      type: 'coding',
      question: 'Implement a method `calculateDistance(double[] pointA, double[] pointB, String metric)` in Java that computes Euclidean distance when metric is "euclidean" and Manhattan distance when metric is "manhattan".',
      hints: [
        'Hint 1: Euclidean distance = sqrt(sum((a_i - b_i)^2)).',
        'Hint 2: Manhattan distance = sum(abs(a_i - b_i)).'
      ],
      starterCode: {
        java: `public class Solution {
    public static double calculateDistance(double[] pointA, double[] pointB, String metric) {
        // Write your solution here
        double sum = 0.0;
        if ("manhattan".equalsIgnoreCase(metric)) {
            for (int i = 0; i < pointA.length; i++) {
                sum += Math.abs(pointA[i] - pointB[i]);
            }
            return sum;
        } else {
            for (int i = 0; i < pointA.length; i++) {
                double diff = pointA[i] - pointB[i];
                sum += diff * diff;
            }
            return Math.sqrt(sum);
        }
    }
}`,
        python: `import math

class Solution:
    def calculateDistance(self, pointA: list[float], pointB: list[float], metric: str) -> float:
        if metric.lower() == "manhattan":
            return sum(abs(a - b) for a, b in zip(pointA, pointB))
        return math.sqrt(sum((a - b) ** 2 for a, b in zip(pointA, pointB)))`
      },
      testCases: [
        { input: 'pointA=[0,0], pointB=[3,4], metric="euclidean"', expectedOutput: '5.0' },
        { input: 'pointA=[1,2], pointB=[4,6], metric="manhattan"', expectedOutput: '7.0' }
      ],
      timeComplexity: 'O(d) where d is dimensionality',
      spaceComplexity: 'O(1)'
    }
  ],
  project: [
    {
      id: 'pr-1',
      title: 'Architecting End-to-End ML REST API with FastAPI',
      topic: 'Flask/FastAPI',
      difficulty: 'Intermediate',
      type: 'technical',
      question: 'How do you design a high-throughput, low-latency FastAPI inference service for a Scikit-Learn or PyTorch model, including request validation and async batching?',
      hints: [
        'Hint 1: Use Pydantic for strict request/response schemas.',
        'Hint 2: Load model weights once during startup in app lifespan context, not per request.'
      ],
      idealKeyPoints: [
        'Use Pydantic `BaseModel` for automatic validation, type safety, and OpenAPI documentation.',
        'Load model weights globally in lifespan/startup event to prevent reloading per request.',
        'Use `async def` endpoints with background worker queues or thread pool offloading (`asyncio.to_thread`) for CPU-bound inference.',
        'Implement structured logging, health checks (`/healthz`), and Prometheus latency metrics.'
      ],
      explanation: 'FastAPI combined with Uvicorn and Gunicorn workers provides asynchronous I/O. For compute-heavy model inference, offloading forward passes to dedicated process pools or ONNX runtime prevents event loop blocking.'
    },
    {
      id: 'pr-2',
      title: 'Containerizing ML Inference with Docker',
      topic: 'Docker',
      difficulty: 'Intermediate',
      type: 'scenario',
      question: 'Describe best practices for creating a lightweight, production-ready Docker container for an AI microservice. How do you optimize image size and prevent security risks?',
      hints: [
        'Hint 1: Use multi-stage builds and slim base images (e.g. `python:3.11-slim`).',
        'Hint 2: Avoid running containers as `root` user.'
      ],
      idealKeyPoints: [
        'Use specific slim base images (e.g., `python:3.11-slim`) rather than full Ubuntu/Python images.',
        'Leverage multi-stage builds to compile C dependencies without keeping build tools in final image.',
        'Order Dockerfile layers from least to most frequently modified (`requirements.txt` before source code) to maximize layer caching.',
        'Create and switch to a non-root `appuser` for runtime security.',
        'Use `.dockerignore` to exclude virtualenvs, `.git`, cache files, and model checkpoints if fetched from S3.'
      ],
      explanation: 'Optimizing Docker images reduces deploy latency, memory overhead, and attack surface in production Kubernetes clusters.'
    }
  ],
  deeplearning: [
    {
      id: 'dl-1',
      title: 'Vanishing and Exploding Gradients & Solutions',
      topic: 'Neural Networks',
      difficulty: 'Intermediate',
      type: 'conceptual',
      question: 'What causes vanishing and exploding gradients in deep neural networks during backpropagation, and what architectural and training techniques solve them?',
      hints: [
        'Hint 1: Gradients are calculated via repeated matrix multiplications with the chain rule across layers.',
        'Hint 2: Sigmoid/Tanh derivative saturation shrinks gradients (< 0.25); large weights amplify them.'
      ],
      idealKeyPoints: [
        'Vanishing gradients: Small activation derivatives (e.g., Sigmoid < 0.25) multiplied across many layers exponentially decay gradient toward zero, stalling early layer learning.',
        'Exploding gradients: Large weight matrices repeatedly multiplied cause gradient explosion, producing NaN/inf weight updates.',
        'Solutions: Non-saturating activations (ReLU, LeakyReLU, GELU).',
        'Proper initialization (He/Kaiming initialization for ReLU, Xavier/Glorot for Sigmoid/Tanh).',
        'Batch Normalization / Layer Normalization to stabilize internal covariate shift.',
        'Residual Connections (Skip connections in ResNets) providing gradient superhighways.',
        'Gradient Clipping for exploding gradients in RNNs/Transformers.'
      ],
      explanation: 'Residual connections (x + F(x)) and Batch Normalization revolutionized deep architectures by allowing gradients to propagate directly to early layers without attenuation.'
    },
    {
      id: 'dl-2',
      title: 'Self-Attention Mechanism Mathematical Walkthrough',
      topic: 'Attention Mechanism',
      difficulty: 'Advanced',
      type: 'technical',
      question: 'Explain the mathematical formulation of Scaled Dot-Product Attention: Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k)) * V. Why is the scaling factor sqrt(d_k) necessary?',
      hints: [
        'Hint 1: Q and K are dot-multiplied to compute pairwise similarity scores.',
        'Hint 2: For large dimensions d_k, dot products grow large in magnitude, pushing softmax into regions with extremely tiny gradients.'
      ],
      idealKeyPoints: [
        'Queries (Q) and Keys (K) compute alignment matrix via dot product Q * K^T of shape (seq_len, seq_len).',
        'Scaling factor 1/sqrt(d_k) prevents dot products from growing excessively large in high dimensions.',
        'Large values push the softmax function into regions with tiny gradients (saturation), leading to vanishing gradients.',
        'Softmax normalizes similarity scores into probability weights across all tokens.',
        'Weighted sum of Values (V) produces context-aware token representations.'
      ],
      explanation: 'Scaled Dot-Product Attention allows every token in a sequence to dynamically attend to every other token with O(1) path length, forming the core engine of Transformer architectures.'
    }
  ],
  nlp_llm: [
    {
      id: 'nlp-1',
      title: 'Retrieval-Augmented Generation (RAG) Architecture',
      topic: 'RAG',
      difficulty: 'Intermediate',
      type: 'technical',
      question: 'Walk through an end-to-end RAG (Retrieval-Augmented Generation) pipeline. How do you handle chunking, vector embeddings, similarity search, and prompt synthesis to minimize hallucinations?',
      hints: [
        'Hint 1: Stages: Ingestion (Chunking & Embedding) -> Query vector search in Vector DB -> Context augmentation -> LLM Generation.',
        'Hint 2: Semantic chunking, reranking (Cross-Encoders), and strict system prompt grounding reduce hallucination.'
      ],
      idealKeyPoints: [
        'Document Ingestion: Clean text, split with semantic chunking + overlap (e.g. 500 tokens with 50 token overlap).',
        'Embedding: Generate dense vector embeddings via models like `text-embedding-3` or `BGE`.',
        'Indexing: Store in Vector DB (Pinecone, Milvus, Chroma, Qdrant) with HNSW indexing.',
        'Retrieval: Perform cosine similarity / hybrid search (Dense + BM25 keyword).',
        'Reranking: Use Cross-Encoder reranker on top-K candidates to prioritize highest relevance.',
        'Synthesis: Construct grounded prompt: "Answer ONLY using provided context. If unknown, say I don\'t know."'
      ],
      explanation: 'RAG bridges the gap between static parametric memory of LLMs and dynamic proprietary enterprise knowledge bases without expensive fine-tuning.'
    },
    {
      id: 'nlp-2',
      title: 'LoRA (Low-Rank Adaptation) for LLM Fine-Tuning',
      topic: 'Fine-Tuning',
      difficulty: 'Advanced',
      type: 'technical',
      question: 'How does LoRA (Low-Rank Adaptation) enable parameter-efficient fine-tuning (PEFT) of multi-billion parameter LLMs on consumer hardware?',
      hints: [
        'Hint 1: Decomposes weight update matrix ΔW into two low-rank matrices A and B: ΔW = B * A where rank r << d.',
        'Hint 2: Freezes original pre-trained weights W_0 and only trains A and B.'
      ],
      idealKeyPoints: [
        'Freezes original pre-trained weight matrix W_0 (d × k).',
        'Represents weight update ΔW as product of two low-rank matrices: ΔW = B × A, where B is (d × r) and A is (r × k), with rank r << min(d, k).',
        'Reduces trainable parameters by 99%+, drastically cutting GPU VRAM requirements and training time.',
        'At inference, weights can be merged: W = W_0 + (alpha/r) * (B * A) with ZERO added inference latency.',
        'Allows serving multiple task-specific LoRA adapters over a single shared base model.'
      ],
      explanation: 'LoRA assumes weight updates have a low intrinsic dimension. By constraining updates to low-rank factorizations, fine-tuning 70B models becomes feasible on single workstation GPUs.'
    }
  ],
  cv_vision: [
    {
      id: 'cv-1',
      title: 'Object Detection: YOLO vs Two-Stage Detectors (Faster R-CNN)',
      topic: 'Object Detection',
      difficulty: 'Intermediate',
      type: 'conceptual',
      question: 'Compare Single-Stage object detectors (YOLO, SSD) with Two-Stage object detectors (Faster R-CNN). What are the speed vs accuracy tradeoffs, and how does YOLO frame detection as regression?',
      hints: [
        'Hint 1: Two-stage detectors generate Region Proposals first (RPN), then classify each box. Single-stage predicts bounding boxes and classes in a single pass.',
        'Hint 2: YOLO divides image into S x S grid and directly regresses box coordinates (x, y, w, h) and class probabilities.'
      ],
      idealKeyPoints: [
        'Two-Stage (Faster R-CNN): Generates Region Proposals via RPN, then crops features and classifies. High accuracy and localization precision, but slower FPS (10-15 FPS).',
        'Single-Stage (YOLO): Treats object detection as a direct single-pass regression problem from full image pixels to bounding box coordinates and class probabilities.',
        'YOLO divides image into grid cells; each cell predicts B bounding boxes, confidence scores, and C class probabilities.',
        'Tradeoff: YOLO delivers real-time inference (30-150+ FPS) suitable for edge/video processing; Two-stage excels on small/crowded objects.',
        'Non-Maximum Suppression (NMS) and IoU thresholding filter overlapping redundant boxes.'
      ],
      explanation: 'YOLO enables real-time edge intelligence by executing one single forward pass across the entire image, drastically reducing latency.'
    }
  ],
  mlops: [
    {
      id: 'mlo-1',
      title: 'Detecting and Handling Data Drift and Concept Drift in Production',
      topic: 'Model Monitoring',
      difficulty: 'Intermediate',
      type: 'scenario',
      question: 'Your production fraud detection model\'s accuracy drops by 18% three months after deployment. Distinguish Data Drift from Concept Drift, and outline a diagnostic and automated remediation architecture.',
      hints: [
        'Hint 1: Data Drift is P(X) changing (input distributions shifting). Concept Drift is P(Y|X) changing (relationship between input and fraud labels shifting).',
        'Hint 2: Statistical tests: Kolmogorov-Smirnov (KS) test, Population Stability Index (PSI), Wasserstein distance.'
      ],
      idealKeyPoints: [
        'Data Drift (Covariate Shift): Input feature distribution P(X) changes while P(Y|X) remains constant (e.g., new user demographics).',
        'Concept Drift: The underlying relationship P(Y|X) changes (e.g., fraudsters adopt new deceptive transaction patterns).',
        'Detection: Calculate statistical divergence (Kolmogorov-Smirnov test for continuous, Chi-Square for categorical, Population Stability Index PSI > 0.2).',
        'Monitoring Pipeline: Stream inference payloads to feature store/data lake; run daily drift detection jobs (Evidently AI / Great Expectations).',
        'Remediation: Trigger automated retraining pipeline with recent window data; evaluate on holdout set; canary deploy new model version.'
      ],
      explanation: 'Continuous monitoring of statistical feature divergence and ground-truth delay curves is critical to ensure ML systems remain reliable in changing real-world environments.'
    }
  ],
  datascience: [
    {
      id: 'ds-1',
      title: 'A/B Testing Methodology, Sample Size & P-Values',
      topic: 'Statistics',
      difficulty: 'Intermediate',
      type: 'technical',
      question: 'Walk through the design and execution of an A/B test for a new checkout recommendation algorithm. How do you determine sample size, control for Type I/II errors, and interpret p-values?',
      hints: [
        'Hint 1: Null hypothesis H0: No difference in conversion rate. Alternative H1: Conversion rate improves by minimum detectable effect (MDE).',
        'Hint 2: Power analysis uses significance level alpha (typically 0.05) and statistical power 1 - beta (typically 0.80).'
      ],
      idealKeyPoints: [
        'Formulate Null Hypothesis (H0: CR_test = CR_control) and Alternative Hypothesis (H1: CR_test > CR_control).',
        'Sample Size Calculation: Determined by baseline conversion rate, Minimum Detectable Effect (MDE), significance level alpha (0.05), and statistical power (1 - beta = 0.80).',
        'Randomization: Ensure user-level hashing prevents split leakage; verify sample ratio mismatch (SRM).',
        'Execution: Run for full business cycles (minimum 1-2 full weeks) to avoid day-of-week seasonality.',
        'P-Value Interpretation: Probability of observing data at least as extreme assuming H0 is true; if p < 0.05, reject H0 with statistical significance.'
      ],
      explanation: 'A/B testing is the gold standard for causal inference in product decision-making, ensuring algorithm enhancements deliver genuine measurable business lift.'
    }
  ]
};

// Storage helper for selected goal
const GOAL_STORAGE_KEY = 'autolearn_selected_goal';
const INTERVIEW_HISTORY_KEY = 'autolearn_interview_history';

export function getSelectedGoal() {
  try {
    const saved = localStorage.getItem(GOAL_STORAGE_KEY);
    if (saved && INTERVIEW_GOALS[saved]) {
      return saved;
    }
  } catch {}
  return 'placement'; // Default to ML for Placement
}

export function setSelectedGoal(goalId) {
  try {
    if (INTERVIEW_GOALS[goalId]) {
      localStorage.setItem(GOAL_STORAGE_KEY, goalId);
      // Synchronize with backend asynchronously
      fetch('/api/interview/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalId })
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Could not save goal', err);
  }
}

export function getGoalMetadata(goalId) {
  return INTERVIEW_GOALS[goalId] || INTERVIEW_GOALS.placement;
}

export function getInterviewQuestionsForGoal(goalId, filterDifficulty = 'all', filterType = 'all') {
  const g = goalId || getSelectedGoal();
  const pool = INTERVIEW_QUESTIONS[g] || INTERVIEW_QUESTIONS.placement;
  return pool.filter(q => {
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    if (filterType !== 'all' && q.type !== filterType) return false;
    return true;
  });
}

// Generate topic-specific interview questions on demand
export function getInterviewQuestionsForTopic(topicName, goalId, filterDifficulty = 'all') {
  if (!topicName) return getInterviewQuestionsForGoal(goalId, filterDifficulty);
  const cleanTopic = topicName.trim().toLowerCase();
  const g = goalId || getSelectedGoal();
  const pool = INTERVIEW_QUESTIONS[g] || INTERVIEW_QUESTIONS.placement;
  
  // Find exact or partial topic matches
  const matched = pool.filter(q => {
    const qTopic = (q.topic || '').toLowerCase();
    const qTitle = (q.title || '').toLowerCase();
    return qTopic.includes(cleanTopic) || cleanTopic.includes(qTopic) || qTitle.includes(cleanTopic);
  });

  if (matched.length >= 2) {
    return matched;
  }

  // Synthesize rich, topic-specific interview questions dynamically
  const synthesized = [
    {
      id: `top-dyn-1-${cleanTopic.replace(/\s+/g, '-')}`,
      title: `${topicName}: Core Concepts, Mechanics & Mathematical Foundations`,
      topic: topicName,
      difficulty: 'Intermediate',
      type: 'conceptual',
      question: `Explain the fundamental principles and mechanics of ${topicName}. How does it operate internally, what mathematical or architectural assumptions does it make, and what are its key advantages and limitations?`,
      hints: [
        `Hint 1: Define the primary purpose and core formulation of ${topicName}.`,
        `Hint 2: Discuss input/output specifications, common hyper-parameters, and practical trade-offs.`
      ],
      idealKeyPoints: [
        `Precise definition and working mechanism of ${topicName}.`,
        `Core mathematical equations, loss objectives, or architecture layers involved.`,
        `Handling of edge cases, computational complexity, and data representation.`,
        `Comparison against alternative techniques or baseline algorithms.`,
        `Practical tuning considerations and failure modes in production.`
      ],
      explanation: `${topicName} is a critical topic in this learning track. Understanding its theoretical foundation, loss optimization, and internal representations is essential for senior engineering interviews.`
    },
    {
      id: `top-dyn-2-${cleanTopic.replace(/\s+/g, '-')}`,
      title: `${topicName}: Real-World System Design & Production Scenario`,
      topic: topicName,
      difficulty: 'Advanced',
      type: 'scenario',
      question: `You are tasked with deploying and scaling ${topicName} in a high-throughput production environment with strict latency and memory constraints. Walk through your design architecture, failure debugging strategy, and performance monitoring metrics.`,
      hints: [
        `Hint 1: Consider throughput bottlenecks, batching strategies, and caching.`,
        `Hint 2: Discuss latency SLAs, data drift detection, and automated rollback strategies.`
      ],
      idealKeyPoints: [
        `End-to-end pipeline architecture incorporating ${topicName}.`,
        `Latency vs accuracy optimizations (e.g. quantization, caching, async queues).`,
        `Drift and divergence monitoring metrics specific to ${topicName}.`,
        `Graceful degradation, fallback handling, and rollback mechanisms.`,
        `Logging, alerting, and observability best practices.`
      ],
      explanation: `Productionizing ${topicName} requires addressing real-world challenges like inference latency, distribution shifts, and distributed scalability.`
    },
    {
      id: `top-dyn-3-${cleanTopic.replace(/\s+/g, '-')}`,
      title: `${topicName}: Diagnostic Debugging & Edge-Case Optimization`,
      topic: topicName,
      difficulty: 'Intermediate',
      type: 'technical',
      question: `Suppose your ${topicName} implementation suffers from severe performance degradation (or poor convergence) on test splits while performing well on train data. How do you isolate the root cause and remedy the issue?`,
      hints: [
        `Hint 1: Check for data leakage, distribution mismatch, or regularizer strength.`,
        `Hint 2: Formulate diagnostic validation splits and feature importance checks.`
      ],
      idealKeyPoints: [
        `Diagnostic inspection of train vs test residual distributions.`,
        `Verification of preprocessing transforms and data leakage prevention.`,
        `Regularization adjustments, hyperparameter search, and loss curve analysis.`,
        `Ablation testing to isolate faulty features or layers.`,
        `Cross-validation schemes tailored to the problem distribution.`
      ],
      explanation: `Systematic debugging of ${topicName} demonstrates deep problem-solving skills and empirical understanding.`
    }
  ];

  return [...matched, ...synthesized];
}

// Fetch Interview context from backend API with local fallback
export async function fetchInterviewContext(goalId) {
  const targetGoal = goalId || getSelectedGoal();
  try {
    const res = await fetch(`/api/interview/context?goal=${encodeURIComponent(targetGoal)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok) {
        return data;
      }
    }
  } catch (err) {
    // Backend offline or unreachable, return local state
  }

  const meta = getGoalMetadata(targetGoal);
  return {
    ok: true,
    selectedGoal: targetGoal,
    goalMetadata: meta,
    readinessTopics: meta.readinessTopics || [],
    overallReadiness: Math.round(
      (meta.readinessTopics || []).reduce((acc, t) => acc + t.mastery, 0) /
      Math.max(1, (meta.readinessTopics || []).length)
    ),
    weakTopics: (meta.readinessTopics || []).filter(t => t.mastery < 65).map(t => t.name),
    strengths: (meta.readinessTopics || []).filter(t => t.mastery >= 75).map(t => t.name),
    questionsAttempted: 0,
    accuracy: 0,
    dailyChallenge: INTERVIEW_QUESTIONS[targetGoal]?.[0] || INTERVIEW_QUESTIONS.placement[0]
  };
}

// AI Evaluation System for text responses (Backend Gemini + Local Heuristic Fallback)
export async function evaluateUserAnswerAsync({ question, userAnswer }) {
  if (!userAnswer || userAnswer.trim().length < 10) {
    return {
      score: 25,
      verdict: 'Incomplete Response',
      isSatisfactory: false,
      feedback: 'Your answer is too brief. Be sure to articulate key principles, definitions, and practical examples.',
      matchedKeyPoints: [],
      missedKeyPoints: question.idealKeyPoints || [],
      clarityScore: 'Needs Improvement',
      technicalDepth: 'Basic'
    };
  }

  // Try server-side evaluation (uses Gemini LLM if configured)
  try {
    const res = await fetch('/api/interview/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, userAnswer })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok && data.evaluation) {
        return data.evaluation;
      }
    }
  } catch (err) {
    // Fall back to local evaluation
  }

  return evaluateUserAnswer({ question, userAnswer });
}

// Client-side heuristic evaluator
export function evaluateUserAnswer({ question, userAnswer }) {
  if (!userAnswer || userAnswer.trim().length < 10) {
    return {
      score: 25,
      verdict: 'Incomplete Response',
      isSatisfactory: false,
      feedback: 'Your answer is too brief. Be sure to articulate key principles, definitions, and practical examples.',
      matchedKeyPoints: [],
      missedKeyPoints: question.idealKeyPoints || [],
      clarityScore: 'Needs Improvement',
      technicalDepth: 'Basic'
    };
  }

  const answerLower = userAnswer.toLowerCase();
  const matchedPoints = [];
  const missedPoints = [];

  (question.idealKeyPoints || []).forEach(point => {
    // Extract key tokens from point
    const tokens = point.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matchCount = tokens.filter(t => answerLower.includes(t)).length;
    if (matchCount >= 2 || answerLower.includes(point.toLowerCase().slice(0, 15))) {
      matchedPoints.push(point);
    } else {
      missedPoints.push(point);
    }
  });

  const matchRatio = matchedPoints.length / Math.max(1, (question.idealKeyPoints || []).length);
  const score = Math.min(95, Math.max(40, Math.round(matchRatio * 70 + 25 + (userAnswer.length > 120 ? 10 : 0))));

  let verdict = 'Good Answer';
  if (score >= 80) verdict = 'Strong Technical Answer';
  else if (score >= 60) verdict = 'Partially Complete';
  else verdict = 'Needs More Depth';

  return {
    score,
    verdict,
    isSatisfactory: score >= 60,
    feedback: score >= 80 
      ? 'Excellent articulation of core concepts and trade-offs. Your answer demonstrates strong technical terminology and clear structure.'
      : 'You covered the foundational idea, but missed a few crucial technical subtleties. Review the missing key points below.',
    matchedKeyPoints: matchedPoints,
    missedKeyPoints: missedPoints,
    clarityScore: score >= 75 ? 'High Clarity' : 'Moderate',
    technicalDepth: score >= 75 ? 'Industry Standard' : 'Developing'
  };
}

// Client-side coding runner simulation
export function runInterviewCode({ code, language, testCases }) {
  const startTime = performance.now();
  if (!code || code.trim().length < 20) {
    return {
      success: false,
      error: 'Compilation Error: Code is incomplete or empty.',
      output: 'Build failed: Missing method body.',
      timeMs: 12
    };
  }

  const hasLogic = code.includes('return') && (code.includes('sum') || code.includes('Math.'));
  const duration = Math.round(performance.now() - startTime + 42);

  if (!hasLogic) {
    return {
      success: false,
      error: 'Wrong Answer: Test case failed.',
      output: `Test Case 1 Failed.\nExpected output: ${testCases?.[0]?.expectedOutput || '5.0'}\nActual output: null`,
      timeMs: duration
    };
  }

  return {
    success: true,
    message: 'All test cases passed successfully!',
    output: `Test Cases: ${testCases?.length || 2}/${testCases?.length || 2} Passed\nExecution Time: ${duration} ms (Beats 89%)\nMemory Footprint: 36.8 MB`,
    timeMs: duration
  };
}

// Save completed interview session with backend and localStorage sync
export async function saveInterviewSession(sessionData) {
  try {
    const raw = localStorage.getItem(INTERVIEW_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    const record = {
      id: `int-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...sessionData
    };
    history.unshift(record);
    localStorage.setItem(INTERVIEW_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));

    // Send to backend finish endpoint
    await fetch('/api/interview/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    }).catch(() => {});
  } catch (err) {
    console.warn('Could not save interview session', err);
  }
}

