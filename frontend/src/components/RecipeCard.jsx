import React from 'react';
import './RecipeCard.css';

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.title}</h3>
        
        {recipe.readyInMinutes && (
          <div className="recipe-meta">
            <span className="meta-chip"><ClockIcon /> {recipe.readyInMinutes} min</span>
          </div>
        )}
        
        {recipe.summary && (
          <p className="recipe-summary">{recipe.summary}</p>
        )}
        
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="recipe-ingredients">
            <strong>Ingredienti base:</strong> {recipe.ingredients.slice(0, 4).join(', ')}...
          </div>
        )}
      </div>
    </div>
  );
}
