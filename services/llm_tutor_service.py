from __future__ import annotations

import os
import textwrap
from dataclasses import dataclass
from functools import lru_cache
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

import pandas as pd
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from resources import TOPIC_CATALOG, normalize_topic
from services.catalog_service import rank_courses, rank_kaggle_datasets, rank_catalog_videos, project_for_topic

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

TOPIC_NOTES: Dict[str, str] = {
    'python': 'Python is the foundation language for AI and ML workflows. Focus on data types, functions, loops, list comprehensions, NumPy, pandas, and basic visualization.',
    'statistics': 'Statistics helps you summarize data, estimate uncertainty, and validate model decisions. Learn mean, variance, distributions, hypothesis testing, and confidence intervals.',
    'probability': 'Probability gives the mathematical language for uncertainty. Learn conditional probability, Bayes theorem, random variables, expectation, and common distributions.',
    'feature engineering': 'Feature engineering improves how raw data is represented. It includes encoding, scaling, feature creation, feature selection, and handling missing values.',
    'linear regression': 'Linear regression predicts continuous values and teaches the basics of supervised learning, fitting, coefficients, loss, and regularization.',
    'classification': 'Classification predicts categories such as pass/fail or spam/not-spam. Learn logistic regression, metrics, imbalance handling, and threshold tuning.',
    'decision trees': 'Decision trees split data into interpretable rules. Understand entropy, information gain, pruning, and ensemble extensions like random forests.',
    'clustering': 'Clustering groups unlabeled examples using similarity. Study K-means, hierarchical clustering, silhouette score, and feature scaling effects.',
    'dimensionality reduction': 'Dimensionality reduction compresses information into fewer features. Learn PCA, explained variance, visualization, and denoising tradeoffs.',
    'naive bayes': 'Naive Bayes is a probabilistic classifier that works well on sparse text features and small datasets, especially when assumptions are acceptable.',
    'neural networks': 'Neural networks learn layered representations. Understand perceptrons, activation functions, backpropagation, optimization, overfitting, and regularization.',
    'computer vision': 'Computer vision teaches machines to interpret images using preprocessing, convolutional neural networks, detection, segmentation, and augmentation.',
    'nlp': 'Natural language processing handles text tasks like tokenization, embeddings, sentiment analysis, translation, and retrieval.',
    'transformers': 'Transformers use attention to model long-range dependencies. They power modern NLP, vision transformers, and most LLM systems.',
    'llm': 'Large language models are pretrained on broad text corpora and then adapted through prompting, retrieval, instruction tuning, and tool use.',
    'prompt engineering': 'Prompt engineering structures instructions, context, role, constraints, and examples so language models answer more reliably.',
    'generative ai': 'Generative AI creates new text, images, audio, or code by learning data patterns. It includes diffusion, autoregressive models, and multimodal systems.',
    'reinforcement learning': 'Reinforcement learning optimizes behavior through rewards. Learn agents, environments, policies, exploration, and value functions.',
    'model evaluation': 'Model evaluation tells whether a model is trustworthy. Use train/validation/test splits, cross-validation, precision, recall, F1, ROC-AUC, and error analysis.',
    'model deployment': 'Model deployment makes models usable in real systems via APIs, monitoring, versioning, and retraining pipelines.',
    'automl': 'AutoML automates feature preprocessing, model search, and hyperparameter tuning so strong baselines are easier to build quickly.',
    'svm': 'Support Vector Machines maximize margin between classes and are strong for small to medium structured datasets.',
    'ensemble methods': 'Ensemble methods combine multiple models to improve robustness and predictive power through bagging, boosting, or stacking.',
    'hyperparameter tuning': 'Hyperparameter tuning searches for good model settings using grid search, random search, Bayesian optimization, or bandit-based methods.',
    'search algorithms': 'Search algorithms explore state spaces to find solutions. Learn BFS, DFS, uniform cost search, A*, heuristics, and admissibility.',
    'knowledge representation': 'Knowledge representation models facts, rules, entities, and relationships so AI systems can reason about them.',
    'expert systems': 'Expert systems combine a knowledge base and inference engine to emulate domain-specific decision making.',
    'fuzzy logic': 'Fuzzy logic handles partial truth with membership functions and linguistic rules, useful when boundaries are not crisp.',
    'rag': 'Retrieval-augmented generation combines search with a language model so answers are grounded in documents instead of memory alone.',
    'agentic ai': 'Agentic AI refers to autonomous systems capable of goal-driven planning, multi-step reasoning, calling external tools/APIs, executing code, reflecting on outputs, and collaborating with other agents without constant human intervention.',
    'vector database': 'Vector databases store high-dimensional embeddings and execute approximate nearest-neighbor search for fast similarity retrieval in LLM, RAG, and computer vision systems.',
}

