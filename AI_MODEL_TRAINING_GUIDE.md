# AI Model Training Guide for Complaint Classification

## Current System (Rule-Based)
The current system uses **keyword matching** - it's fast but limited in accuracy.

## Option 1: Improve Keywords (Done ✓)
I've expanded the keyword lists to include:
- 36 infrastructure keywords
- 36 sanitation keywords  
- 30 traffic keywords
- 30 safety keywords
- 30 utilities keywords
- 45 critical priority keywords
- 25 high priority keywords

This should improve accuracy from ~60% to ~75-80%.

---

## Option 2: Train Machine Learning Model (Advanced)

### Prerequisites
```bash
pip install scikit-learn pandas numpy joblib
```

### Step 1: Collect Training Data

Create a CSV file `training_data.csv` with your historical complaints:

```csv
title,description,category,priority
"Broken Street Light","The street light near bus stop is not working for 3 days",utilities,high
"Road Accident","Two vehicles collided, one person injured",traffic,critical
"Garbage Overflow","Dustbin overflowing with waste, bad smell",sanitation,medium
```

You need **at least 500-1000 examples** for good accuracy.

### Step 2: Create ML Training Script

Create `ai-service/train_model.py`:

```python
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# Load training data
df = pd.read_csv('training_data.csv')

# Combine title and description
df['text'] = df['title'] + ' ' + df['description']

# Split data
X_train, X_test, y_cat_train, y_cat_test = train_test_split(
    df['text'], df['category'], test_size=0.2, random_state=42
)

_, _, y_pri_train, y_pri_test = train_test_split(
    df['text'], df['priority'], test_size=0.2, random_state=42
)

# Train category classifier
category_model = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=1000, ngram_range=(1, 2))),
    ('clf', MultinomialNB())
])
category_model.fit(X_train, y_cat_train)

# Train priority classifier
priority_model = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=1000, ngram_range=(1, 2))),
    ('clf', MultinomialNB())
])
priority_model.fit(X_train, y_pri_train)

# Evaluate
print("Category Accuracy:", category_model.score(X_test, y_cat_test))
print("Priority Accuracy:", priority_model.score(X_test, y_pri_test))

# Save models
joblib.dump(category_model, 'models/category_model.pkl')
joblib.dump(priority_model, 'models/priority_model.pkl')
print("Models saved!")
```

### Step 3: Update Categorizer to Use ML Model

Update `ai-service/models/categorizer.py`:

```python
import joblib
import os

class ComplaintCategorizer:
    def __init__(self):
        # Try to load ML models
        try:
            self.category_model = joblib.load('models/category_model.pkl')
            self.priority_model = joblib.load('models/priority_model.pkl')
            self.use_ml = True
            print("ML models loaded successfully")
        except:
            self.use_ml = False
            print("ML models not found, using keyword-based system")
    
    def categorize(self, title: str, description: str) -> Dict:
        text = f"{title} {description}"
        
        if self.use_ml:
            # Use ML model
            category = self.category_model.predict([text])[0]
            confidence = max(self.category_model.predict_proba([text])[0])
            return {
                'category': category,
                'confidence': confidence,
                'keywords': [],
                'method': 'machine_learning'
            }
        else:
            # Fallback to keyword-based
            return self._keyword_categorize(title, description)
```

### Step 4: Train the Model

```bash
cd ai-service
python train_model.py
```

---

## Option 3: Use Pre-trained Models (Best for Production)

### Using Hugging Face Transformers

```bash
pip install transformers torch
```

Create `ai-service/models/transformer_classifier.py`:

```python
from transformers import pipeline

class TransformerClassifier:
    def __init__(self):
        # Use zero-shot classification
        self.classifier = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli"
        )
    
    def categorize(self, text: str) -> Dict:
        categories = ['infrastructure', 'sanitation', 'traffic', 'safety', 'utilities']
        result = self.classifier(text, categories)
        
        return {
            'category': result['labels'][0],
            'confidence': result['scores'][0],
            'method': 'transformer'
        }
    
    def analyze_priority(self, text: str) -> Dict:
        priorities = ['critical', 'high', 'medium', 'low']
        result = self.classifier(text, priorities)
        
        return {
            'priority': result['labels'][0],
            'confidence': result['scores'][0]
        }
```

**Pros:**
- No training data needed
- High accuracy (85-95%)
- Works out of the box

**Cons:**
- Slower (2-3 seconds per complaint)
- Requires more memory (2GB+)
- Needs GPU for fast processing

---

## Option 4: Collect Data & Improve Over Time

### Add Feedback Loop

1. **Admin corrects AI predictions**
2. **Store corrections in database**
3. **Retrain model monthly with new data**

Add to `database/schema.sql`:

```sql
CREATE TABLE ai_training_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  ai_predicted_category VARCHAR(100),
  ai_predicted_priority VARCHAR(50),
  admin_corrected_category VARCHAR(100),
  admin_corrected_priority VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id)
);
```

---

## Recommended Approach

**For your use case (1000s of complaints daily):**

1. **Short term (Now)**: Use improved keyword system (already done ✓)
2. **Medium term (1-2 weeks)**: Collect 500-1000 labeled examples
3. **Long term (1 month)**: Train custom ML model with your data

**Quick Win**: Add more domain-specific keywords based on your city/region:
- Local street names
- Common local issues
- Regional language terms

---

## Testing Accuracy

Create test cases in `ai-service/test_accuracy.py`:

```python
test_cases = [
    {
        'title': 'Electric Wire Fallen',
        'description': 'Live wire hanging dangerously',
        'expected_category': 'utilities',
        'expected_priority': 'critical'
    },
    {
        'title': 'Road Accident',
        'description': 'Two cars collided, one injured',
        'expected_category': 'traffic',
        'expected_priority': 'critical'
    }
]

correct = 0
for case in test_cases:
    result = categorizer.categorize(case['title'], case['description'])
    if result['category'] == case['expected_category']:
        correct += 1

accuracy = (correct / len(test_cases)) * 100
print(f"Accuracy: {accuracy}%")
```

---

## Current Accuracy Estimate

- **Keyword-based (improved)**: 75-80%
- **Custom ML model**: 85-90% (needs training data)
- **Transformer model**: 90-95% (slower, more resources)

**Next Steps:**
1. Test current improved keyword system
2. Collect real complaint data
3. Decide on ML approach based on accuracy needs
