import { useState } from "react";
import type { ComparePair } from "../data/compare";
import { Picture } from "./Media";

export function Compare({ pair }: { pair: ComparePair }) {
  const [position, setPosition] = useState(52);

  return (
    <div className="compare">
      <Picture image={pair.after} />
      <div className="compare-before" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Picture image={pair.before} alt={pair.before.alt} />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        aria-label="Сравнение: исходный продукт и рекламная сцена"
        onChange={(event) => setPosition(Number(event.target.value))}
      />
    </div>
  );
}
