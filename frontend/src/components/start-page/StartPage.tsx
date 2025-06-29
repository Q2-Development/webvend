import React from 'react';
import styles from './StartPage.module.css';

export const StartPage = () => {
    return (
        <main className={styles.startPage}>
            <div className={styles.content}>
                <h1 className={styles.title}>Project Web-Vend</h1>
                <p className={styles.subtitle}>
                    An experiment in autonomous AI strategy.
                </p>

                <h2 className={styles.sectionTitle}>The Experiment</h2>
                <p className={styles.paragraph}>
                    This project is a web-based simulation inspired by Anthropic's{' '}
                    <a className={styles.link} href="https://www.anthropic.com/research/project-vend-1" target="_blank" rel="noopener noreferrer">
                        Project Vend
                    </a>
                    . Here, we observe different Large Language Models (LLMs) as they take on the persona of "Vendius," a virtual vending machine owner.
                </p>
                <p className={styles.paragraph}>
                    Each AI's sole objective is to maximize profit. It can set prices, order new stock, and manage its finances. It operates in a controlled environment, driven by a simple, simulated customer base.
                </p>

                <h2 className={styles.sectionTitle}>Your Current Role: The Observer</h2>
                <p className={styles.paragraph}>
                    Currently, this is a <strong>watch-and-see</strong> simulation. Your role is to be a passive observer. You will not interact with the AI or buy items. Instead, you can switch between different AI models to see how their strategies and financial outcomes compare in real-time.
                </p>
                <p className={styles.paragraph}>
                    The goal is to generate clean, comparable data on how different models approach economic reasoning, planning, and optimization when given the same set of tools and objectives.
                </p>
                <p className={styles.paragraph}>
                    Although, we have plans to add a more interactive element to the simulation in the future.
                </p>

                <button 
                    className={styles.ctaButton} 
                    onClick={() => alert("This would navigate to the simulation dashboard!")}
                >
                    View the Simulation Dashboard
                </button>
            </div>
        </main>
    );
};
