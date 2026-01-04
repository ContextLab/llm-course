# Assignment 2: Advanced SPAM Classifier with Multi-Method Comparison

## Overview

Spam detection is one of the most successful and widely-deployed applications of machine learning. In this assignment, you will build a comprehensive spam classification system that not only achieves high performance but also provides deep insights into what makes spam detection work—and what makes it fail.

Unlike a simple "build a classifier" task, this assignment requires you to:
1. **Implement multiple classification approaches** (traditional ML and neural methods)
2. **Conduct rigorous comparative analysis** across methods
3. **Perform extensive error analysis** to understand failure modes
4. **Test adversarial robustness** by trying to fool your own classifier
5. **Consider real-world deployment constraints** (speed, memory, class imbalance)

This assignment mirrors real-world ML engineering: you'll make architecture decisions, justify trade-offs, and demonstrate that you understand not just how to build models, but why they work.

**Timeline:** This assignment is designed to be completed in **1 week (7 days)** while remaining comprehensive in scope. By using GenAI tools to accelerate implementation, you can focus your time on the deeper analytical work—error analysis, robustness testing, and deriving insights—that separates excellent work from good work.

## Learning Objectives

By completing this assignment, you will:
- Understand the full pipeline of text classification from feature engineering to deployment
- Compare traditional ML vs. neural approaches on the same task
- Learn to properly evaluate classifiers using multiple metrics
- Develop skills in systematic error analysis and debugging ML models
- Think adversarially about model robustness
- Make informed decisions about model selection based on performance/efficiency trade-offs

## Dataset