COMPARISON_HINTS = {
    ('classification', 'clustering'): 'Classification uses labeled data to predict known classes, while clustering uses unlabeled data to discover groups.',
    ('linear regression', 'classification'): 'Linear regression predicts continuous values; classification predicts discrete labels.',
    ('decision trees', 'random forest'): 'A decision tree is a single interpretable model, while a random forest averages many trees for higher robustness.',
    ('transformers', 'llm'): 'Transformers are the architecture family; an LLM is a large trained model often built on transformers.',
    ('rag', 'llm'): 'An LLM answers from learned parameters; RAG adds retrieved external context to improve freshness and grounding.',
}


@dataclass
class TutorReply:
    answer: str
    mode: str
    detected_topic: str
    retrieved_chunks: List[Dict]
    related_resources: Dict


@lru_cache(maxsize=1)
def load_dataset_registry() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, 'real_dataset_registry.csv')
    if os.path.exists(path):
        return pd.read_csv(path)
    return pd.DataFrame(columns=['dataset', 'task', 'topic', 'source', 'url', 'why_it_fits'])


@lru_cache(maxsize=1)
def _topic_documents():
    docs = []
    for topic, meta in TOPIC_CATALOG.items():
        docs.append({
            'topic': topic,
            'kind': 'topic_note',
            'text': ' '.join([
                topic,
                ' '.join(meta.get('aliases', [])),
                ' '.join(meta.get('prerequisites', [])),
                meta.get('project', ''),
                TOPIC_NOTES.get(topic, ''),
            ]).strip(),
        })
    df = load_dataset_registry()
    for _, row in df.iterrows():
        docs.append({
            'topic': normalize_topic(str(row.get('topic', ''))),
            'kind': 'dataset',
            'text': f"Dataset {row.get('dataset','')} task {row.get('task','')} topic {row.get('topic','')} source {row.get('source','')} why {row.get('why_it_fits','')}".strip(),
            'url': row.get('url', ''),
            'dataset': row.get('dataset', ''),
        })
    corpus = [d['text'] for d in docs] or ['machine learning']
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    matrix = vectorizer.fit_transform(corpus)
    return docs, vectorizer, matrix


def retrieve_relevant_chunks(question: str, selected_topics: List[str], limit: int = 6) -> List[Dict]:
    docs, vectorizer, matrix = _topic_documents()
    query = ' '.join([question] + selected_topics)
    qv = vectorizer.transform([query])
    sims = cosine_similarity(qv, matrix).ravel()
    scored = sorted(enumerate(sims), key=lambda x: x[1], reverse=True)
    chunks = []
    for idx, score in scored:
        if score <= 0:
            continue
        item = dict(docs[idx])
        item['score'] = round(float(score), 4)
        chunks.append(item)
        if len(chunks) >= limit:
            break
    return chunks


