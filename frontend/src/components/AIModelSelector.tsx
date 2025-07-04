import React from 'react';
import styles from '../styles/AIModelSelector.module.css';

interface Props {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const AI_MODELS = [
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic\'s latest flagship model' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'OpenAI\'s advanced reasoning model' },
  { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s multimodal AI model' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and efficient reasoning' },
];

export default function AIModelSelector({ selectedModel, onModelChange }: Props) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <div className={styles.indicator}></div>
        Vendius AI Model
      </h2>
      
      <div className={styles.modelsGrid}>
        {AI_MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`${styles.modelButton} ${selectedModel === model.id ? styles.selected : ''}`}
          >
            <div className={styles.modelName}>{model.name}</div>
            <div className={styles.modelDescription}>{model.description}</div>
            {selectedModel === model.id && (
              <div className={styles.activeIndicator}>
                <div className={styles.activeDot}></div>
                Active
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className={styles.strategyNote}>
        <p className={styles.strategyText}>
          <span className={styles.strategyLabel}>Current Strategy:</span> Each AI model uses different approaches to maximize profit. 
          Switch models to compare their pricing strategies, inventory management, and customer relationship tactics.
        </p>
      </div>
    </div>
  );
} 