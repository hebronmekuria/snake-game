// SnakeGame.tsx

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import './SnakeGame.css';

interface Snake {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
}
const generateFoodPosition = (): Food => {
  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);
  return { x, y };
};

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Snake[]>([{ x: 0, y: 0 }]);
  const [food, setFood] = useState<Food>(generateFoodPosition());
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const gameIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!gameOver) {
      gameIntervalRef.current = setInterval(moveSnake, 300);

      return () => clearInterval(gameIntervalRef.current!);
    }
  }, [snake, food, gameOver]);


  const moveSnake = () => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
      default:
        break;
    }

    if (head.x === food.x && head.y === food.y) {
      setFood(generateFoodPosition());
      newSnake.unshift(head);
      setScore(score + 1);
    } else {
      newSnake.unshift(head);
      newSnake.pop();
    }

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= 10 ||
      head.y >= 10 ||
      checkCollision(newSnake.slice(1), head)
    ) {
      setGameOver(true);
    }

    setSnake(newSnake);
  };

  const checkCollision = (snakeSegments: Snake[], head: Snake): boolean => {
    return snakeSegments.some((segment) => segment.x === head.x && segment.y === head.y);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        setDirection('UP');
        break;
      case 'ArrowDown':
        setDirection('DOWN');
        break;
      case 'ArrowLeft':
        setDirection('LEFT');
        break;
      case 'ArrowRight':
        setDirection('RIGHT');
        break;
      default:
        break;
    }
  };

  const handleRestart = () => {
    setSnake([{ x: 0, y: 0 }]);
    setFood(generateFoodPosition());
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
  };

  return (
    <div
      className={`snake-game ${gameOver ? 'game-over' : ''}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h1>Snake Game</h1>
      <div className="score">Score: {score}</div>
      <div className="game-board">
        {Array.from({ length: 10 }).map((_, rowIndex) => (
          <div key={rowIndex} className="row">
            {Array.from({ length: 10 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${
                  snake.some(
                    (segment) => segment.x === colIndex && segment.y === rowIndex
                  )
                    ? 'snake'
                    : ''
                } ${
                  food.x === colIndex && food.y === rowIndex ? 'food' : ''
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
      {gameOver && (
        <div>
          <p className="game-over-message">Game Over!</p>
          <button className="restart-button" onClick={handleRestart}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