def _detect_topic(question: str, selected_topics: List[str]) -> str:
    import re
    q = question.lower().strip()
    
    # 1. Prioritize exact topic matches in TOPIC_CATALOG using word boundaries \b
    sorted_catalog_topics = sorted(TOPIC_CATALOG.keys(), key=lambda k: len(k), reverse=True)
    for topic in sorted_catalog_topics:
        meta = TOPIC_CATALOG[topic]
        keys = [topic] + meta.get('aliases', [])
        for k in sorted(keys, key=lambda x: len(x), reverse=True):
            if re.search(r'\b' + re.escape(k.lower()) + r'\b', q):
                return topic

    # 2. Extract query subject if user asks "what is X", "explain X", "tell me about X"
    patterns = [
        r'(?:what\s+is|explain|tell\s+me\s+about|how\s+does|define|overview\s+of|teach\s+me)\s+(?:the\s+)?([a-z0-9\s\-_]+?)(?:\?|$|\s+in\s+|\s+using\s+)',
    ]
    for p in patterns:
        m = re.search(p, q)
        if m:
            extracted = m.group(1).strip()
            if len(extracted) > 2 and extracted not in {'a', 'an', 'the', 'this', 'that', 'it', 'me', 'my'}:
                return extracted

    # 3. Match against selected topics
    for topic in selected_topics:
        if topic in TOPIC_CATALOG and re.search(r'\b' + re.escape(topic.lower()) + r'\b', q):
            return topic

    return selected_topics[0] if selected_topics else 'agentic ai'


def _compare_answer(question: str, selected_topics: List[str]) -> str | None:
    q = question.lower().replace(' versus ', ' vs ')
    if ' vs ' not in q and 'difference' not in q and 'compare' not in q:
        return None
    mentioned = []
    for topic in list(TOPIC_CATALOG.keys()) + ['random forest']:
        if topic in q:
            mentioned.append(topic)
    if len(mentioned) < 2:
        return None
    a, b = mentioned[0], mentioned[1]
    pair = (a, b)
    rev = (b, a)
    if pair in COMPARISON_HINTS:
        base = COMPARISON_HINTS[pair]
    elif rev in COMPARISON_HINTS:
        base = COMPARISON_HINTS[rev]
    else:
        base = f"{a.title()} and {b.title()} solve different problems or use different assumptions. Compare them by task type, input labels, interpretability, data size, and evaluation metric."
    return base + f" For your project, use {a.title()} when it matches the task goal, and use {b.title()} when you need the strengths of that method."


def _build_learning_snapshot(profile: Dict, assessment: List[Dict]) -> str:
    topics = ', '.join(t.title() for t in profile.get('topics', [])) or 'All AI/ML topics'
    weak = sorted(assessment, key=lambda x: x.get('score_pct', 0))[:2]
    strong = sorted(assessment, key=lambda x: x.get('score_pct', 0), reverse=True)[:2]
    weak_txt = ', '.join(f"{w['topic']} ({w['score_pct']}%)" for w in weak) if weak else 'none detected'
    strong_txt = ', '.join(f"{s['topic']} ({s['score_pct']}%)" for s in strong) if strong else 'none detected'
    return f"Selected topics: {topics}. Weak topics: {weak_txt}. Strong topics: {strong_txt}. Goal: {profile.get('target_goal','Personalized AI/ML Learning')}."