A sample dataset is provided ([`training.zip`](training.zip)), consisting of two folders:
- **spam/**: Contains spam emails in plain text format.
- **ham/**: Contains ham emails in plain text format.

You can use this dataset to develop, train, and test your classifiers. When evaluating your solution, a new dataset—structured in the same way (with "spam" and "ham" folders)—will be used. Your models should generalize well to this unseen data.

**Important Notes:**
- You may split the provided data however you like (train/val/test)
- You may augment the dataset with external spam datasets (must cite sources)
- Be aware of potential class imbalance and handle it appropriately
- Consider using stratified splitting to maintain class distributions

## Required Components

### Part 1: Multiple Classifier Implementations (40 points)

You must implement and train **at least three** different classifiers:

#### 1. Traditional ML Baseline (15 points)
Implement **two** of the following with proper feature engineering:
- **Naive Bayes** with TF-IDF features
- **Support Vector Machine (SVM)** with TF-IDF features
- **Logistic Regression** with engineered features
- **Random Forest** with custom feature extraction

For traditional methods, you must:
- Document your feature engineering choices (TF-IDF parameters, n-grams, custom features)
- Explain preprocessing decisions (lowercasing, stemming, stop words, etc.)
- Justify hyperparameter selections

**Example features to consider:**
- TF-IDF vectors (unigrams, bigrams, trigrams)
- Custom features: email length, number of URLs, exclamation marks, ALL CAPS ratio
- Domain-specific features: sender patterns, header information
- Character-level features for obfuscated spam

#### 2. Neural/Transformer-Based Model (15 points)
Implement at least one neural approach:
- **Fine-tuned BERT** (bert-base-uncased or distilbert-base-uncased)
- **Fine-tuned DistilBERT** (recommended for faster training)
- **RoBERTa** or other transformer variant
- **Custom neural architecture** (LSTM/GRU with embeddings)

For neural methods, you must:
- Use appropriate pre-trained models and fine-tune on spam data
- Document training procedures (learning rate, epochs, batch size)
- Handle sequence length appropriately (truncation/padding)
- Monitor for overfitting (training vs. validation curves)

#### 3. Ensemble Method (10 points)
Create an ensemble that combines predictions from your best models:
- **Voting ensemble** (majority vote or weighted average)
- **Stacking** (meta-classifier on top of base models)
- **Boosting** (if using multiple traditional classifiers)

Document your ensemble strategy and show whether it improves over individual models.

### Part 2: Comprehensive Evaluation (25 points)

For each classifier, you must report:

#### Quantitative Metrics (15 points)
- **Accuracy**: Overall correctness
- **Precision**: Of emails classified as spam, how many are actually spam?
- **Recall**: Of actual spam emails, how many did you catch?
- **F1 Score**: Harmonic mean of precision and recall
- **AUC-ROC**: Area under the receiver operating characteristic curve
- **Confusion Matrix**: Visualize true positives, false positives, true negatives, false negatives

**Create a comparison table** showing all metrics for all classifiers.

#### Computational Efficiency (5 points)
For each model, measure and report:
- **Training time**: How long to train on the full dataset?
- **Inference time**: Average time to classify a single email
- **Model size**: Memory footprint of saved model
- **Throughput**: Emails classified per second

This helps understand deployment trade-offs.

#### Statistical Significance (5 points)
- Use **cross-validation** (at least 5-fold) to get confidence intervals
- Perform **statistical tests** to determine if one model significantly outperforms another
- Report means and standard deviations across folds

### Part 3: Error Analysis (20 points)

This is where you demonstrate deep understanding:

#### Systematic Error Categorization (10 points)
1. **Identify failure cases**: Find at least 20 misclassified emails (10 false positives, 10 false negatives)
2. **Categorize errors**: Group them into patterns:
   - False Positives: Legitimate emails classified as spam (e.g., promotional emails, newsletters)
   - False Negatives: Spam that slipped through (e.g., sophisticated phishing, image-based spam)
3. **Analyze patterns**: What do misclassified emails have in common?
   - Vocabulary overlap between spam and ham
   - Short emails with little context
   - Emails with unusual formatting
   - Multilingual content

#### Comparative Error Analysis (5 points)
- Do different models make different mistakes?
- Are neural models better at certain types of spam vs. traditional models?
- Where does the ensemble help most?

#### Feature Importance Analysis (5 points)
- For traditional models: What features are most predictive? (Use feature coefficients or SHAP values)
- For neural models: Use attention visualization or probing classifiers
- What words/patterns are most strongly associated with spam vs. ham?

### Part 4: Adversarial Testing (10 points)

Test the robustness of your classifiers:

#### Create Adversarial Examples (5 points)
Manually craft at least **5 emails** that:
- Should be classified as spam but try to evade detection
- Use techniques spammers actually use: character substitution (V1agra), adding legitimate text, etc.

Test these on all your classifiers. Which models are most robust?

#### Robustness Analysis (5 points)
Test your classifier against:
- **Typos and misspellings**: Add random character swaps
- **Case variations**: Change capitalization randomly
- **Synonym replacement**: Replace words with synonyms
- **Content injection**: Add benign text to spam emails

How much does performance degrade? Which models are most robust?

### Part 5: Real-World Considerations (5 points)

Discuss the following:

#### Class Imbalance (2 points)
- How did you handle class imbalance in training?
- What happens if spam/ham ratio changes in production?
- Should you use sampling techniques (SMOTE, undersampling)?

#### Deployment Scenarios (3 points)
Given different constraints, which model would you choose?
- **Mobile email app**: Needs fast inference, small model size
- **Email server**: Can use larger models, needs high throughput
- **Maximum accuracy**: No constraints, best possible performance

Justify your recommendations with evidence from your experiments.

## Deliverables

Submit a **single Jupyter notebook** that includes:

### 1. Code Implementation
- All classifier implementations with clear documentation
- Training and evaluation code
- Utility functions for metrics, visualization, etc.
- Must run in a clean Google Colab instance without errors

### 2. Markdown Documentation
Your notebook must include well-written markdown sections:

#### Introduction
- Overview of your approach
- High-level architecture decisions

#### Methods
For each classifier:
- Architecture description
- Feature engineering choices
- Hyperparameter selection process
- Training procedure

#### Results
- Comparison table of all metrics
- Visualizations (confusion matrices, ROC curves, training curves)
- Statistical significance tests

#### Error Analysis
- Categorization of failure cases
- Specific examples with explanations
- Insights about what makes spam detection difficult

#### Adversarial Testing
- Description of adversarial examples you created
- Results of robustness tests
- Analysis of model vulnerabilities

#### Discussion
- What did you learn about spam classification?
- Which approach worked best and why?
- Trade-offs between different models
- Recommendations for deployment scenarios
- Limitations of your approach

#### Reflection
- What was challenging about this assignment?
- What would you do differently with more time/resources?
- What surprised you about the results?

### 3. Code Quality
- Clean, readable code with meaningful variable names
- Comments explaining non-obvious logic
- Modular functions (not one giant cell)
- Reproducible results (set random seeds)

## Grading Rubric (100 points total)

Your assignment will be graded according to the following breakdown:

### Technical Implementation (40 points)
- **Traditional ML Models (15 points)**
  - Two different traditional ML classifiers properly implemented (8 pts)
  - Proper feature engineering documented and justified (4 pts)
  - Appropriate hyperparameter tuning demonstrated (3 pts)

- **Neural/Transformer Model (15 points)**
  - Correct implementation of fine-tuned transformer or neural model (8 pts)
  - Proper training procedure with validation monitoring (4 pts)
  - Handling of sequence length and preprocessing (3 pts)

- **Ensemble Method (10 points)**
  - Ensemble combines multiple models appropriately (5 pts)
  - Improvement over individual models demonstrated (5 pts)

### Evaluation and Analysis (45 points)
- **Quantitative Metrics (15 points)**
  - All required metrics computed correctly (5 pts)
  - Clear comparison table across all models (5 pts)
  - Proper visualizations (confusion matrices, ROC curves) (5 pts)

- **Computational Efficiency (5 points)**
  - Training time, inference time, and model size measured (3 pts)
  - Trade-offs discussed appropriately (2 pts)

- **Statistical Rigor (5 points)**
  - Cross-validation performed correctly (3 pts)
  - Statistical significance testing (2 pts)

- **Error Analysis (20 points)**
  - Systematic categorization of at least 20 failure cases (8 pts)
  - Insightful patterns identified in errors (6 pts)
  - Comparative analysis across models (3 pts)
  - Feature importance analysis (3 pts)

### Adversarial Testing and Robustness (10 points)
- Creation of meaningful adversarial examples (5 pts)
- Robustness testing across perturbations (3 pts)
- Thoughtful analysis of vulnerabilities (2 pts)

### Real-World Considerations (5 points)
- Discussion of class imbalance handling (2 pts)
- Deployment scenario recommendations with justification (3 pts)

### Documentation and Presentation (15 points)
- Code quality: clean, readable, well-commented (5 pts)
- Markdown documentation: clear, thorough, well-organized (5 pts)
- Visualizations: informative and professional (3 pts)
- Reflection and insights: thoughtful and substantive (2 pts)

### Bonus Points (up to 10 points)
- **Exceptionally thorough analysis** that goes beyond requirements (+5 pts)
- **Novel techniques or insights** not covered in class (+5 pts)
- **Additional robustness tests** (e.g., multilingual spam, zero-day attacks) (+3 pts)
- **Deployment-ready code** with API endpoint or containerization (+5 pts)
- **Interactive demo** or visualization tool (+3 pts)

Note: Maximum score is capped at 110/100.

## Evaluation Metrics

While your grade is based on the rubric above, your model's performance will also be tested on a held-out dataset. This serves as a sanity check—if your models perform poorly (e.g., below 0.85 AUC), you may lose points even if other components are complete.

**Expected Performance Benchmarks:**
- **Minimum acceptable**: AUC > 0.85 on held-out data
- **Good performance**: AUC > 0.92 on held-out data
- **Excellent performance**: AUC > 0.96 on held-out data

The following code can be used to evaluate your classifiers during development:

```python
import os
import zipfile
import shutil
from pathlib import Path
from sklearn.metrics import roc_auc_score

def evaluate_classifier(zip_path: str, classify_email_fn) -> float:
    """
    Evaluate a classifier's performance on a dataset contained in a zip archive.

    Parameters:
    zip_path (str): Path to the zip archive containing "spam" and "ham" folders.
    classify_email_fn (function): A function handle to classify_email(email_text: str) -> int.

    Returns:
    float: The AUC (Area Under the Curve) score of the classifier.
    """
    # Step 1: Set up paths and directories
    dataset_dir = Path(zip_path).with_suffix('')  # Create a directory name based on the zip name (without .zip)
    temp_extracted = False  # Track if we extracted the zip (for cleanup)

    # Step 2: Check if the dataset is already extracted
    if not dataset_dir.exists():
        print(f"Extracting {zip_path}...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(dataset_dir)
        temp_extracted = True  # Mark that we extracted files

    # Step 3: Prepare to collect the data
    emails = []
    labels = []

    # Traverse the spam folder
    spam_folder = dataset_dir / "spam"
    for file_path in spam_folder.iterdir():
        if file_path.is_file():
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                email_text = file.read()
                emails.append(email_text)
                labels.append(1)  # Spam is labeled as 1

    # Traverse the ham folder
    ham_folder = dataset_dir / "ham"
    for file_path in ham_folder.iterdir():
        if file_path.is_file():
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                email_text = file.read()
                emails.append(email_text)
                labels.append(0)  # Ham is labeled as 0

    # Step 4: Classify all emails
    predictions = [classify_email_fn(email) for email in emails]

    # Step 5: Calculate AUC score
    auc_score = roc_auc_score(labels, predictions)

    # Step 6: Clean up if necessary
    if temp_extracted:
        print(f"Cleaning up extracted files from {dataset_dir}...")
        shutil.rmtree(dataset_dir)

    return auc_score
```

You can call this function in your notebook to evaluate individual models during development:
```python
auc_score = evaluate_classifier('training.zip', classify_email)
print(f"Model AUC Score: {auc_score:.4f}")
```

## Tips for Success

### Complete Within 1 Week: Suggested Daily Schedule
While this assignment is comprehensive in scope, it's designed to be completable in **7 days**. Here's a suggested timeline (students can use GenAI to accelerate implementation):

- **Day 1: Setup & Data Exploration** - Extract data, perform EDA, create train/val/test splits
- **Day 2: Traditional ML Models** - Implement two traditional ML classifiers with feature engineering (use GenAI to accelerate TF-IDF/feature pipeline code)
- **Day 3: Neural Model** - Fine-tune transformer (DistilBERT recommended for speed), monitor training
- **Day 4: Evaluation & Metrics** - Compute all metrics, generate comparison tables and visualizations
- **Day 5: Error Analysis** - Identify and categorize 20+ failure cases, analyze patterns and feature importance
- **Day 6: Adversarial Testing & Real-World Considerations** - Create adversarial examples, test robustness, discuss class imbalance and deployment scenarios
- **Day 7: Documentation & Polish** - Write markdown sections, verify code runs cleanly, final review

**Key to Success:** Use GenAI coding assistants to accelerate boilerplate code and feature engineering, but invest your time in understanding results, analyzing errors, and writing insightful analysis.

### Use Version Control
- Save different model versions as you experiment.
- Track what worked and what didn't in your notebook.
- Use meaningful names for models and experiments.

### Leverage GenAI Tools Effectively (Critical for 1-Week Timeline)
Since this assignment must be completed in 7 days, **using AI coding assistants is essential** to accelerate implementation while you focus on the analytical components:

**DO use GenAI for:**
- **Boilerplate code**: Data loading, train/test splits, metric computation
- **Feature engineering pipelines**: TF-IDF setup, feature extraction utilities
- **Model scaffolding**: Training loops, validation monitoring, hyperparameter grids
- **Visualization code**: Confusion matrices, ROC curves, comparison tables
- **Debugging**: Finding issues in data processing or model output shape mismatches

**DON'T use GenAI as a shortcut for:**
- **Understanding results**: Always interpret what your models are doing
- **Error analysis**: Manually examine misclassified examples and identify patterns
- **Design decisions**: Think critically about which models/features to try and why
- **Documentation**: Write your own explanations of methodology and findings

**Workflow:** Generate code scaffolds with GenAI, then spend your time on data exploration, result interpretation, error categorization, and insightful analysis. The best submissions show deep understanding of the *why*, not just the *how*.

The goal is to learn ML concepts deeply while shipping a complete, well-analyzed project in 7 days.

### Feature Engineering Matters
For traditional ML models:
- Don't just use default TF-IDF—experiment with n-gram ranges, max features, min/max document frequency.
- Create custom features based on spam characteristics (URLs, special characters, etc.).
- Consider domain-specific patterns (e.g., "Click here", "Free money", etc.).

### Monitor for Overfitting
- Always use a validation set separate from your training data.
- Plot training vs. validation curves for neural models.
- Use cross-validation for traditional models.
- If training accuracy >> validation accuracy, you're overfitting.

### Debugging Poor Performance
If your models aren't performing well:
1. **Check data quality**: Are there mislabeled examples?
2. **Verify preprocessing**: Are you handling special characters, URLs correctly?
3. **Inspect predictions**: Look at specific examples where the model fails.
4. **Try simpler models first**: Debug Naive Bayes before attempting BERT.
5. **Check class balance**: Are you predicting only the majority class?

### Make Comparisons Fair
- Use the same train/validation/test split for all models.
- Report all metrics (not just the best one).
- Don't cherry-pick results.

### Document Everything
- Future you (and the grader) will thank you for clear documentation.
- Explain why you made each decision, not just what you did.
- Include negative results—what didn't work and why?

## Resources

### Spam Detection Research
- [Spam Filtering with Naive Bayes](https://www.cs.cmu.edu/~tom/mlbook/NBayesSpam.pdf) - Classic paper on Naive Bayes for spam
- [Learning to Detect Phishing Emails](https://arxiv.org/abs/1702.01804) - Modern ML approaches
- [A Survey of Learning-Based Techniques of Email Spam Filtering](https://arxiv.org/abs/0912.0520) - Comprehensive overview

### Transformer Fine-Tuning
- [Hugging Face Transformers Documentation](https://huggingface.co/docs/transformers) - Essential for BERT/DistilBERT
- [Fine-tuning BERT for Text Classification](https://huggingface.co/docs/transformers/tasks/sequence_classification)
- [DistilBERT Paper](https://arxiv.org/abs/1910.01108) - Lighter, faster BERT variant

### Evaluation and Metrics
- [Precision and Recall](https://en.wikipedia.org/wiki/Precision_and_recall) - Understanding the trade-off
- [ROC Curves and AUC](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc)
- [Confusion Matrix Guide](https://scikit-learn.org/stable/modules/model_evaluation.html#confusion-matrix)

### Adversarial Robustness
- [Adversarial Examples for Natural Language](https://arxiv.org/abs/1801.07175)
- [TextAttack: Framework for Adversarial Attacks](https://github.com/QData/TextAttack)

### Handling Imbalanced Data
- [Learning from Imbalanced Data](https://www.jair.org/index.php/jair/article/view/10302)
- [SMOTE: Synthetic Minority Over-sampling](https://arxiv.org/abs/1106.1813)

### Python Libraries
- **scikit-learn**: Traditional ML, metrics, preprocessing
- **transformers**: BERT, DistilBERT, RoBERTa
- **pandas**: Data manipulation
- **matplotlib/seaborn**: Visualization
- **nltk/spaCy**: NLP preprocessing
- **imbalanced-learn**: Handling class imbalance

### Datasets (Optional Augmentation)
- [SpamAssassin Public Corpus](https://spamassassin.apache.org/old/publiccorpus/)
- [Enron Email Dataset](https://www.cs.cmu.edu/~enron/)
- [SMS Spam Collection](https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset)

If you use external datasets, you must cite them clearly in your notebook.

## Submission Guidelines

### GitHub Classroom Submission

This assignment is submitted via **GitHub Classroom**. Follow these steps:

1. **Accept the assignment**: Click the assignment link provided in Canvas or by your instructor
   - Repository: [github.com/ContextLab/spam-classifier-llm-course](https://github.com/ContextLab/spam-classifier-llm-course)
   - This creates your own private repository for the assignment

2. **Clone your repository**: 
   ```bash
   git clone https://github.com/ContextLab/spam-classifier-llm-course-YOUR_USERNAME.git
   ```

3. **Complete your work**: 
   - Work in Google Colab, Jupyter, or your preferred environment
   - Save your notebook to the repository

4. **Commit and push your changes**:
   ```bash
   git add .
   git commit -m "Complete SPAM classifier assignment"
   git push
   ```

5. **Verify submission**: Check that your latest commit appears in your GitHub repository before the deadline

**Deadline**: January 23, 2026 at 11:59 PM EST

### What to Submit
Submit **one Jupyter notebook** (.ipynb file) in your GitHub Classroom repository.

### Notebook Requirements
Your notebook must:
1. **Run from top to bottom without errors** in a clean Google Colab environment
2. **Include all necessary code** for training, evaluation, and analysis
3. **Download any required data/models** within the notebook (don't assume files are present)
4. **Set random seeds** for reproducibility (e.g., `np.random.seed(42)`)
5. **Have a reasonable runtime**: Full execution should complete in under 60 minutes on Colab (use DistilBERT instead of BERT-base to stay within this constraint)

### Organization
Structure your notebook with clear sections:
```
1. Introduction and Setup
   - Import libraries
   - Load data
   - Exploratory data analysis

2. Data Preprocessing
   - Train/val/test split
   - Text cleaning functions
   - Feature engineering utilities

3. Model Implementations
   - Traditional ML models (separate subsections for each)
   - Neural model (BERT/DistilBERT)
   - Ensemble method

4. Evaluation
   - Metrics computation
   - Comparison tables
   - Visualizations
   - Statistical tests

5. Error Analysis
   - Failure case examination
   - Pattern identification
   - Feature importance

6. Adversarial Testing
   - Adversarial examples
   - Robustness tests

7. Discussion and Conclusions
   - Model comparison
   - Real-world considerations
   - Reflection

8. References
   - Papers cited
   - Datasets used
   - Resources consulted
```

### Formatting
- Use **descriptive markdown headers** for each section
- Include **explanatory text** before code cells
- Add **inline comments** for complex code
- Create **clear visualizations** with titles and labels
- Use **tables** for metric comparisons

### File Naming
Name your file: `LastName_FirstName_Assignment2.ipynb`

Example: `Smith_Jane_Assignment2.ipynb`

### Pre-Submission Checklist
Before submitting, verify:
- [ ] Notebook runs completely in a fresh Colab instance
- [ ] All required components are implemented (3+ models, evaluation, error analysis, adversarial testing)
- [ ] All metrics are reported for all models
- [ ] At least 20 error cases are analyzed
- [ ] Markdown documentation is thorough and well-written
- [ ] Code is clean and readable
- [ ] Visualizations are clear and professional
- [ ] Random seeds are set for reproducibility
- [ ] Citations are included for external resources
- [ ] File is named correctly

### Deadline
**One week from assignment release** (7 calendar days)

Late submissions will be penalized according to the course late policy.

## Academic Integrity

While you are encouraged to use AI coding assistants and discuss concepts with peers:
- **Your submission must be your own work**
- **Understand every line of code** you submit
- **Do not copy code** from other students or online sources without attribution
- **Cite all external resources** (papers, datasets, significant code snippets)

You may be asked to explain your implementation decisions in office hours or during grading. Make sure you can justify your choices.

## Getting Help

If you're stuck:
1. **Review the tips and resources** in this document
2. **Ask specific questions** in office hours or on the course forum
3. **Debug systematically**: Isolate the problem, test components individually
4. **Start simple**: Get a basic version working before adding complexity

Remember: The goal is to learn about text classification, evaluation, and error analysis. Don't get lost in trying to achieve the highest possible score—focus on understanding the concepts deeply.

## Final Notes

This assignment is designed to be challenging but achievable **within 1 week**. You're expected to:
- Think critically about model selection and evaluation
- Go beyond "does it work?" to "why does it work?"
- Consider real-world deployment constraints
- Demonstrate both technical skills and analytical thinking
- **Use GenAI tools strategically** to manage time constraints without sacrificing rigor

The best submissions will show:
- Deep understanding of classification fundamentals
- Thoughtful comparison across methods
- Insightful error analysis
- Professional code and documentation
- Strategic use of GenAI to accelerate implementation while maintaining analytical depth

**Remember:** The 7-day timeline is realistic because:
1. GenAI can generate boilerplate code (training loops, metrics, visualizations)
2. DistilBERT trains faster than BERT-base
3. You can run many experiments in parallel on Colab's GPUs
4. The most valuable insights come from *analysis*, not *implementation time*

Good luck, and enjoy building your spam classifier in a week!