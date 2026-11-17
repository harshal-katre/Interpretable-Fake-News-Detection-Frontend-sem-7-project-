import { useState } from 'react';
import { gameHeadlines } from '../data/gameHeadlines';

export default function SpotTheFakeGame() {
  const [deck, setDeck] = useState(() => shuffleArray([...gameHeadlines]));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userChoice, setUserChoice] = useState(null); // 'real' | 'fake'
  const [history, setHistory] = useState([]); // array of booleans: wasCorrect
  const [gameOver, setGameOver] = useState(false);
  const [flashState, setFlashState] = useState(null); // 'correct' | 'wrong'

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const currentItem = deck[currentIndex];

  const handleGuess = (guess) => {
    if (userChoice !== null) return; // already guessed
    setUserChoice(guess);
    const isCorrect = (guess === 'fake' && currentItem.isFake) || (guess === 'real' && !currentItem.isFake);
    setFlashState(isCorrect ? 'correct' : 'wrong');
    setHistory([...history, isCorrect]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex(currentIndex + 1);
      setUserChoice(null);
      setFlashState(null);
    } else {
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    setDeck(shuffleArray([...gameHeadlines]));
    setCurrentIndex(0);
    setUserChoice(null);
    setHistory([]);
    setGameOver(false);
    setFlashState(null);
  };

  // Render headline with glowing highlighted clues
  const renderHighlightedHeadline = (headline, clues, isRevealed, isFake) => {
    if (!isRevealed || !clues || clues.length === 0) {
      return <span>"{headline}"</span>;
    }

    // Create regex matching any of the clues
    const escapedClues = clues.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedClues.join('|')})`, 'gi');
    const parts = headline.split(regex);

    const clueStyle = isFake
      ? {
          backgroundColor: 'rgba(255, 77, 109, 0.22)',
          boxShadow: '0 0 14px rgba(255, 77, 109, 0.65)',
          border: '1px solid rgba(255, 77, 109, 0.7)',
          color: '#FFA3B5',
          borderRadius: '5px',
          padding: '1px 6px',
          fontWeight: 700,
        }
      : {
          backgroundColor: 'rgba(45, 226, 196, 0.22)',
          boxShadow: '0 0 14px rgba(45, 226, 196, 0.65)',
          border: '1px solid rgba(45, 226, 196, 0.7)',
          color: '#C2FBF3',
          borderRadius: '5px',
          padding: '1px 6px',
          fontWeight: 700,
        };

    return (
      <span className="game-headline-text">
        "
        {parts.map((part, i) => {
          const isClue = clues.some((c) => c.toLowerCase() === part.toLowerCase());
          return isClue ? (
            <span key={i} style={clueStyle} className="game-clue-highlight">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
        "
      </span>
    );
  };

  const score = history.filter(Boolean).length;

  const getScoreMessage = (s) => {
    if (s === 5) return 'Master Fact-Checker! You detected every deception signature flawlessly.';
    if (s >= 3) return 'Sharp Eye! You spotted the deceptive clues and credible signals effectively.';
    return 'Room for Practice! Sensational claims often disguise as breaking news.';
  };

  return (
    <section className="spot-game-card">
      <div className="game-header">
        <div className="game-title-group">
          <span className="game-badge">30-SEC CHALLENGE</span>
          <h3 className="game-title">Spot the Fake</h3>
        </div>
        <div className="game-score-counter">
          Score: <span className="score-number">{score}</span> / {deck.length}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="game-progress-row">
        {deck.map((_, i) => {
          let dotClass = 'game-dot';
          if (i < history.length) {
            dotClass += history[i] ? ' dot-correct' : ' dot-wrong';
          } else if (i === currentIndex && !gameOver) {
            dotClass += ' dot-current';
          }
          return <span key={i} className={dotClass} />;
        })}
      </div>

      {!gameOver ? (
        <div className={`game-arena ${flashState ? `flash-${flashState}` : ''}`}>
          <div className="game-card-prompt">
            <span className="prompt-label">Headline #{currentIndex + 1}:</span>
            <p className="headline-display">
              {renderHighlightedHeadline(
                currentItem.headline,
                currentItem.clues,
                userChoice !== null,
                currentItem.isFake
              )}
            </p>
          </div>

          {/* Feedback & Reason Explanation */}
          {userChoice !== null && (
            <div className={`game-feedback-box ${flashState === 'correct' ? 'feedback-correct' : 'feedback-wrong'}`}>
              <div className="feedback-status">
                {flashState === 'correct' ? '✓ Correct Decision!' : '✗ Misleading Call!'}
                <span className="verdict-revealed">
                  Truth: {currentItem.isFake ? 'FAKE' : 'REAL'}
                </span>
              </div>
              <p className="feedback-reason">{currentItem.reason}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="game-buttons-row">
            {userChoice === null ? (
              <>
                <button
                  className="btn btn-guess btn-guess-real"
                  onClick={() => handleGuess('real')}
                >
                  <span>✓</span> Real News
                </button>
                <button
                  className="btn btn-guess btn-guess-fake"
                  onClick={() => handleGuess('fake')}
                >
                  <span>⚠</span> Fake News
                </button>
              </>
            ) : (
              <button className="btn btn-primary btn-next-headline" onClick={handleNext}>
                <span>{currentIndex + 1 < deck.length ? 'Next Headline' : 'View Results'}</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Game Over Screen */
        <div className="game-results-view">
          <div className="results-trophy">✦</div>
          <h4 className="results-title">Game Finished!</h4>
          <div className="results-final-score">
            <span className="score-big">{score}</span>
            <span className="score-total">/ 5</span>
          </div>
          <p className="results-message">{getScoreMessage(score)}</p>
          <button className="btn btn-primary btn-play-again" onClick={handleRestart}>
            Play Again ↺
          </button>
        </div>
      )}
    </section>
  );
}