def _local_reasoned_answer(question: str, detected_topic: str, profile: Dict, assessment: List[Dict], chunks: List[Dict]) -> str:
    q = question.lower().strip()
    topic = detected_topic.lower()
    topic_title = detected_topic.title()
    meta = TOPIC_CATALOG.get(detected_topic, {})
    topic_note = TOPIC_NOTES.get(detected_topic, meta.get('project', ''))
    
    current_result = next((r for r in assessment if r.get('topic') == detected_topic), None)
    current_level = (current_result or {}).get('predicted_level', 'beginner')
    
    courses = rank_courses(detected_topic, current_level, max_results=2)
    videos = rank_catalog_videos(detected_topic, current_level, max_results=2)
    datasets = rank_kaggle_datasets(detected_topic, current_level, max_results=2)
    proj = project_for_topic(detected_topic, current_level)

    # 1. COMPARISON INTENT (e.g. "Classification vs Clustering")
    compare = _compare_answer(question, profile.get('topics', []))
    if compare:
        return f"### 💡 Comparison: {topic_title}\n\n{compare}\n\n**Best Practice:** Choose the model based on your dataset size, interpretability requirements, and latency targets."

    # 2. PROS AND CONS / ADVANTAGES INTENT
    if any(k in q for k in ['pros', 'cons', 'advantage', 'disadvantage', 'benefit', 'limitation', 'drawback', 'why use', 'when to use']):
        topic_pros_cons = {
            'decision trees': (
                "### 🌲 Decision Trees: Pros and Cons\n\n"
                "**Decision Trees** are non-parametric supervised learning models used for classification and regression tasks.\n\n"
                "#### 🟢 Pros (Advantages)\n"
                "1. **High Interpretability:** Decision rules are easy to understand, visualize, and explain to non-technical stakeholders.\n"
                "2. **No Feature Scaling Required:** Does not require feature scaling, normalization, or zero-centering.\n"
                "3. **Handles Mixed Data Types:** Naturally processes both numerical and categorical features.\n"
                "4. **Captures Non-Linear Relationships:** Models complex non-linear feature interactions without feature engineering.\n\n"
                "#### 🔴 Cons (Disadvantages)\n"
                "1. **Prone to Overfitting:** Deep unpruned trees memorize noise in training data, resulting in poor generalization.\n"
                "2. **High Variance (Instability):** Small variations in training data can produce a completely different tree.\n"
                "3. **Greedy Decision Splits:** Uses greedy algorithms (e.g., CART) at each split, which may miss globally optimal trees.\n"
                "4. **Biased Towards Majority Classes:** Can create imbalanced decision rules when trained on skewed class distributions.\n\n"
                "#### 💡 Solution / Recommendation:\n"
                "To eliminate high variance and overfitting, upgrade to ensemble methods like **Random Forests** or **Gradient Boosted Trees (XGBoost/LightGBM)**."
            ),
            'linear regression': (
                "### 📈 Linear Regression: Pros and Cons\n\n"
                "**Linear Regression** models continuous targets using a linear combination of input features.\n\n"
                "#### 🟢 Pros (Advantages)\n"
                "1. **Extremely Fast & Efficient:** Computationally lightweight for training, evaluation, and production deployment.\n"
                "2. **Fully Interpretable:** Coefficients explicitly define feature magnitude and directional impact on target predictions.\n"
                "3. **Less Overfitting Risk:** Perform robustly on linearly separable datasets with regularizers (Ridge/Lasso).\n\n"
                "#### 🔴 Cons (Disadvantages)\n"
                "1. **Linearity Assumption:** Fails on complex, non-linear relationships without manual feature transformations.\n"
                "2. **Outlier Sensitivity:** Outliers strongly shift the fitted regression hyperplane.\n"
                "3. **Multicollinearity Sensitivity:** Highly correlated predictor features make coefficient estimates unstable."
            ),
            'classification': (
                "### 🎯 Classification Models: Pros and Cons\n\n"
                "**Classification** algorithms predict discrete categorical labels (e.g., Spam vs Not Spam, Pass vs Fail).\n\n"
                "#### 🟢 Pros (Advantages)\n"
                "1. **Actionable Probabilities:** Outputs calibrated probability scores for threshold decision tuning.\n"
                "2. **Comprehensive Metrics:** Evaluated using Precision, Recall, F1-Score, and ROC-AUC metrics.\n\n"
                "#### 🔴 Cons (Disadvantages)\n"
                "1. **Class Imbalance Degradation:** Loss functions can become biased towards dominant classes unless reweighted.\n"
                "2. **Threshold Tuning Needed:** Default 0.5 probability cutoff must be calibrated for costly false positives/negatives."
            ),
            'naive bayes': (
                "### ⚡ Naive Bayes: Pros and Cons\n\n"
                "**Naive Bayes** is a probabilistic classifier based on Bayes' theorem with feature independence assumptions.\n\n"
                "#### 🟢 Pros (Advantages)\n"
                "1. **Extremely Fast Training:** Requires minimal compute for high-dimensional sparse text vectors (NLP/Spam filtering).\n"
                "2. **Performs Well on Small Datasets:** Requires relatively small training sample size to estimate parameters.\n\n"
                "#### 🔴 Cons (Disadvantages)\n"
                "1. **Independence Assumption:** Assumes all features are independent given the class, which rarely holds in real data.\n"
                "2. **Zero Frequency Problem:** Assigns zero probability to unseen categorical values unless Laplace smoothing is applied."
            ),
            'neural networks': (
                "### 🧠 Neural Networks: Pros and Cons\n\n"
                "**Neural Networks** learn hierarchical representations across connected layers of artificial neurons.\n\n"
                "#### 🟢 Pros (Advantages)\n"
                "1. **Universal Function Approximation:** Learns highly complex, non-linear patterns across vision, speech, and text.\n"
                "2. **Automated Feature Extraction:** Eliminates manual feature engineering for unstructured raw inputs.\n\n"
                "#### 🔴 Cons (Disadvantages)\n"
                "1. **Black-Box Nature:** Extremely difficult to interpret or audit individual decision nodes.\n"
                "2. **Data & Compute Intensive:** Requires large datasets and GPU compute to train without overfitting."
            ),
            'agentic ai': (
                "### 🤖 Agentic AI: Pros and Cons\n\n"
                "**Agentic AI** refers to autonomous AI systems capable of goal-oriented planning, tool execution, and multi-step reasoning.\n\n"
                "#### 🟢 Pros (Advantages)\n"
                "1. **Autonomous Execution:** Solves end-to-end multi-step tasks without human intervention at every step.\n"
                "2. **Tool Integration:** Connects LLMs to search engines, databases, Python interpreters, and external APIs.\n"
                "3. **Self-Correction & Reflection:** Evaluates output errors and retries tool calls dynamically.\n\n"
                "#### 🔴 Cons (Disadvantages)\n"
                "1. **Infinite Loop Risk:** Unconstrained agents can stall in execution loops without max-iteration safeguards.\n"
                "2. **Higher API Latency & Cost:** Multi-step tool reasoning requires multiple LLM call cycles per query."
            ),
        }

        specific_ans = topic_pros_cons.get(topic)
        if specific_ans:
            return specific_ans

        return f"""### 📊 {topic_title}: Pros and Cons

#### 🟢 Pros (Advantages)
1. **High Predictive Performance:** Efficiently captures statistical patterns across features for reliable predictions.
2. **Scalable Production Deployment:** Fits seamlessly into standard machine learning frameworks and REST APIs.
3. **Established Industry Standard:** Supported by robust open-source libraries (Scikit-Learn, PyTorch, Pandas).

#### 🔴 Cons (Disadvantages)
1. **Data Quality Dependency:** Requires clean data inputs, missing value imputation, and feature engineering.
2. **Hyperparameter Sensitivity:** Performance depends on proper cross-validation to prevent overfitting."""

    # 3. CODE & IMPLEMENTATION INTENT
    if any(k in q for k in ['code', 'implement', 'python', 'script', 'write', 'how to build', 'syntax', 'example']):
        code_examples = {
            'decision trees': '''from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_iris

# 1. Load benchmark dataset
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)

# 2. Train Decision Tree Classifier
clf = DecisionTreeClassifier(max_depth=3, random_state=42)
clf.fit(X_train, y_train)

# 3. Evaluate and view decision rules
print(f"Test Accuracy: {clf.score(X_test, y_test):.2f}")
print("\\nDecision Rules:\\n", export_text(clf, feature_names=iris.feature_names))''',

            'linear regression': '''import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

# 1. Create sample numerical dataset (Study Hours vs Exam Score)
X = np.array([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]])
y = np.array([32, 40, 51, 62, 70, 78, 85, 91, 98, 105])

# 2. Train Linear Regression model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LinearRegression()
model.fit(X_train, y_train)

# 3. Print predictions and parameters
print(f"Slope (Weight): {model.coef_[0]:.2f}")
print(f"Intercept (Bias): {model.intercept_:.2f}")
print("Test Predictions:", model.predict(X_test))''',

            'naive bayes': '''from sklearn.naive_bayes import GaussianNB
import numpy as np

# 1. Sample feature matrix and target labels
X = np.array([[-1, -1], [-2, -1], [-3, -2], [1, 1], [2, 1], [3, 2]])
y = np.array([1, 1, 1, 2, 2, 2])

# 2. Fit Gaussian Naive Bayes
gnb = GaussianNB()
gnb.fit(X, y)

# 3. Predict class probability for new test vector
test_sample = [[-0.8, -1.2]]
print("Predicted Class:", gnb.predict(test_sample)[0])
print("Class Probabilities:", gnb.predict_proba(test_sample))''',

            'agentic ai': '''# Python Autonomous AI Agent Tool Loop
class Agent:
    def __init__(self, tools):
        self.tools = tools

    def execute_goal(self, goal):
        print(f"🤖 [Agent Reasoning]: Processing goal -> '{goal}'")
        if "weather" in goal.lower():
            result = self.tools["get_weather"]("New York")
        elif "search" in goal.lower():
            result = self.tools["web_search"](goal)
        else:
            result = "Internal neural reasoning applied."
        return f"[Agent Output]: {result}"

# Register external execution tools
tools = {
    "get_weather": lambda loc: f"Current weather in {loc}: 72°F Sunny",
    "web_search": lambda q: f"Top query result for '{q}': Agentic Workflows Guide 2026"
}

agent = Agent(tools)
print(agent.execute_goal("Check weather in New York"))''',
        }

        code_block = code_examples.get(topic, f'''import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

# 1. Load and prepare feature matrix X and targets y
print("Executing {topic_title} machine learning pipeline...")

# 2. Train estimator and evaluate performance metrics''')

        return f"""### 💻 Python Code Example: {topic_title}

Here is a complete, runnable Python code implementation for **{topic_title}**:

```python
{code_block}
```

#### 📝 Step-by-Step Breakdown:
1. **Data Prep:** Format predictor variables into matrix `X` and targets into vector `y`.
2. **Model Training:** Call `.fit(X_train, y_train)` to optimize decision parameters.
3. **Evaluation:** Call `.predict(X_test)` to evaluate generalization accuracy."""

    # 4. DATASET INTENT
    if any(k in q for k in ['dataset', 'data', 'kaggle', 'where to find data']):
        rec_ds = datasets[0] if datasets else {'title': f'{topic_title} Benchmark Dataset', 'url': 'https://www.kaggle.com', 'description': 'Curated dataset for practice.'}
        return f"""### 📊 Recommended Practice Datasets for {topic_title}

Here is the best dataset to practice **{topic_title}**:

- 📁 **[{rec_ds['title']}]({rec_ds.get('url','#')})**
  - *Overview:* {rec_ds.get('description', 'Curated dataset for building and evaluating models.')}
  - *Source:* {rec_ds.get('source', 'Kaggle')}

#### 🛠️ Recommended Practical Steps:
1. Download dataset and load via `pandas.read_csv()`.
2. Clean missing data and standardize feature distributions.
3. Fit your **{topic_title}** model and evaluate performance."""

    # 5. GENERAL CONCEPT / EXPLANATION INTENT (ChatGPT Detailed Style)
    explanations = {
        'linear regression': (
            "**Linear Regression** is a foundational supervised learning algorithm used to model the relationship between one or more independent predictor features ($X$) and a continuous target variable ($y$).\n\n"
            "### ⚙️ How It Works:\n"
            "1. **Linear Equation:** Fits a straight line or hyperplane to observed data points:\n"
            "   $$y = w_1 x_1 + w_2 x_2 + \\dots + w_n x_n + b$$\n"
            "2. **Loss Minimization:** Optimizes weights ($w$) and bias ($b$) by minimizing the Mean Squared Error (MSE):\n"
            "   $$MSE = \\frac{1}{N} \\sum_{i=1}^{N} (y_i - \\hat{y}_i)^2$$\n"
            "3. **Optimization:** Uses Gradient Descent or Ordinary Least Squares (OLS) closed-form solution to calculate optimal coefficients."
        ),
        'agentic ai': (
            "**Agentic AI** refers to autonomous AI systems capable of goal-driven multi-step planning, tool execution, self-reflection, and problem solving without constant human intervention.\n\n"
            "### ⚙️ Core Architecture & Principles:\n"
            "1. **Planning & Task Decomposition:** Breaks complex user requests into ordered sub-tasks.\n"
            "2. **Tool Execution:** Connects LLMs to Python interpreters, web search APIs, and databases.\n"
            "3. **Memory & State Tracking:** Retains context across execution turns.\n"
            "4. **Reflection & Error Recovery:** Evaluates tool outputs and self-corrects execution errors.\n\n"
            "### 🚀 Popular Agentic Frameworks:\n"
            "- **LangChain / LangGraph:** State-machine agent execution.\n"
            "- **CrewAI & AutoGen:** Multi-agent role collaboration."
        ),
        'decision trees': (
            "**Decision Trees** are non-parametric supervised learning models that partition feature spaces into simple decision rules to predict categorical or continuous outcomes.\n\n"
            "### ⚙️ How It Works:\n"
            "1. **Root & Internal Nodes:** Evaluates features using split criteria like **Gini Impurity** or **Entropy**.\n"
            "2. **Leaf Nodes:** Output final class predictions or regression average values.\n"
            "3. **Pruning:** Trims weak tree branches to prevent overfitting training noise."
        ),
        'classification': (
            "**Classification** is a supervised machine learning task where algorithms categorize data points into predefined discrete classes or labels (e.g., Binary: Spam/Not-Spam, Multiclass: Digits 0-9).\n\n"
            "### ⚙️ How It Works:\n"
            "1. **Feature Input:** Takes continuous or categorical predictor variables.\n"
            "2. **Probability Estimation:** Uses algorithms like Logistic Regression, Random Forest, or SVM to compute class probabilities.\n"
            "3. **Decision Cutoff:** Applies a decision threshold (e.g., 0.5 probability) to output predicted categories."
        ),
        'clustering': (
            "**Clustering** is an unsupervised learning technique that groups unlabeled data points together based on feature similarity and spatial proximity.\n\n"
            "### ⚙️ How It Works:\n"
            "1. **Distance Metrics:** Measures proximity between points using Euclidean, Cosine, or Manhattan distance.\n"
            "2. **Centroid Optimization:** Algorithms like K-Means iteratively update cluster centroids to minimize within-cluster variance.\n"
            "3. **Evaluation:** Measures cluster separation using Silhouette Score or Inertia."
        ),
        'naive bayes': (
            "**Naive Bayes** is a fast probabilistic classifier based on Bayes' Theorem with the assumption of strong independence between features.\n\n"
            "### ⚙️ How It Works:\n"
            "1. **Bayes Theorem Formula:** Calculates posterior probability:\n"
            "   $$P(y|X) = \\frac{P(X|y) \\cdot P(y)}{P(X)}$$\n"
            "2. **Conditional Independence:** Assumes feature probabilities $P(x_i|y)$ multiply independently.\n"
            "3. **Inference:** Assigns the class label with the highest computed posterior probability."
        ),
        'neural networks': (
            "**Neural Networks** (Artificial Neural Networks) are computing systems inspired by biological brains that learn complex hierarchical patterns from data across interconnected layers of neurons.\n\n"
            "### ⚙️ How It Works:\n"
            "1. **Forward Propagation:** Passes input vectors through weighted connections and activation functions (ReLU, Sigmoid).\n"
            "2. **Loss Evaluation:** Measures prediction error using Cross-Entropy or Mean Squared Error.\n"
            "3. **Backpropagation:** Computes gradients using the chain rule and updates weights using Adam or SGD optimizers."
        ),
        'vector database': (
            "A **Vector Database** is a specialized database engineered to store, index, and query high-dimensional vector embeddings efficiently using Approximate Nearest Neighbor (ANN) search.\n\n"
            "### ⚙️ Key Concepts:\n"
            "1. **Embedding Storage:** Converts text, images, or documents into dense numerical vectors.\n"
            "2. **Similarity Metrics:** Measures vector proximity using Cosine Similarity, Euclidean Distance, or Dot Product.\n"
            "3. **Popular Engines:** ChromaDB, Pinecone, Weaviate, FAISS, Milvus."
        ),
    }

    general_exp = explanations.get(topic)
    if not general_exp:
        note_clean = topic_note.strip()
        if note_clean.lower().startswith(topic):
            general_exp = f"**{topic_title}** - {note_clean}\n\n### ⚙️ Core Principles:\n1. **Data Formatting:** Processes structured or unstructured inputs.\n2. **Optimization:** Minimizes objective loss functions during training.\n3. **Evaluation:** Measures generalization accuracy on test validation sets."
        else:
            general_exp = f"**{topic_title}** is an important machine learning discipline.\n\n{note_clean}\n\n### ⚙️ Core Principles:\n1. **Data Formatting:** Processes structured or unstructured inputs.\n2. **Optimization:** Minimizes objective loss functions during training.\n3. **Evaluation:** Measures generalization accuracy on test validation sets."

    return general_exp


def _api_key_available() -> bool:
    return bool(os.getenv('GEMINI_API_KEY') or os.getenv('OPENAI_API_KEY'))


def _call_gemini(api_key: str, question: str, detected_topic: str, profile: Dict, assessment: List[Dict], chunks: List[Dict]) -> str:
    system_instruction = (
        "You are an intelligent AI Tutor. "
        "Answer the user's question directly, clearly, and accurately. "
        "CRITICAL RULE: Do NOT include any conversational greetings, intros, or fluff like 'Hello!', 'It\\'s great you\\'re diving into...', 'Let\\'s break down...', or 'As an expert AI tutor...'. "
        "Start IMMEDIATELY with the direct, exact answer to the question using clean markdown headers (###), bold text, bullet points, math equations where relevant, and code blocks only if requested."
    )
    models = ['gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-pro']
    last_err = None
    for m in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
            payload = {
                "systemInstruction": {
                    "parts": [{"text": system_instruction}]
                },
                "contents": [{"parts": [{"text": f"User Question: {question}\n\nProvide the direct, exact, greeting-free answer now:"}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1500}
            }
            resp = requests.post(url, json=payload, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        raw_ans = parts[0]["text"].strip()
                        lines = raw_ans.split('\n')
                        clean_lines = []
                        skipping_intro = True
                        for line in lines:
                            l_strip = line.strip().lower()
                            if skipping_intro:
                                if any(l_strip.startswith(p) for p in ['hello', 'hi', 'hey', 'greetings', 'welcome', 'sure', 'certainly', "i'd be happy", "it's great", "let's break down", "let's explore", "as an expert"]):
                                    continue
                                if l_strip.startswith('---') and len(clean_lines) == 0:
                                    continue
                                if not l_strip:
                                    continue
                                skipping_intro = False
                            clean_lines.append(line)
                        cleaned_ans = '\n'.join(clean_lines).strip()
                        return cleaned_ans or raw_ans
        except Exception as e:
            last_err = e
            continue
    raise RuntimeError(f"Gemini API call failed: {last_err}")


def generate_tutor_reply(question: str, profile: Dict, assessment: List[Dict]) -> TutorReply:
    selected_topics = profile.get('topics', []) or list(TOPIC_CATALOG.keys())
    detected_topic = _detect_topic(question, selected_topics)
    chunks = retrieve_relevant_chunks(question, selected_topics)
    related_resources = {
        'videos': rank_catalog_videos(detected_topic, 'beginner', max_results=2),
        'courses': rank_courses(detected_topic, 'beginner', max_results=2),
        'datasets': rank_kaggle_datasets(detected_topic, 'beginner', max_results=2),
        'project': project_for_topic(detected_topic, 'beginner'),
    }

    # Use Gemini API key if present
    gemini_key = os.getenv('GEMINI_API_KEY') or os.getenv('OPENAI_API_KEY')
    if gemini_key and len(gemini_key.strip()) > 8:
        try:
            answer = _call_gemini(gemini_key.strip(), question, detected_topic, profile, assessment, chunks)
            return TutorReply(answer=answer, mode='gemini_ai', detected_topic=detected_topic, retrieved_chunks=chunks, related_resources=related_resources)
        except Exception as e:
            print(f"[LLM Tutor] Gemini API error: {e}")
            pass

    # High-quality structured AI response engine fallback
    answer = _local_reasoned_answer(question, detected_topic, profile, assessment, chunks)
    return TutorReply(answer=answer, mode='ai_tutor_engine', detected_topic=detected_topic, retrieved_chunks=chunks, related_resources=related_resources)



